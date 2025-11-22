import 'reflect-metadata';
import { container } from 'tsyringe';
import { DoctorRepository } from '../domain/repositories/doctor.repository';
import { DoctorRepository as DoctorRepositoryImpl } from '../infrastructure/repositories/doctor.repository';
import { PasswordService } from '../infrastructure/shared/password.service';
import { JwtService } from '../infrastructure/shared/jwt.service';

container.register<DoctorRepository>('DoctorRepository', {
  useClass: DoctorRepositoryImpl,
});

container.register<PasswordService>('PasswordService', {
  useClass: PasswordService,
});

container.register<JwtService>('JwtService', {
  useClass: JwtService,
});

export { container };
export default container;
