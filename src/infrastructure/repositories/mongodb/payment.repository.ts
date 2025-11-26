import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IPaymentRepository, PaymentSearchOptions } from '../../../domain/repositories/payment.repository';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentMethodVO } from '../../../domain/value-objects/payment-method.vo';
import { RefundDetails } from '../../../domain/entities/refund-details.entity';
import { PaymentModel, IPayment } from '../../database/mongoose/payment.model';

@injectable()
export class MongoPaymentRepository implements IPaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<Payment[]> {
    const docs = await PaymentModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Payment, session?: any): Promise<Payment> {
    const doc = new PaymentModel({
      doctor: new Types.ObjectId(entity.doctorId),
      patient: new Types.ObjectId(entity.patientId),
      course: new Types.ObjectId(entity.courseId),
      visit: entity.visitId ? new Types.ObjectId(entity.visitId) : undefined,
      clinic: entity.clinicId ? new Types.ObjectId(entity.clinicId) : undefined,
      amount: entity.amount,
      method: entity.method.getValue(),
      reference: entity.reference,
      paidAt: entity.paidAt,
      refunded: entity.refunded,
      refundDetails: entity.refundDetails
        ? {
            refundedAt: entity.refundDetails.refundedAt,
            refundReason: entity.refundDetails.refundReason,
            refundAmount: entity.refundDetails.refundAmount,
          }
        : undefined,
      isDeleted: entity.isDeleted || false,
    });

    if (session) {
      await doc.save({ session });
    } else {
      await doc.save();
    }

    return this.toDomain(doc);
  }

  async update(id: string, entity: Partial<Payment>, session?: any): Promise<Payment | null> {
    const updateData: any = {};
    if (entity.doctorId !== undefined) updateData.doctor = new Types.ObjectId(entity.doctorId);
    if (entity.patientId !== undefined) updateData.patient = new Types.ObjectId(entity.patientId);
    if (entity.courseId !== undefined) updateData.course = new Types.ObjectId(entity.courseId);
    if (entity.visitId !== undefined) updateData.visit = entity.visitId ? new Types.ObjectId(entity.visitId) : null;
    if (entity.clinicId !== undefined) updateData.clinic = entity.clinicId ? new Types.ObjectId(entity.clinicId) : null;
    if (entity.amount !== undefined) updateData.amount = entity.amount;
    if (entity.method !== undefined) updateData.method = entity.method.getValue();
    if (entity.reference !== undefined) updateData.reference = entity.reference;
    if (entity.paidAt !== undefined) updateData.paidAt = entity.paidAt;
    if (entity.refunded !== undefined) updateData.refunded = entity.refunded;
    if (entity.refundDetails !== undefined) {
      updateData.refundDetails = entity.refundDetails
        ? {
            refundedAt: entity.refundDetails.refundedAt,
            refundReason: entity.refundDetails.refundReason,
            refundAmount: entity.refundDetails.refundAmount,
          }
        : null;
    }
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    await PaymentModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, updateOptions);
    const doc = await PaymentModel.findOne({ _id: id, isDeleted: false }).session(session || null);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await PaymentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  async findPaginated(options: PaymentSearchOptions): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page,
      limit,
      doctorId,
      patientId,
      courseId,
      clinicId,
      visitId,
      dateFrom,
      dateTo,
      method,
      refunded,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;
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

    if (visitId && Types.ObjectId.isValid(visitId)) {
      andConditions.push({ visit: new Types.ObjectId(visitId) });
    }

    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.$gte = dateFrom;
      if (dateTo) dateFilter.$lte = dateTo;
      andConditions.push({ paidAt: dateFilter });
    }

    if (method) {
      andConditions.push({ method });
    }

    if (refunded !== undefined) {
      andConditions.push({ refunded });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      paidAt: 'paidAt',
      amount: 'amount',
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
          payments: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await PaymentModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        payments: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const payments = aggregationResult.payments.map((doc: any) => this.toDomainFromPlainObject(doc));

    return {
      payments,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: IPayment): Payment {
    const refundDetails = doc.refundDetails
      ? new RefundDetails(
          doc.refundDetails.refundedAt,
          doc.refundDetails.refundAmount,
          doc.refundDetails.refundReason
        )
      : undefined;

    return new Payment(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.course ? doc.course.toString() : '',
      doc.amount,
      new PaymentMethodVO(doc.method),
      doc.paidAt,
      doc.createdAt,
      doc.updatedAt,
      doc.visit ? doc.visit.toString() : undefined,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.reference,
      doc.refunded,
      refundDetails,
      doc.isDeleted || false
    );
  }

  private toDomainFromPlainObject(doc: any): Payment {
    const id = doc._id ? doc._id.toString() : '';
    const refundDetails = doc.refundDetails
      ? new RefundDetails(
          doc.refundDetails.refundedAt,
          doc.refundDetails.refundAmount,
          doc.refundDetails.refundReason
        )
      : undefined;

    return new Payment(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.course ? doc.course.toString() : '',
      doc.amount || 0,
      new PaymentMethodVO(doc.method || 'cash'),
      doc.paidAt || new Date(),
      doc.createdAt,
      doc.updatedAt,
      doc.visit ? doc.visit.toString() : undefined,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.reference,
      doc.refunded || false,
      refundDetails,
      doc.isDeleted || false
    );
  }
}

