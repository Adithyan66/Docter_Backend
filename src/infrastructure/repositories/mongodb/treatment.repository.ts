import { injectable } from 'tsyringe';
import { PipelineStage } from 'mongoose';
import { ITreatmentRepository, FindAllPaginatedOptions } from '../../../domain/repositories/treatment.repository';
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

  async findAllActive(): Promise<Treatment[]> {
    return this.findAll();
  }

  async findByName(name: string): Promise<Treatment | null> {
    const treatmentDoc = await TreatmentModel.findOne({ name: name.trim(), isDeleted: false });
    if (!treatmentDoc) return null;
    return this.toDomain(treatmentDoc);
  }

  async findNames(search?: string): Promise<Array<{ id: string; name: string }>> {
    const filter: any = { isDeleted: false };
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

  async findAllPaginated(options: FindAllPaginatedOptions): Promise<{ treatments: Treatment[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc', search } = options;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      isDeleted: false,
    };

    if (search && search.trim().length > 0) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      matchStage.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    const sortField = this.getSortField(sortBy);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
    ];

    if (sortBy === 'fees' || sortBy === 'duration') {
      pipeline.push({
        $addFields: {
          sortValue: {
            $ifNull: [sortBy === 'fees' ? '$avgFees' : '$avgDuration', sortOrder === 'asc' ? Number.MAX_SAFE_INTEGER : -1],
          },
        },
      });
    }

    const sortStage: any = {};
    if (sortBy === 'fees' || sortBy === 'duration') {
      sortStage.sortValue = sortDirection;
      sortStage.createdAt = -1;
    } else {
      sortStage[sortField] = sortDirection;
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
            ...(sortBy === 'fees' || sortBy === 'duration' ? [{
              $project: {
                sortValue: 0,
              },
            }] : []),
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

    const treatments = aggregationResult.treatments.map((doc: any) =>
      this.toDomainFromPlainObject(doc)
    );

    return {
      treatments,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private getSortField(sortBy: 'fees' | 'duration' | 'createdAt'): string {
    switch (sortBy) {
      case 'fees':
        return 'avgFees';
      case 'duration':
        return 'avgDuration';
      case 'createdAt':
      default:
        return 'createdAt';
    }
  }

  async create(entity: Treatment): Promise<Treatment> {
    const treatmentDoc = new TreatmentModel({
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

