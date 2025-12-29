import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IPrescriptionRepository, PrescriptionSearchOptions } from '../../../domain/repositories/prescription.repository';
import { Prescription, PrescriptionItem } from '../../../domain/entities/prescription.entity';
import { PrescriptionModel, IPrescription } from '../../database/mongoose/prescription.model';

@injectable()
export class MongoPrescriptionRepository implements IPrescriptionRepository {
  async findById(id: string): Promise<Prescription | null> {
    const doc = await PrescriptionModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Prescription | null> {
    const doc = await PrescriptionModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<Prescription[]> {
    const docs = await PrescriptionModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Prescription): Promise<Prescription> {
    const doc = new PrescriptionModel({
      doctor: new Types.ObjectId(entity.doctor),
      patient: new Types.ObjectId(entity.patient),
      visit: new Types.ObjectId(entity.visit),
      clinic: entity.clinic ? new Types.ObjectId(entity.clinic) : undefined,
      diagnosis: entity.diagnosis || [],
      items: entity.items || [],
      notes: entity.notes,
      isDeleted: false,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Prescription>): Promise<Prescription | null> {
    const updateData: any = {};
    if (entity.doctor !== undefined) updateData.doctor = new Types.ObjectId(entity.doctor);
    if (entity.patient !== undefined) updateData.patient = new Types.ObjectId(entity.patient);
    if (entity.visit !== undefined) updateData.visit = new Types.ObjectId(entity.visit);
    if (entity.clinic !== undefined) updateData.clinic = entity.clinic ? new Types.ObjectId(entity.clinic) : null;
    if (entity.diagnosis !== undefined) updateData.diagnosis = entity.diagnosis;
    if (entity.items !== undefined) updateData.items = entity.items;
    if (entity.notes !== undefined) updateData.notes = entity.notes;

    const doc = await PrescriptionModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await PrescriptionModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  async findPaginated(options: PrescriptionSearchOptions): Promise<{
    prescriptions: Prescription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, visitId, clinicId, dateFrom, dateTo, medicineName, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const baseMatch: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
    };

    const andConditions: any[] = [baseMatch];

    if (patientId && Types.ObjectId.isValid(patientId)) {
      andConditions.push({ patient: new Types.ObjectId(patientId) });
    }

    if (visitId && Types.ObjectId.isValid(visitId)) {
      andConditions.push({ visit: new Types.ObjectId(visitId) });
    }

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      andConditions.push({ clinic: new Types.ObjectId(clinicId) });
    }

    if (dateFrom || dateTo) {
      const dateFilter: any = {};
      if (dateFrom) dateFilter.$gte = dateFrom;
      if (dateTo) dateFilter.$lte = dateTo;
      andConditions.push({ createdAt: dateFilter });
    }

    if (medicineName && medicineName.trim().length > 0) {
      const regex = new RegExp(medicineName.trim(), 'i');
      andConditions.push({
        'items.medicineName': regex,
      });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    };

    const sortField = sortFieldMap[sortBy] || 'createdAt';
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
          prescriptions: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await PrescriptionModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        prescriptions: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const prescriptions = aggregationResult.prescriptions.map((doc: any) => this.toDomainFromPlainObject(doc));

    return {
      prescriptions,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: IPrescription): Prescription {
    return new Prescription(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.visit ? doc.visit.toString() : '',
      doc.items || [],
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.diagnosis || [],
      doc.notes
    );
  }

  private toDomainFromPlainObject(doc: any): Prescription {
    const id = doc._id ? doc._id.toString() : '';
    return new Prescription(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.visit ? doc.visit.toString() : '',
      doc.items || [],
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.diagnosis || [],
      doc.notes
    );
  }
}

