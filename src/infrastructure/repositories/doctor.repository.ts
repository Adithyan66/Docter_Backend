import { injectable } from 'tsyringe';
import { DoctorRepository as IDoctorRepository } from '../../domain/repositories/doctor.repository';
import { Doctor } from '../../domain/entities/doctor.entity';
import { DoctorModel, IDoctor } from '../database/mongoose/doctor.model';
import { Email } from '../../domain/value-objects/email.vo';

@injectable()
export class DoctorRepository implements IDoctorRepository {
  async findById(id: string): Promise<Doctor | null> {
    const doctorDoc = await DoctorModel.findById(id);
    if (!doctorDoc) return null;
    return this.toDomain(doctorDoc);
  }

  async findAll(): Promise<Doctor[]> {
    const doctorDocs = await DoctorModel.find();
    return doctorDocs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Doctor): Promise<Doctor> {
    const doctorDoc = new DoctorModel({
      email: entity.email.toString(),
      password: entity.password,
    });
    const saved = await doctorDoc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<Doctor>): Promise<Doctor | null> {
    const updateData: any = {};
    if (entity.email) updateData.email = entity.email.toString();
    if (entity.password) updateData.password = entity.password;

    const doctorDoc = await DoctorModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!doctorDoc) return null;
    return this.toDomain(doctorDoc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await DoctorModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    const doctorDoc = await DoctorModel.findOne({ email: email.toLowerCase() });
    if (!doctorDoc) return null;
    return this.toDomain(doctorDoc);
  }

  private toDomain(doc: IDoctor): Doctor {
    return new Doctor(
      doc._id.toString(),
      new Email(doc.email),
      doc.password,
      doc.createdAt,
      doc.updatedAt
    );
  }
}

