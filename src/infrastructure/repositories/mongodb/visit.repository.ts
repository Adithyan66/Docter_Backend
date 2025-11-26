import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IVisitRepository, VisitSearchOptions } from '../../../domain/repositories/visit.repository';
import { Visit } from '../../../domain/entities/visit.entity';
import { VisitModel, IVisit } from '../../database/mongoose/visit.model';

@injectable()
export class MongoVisitRepository implements IVisitRepository {
  async findById(id: string): Promise<Visit | null> {
    const doc = await VisitModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Visit | null> {
    const doc = await VisitModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<Visit[]> {
    const docs = await VisitModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Visit): Promise<Visit> {
    const doc = new VisitModel({
      doctor: new Types.ObjectId(entity.doctorId),
      patient: new Types.ObjectId(entity.patientId),
      course: new Types.ObjectId(entity.courseId),
      clinic: entity.clinicId ? new Types.ObjectId(entity.clinicId) : undefined,
      visitDate: entity.visitDate,
      notes: entity.notes,
      billedAmount: entity.billedAmount,
      media: entity.mediaIds.map((id) => new Types.ObjectId(id)),
      prescription: entity.prescriptionId ? new Types.ObjectId(entity.prescriptionId) : undefined,
      isDeleted: entity.isDeleted || false,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Visit>): Promise<Visit | null> {
    const updateData: any = {};
    if (entity.doctorId !== undefined) updateData.doctor = new Types.ObjectId(entity.doctorId);
    if (entity.patientId !== undefined) updateData.patient = new Types.ObjectId(entity.patientId);
    if (entity.courseId !== undefined) updateData.course = new Types.ObjectId(entity.courseId);
    if (entity.clinicId !== undefined) updateData.clinic = entity.clinicId ? new Types.ObjectId(entity.clinicId) : null;
    if (entity.visitDate !== undefined) updateData.visitDate = entity.visitDate;
    if (entity.notes !== undefined) updateData.notes = entity.notes;
    if (entity.billedAmount !== undefined) updateData.billedAmount = entity.billedAmount;
    if (entity.mediaIds !== undefined) updateData.media = entity.mediaIds.map((id) => new Types.ObjectId(id));
    if (entity.prescriptionId !== undefined) updateData.prescription = entity.prescriptionId ? new Types.ObjectId(entity.prescriptionId) : null;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const doc = await VisitModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await VisitModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  async findPaginated(options: VisitSearchOptions): Promise<{
    visits: Visit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, courseId, clinicId, visitDateFrom, visitDateTo, notes, sortBy = 'visitDate', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const baseMatch: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
    };

    const andConditions: any[] = [baseMatch];

    if (patientId && Types.ObjectId.isValid(patientId)) {
      andConditions.push({ patient: new Types.ObjectId(patientId) });
    }

    if (courseId && Types.ObjectId.isValid(courseId)) {
      andConditions.push({ course: new Types.ObjectId(courseId) });
    }

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      andConditions.push({ clinic: new Types.ObjectId(clinicId) });
    }

    if (visitDateFrom || visitDateTo) {
      const dateFilter: any = {};
      if (visitDateFrom) dateFilter.$gte = visitDateFrom;
      if (visitDateTo) dateFilter.$lte = visitDateTo;
      andConditions.push({ visitDate: dateFilter });
    }

    if (notes && notes.trim().length > 0) {
      const regex = new RegExp(notes.trim(), 'i');
      andConditions.push({ notes: regex });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      visitDate: 'visitDate',
      createdAt: 'createdAt',
    };

    const sortField = sortFieldMap[sortBy] || 'visitDate';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { [sortField]: sortDirection, _id: sortDirection } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
      {
        $project: {
          visits: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await VisitModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        visits: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const visits = aggregationResult.visits.map((doc: any) => this.toDomainFromPlainObject(doc));

    return {
      visits,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: IVisit): Visit {
    return new Visit(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.course ? doc.course.toString() : '',
      doc.visitDate,
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.notes,
      doc.billedAmount,
      doc.media ? doc.media.map((m) => m.toString()) : [],
      doc.prescription ? doc.prescription.toString() : undefined,
      doc.isDeleted || false
    );
  }

  private toDomainFromPlainObject(doc: any): Visit {
    const id = doc._id ? doc._id.toString() : '';
    return new Visit(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.course ? doc.course.toString() : '',
      doc.visitDate || new Date(),
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.notes,
      doc.billedAmount || 0,
      doc.media ? doc.media.map((m: any) => m.toString()) : [],
      doc.prescription ? doc.prescription.toString() : undefined,
      doc.isDeleted || false
    );
  }
}

