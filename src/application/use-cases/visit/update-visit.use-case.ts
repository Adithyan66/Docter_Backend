import { injectable, inject } from 'tsyringe';
import { ITransactionManager } from '../../interfaces/transaction-manager.interface';
import { IVisitRepository } from '../../../domain/repositories/visit.repository';
import { ITreatmentCourseRepository } from '../../../domain/repositories/treatment-course.repository';
import { ITreatmentRepository } from '../../../domain/repositories/treatment.repository';
import { IPaymentRepository } from '../../../domain/repositories/payment.repository';
import { Visit } from '../../../domain/entities/visit.entity';
import { VisitResponseDto, UpdateVisitRequestDto } from '../../../presentation/dto/visit.dto';
import { ValidationError } from '../../../domain/errors/validation.error';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { visitToDto } from '../../mappers/visit.mapper';
import { PaymentMethodVO } from '../../../domain/value-objects/payment-method.vo';
import { IUpdateVisitUseCase } from '../../interfaces/use-cases/visit/visit-use-cases.interface';

@injectable()
export class UpdateVisitUseCase implements IUpdateVisitUseCase {
  constructor(
    @inject('IVisitRepository') private readonly visitRepository: IVisitRepository,
    @inject('ITreatmentCourseRepository') private readonly treatmentCourseRepository: ITreatmentCourseRepository,
    @inject('ITreatmentRepository') private readonly treatmentRepository: ITreatmentRepository,
    @inject('IPaymentRepository') private readonly paymentRepository: IPaymentRepository,
    @inject('ITransactionManager') private readonly txManager: ITransactionManager
  ) {}

  async execute(id: string, doctorId: string, input: UpdateVisitRequestDto): Promise<VisitResponseDto> {
    const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
    if (!visit) {
      throw new NotFoundError('Visit', id);
    }

    let course = null;
    if (input.patientId || input.courseId) {
      const courseId = input.courseId ? input.courseId.trim() : visit.courseId;
      course = await this.treatmentCourseRepository.findById(courseId);
      if (!course) {
        throw new ValidationError('TreatmentCourse not found');
      }

      const patientId = input.patientId ? input.patientId.trim() : visit.patientId;
      if (course.patientId !== patientId) {
        throw new ValidationError('Patient mismatch: Visit.patient must equal TreatmentCourse.patient');
      }
    }

    const updateData: Partial<Visit> = {};

    if (input.patientId !== undefined) {
      updateData.patientId = input.patientId.trim();
    }
    if (input.courseId !== undefined) {
      updateData.courseId = input.courseId.trim();
    }
    if (input.clinicId !== undefined) {
      updateData.clinicId = input.clinicId ? input.clinicId.trim() : undefined;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes ? input.notes.trim() : undefined;
    }
    if (input.billedAmount !== undefined) {
      updateData.billedAmount = input.billedAmount;
    }
    if (input.mediaIds !== undefined) {
      updateData.mediaIds = input.mediaIds;
    }
    if (input.prescriptionId !== undefined) {
      updateData.prescriptionId = input.prescriptionId ? input.prescriptionId.trim() : undefined;
    }

    if (input.billedAmount !== undefined) {
      if (input.billedAmount < 0) {
        throw new ValidationError('billedAmount must be non-negative');
      }

      if (!course) {
        course = await this.treatmentCourseRepository.findById(visit.courseId);
        if (!course) {
          throw new ValidationError('TreatmentCourse not found');
        }
      }

      const treatment = await this.treatmentRepository.findById(course.treatmentId);
      if (!treatment) {
        throw new ValidationError('Treatment not found');
      }

      const currentBilledAmount = visit.billedAmount || 0;
      const amountDifference = input.billedAmount - currentBilledAmount;

      if (!treatment.isOneTime) {
        const newTotalPaid = course.totalPaid + amountDifference;
        if (newTotalPaid > course.totalCost) {
          throw new ValidationError('Updated billed amount would cause total paid amount to exceed total cost');
        }
      }

      const needsPaymentUpdate = input.paymentMethod !== undefined || input.paymentReference !== undefined;
      const needsTransaction = amountDifference !== 0 || (needsPaymentUpdate && input.billedAmount !== undefined);

      if (needsTransaction) {
        const courseForTx = course;
        return this.txManager.runInTransaction(async (tx) => {
          const paymentsResult = await this.paymentRepository.findPaginated({
            doctorId,
            visitId: id,
            page: 1,
            limit: 100,
          });

          const payments = paymentsResult.payments;

          if (payments.length > 0) {
            const firstPayment = payments[0];
            const paymentUpdateData: any = {};
            
            if (input.billedAmount !== undefined) {
              if (input.billedAmount > 0) {
                paymentUpdateData.amount = input.billedAmount;
              } else {
                paymentUpdateData.isDeleted = true;
              }
            }

            if (input.paymentMethod !== undefined) {
              const paymentMethod = new PaymentMethodVO(input.paymentMethod);
              paymentUpdateData.method = paymentMethod;
            }

            if (input.paymentReference !== undefined) {
              paymentUpdateData.reference = input.paymentReference.trim() || undefined;
            }

            if (Object.keys(paymentUpdateData).length > 0) {
              await this.paymentRepository.update(firstPayment.id, paymentUpdateData, tx);
            }

            if (input.billedAmount !== undefined) {
              for (let i = 1; i < payments.length; i++) {
                await this.paymentRepository.update(payments[i].id, { isDeleted: true }, tx);
              }
            }
          } else if (needsPaymentUpdate && input.billedAmount !== undefined && input.billedAmount > 0) {
            throw new ValidationError('Payment record not found for this visit');
          }

          if (amountDifference !== 0) {
            if (amountDifference > 0) {
              await this.treatmentCourseRepository.incrementTotalPaid(courseForTx.id, amountDifference, tx);
            } else {
              await this.treatmentCourseRepository.decrementTotalPaid(courseForTx.id, Math.abs(amountDifference), tx);
            }
          }

          const updated = await this.visitRepository.update(id, updateData, tx);
          if (!updated) {
            throw new NotFoundError('Visit', id);
          }

          const finalVisit = await this.visitRepository.findById(updated.id);
          return visitToDto(finalVisit || updated);
        });
      }
    }

    if (input.paymentMethod !== undefined || input.paymentReference !== undefined) {
      const paymentsResult = await this.paymentRepository.findPaginated({
        doctorId,
        visitId: id,
        page: 1,
        limit: 100,
      });

      const payments = paymentsResult.payments;

      if (payments.length > 0) {
        const firstPayment = payments[0];
        const paymentUpdateData: any = {};

        if (input.paymentMethod !== undefined) {
          const paymentMethod = new PaymentMethodVO(input.paymentMethod);
          paymentUpdateData.method = paymentMethod;
        }

        if (input.paymentReference !== undefined) {
          paymentUpdateData.reference = input.paymentReference.trim() || undefined;
        }

        await this.paymentRepository.update(firstPayment.id, paymentUpdateData);
      } else {
        if (visit.billedAmount && visit.billedAmount > 0) {
          throw new ValidationError('Payment record not found for this visit');
        }
      }
    }

    const updated = await this.visitRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundError('Visit', id);
    }

    return visitToDto(updated);
  }
}

