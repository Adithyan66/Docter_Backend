import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IPatientRepository, PatientSearchOptions } from '../../../domain/repositories/patient.repository';
import { Patient } from '../../../domain/entities/patient.entity';
import { PatientModel, IPatient } from '../../database/mongoose/patient.model';
import { Email } from '../../../domain/value-objects/email.vo';
import { Phone } from '../../../domain/value-objects/phone.vo';
import { PatientId } from '../../../domain/value-objects/patient-id.vo';

@injectable()
export class MongoPatientRepository implements IPatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const doc = await PatientModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Patient | null> {
    const doc = await PatientModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctorIncludingDeleted(id: string, doctorId: string): Promise<Patient | null> {
    const doc = await PatientModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<Patient[]> {
    const docs = await PatientModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByPatientId(patientId: string): Promise<Patient | null> {
    const doc = await PatientModel.findOne({ patientId: patientId.trim().toUpperCase(), isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }




  async findPaginated(options: PatientSearchOptions): Promise<{
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    clinicNames?: Record<string, string>;
  }> {
    const { page, limit, doctorId, search, patientId, clinicId, gender, consultationType, minAge, maxAge, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const baseMatch: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
    };

    const andConditions: any[] = [baseMatch];

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { fullName: regex },
          // { firstName: regex },
          // { lastName: regex },
          { patientId: regex },
        ],
      });
    }

    if (patientId && patientId.trim().length > 0) {
      andConditions.push({ patientId: patientId.trim().toUpperCase() });
    }

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      const clinicObjectId = new Types.ObjectId(clinicId);
      andConditions.push({
        $or: [{ primaryClinic: clinicObjectId }, { clinics: clinicObjectId }],
      });
    }

    if (gender) {
      andConditions.push({ gender });
    }

    if (consultationType) {
      andConditions.push({ consultationType });
    }

