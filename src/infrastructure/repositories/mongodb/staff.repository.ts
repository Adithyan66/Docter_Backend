import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import { IStaffRepository, FindAllStaffPaginatedOptions, PaginatedStaffResult } from '../../../domain/repositories/staff.repository';
import { Staff } from '../../../domain/entities/staff.entity';
import { StaffModel, IStaff } from '../../database/mongoose/staff.model';
import { IPasswordService } from '../../../application/interfaces/password-service.interface';

@injectable()
export class MongoStaffRepository implements IStaffRepository {
  constructor(@inject('IPasswordService') private readonly passwordService: IPasswordService) {}

  async findById(id: string): Promise<Staff | null> {
    const doc = await StaffModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByIdWithClinicName(id: string): Promise<(Staff & { clinicName?: string }) | null> {
    const objectId = new mongoose.Types.ObjectId(id);
    const docs = await StaffModel.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinicId',
          foreignField: '_id',
          as: 'clinic',
        },
      },
      {
        $unwind: {
          path: '$clinic',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          clinicId: 1,
          doctorId: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
          clinicName: '$clinic.name',
        },
      },
    ]);
    const doc = docs[0];
    if (!doc) return null;
    const staff = this.toDomain({
      _id: doc._id,
      username: doc.username,
      password: '',
      clinicId: doc.clinicId,
      doctorId: doc.doctorId,
      role: doc.role,
      refreshToken: null,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as IStaff);
    return { ...staff, clinicName: doc.clinicName };
  }

  async findAll(): Promise<Staff[]> {
    const docs = await StaffModel.find();
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Staff): Promise<Staff> {
    const passwordToSave = entity.password.startsWith('$2') ? entity.password : await this.passwordService.hash(entity.password);
    const doc = new StaffModel({
      username: entity.username.toLowerCase(),
      password: passwordToSave,
      clinicId: new mongoose.Types.ObjectId(entity.clinicId),
      doctorId: new mongoose.Types.ObjectId(entity.doctorId),
      role: entity.role,
      refreshToken: entity.refreshToken,
      isActive: entity.isActive,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Staff>): Promise<Staff | null> {
    const updateData: any = {};
    if (entity.username) updateData.username = entity.username.toLowerCase();
    if (entity.clinicId) updateData.clinicId = new mongoose.Types.ObjectId(entity.clinicId);
    if (entity.doctorId) updateData.doctorId = new mongoose.Types.ObjectId(entity.doctorId);
    if (entity.role) updateData.role = entity.role;
    if (entity.refreshToken !== undefined) updateData.refreshToken = entity.refreshToken;
    if (entity.isActive !== undefined) updateData.isActive = entity.isActive;
    if (entity.password) {
      updateData.password = entity.password.startsWith('$2')
        ? entity.password
        : await this.passwordService.hash(entity.password);
    }

    const updated = await StaffModel.findByIdAndUpdate(id, updateData, { new: true });
    return updated ? this.toDomain(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await StaffModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByUsername(username: string): Promise<Staff | null> {
    const doc = await StaffModel.findOne({ username: username.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  async findByDoctorId(doctorId: string): Promise<Staff[]> {
    const docs = await StaffModel.find({ doctorId: new mongoose.Types.ObjectId(doctorId) });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByClinicId(clinicId: string): Promise<Staff[]> {
    const docs = await StaffModel.find({ clinicId: new mongoose.Types.ObjectId(clinicId) });
    return docs.map((doc) => this.toDomain(doc));
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    await StaffModel.findByIdAndUpdate(id, { refreshToken });
  }

  async findAllPaginated(options: FindAllStaffPaginatedOptions): Promise<PaginatedStaffResult> {
    const { doctorId, page, limit, username, clinicId, isActive } = options;
    const skip = (page - 1) * limit;

    const matchStage: any = {
      doctorId: new mongoose.Types.ObjectId(doctorId),
    };

    if (username) {
      matchStage.username = { $regex: username, $options: 'i' };
    }

    if (clinicId) {
      matchStage.clinicId = new mongoose.Types.ObjectId(clinicId);
    }

    if (isActive !== undefined) {
      matchStage.isActive = isActive;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinicId',
          foreignField: '_id',
          as: 'clinic',
        },
      },
      {
        $unwind: {
          path: '$clinic',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                username: 1,
                clinicId: 1,
                doctorId: 1,
                role: 1,
                isActive: 1,
                createdAt: 1,
                updatedAt: 1,
                clinicName: '$clinic.name',
              },
            },
          ],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const result = await StaffModel.aggregate(pipeline);
    const data = result[0]?.data || [];
    const total = result[0]?.total[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    const staff = data.map((doc: any) => {
      const staffEntity = this.toDomain({
        _id: doc._id,
        username: doc.username,
        password: '',
        clinicId: doc.clinicId,
        doctorId: doc.doctorId,
        role: doc.role,
        refreshToken: null,
        isActive: doc.isActive,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      } as IStaff);
      return {
        ...staffEntity,
        clinicName: doc.clinicName,
      };
    });

    return {
      staff,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: IStaff): Staff {
    return new Staff(
      doc._id.toString(),
      doc.username,
      doc.password,
      doc.clinicId.toString(),
      doc.doctorId.toString(),
      doc.refreshToken,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt
    );
  }
}


