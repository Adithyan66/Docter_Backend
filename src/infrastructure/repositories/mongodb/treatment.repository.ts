import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { ITreatmentRepository, FindAllPaginatedOptions, TreatmentListResult } from '../../../domain/repositories/treatment.repository';
import { Treatment } from '../../../domain/entities/treatment.entity';
import { TreatmentModel, ITreatment } from '../../database/mongoose/treatment.model';

@injectable()
export class MongoTreatmentRepository implements ITreatmentRepository {
  async findById(id: string): Promise<Treatment | null> {
    const treatmentDoc = await TreatmentModel.findOne({ _id: id, isDeleted: false });
    if (!treatmentDoc) return null;
    return this.toDomain(treatmentDoc);
  }

  async findAll(): Promise<Treatment[]> {
    const treatmentDocs = await TreatmentModel.find({ isDeleted: false });
    return treatmentDocs.map((doc) => this.toDomain(doc));
  }

  async findAllActive(doctorId: string): Promise<Treatment[]> {
    const treatmentDocs = await TreatmentModel.find({ isDeleted: false, doctor: new Types.ObjectId(doctorId) });
    return treatmentDocs.map((doc) => this.toDomain(doc));
  }

  async findByName(name: string, doctorId: string): Promise<Treatment | null> {
    const treatmentDoc = await TreatmentModel.findOne({ name: name.trim(), doctor: new Types.ObjectId(doctorId), isDeleted: false });
    if (!treatmentDoc) return null;
    return this.toDomain(treatmentDoc);
  }

  async findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    const filter: any = { isDeleted: false, doctor: new Types.ObjectId(doctorId) };
    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }

    const documents = await TreatmentModel.find(filter).sort({ name: 1 }).select({ name: 1 });
    return documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
    }));
  }

  async findAllPaginated(options: FindAllPaginatedOptions): Promise<{ treatments: TreatmentListResult[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, sortBy = '', sortOrder = 'desc', search, doctorId } = options;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
    };

    if (search && search.trim().length > 0) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      matchStage.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'treatmentcourses',
          let: { treatmentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$treatment', '$$treatmentId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
          ],
          as: 'treatmentCourses',
        },
      },
      {
        $addFields: {
          numberOfPatients: { $size: '$treatmentCourses' },
          ongoing: {
            $size: {
              $filter: {
                input: '$treatmentCourses',
                as: 'tc',
                cond: { $eq: ['$$tc.status', 'active'] },
              },
            },
          },
          completed: {
            $size: {
              $filter: {
                input: '$treatmentCourses',
                as: 'tc',
                cond: { $eq: ['$$tc.status', 'completed'] },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          avgFees: 1,
          avgDuration: 1,
          numberOfPatients: 1,
          ongoing: 1,
          completed: 1,
          createdAt: 1,
        },
      },
    ];

    const sortStage: any = {};
    switch (sortBy) {
      case 'averageAmount':
        sortStage.avgFees = sortDirection;
        break;
      case 'averageDuration':
        sortStage.avgDuration = sortDirection;
        break;
      case 'numberOfPatients':
        sortStage.numberOfPatients = sortDirection;
        break;
      case 'ongoing':
        sortStage.ongoing = sortDirection;
        break;
      case 'completed':
        sortStage.completed = sortDirection;
        break;
      default:
        sortStage.createdAt = sortDirection;
    }

    pipeline.push(
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
          ],
          data: [
            {
              $sort: sortStage,
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
      {
        $project: {
          treatments: '$data',
          total: {
            $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0],
          },
        },
      }
    );

    const result = await TreatmentModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        treatments: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const treatments: TreatmentListResult[] = aggregationResult.treatments.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name,
      avgFees: doc.avgFees,
      avgDuration: doc.avgDuration,
      numberOfPatients: doc.numberOfPatients || 0,
      ongoing: doc.ongoing || 0,
      completed: doc.completed || 0,
    }));

    return {
      treatments,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(entity: Treatment): Promise<Treatment> {
    const treatmentDoc = new TreatmentModel({
      doctor: new Types.ObjectId(entity.doctorId),
      name: entity.name,
      description: entity.description,
      minDuration: entity.minDuration,
      maxDuration: entity.maxDuration,
      avgDuration: entity.avgDuration,
      minFees: entity.minFees,
      maxFees: entity.maxFees,
      avgFees: entity.avgFees,
      steps: entity.steps,
      aftercare: entity.aftercare,
      followUpRequired: entity.followUpRequired,
      followUpAfterDays: entity.followUpAfterDays,
      risks: entity.risks,
      images: entity.images,
      isDeleted: entity.isDeleted || false,
    });
    const saved = await treatmentDoc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Treatment>): Promise<Treatment | null> {
    const updateData: any = {};
    if (entity.name !== undefined) updateData.name = entity.name;
    if (entity.description !== undefined) updateData.description = entity.description;
    if (entity.minDuration !== undefined) updateData.minDuration = entity.minDuration;
    if (entity.maxDuration !== undefined) updateData.maxDuration = entity.maxDuration;
    if (entity.avgDuration !== undefined) updateData.avgDuration = entity.avgDuration;
    if (entity.minFees !== undefined) updateData.minFees = entity.minFees;
    if (entity.maxFees !== undefined) updateData.maxFees = entity.maxFees;
    if (entity.avgFees !== undefined) updateData.avgFees = entity.avgFees;
    if (entity.steps !== undefined) updateData.steps = entity.steps;
    if (entity.aftercare !== undefined) updateData.aftercare = entity.aftercare;
    if (entity.followUpRequired !== undefined) updateData.followUpRequired = entity.followUpRequired;
    if (entity.followUpAfterDays !== undefined) updateData.followUpAfterDays = entity.followUpAfterDays;
    if (entity.risks !== undefined) updateData.risks = entity.risks;
    if (entity.images !== undefined) updateData.images = entity.images;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const treatmentDoc = await TreatmentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    );
    if (!treatmentDoc) return null;
    return this.toDomain(treatmentDoc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await TreatmentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  private toDomain(doc: ITreatment): Treatment {
    return new Treatment(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.name,
      doc.createdAt,
      doc.updatedAt,
      doc.description,
      doc.minDuration,
      doc.maxDuration,
      doc.avgDuration,
      doc.minFees,
      doc.maxFees,
      doc.avgFees,
      doc.steps,
      doc.aftercare,
      doc.followUpRequired,
      doc.followUpAfterDays,
      doc.risks,
      doc.images,
      doc.isDeleted
    );
  }

  private toDomainFromPlainObject(doc: any): Treatment {
    const id = doc._id ? doc._id.toString() : '';
    return new Treatment(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.name || '',
      doc.createdAt,
      doc.updatedAt,
      doc.description,
      doc.minDuration,
      doc.maxDuration,
      doc.avgDuration,
      doc.minFees,
      doc.maxFees,
      doc.avgFees,
      doc.steps,
      doc.aftercare,
      doc.followUpRequired,
      doc.followUpAfterDays,
      doc.risks,
      doc.images,
      doc.isDeleted
    );
  }
}

