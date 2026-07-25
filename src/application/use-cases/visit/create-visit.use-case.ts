import { injectable, inject } from 'tsyringe';
import { ITransactionManager } from '../../interfaces/transaction-manager.interface';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { IPatientRepository } from '../../../domain/repositories/patient.repository';
import { IDoctorRepository } from '../../../domain/repositories/doctor.repository';
import { IPrescriptionRepository } from '../../../domain/repositories/prescription.repository';
import { IMediaRepository } from '../../../domain/repositories/media.repository';
import { IClinicRepository } from '../../../domain/repositories/clinic.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { Visit } from '../../../domain/entities/visit.entity';
import { Prescription } from '../../../domain/entities/prescription.entity';
import { Media } from '../../../domain/entities/media.entity';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentMethodVO } from '../../../domain/value-objects/payment-method.vo';
import { CreateVisitRequestDto, VisitResponseDto, CreateVisitMediaDto } from '../../../presentation/dto/visit.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { visitToDto } from '../../mappers/visit.mapper';
import { ICreateVisitUseCase } from '../../interfaces/use-cases/visit/visit-use-cases.interface';

@injectable()
export class CreateVisitUseCase implements ICreateVisitUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('IPatientRepository') private readonly patientRepository: IPatientRepository,
    @inject('IDoctorRepository') private readonly doctorRepository: IDoctorRepository,
    @inject('IPrescriptionRepository') private readonly prescriptionRepository: IPrescriptionRepository,
    @inject('IMediaRepository') private readonly mediaRepository: IMediaRepository,
    @inject('IClinicRepository') private readonly clinicRepository: IClinicRepository,
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository,
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager
  ) {}

  async execute(doctorId: string, input: CreateVisitRequestDto): Promise<VisitResponseDto> {
    this.validateInput(input);

    await this.validateReferences(doctorId, input);

    const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
    if (!course) {
      throw new ValidationError('TreatmentCourse not found');
    }

    if (course.patientId !== input.patientId.trim()) {
      throw new ValidationError('Patient mismatch: Visit.patient must equal TreatmentCourse.patient');
    }

    let clinicId = input.clinicId ? input.clinicId.trim() : undefined;
    if (!clinicId && course.clinicId) {
      clinicId = course.clinicId;
    }

    const visitDate = input.visitDate ? new Date(input.visitDate) : new Date();
    const billedAmount = input.billedAmount !== undefined ? input.billedAmount : 0;

    const treatment = await this.treatmentRepository.findById(course.treatmentId);
    if (!treatment) {
      throw new ValidationError('Treatment not found');
    }

    const isOneTime = treatment.isOneTime === true;

    if (isOneTime && input.nextVisitDate) {
      throw new ValidationError('nextVisitDate cannot be set for one-time treatments');
    }

    if (!isOneTime && billedAmount > course.remaining) {
      throw new ValidationError('billedAmount cannot exceed remaining treatment course balance');
    }

    if (input.nextVisitDate) {
      const nextVisitDate = new Date(input.nextVisitDate);
      if (nextVisitDate <= new Date()) {
        throw new ValidationError('nextVisitDate must be in the future');
      }
      if (nextVisitDate <= visitDate) {
        throw new ValidationError('nextVisitDate must be after visitDate');
      }
    }

    const visit = new Visit(
      '',
      doctorId,
      input.patientId.trim(),
      input.courseId.trim(),
      visitDate,
      undefined,
      undefined,
      clinicId,
      input.notes ? input.notes.trim() : undefined,
      billedAmount,
      input.mediaIds || [],
      input.prescriptionId ? input.prescriptionId.trim() : undefined,
      false
    );

    return this.txManager.runInTransaction(async (tx) => {
      const created = await this.visitRepository.create(visit, tx);

      let prescriptionId = input.prescriptionId ? input.prescriptionId.trim() : undefined;
      const mediaIds: string[] = [...(input.mediaIds || [])];

      if (input.prescription) {
        this.validatePrescriptionInput(input.prescription);
        
        const prescription = new Prescription(
          '',
          doctorId,
          input.patientId.trim(),
          created.id,
          input.prescription.items || [],
          undefined,
          undefined,
          input.prescription.clinicId ? input.prescription.clinicId.trim() : clinicId,
          input.prescription.diagnosis || [],
          input.prescription.notes ? input.prescription.notes.trim() : undefined
        );

        const createdPrescription = await this.prescriptionRepository.create(prescription);
        prescriptionId = createdPrescription.id;
      }

      if (input.media && input.media.length > 0) {
        for (const mediaData of input.media) {
          this.validateMediaInput(mediaData);
          
          const media = new Media(
            '',
            doctorId,
            mediaData.url.trim(),
            mediaData.type || 'image',
            undefined,
            undefined,
            input.patientId.trim(),
            input.courseId.trim(),
            created.id,
            clinicId,
            mediaData.filename ? mediaData.filename.trim() : undefined,
            mediaData.mimeType ? mediaData.mimeType.trim() : undefined,
            mediaData.size,
            mediaData.notes ? mediaData.notes.trim() : undefined,
            false
          );

          const createdMedia = await this.mediaRepository.create(media);
          mediaIds.push(createdMedia.id);
        }
      }

      if (prescriptionId !== created.prescriptionId || mediaIds.length !== created.mediaIds.length || 
          !mediaIds.every(id => created.mediaIds.includes(id))) {
        created.setPrescription(prescriptionId);
        mediaIds.forEach(id => created.addMedia(id));
        await this.visitRepository.update(created.id, created, tx);
      }

      const patient = await this.patientRepository.findById(input.patientId.trim());
      if (patient) {
        patient.incrementVisitCount(visitDate);
        await this.patientRepository.update(patient.id, patient, tx);
      }

      let paymentId: string | undefined;

      if (billedAmount > 0) {
        const paymentMethod = new PaymentMethodVO(input.paymentMethod!);
        const paidAt = new Date();

        const payment = new Payment(
          '',
          doctorId,
          input.patientId.trim(),
          input.courseId.trim(),
          billedAmount,
          paymentMethod,
          paidAt,
          undefined,
          undefined,
          created.id,
          clinicId,
          input.paymentReference ? input.paymentReference.trim() : undefined,
          false,
          undefined,
          false
        );

        const createdPayment = await this.paymentRepository.create(payment, tx);
        paymentId = createdPayment.id;

        await this.treatmentCourseRepository.incrementTotalPaid(course.id, billedAmount, tx, paymentId);
        
        course.addPayment(billedAmount);
        if (paymentId) {
          course.addPaymentReference(paymentId);
        }
        
        if (isOneTime) {
          course.addToTotalCost(billedAmount);
        }
      }

      course.addVisit(created.id);
      
      // Update lastVisitDate to the visit date
      course.lastVisitDate = visitDate;
      
      // Update nextVisitDate if provided in request
      if (input.nextVisitDate) {
        course.nextVisitDate = new Date(input.nextVisitDate);
      }
      
      await this.treatmentCourseRepository.update(course.id, course, tx);

      const updatedVisit = await this.visitRepository.findById(created.id);
      return visitToDto(updatedVisit || created);
    });
  }

  private validateInput(input: CreateVisitRequestDto): void {
    if (!input.patientId || input.patientId.trim().length === 0) {
      throw new ValidationError('patientId is required');
    }
    if (!input.courseId || input.courseId.trim().length === 0) {
      throw new ValidationError('courseId is required');
    }
    if (input.billedAmount !== undefined && input.billedAmount < 0) {
      throw new ValidationError('billedAmount must be non-negative');
    }
    if (input.billedAmount !== undefined && input.billedAmount > 0) {
      if (!input.paymentMethod) {
        throw new ValidationError('paymentMethod is required when billedAmount is greater than zero');
      }
    }
  }

  private async validateReferences(doctorId: string, input: CreateVisitRequestDto): Promise<void> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new ValidationError('Doctor not found');
    }

    const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
    if (!patient) {
      throw new ValidationError('Patient not found or does not belong to doctor');
    }

    const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
    if (!course || course.doctorId !== doctorId) {
      throw new ValidationError('TreatmentCourse not found or does not belong to doctor');
    }

    if (input.prescription?.clinicId) {
      const clinic = await this.clinicRepository.findById(input.prescription.clinicId.trim());
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('Clinic not found or does not belong to doctor');
      }
    }

    if (input.clinicId) {
      const clinic = await this.clinicRepository.findById(input.clinicId.trim());
      if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
        throw new ValidationError('Clinic not found or does not belong to doctor');
      }
    }
  }

  private validatePrescriptionInput(prescription: CreateVisitRequestDto['prescription']): void {
    if (!prescription) {
      return;
    }

    if (!prescription.items || prescription.items.length === 0) {
      throw new ValidationError('At least one prescription item is required');
    }

    prescription.items.forEach((item, index) => {
      if (!item.medicineName || item.medicineName.trim().length === 0) {
        throw new ValidationError(`Item ${index + 1}: medicineName is required`);
      }
    });
  }

  private validateMediaInput(media: CreateVisitMediaDto): void {
    if (!media.url || media.url.trim().length === 0) {
      throw new ValidationError('Media url is required');
    }
    if (media.size !== undefined && media.size < 0) {
      throw new ValidationError('Media size must be non-negative');
    }
  }
}

