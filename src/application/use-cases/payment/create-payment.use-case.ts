import { injectable, inject } from 'tsyringe';
import { ITransactionManager } from '../../interfaces/transaction-manager.interface';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentMethodVO } from '../../../domain/value-objects/payment-method.vo';
import { CreatePaymentRequestDto, PaymentResponseDto } from '../../../presentation/dto/payment.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { paymentToDto } from '../../mappers/payment.mapper';
import { ICreatePaymentUseCase } from '../../interfaces/use-cases/payment/payment-use-cases.interface';

@injectable()
export class CreatePaymentUseCase implements ICreatePaymentUseCase {
  constructor(
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager
  ) {}

  async execute(doctorId: string, input: CreatePaymentRequestDto): Promise<PaymentResponseDto> {
    this.validateInput(input);

    await this.validateReferences(doctorId, input);

    const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
    if (!course) {
      throw new ValidationError('TreatmentCourse not found');
    }

    if (course.patientId !== input.patientId.trim()) {
      throw new ValidationError('Patient mismatch: Payment.patient must equal TreatmentCourse.patient');
    }

    const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();
    const method = new PaymentMethodVO(input.method);

    const payment = new Payment(
      '',
      doctorId,
      input.patientId.trim(),
      input.courseId.trim(),
      input.amount,
      method,
      paidAt,
      undefined,
      undefined,
      input.visitId ? input.visitId.trim() : undefined,
      input.clinicId ? input.clinicId.trim() : undefined,
      input.reference ? input.reference.trim() : undefined,
      false,
      undefined,
      false
    );

    return this.txManager.runInTransaction(async (tx) => {
      const created = await this.paymentRepository.create(payment, tx);

      await this.treatmentCourseRepository.incrementTotalPaid(course.id, input.amount, tx, created.id);

      return paymentToDto(created);
    });
  }

  private validateInput(input: CreatePaymentRequestDto): void {
    if (!input.patientId || input.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }
    if (!input.courseId || input.courseId.trim().length === 0) {
      throw new ValidationError('courseId is required');
    }
    if (input.amount === undefined || input.amount <= 0) {
      throw new ValidationError('amount is required and must be greater than zero');
    }
    if (!input.method) {
      throw new ValidationError('method is required');
    }
    if (input.paidAt && isNaN(new Date(input.paidAt).getTime())) {
      throw new ValidationError('Invalid paidAt date');
    }
  }

  private async validateReferences(doctorId: string, input: CreatePaymentRequestDto): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new ValidationError('Doctor not found');
    }

    const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
    if (!patient) {
      throw new ValidationError('Patient not found or does not belong to doctor');
    }

    const course = await this.treatmentCourseRepository.findByIdAndDoctor(input.courseId.trim(), doctorId);
    if (!course) {
      throw new ValidationError('TreatmentCourse not found or does not belong to doctor');
    }

    if (input.visitId) {
      const visit = await this.visitRepository.findById(input.visitId.trim());
      if (!visit || visit.doctorId !== doctorId) {
        throw new ValidationError('Visit not found or does not belong to doctor');
      }
    }

    if (input.clinicId) {
      const clinic = await this.clinicRepository.findById(input.clinicId.trim());
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('Clinic not found or does not belong to doctor');
      }
    }
  }
}

