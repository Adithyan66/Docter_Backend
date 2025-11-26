import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IClinicRepository, FindAllPaginatedOptions } from '../../../domain/repositories/clinic.repository';
import { Clinic } from '../../../domain/entities/clinic.entity';
import { ClinicModel, IClinic } from '../../database/mongoose/clinic.model';
import { Email } from '../../../domain/value-objects/email.vo';
import { WorkingDay } from '../../../domain/value-objects/working-day.vo';

@injectable()
export class MongoClinicRepository implements IClinicRepository {
  async findById(id: string): Promise<Clinic | null> {
    const clinicDoc = await ClinicModel.findOne({ _id: id, isDeleted: false }).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async findAll(): Promise<Clinic[]> {
    const clinicDocs = await ClinicModel.find({ isDeleted: false }).populate('treatments', 'name');
    return clinicDocs.map((doc) => this.toDomain(doc));
  }

  async findByName(name: string, doctorId: string): Promise<Clinic | null> {
    const clinicDoc = await ClinicModel.findOne({ name: name.trim(), doctor: new Types.ObjectId(doctorId), isDeleted: false }).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async findByClinicId(clinicId: string, doctorId: string): Promise<Clinic | null> {
    const clinicDoc = await ClinicModel.findOne({ clinicId: clinicId.toUpperCase(), doctor: new Types.ObjectId(doctorId), isDeleted: false }).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    const filter: any = { isDeleted: false, doctor: new Types.ObjectId(doctorId) };
    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { city: regex }];
    }

    const documents = await ClinicModel.find(filter).sort({ name: 1 }).select({ name: 1 });
    return documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
    }));
  }

  async findAllPaginated(options: FindAllPaginatedOptions): Promise<{ clinics: Clinic[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, search, doctorId } = options;
    const skip = (page - 1) * limit;

    const matchStage: any = { isDeleted: false, doctor: new Types.ObjectId(doctorId) };

    if (search && search.trim().length > 0) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      matchStage.$or = [
        { name: searchRegex },
        { city: searchRegex },
      ];
    }

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'treatments',
          localField: 'treatments',
          foreignField: '_id',
          as: 'populatedTreatments',
          pipeline: [
            {
              $match: { isDeleted: { $ne: true } },
            },
            {
              $project: { name: 1 },
            },
          ],
        },
      },
      {
        $addFields: {
          populatedTreatments: {
            $map: {
              input: '$populatedTreatments',
              as: 'treatment',
              in: {
                id: { $toString: '$$treatment._id' },
                name: '$$treatment.name',
              },
            },
          },
        },
      },
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
          ],
          data: [
            {
              $sort: { createdAt: -1 },
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
          clinics: '$data',
          total: {
            $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0],
          },
        },
      }
    ];

    const result = await ClinicModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        clinics: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const clinics = aggregationResult.clinics.map((doc: any) =>
      this.toDomainFromPlainObject(doc)
    );

    return {
      clinics,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(entity: Clinic): Promise<Clinic> {
    const clinicDoc = new ClinicModel({
      clinicId: entity.clinicId.toUpperCase(),
      doctor: new Types.ObjectId(entity.doctorId),
      name: entity.name,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      pincode: entity.pincode,
      phone: entity.phone,
      email: entity.email?.toString(),
      website: entity.website,
      locationUrl: entity.locationUrl,
      workingDays: entity.workingDays?.map(wd => ({
        day: wd.getDay(),
        startTime: wd.getStartTime(),
        endTime: wd.getEndTime(),
      })),
      treatments: entity.treatments?.map(t => t) || [],
      images: entity.images,
      notes: entity.notes,
      isActive: entity.isActive !== undefined ? entity.isActive : true,
      isDeleted: entity.isDeleted !== undefined ? entity.isDeleted : false,
    });
    const saved = await clinicDoc.save();
    const populated = await ClinicModel.findById(saved._id).populate('treatments', 'name');
    return this.toDomain(populated || saved);
  }

  async update(id: string, entity: Partial<Clinic>): Promise<Clinic | null> {
    const updateData: any = {};
    if (entity.clinicId !== undefined) {
      throw new Error('clinicId cannot be updated');
    }
    if (entity.name !== undefined) updateData.name = entity.name;
    if (entity.address !== undefined) updateData.address = entity.address;
    if (entity.city !== undefined) updateData.city = entity.city;
    if (entity.state !== undefined) updateData.state = entity.state;
    if (entity.pincode !== undefined) updateData.pincode = entity.pincode;
    if (entity.phone !== undefined) updateData.phone = entity.phone;
    if (entity.email !== undefined) {
      updateData.email = entity.email ? entity.email.toString() : undefined;
    }
    if (entity.website !== undefined) updateData.website = entity.website;
    if (entity.locationUrl !== undefined) updateData.locationUrl = entity.locationUrl;
    if (entity.workingDays !== undefined) {
      updateData.workingDays = entity.workingDays.length > 0
        ? entity.workingDays.map(wd => ({
            day: wd.getDay(),
            startTime: wd.getStartTime(),
            endTime: wd.getEndTime(),
          }))
        : [];
    }
    if (entity.treatments !== undefined) updateData.treatments = entity.treatments;
    if (entity.images !== undefined) updateData.images = entity.images;
    if (entity.notes !== undefined) updateData.notes = entity.notes;
    if (entity.isActive !== undefined) updateData.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const clinicDoc = await ClinicModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    ).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await ClinicModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  private toDomain(doc: IClinic | any): Clinic {
    let email: Email | undefined;
    if (doc.email) {
      try {
        email = new Email(doc.email);
      } catch {
        email = undefined;
      }
    }

    let workingDays: WorkingDay[] | undefined;
    if (doc.workingDays && doc.workingDays.length > 0) {
      const mapped = doc.workingDays.map((wd: any) => {
        try {
          return new WorkingDay(wd.day as any, wd.startTime, wd.endTime);
        } catch {
          return null;
        }
      }).filter((wd: WorkingDay | null): wd is WorkingDay => wd !== null);
      workingDays = mapped.length > 0 ? mapped : undefined;
    }

    let treatmentIds: string[] | undefined;
    let populatedTreatmentsData: Array<{ id: string; name: string }> | undefined;
    
    const populatedTreatments = this.extractPopulatedTreatments(doc);
    if (populatedTreatments && populatedTreatments.length > 0) {
      populatedTreatmentsData = populatedTreatments.map((t: any) => ({
        id: typeof t === 'object' && t._id ? t._id.toString() : (typeof t === 'object' && t.id ? t.id : t.toString()),
        name: typeof t === 'object' && (t.name || t.name) ? t.name : undefined,
      })).filter((t: any) => t.id && t.name);
      treatmentIds = populatedTreatmentsData.map(t => t.id);
    } else if (doc.treatments) {
      treatmentIds = doc.treatments.map((t: any) => {
        if (typeof t === 'object' && t._id) return t._id.toString();
        return t.toString();
      });
    }

    return new Clinic(
      doc._id.toString(),
      doc.clinicId,
      doc.doctor ? doc.doctor.toString() : '',
      doc.name,
      doc.createdAt,
      doc.updatedAt,
      doc.address,
      doc.city,
      doc.state,
      doc.pincode,
      doc.phone,
      email,
      doc.website,
      doc.locationUrl,
      workingDays,
      treatmentIds,
      populatedTreatmentsData,
      doc.images,
      doc.notes,
      doc.isActive,
      doc.isDeleted
    );
  }

  private extractPopulatedTreatments(doc: any): any[] | null {
    if (!doc.treatments || !Array.isArray(doc.treatments)) {
      return null;
    }
    
    if (doc.treatments.length > 0 && typeof doc.treatments[0] === 'object' && doc.treatments[0].name) {
      return doc.treatments;
    }
    
    if (doc.populatedTreatments && Array.isArray(doc.populatedTreatments)) {
      return doc.populatedTreatments;
    }
    
    return null;
  }

  private toDomainFromPlainObject(doc: any): Clinic {
    const id = doc._id ? doc._id.toString() : '';
    
    let email: Email | undefined;
    if (doc.email) {
      try {
        email = new Email(doc.email);
      } catch {
        email = undefined;
      }
    }

    let workingDays: WorkingDay[] | undefined;
    if (doc.workingDays && doc.workingDays.length > 0) {
      const mapped = doc.workingDays.map((wd: any) => {
        try {
          return new WorkingDay(wd.day, wd.startTime, wd.endTime);
        } catch {
          return null;
        }
      }).filter((wd: WorkingDay | null): wd is WorkingDay => wd !== null);
      workingDays = mapped.length > 0 ? mapped : undefined;
    }

    let treatmentIds: string[] | undefined;
    let populatedTreatmentsData: Array<{ id: string; name: string }> | undefined;
    
    if (doc.populatedTreatments && Array.isArray(doc.populatedTreatments)) {
      populatedTreatmentsData = doc.populatedTreatments
        .filter((t: any) => t && t.id && t.name)
        .map((t: any) => ({ id: t.id, name: t.name }));
      treatmentIds = populatedTreatmentsData ? populatedTreatmentsData.map(t => t.id) : undefined;
    } else if (doc.treatments) {
      if (doc.treatments.length > 0 && typeof doc.treatments[0] === 'object' && doc.treatments[0].name) {
        populatedTreatmentsData = doc.treatments.map((t: any) => ({
          id: t._id ? t._id.toString() : t.toString(),
          name: t.name,
        })).filter((t: any) => t.id && t.name);
        treatmentIds = populatedTreatmentsData ? populatedTreatmentsData.map(t => t.id) : undefined;
      } else {
        treatmentIds = doc.treatments.map((t: any) => {
          if (typeof t === 'object' && t._id) {
            return t._id.toString();
          }
          return t.toString();
        });
      }
    }

    return new Clinic(
      id,
      doc.clinicId || '',
      doc.doctor ? doc.doctor.toString() : '',
      doc.name || '',
      doc.createdAt,
      doc.updatedAt,
      doc.address,
      doc.city,
      doc.state,
      doc.pincode,
      doc.phone,
      email,
      doc.website,
      doc.locationUrl,
      workingDays,
      treatmentIds,
      populatedTreatmentsData,
      doc.images,
      doc.notes,
      doc.isActive,
      doc.isDeleted
    );
  }
}

