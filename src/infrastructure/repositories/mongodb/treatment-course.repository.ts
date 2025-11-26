import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { ITreatmentCourseRepository, TreatmentCourseSearchOptions } from '../../../domain/repositories/treatment-course.repository';
import { TreatmentCourse } from '../../../domain/entities/treatment-course.entity';
import { TreatmentCourseModel, ITreatmentCourse } from '../../database/mongoose/treatment-course.model';

@injectable()
export class MongoTreatmentCourseRepository implements ITreatmentCourseRepository {
  async findById(id: string): Promise<TreatmentCourse | null> {
    const doc = await TreatmentCourseModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<TreatmentCourse | null> {
    const doc = await TreatmentCourseModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<TreatmentCourse[]> {
    const docs = await TreatmentCourseModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: TreatmentCourse): Promise<TreatmentCourse> {
    const doc = new TreatmentCourseModel({
      doctor: new Types.ObjectId(entity.doctorId),
      patient: new Types.ObjectId(entity.patientId),
      clinic: entity.clinicId ? new Types.ObjectId(entity.clinicId) : undefined,
      treatment: new Types.ObjectId(entity.treatmentId),
      startDate: entity.startDate,
      expectedEndDate: entity.expectedEndDate,
      totalCost: entity.totalCost,
      totalPaid: entity.totalPaid,
      isPaymentCompleted: entity.isPaymentCompleted,
      isMedicallyCompleted: entity.isMedicallyCompleted,
      status: entity.status,
      notes: entity.notes,
      visits: entity.visits.map((v) => new Types.ObjectId(v)),
      payments: entity.payments.map((p) => new Types.ObjectId(p)),
      isDeleted: entity.isDeleted || false,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<TreatmentCourse>, session?: any): Promise<TreatmentCourse | null> {
    const updateData: any = {};
    if (entity.doctorId !== undefined) updateData.doctor = new Types.ObjectId(entity.doctorId);
    if (entity.patientId !== undefined) updateData.patient = new Types.ObjectId(entity.patientId);
    if (entity.clinicId !== undefined) updateData.clinic = entity.clinicId ? new Types.ObjectId(entity.clinicId) : null;
    if (entity.treatmentId !== undefined) updateData.treatment = new Types.ObjectId(entity.treatmentId);
    if (entity.startDate !== undefined) updateData.startDate = entity.startDate;
    if (entity.expectedEndDate !== undefined) updateData.expectedEndDate = entity.expectedEndDate;
    if (entity.totalCost !== undefined) updateData.totalCost = entity.totalCost;
    if (entity.totalPaid !== undefined) updateData.totalPaid = entity.totalPaid;
    if (entity.isPaymentCompleted !== undefined) updateData.isPaymentCompleted = entity.isPaymentCompleted;
    if (entity.isMedicallyCompleted !== undefined) updateData.isMedicallyCompleted = entity.isMedicallyCompleted;
    if (entity.status !== undefined) updateData.status = entity.status;
    if (entity.notes !== undefined) updateData.notes = entity.notes;
    if (entity.visits !== undefined) updateData.visits = entity.visits.map((v) => new Types.ObjectId(v));
    if (entity.payments !== undefined) updateData.payments = entity.payments.map((p) => new Types.ObjectId(p));
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    await TreatmentCourseModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      updateOptions
    );
    const doc = await TreatmentCourseModel.findOne({ _id: id, isDeleted: false }).session(session || null);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await TreatmentCourseModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  async findPaginated(options: TreatmentCourseSearchOptions): Promise<{
    treatmentCourses: TreatmentCourse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, clinicId, treatmentId, patientId, status, startDateFrom, startDateTo, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const baseMatch: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
    };

    const andConditions: any[] = [baseMatch];

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      andConditions.push({ clinic: new Types.ObjectId(clinicId) });
    }

    if (treatmentId && Types.ObjectId.isValid(treatmentId)) {
      andConditions.push({ treatment: new Types.ObjectId(treatmentId) });
    }

    if (patientId && Types.ObjectId.isValid(patientId)) {
      andConditions.push({ patient: new Types.ObjectId(patientId) });
    }

    if (status) {
      andConditions.push({ status });
    }

    if (startDateFrom || startDateTo) {
      const dateFilter: any = {};
      if (startDateFrom) dateFilter.$gte = startDateFrom;
      if (startDateTo) dateFilter.$lte = startDateTo;
      andConditions.push({ startDate: dateFilter });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      startDate: 'startDate',
      totalCost: 'totalCost',
      status: 'status',
    };

    const sortField = sortFieldMap[sortBy] || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { [sortField]: sortDirection } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
      {
        $project: {
          treatmentCourses: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await TreatmentCourseModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        treatmentCourses: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const treatmentCourses = aggregationResult.treatmentCourses.map((doc: any) =>
      this.toDomainFromPlainObject(doc)
    );

    return {
      treatmentCourses,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: ITreatmentCourse): TreatmentCourse {
    return new TreatmentCourse(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.treatment ? doc.treatment.toString() : '',
      doc.startDate,
      doc.totalCost,
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.expectedEndDate,
      doc.totalPaid,
      doc.isPaymentCompleted,
      doc.isMedicallyCompleted,
      doc.status,
      doc.notes,
      doc.visits ? doc.visits.map((v) => v.toString()) : [],
      doc.payments ? doc.payments.map((p) => p.toString()) : [],
      doc.isDeleted || false
    );
  }

  async incrementTotalPaid(courseId: string, amount: number, session?: any, paymentId?: string): Promise<TreatmentCourse | null> {
    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    const updateData: any = { $inc: { totalPaid: amount } };
    if (paymentId) {
      updateData.$addToSet = { payments: new Types.ObjectId(paymentId) };
    }

    await TreatmentCourseModel.findOneAndUpdate(
      { _id: courseId, isDeleted: false },
      updateData,
      updateOptions
    );

    const updated = await TreatmentCourseModel.findOne({ _id: courseId, isDeleted: false }).session(session || null);
    if (!updated) return null;

    if (updated.totalPaid >= updated.totalCost) {
      await TreatmentCourseModel.findOneAndUpdate(
        { _id: courseId, isDeleted: false },
        { $set: { isPaymentCompleted: true } },
        updateOptions
      );
      updated.isPaymentCompleted = true;
    } else {
      updated.isPaymentCompleted = false;
    }

    return this.toDomain(updated);
  }

  async decrementTotalPaid(courseId: string, amount: number, session?: any): Promise<TreatmentCourse | null> {
    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    const doc = await TreatmentCourseModel.findOneAndUpdate(
      { _id: courseId, isDeleted: false },
      { $inc: { totalPaid: -amount } },
      updateOptions
    );

    if (!doc) return null;

    const updated = await TreatmentCourseModel.findOne({ _id: courseId, isDeleted: false }).session(session || null);
    if (!updated) return null;

    if (updated.totalPaid >= updated.totalCost) {
      await TreatmentCourseModel.findOneAndUpdate(
        { _id: courseId, isDeleted: false },
        { $set: { isPaymentCompleted: true } },
        updateOptions
      );
      updated.isPaymentCompleted = true;
    } else {
      updated.isPaymentCompleted = false;
    }

    return this.toDomain(updated);
  }

  private toDomainFromPlainObject(doc: any): TreatmentCourse {
    const id = doc._id ? doc._id.toString() : '';
    return new TreatmentCourse(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.treatment ? doc.treatment.toString() : '',
      doc.startDate || new Date(),
      doc.totalCost || 0,
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.expectedEndDate,
      doc.totalPaid || 0,
      doc.isPaymentCompleted || false,
      doc.isMedicallyCompleted || false,
      doc.status || 'active',
      doc.notes,
      doc.visits ? doc.visits.map((v: any) => v.toString()) : [],
      doc.payments ? doc.payments.map((p: any) => p.toString()) : [],
      doc.isDeleted || false
    );
  }
}