    if (minAge !== undefined || maxAge !== undefined) {
      const ageFilter: any = {};
      if (minAge !== undefined) ageFilter.$gte = minAge;
      if (maxAge !== undefined) ageFilter.$lte = maxAge;
      andConditions.push({ age: ageFilter });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      fullName: 'fullName',
      visitCount: 'visitCount',
      lastVisitAt: 'lastVisitAt',
    };
    const resolvedSortField = sortFieldMap[sortBy || 'createdAt'] || 'createdAt';
    const resolvedSortOrder = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { [resolvedSortField]: resolvedSortOrder, _id: resolvedSortOrder } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'clinics',
                localField: 'primaryClinic',
                foreignField: '_id',
                as: 'primaryClinicData',
              },
            },
            {
              $project: {
                _id: 1,
                doctor: 1,
                primaryClinic: 1,
                primaryClinicName: { $ifNull: [{ $arrayElemAt: ['$primaryClinicData.name', 0] }, null] },
                clinics: 1,
                patientId: 1,
                firstName: 1,
                lastName: 1,
                fullName: 1,
                dob: 1,
                age: 1,
                gender: 1,
                phone: 1,
                email: 1,
                address: 1,
                profilePicUrl: 1,
                consultationType: 1,
                tags: 1,
                treatmentCourses: 1,
                visitCount: 1,
                lastVisitAt: 1,
                isActive: 1,
                isDeleted: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          patients: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await PatientModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        patients: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        clinicNames: {},
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const clinicNames: Record<string, string> = {};
    const patients = (aggregationResult.patients || []).map((doc: any) => {
      if (doc.primaryClinicName && doc._id) {
        clinicNames[doc._id.toString()] = doc.primaryClinicName;
      }
      return this.toDomainFromPlain(doc);
    });

    return {
      patients,
      total,
      page,
      limit,
      totalPages,
      clinicNames,
    };
  }




  async create(entity: Patient): Promise<Patient> {
    const doc = new PatientModel({
      doctor: new Types.ObjectId(entity.doctorId),
      primaryClinic: this.toObjectId(entity.primaryClinic),
      clinics: (entity.clinics || []).map((id) => this.toObjectId(id)).filter((c): c is Types.ObjectId => !!c),
      patientId: entity.patientId?.toString(),
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: entity.fullName,
      dob: entity.dob,
      age: entity.age,
      gender: entity.gender,
      phone: entity.phone?.toString(),
      email: entity.email?.toString(),
      address: entity.address,
      profilePicUrl: entity.profilePicUrl,
      consultationType: entity.consultationType,
      tags: entity.tags || [],
      treatmentCourses: (entity.treatmentCourses || []).map((id) => this.toObjectId(id)).filter((c): c is Types.ObjectId => !!c),
      visitCount: entity.visitCount,
      lastVisitAt: entity.lastVisitAt,
      isActive: entity.isActive,
      isDeleted: entity.isDeleted,
    });

    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Patient>, session?: any): Promise<Patient | null> {
    const updateData: any = {};

    if (entity.primaryClinic !== undefined) {
      updateData.primaryClinic = this.toObjectId(entity.primaryClinic);
    }
    if (entity.clinics !== undefined) {
      updateData.clinics = (entity.clinics || []).map((c) => this.toObjectId(c)).filter((c): c is Types.ObjectId => !!c);
    }
    if (entity.patientId !== undefined) {
      updateData.patientId = entity.patientId ? entity.patientId.toString() : undefined;
    }
    if (entity.firstName !== undefined) updateData.firstName = entity.firstName;
    if (entity.lastName !== undefined) updateData.lastName = entity.lastName;
    if (entity.fullName !== undefined) updateData.fullName = entity.fullName;
    if (entity.dob !== undefined) updateData.dob = entity.dob;
    if (entity.age !== undefined) updateData.age = entity.age;
    if (entity.gender !== undefined) updateData.gender = entity.gender;
    if (entity.phone !== undefined) {
      updateData.phone = entity.phone ? entity.phone.toString() : undefined;
    }
    if (entity.email !== undefined) {
      updateData.email = entity.email ? entity.email.toString() : undefined;
    }
    if (entity.address !== undefined) updateData.address = entity.address;
    if (entity.profilePicUrl !== undefined) {
      updateData.profilePicUrl = entity.profilePicUrl === null ? null : entity.profilePicUrl;
    }
    if (entity.consultationType !== undefined) updateData.consultationType = entity.consultationType;
    if (entity.tags !== undefined) updateData.tags = entity.tags;
    if (entity.treatmentCourses !== undefined) {
      updateData.treatmentCourses = (entity.treatmentCourses || []).map((c) => this.toObjectId(c)).filter((c): c is Types.ObjectId => !!c);
    }
    if (entity.visitCount !== undefined) updateData.visitCount = entity.visitCount;
    if (entity.lastVisitAt !== undefined) updateData.lastVisitAt = entity.lastVisitAt;
    if (entity.isActive !== undefined) updateData.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    await PatientModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      updateOptions
    );
    const updated = await PatientModel.findOne({ _id: id, isDeleted: false }).session(session || null);
    if (!updated) return null;
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<boolean> {
    const result = await PatientModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );
    return !!result;
  }

  private toDomain(doc: IPatient | any): Patient {
    const email = this.safeCreateEmail(doc.email);
    const phone = this.safeCreatePhone(doc.phone);
    const patientId = this.safeCreatePatientId(doc.patientId);

    return new Patient(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.firstName,
      doc.consultationType,
      doc.createdAt,
      doc.updatedAt,
      doc.primaryClinic ? doc.primaryClinic.toString() : undefined,
      this.buildClinics(doc.clinics),
      patientId,
      doc.lastName,
      doc.fullName,
      doc.dob,
      doc.age,
      doc.gender,
      phone,
      email,
      doc.address,
      doc.profilePicUrl,
      doc.tags,
      this.buildTreatmentCourses(doc.treatmentCourses),
      doc.visitCount,
      doc.lastVisitAt,
      doc.isActive,
      doc.isDeleted
    );
  }

  private toDomainFromPlain(doc: any): Patient {
    const email = this.safeCreateEmail(doc.email);
    const phone = this.safeCreatePhone(doc.phone);
    const patientId = this.safeCreatePatientId(doc.patientId);

    return new Patient(
      doc._id ? doc._id.toString() : '',
      doc.doctor ? doc.doctor.toString() : '',
      doc.firstName,
      doc.consultationType,
      doc.createdAt,
      doc.updatedAt,
      doc.primaryClinic ? doc.primaryClinic.toString() : undefined,
      this.buildClinics(doc.clinics),
      patientId,
      doc.lastName,
      doc.fullName,
      doc.dob ? new Date(doc.dob) : undefined,
      doc.age,
      doc.gender,
      phone,
      email,
      doc.address,
      doc.profilePicUrl,
      doc.tags,
      this.buildTreatmentCourses(doc.treatmentCourses),
      doc.visitCount,
      doc.lastVisitAt ? new Date(doc.lastVisitAt) : undefined,
      doc.isActive,
      doc.isDeleted
    );
  }

  private buildClinics(clinics?: any[]): string[] {
    if (!clinics || clinics.length === 0) {
      return [];
    }
    return clinics.map((clinic) => {
      if (!clinic) return '';
      if (typeof clinic === 'string') return clinic;
      if (clinic._id) return clinic._id.toString();
      return clinic.toString();
    }).filter((value) => !!value);
  }

  private toObjectId(id?: string): Types.ObjectId | undefined {
    if (!id) return undefined;
    if (!Types.ObjectId.isValid(id)) return undefined;
    return new Types.ObjectId(id);
  }

  private safeCreateEmail(email?: string): Email | undefined {
    if (!email) return undefined;
    try {
      return new Email(email);
    } catch {
      return undefined;
    }
  }

  private safeCreatePhone(phone?: string): Phone | undefined {
    if (!phone) return undefined;
    try {
      return new Phone(phone);
    } catch {
      return undefined;
    }
  }

  private safeCreatePatientId(id?: string): PatientId | undefined {
    if (!id) return undefined;
    try {
      return new PatientId(id);
    } catch {
      return undefined;
    }
  }

  private buildTreatmentCourses(treatmentCourses?: any[]): string[] {
    if (!treatmentCourses || treatmentCourses.length === 0) {
      return [];
    }
    return treatmentCourses.map((course) => {
      if (!course) return '';
      if (typeof course === 'string') return course;
      if (course._id) return course._id.toString();
      return course.toString();
    }).filter((value) => !!value);
  }

  async getActivePatientCount(doctorId: string, clinicId?: string): Promise<number> {
    const match: any = {
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
      isActive: true,
    };

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      match.clinics = new Types.ObjectId(clinicId);
    }

    const result = await PatientModel.countDocuments(match);
    return result;
  }
}


