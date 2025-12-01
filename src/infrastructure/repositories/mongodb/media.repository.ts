import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IMediaRepository, MediaSearchOptions } from '../../../domain/repositories/media.repository';
import { Media } from '../../../domain/entities/media.entity';
import { MediaModel, IMedia } from '../../database/mongoose/media.model';

@injectable()
export class MongoMediaRepository implements IMediaRepository {
  async findById(id: string): Promise<Media | null> {
    const doc = await MediaModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Media | null> {
    const doc = await MediaModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<Media[]> {
    const docs = await MediaModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Media): Promise<Media> {
    const doc = new MediaModel({
      doctor: new Types.ObjectId(entity.doctorId),
      patient: entity.patientId ? new Types.ObjectId(entity.patientId) : undefined,
      course: entity.courseId ? new Types.ObjectId(entity.courseId) : undefined,
      visit: entity.visitId ? new Types.ObjectId(entity.visitId) : undefined,
      clinic: entity.clinicId ? new Types.ObjectId(entity.clinicId) : undefined,
      url: entity.url,
      filename: entity.filename,
      mimeType: entity.mimeType,
      size: entity.size,
      type: entity.type || 'image',
      notes: entity.notes,
      isDeleted: entity.isDeleted || false,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Media>): Promise<Media | null> {
    const updateData: any = {};
    if (entity.doctorId !== undefined) updateData.doctor = new Types.ObjectId(entity.doctorId);
    if (entity.patientId !== undefined) updateData.patient = entity.patientId ? new Types.ObjectId(entity.patientId) : null;
    if (entity.courseId !== undefined) updateData.course = entity.courseId ? new Types.ObjectId(entity.courseId) : null;
    if (entity.visitId !== undefined) updateData.visit = entity.visitId ? new Types.ObjectId(entity.visitId) : null;
    if (entity.clinicId !== undefined) updateData.clinic = entity.clinicId ? new Types.ObjectId(entity.clinicId) : null;
    if (entity.url !== undefined) updateData.url = entity.url;
    if (entity.filename !== undefined) updateData.filename = entity.filename;
    if (entity.mimeType !== undefined) updateData.mimeType = entity.mimeType;
    if (entity.size !== undefined) updateData.size = entity.size;
    if (entity.type !== undefined) updateData.type = entity.type;
    if (entity.notes !== undefined) updateData.notes = entity.notes;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const doc = await MediaModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await MediaModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  async findPaginated(options: MediaSearchOptions): Promise<{
    media: Media[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, courseId, visitId, clinicId, type, sortBy = 'createdAt', sortOrder = 'desc' } = options;
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

    if (visitId && Types.ObjectId.isValid(visitId)) {
      andConditions.push({ visit: new Types.ObjectId(visitId) });
    }

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      andConditions.push({ clinic: new Types.ObjectId(clinicId) });
    }

    if (type) {
      andConditions.push({ type });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      type: 'type',
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
          media: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await MediaModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        media: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const media = aggregationResult.media.map((doc: any) => this.toDomainFromPlainObject(doc));

    return {
      media,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: IMedia): Media {
    return new Media(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.url,
      (doc.type || 'image') as 'image' | 'xray' | 'report' | 'other',
      doc.createdAt,
      doc.updatedAt,
      doc.patient ? doc.patient.toString() : undefined,
      doc.course ? doc.course.toString() : undefined,
      doc.visit ? doc.visit.toString() : undefined,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.filename,
      doc.mimeType,
      doc.size,
      doc.notes,
      doc.isDeleted || false
    );
  }

  private toDomainFromPlainObject(doc: any): Media {
    const id = doc._id ? doc._id.toString() : '';
    return new Media(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.url || '',
      (doc.type || 'image') as 'image' | 'xray' | 'report' | 'other',
      doc.createdAt,
      doc.updatedAt,
      doc.patient ? doc.patient.toString() : undefined,
      doc.course ? doc.course.toString() : undefined,
      doc.visit ? doc.visit.toString() : undefined,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.filename,
      doc.mimeType,
      doc.size,
      doc.notes,
      doc.isDeleted || false
    );
  }

  async markDeletedByPatientId(patientId: string, doctorId: string, session?: any): Promise<number> {
    const result = await MediaModel.updateMany(
      {
        patient: new Types.ObjectId(patientId),
        doctor: new Types.ObjectId(doctorId),
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      { session }
    );
    return result.modifiedCount;
  }

  async markRestoredByPatientId(patientId: string, doctorId: string, session?: any): Promise<number> {
    const result = await MediaModel.updateMany(
      {
        patient: new Types.ObjectId(patientId),
        doctor: new Types.ObjectId(doctorId),
        isDeleted: true,
      },
      {
        isDeleted: false,
      },
      { session }
    );
    return result.modifiedCount;
  }
}

