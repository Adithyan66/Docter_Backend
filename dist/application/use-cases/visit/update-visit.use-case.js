"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVisitUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const validation_error_1 = require("../../../domain/errors/validation.error");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const visit_mapper_1 = require("../../mappers/visit.mapper");
const payment_method_vo_1 = require("../../../domain/value-objects/payment-method.vo");
let UpdateVisitUseCase = class UpdateVisitUseCase {
    constructor(visitRepository, treatmentCourseRepository, treatmentRepository, paymentRepository) {
        this.visitRepository = visitRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.treatmentRepository = treatmentRepository;
        this.paymentRepository = paymentRepository;
    }
    async execute(id, doctorId, input) {
        const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
        if (!visit) {
            throw new not_found_error_1.NotFoundError('Visit', id);
        }
        let course = null;
        if (input.patientId || input.courseId) {
            const courseId = input.courseId ? input.courseId.trim() : visit.courseId;
            course = await this.treatmentCourseRepository.findById(courseId);
            if (!course) {
                throw new validation_error_1.ValidationError('TreatmentCourse not found');
            }
            const patientId = input.patientId ? input.patientId.trim() : visit.patientId;
            if (course.patientId !== patientId) {
                throw new validation_error_1.ValidationError('Patient mismatch: Visit.patient must equal TreatmentCourse.patient');
            }
        }
        const updateData = {};
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
                throw new validation_error_1.ValidationError('billedAmount must be non-negative');
            }
            if (!course) {
                course = await this.treatmentCourseRepository.findById(visit.courseId);
                if (!course) {
                    throw new validation_error_1.ValidationError('TreatmentCourse not found');
                }
            }
            const treatment = await this.treatmentRepository.findById(course.treatmentId);
            if (!treatment) {
                throw new validation_error_1.ValidationError('Treatment not found');
            }
            const currentBilledAmount = visit.billedAmount || 0;
            const amountDifference = input.billedAmount - currentBilledAmount;
            if (!treatment.isOneTime) {
                const newTotalPaid = course.totalPaid + amountDifference;
                if (newTotalPaid > course.totalCost) {
                    throw new validation_error_1.ValidationError('Updated billed amount would cause total paid amount to exceed total cost');
                }
            }
            const needsPaymentUpdate = input.paymentMethod !== undefined || input.paymentReference !== undefined;
            const needsTransaction = amountDifference !== 0 || (needsPaymentUpdate && input.billedAmount !== undefined);
            if (needsTransaction) {
                const session = await mongoose_1.default.startSession();
                session.startTransaction();
                try {
                    const mongoVisitRepo = this.visitRepository;
                    const mongoPaymentRepo = this.paymentRepository;
                    const mongoCourseRepo = this.treatmentCourseRepository;
                    const paymentsResult = await mongoPaymentRepo.findPaginated({
                        doctorId,
                        visitId: id,
                        page: 1,
                        limit: 100,
                    });
                    const payments = paymentsResult.payments;
                    if (payments.length > 0) {
                        const firstPayment = payments[0];
                        const paymentUpdateData = {};
                        if (input.billedAmount !== undefined) {
                            if (input.billedAmount > 0) {
                                paymentUpdateData.amount = input.billedAmount;
                            }
                            else {
                                paymentUpdateData.isDeleted = true;
                            }
                        }
                        if (input.paymentMethod !== undefined) {
                            const paymentMethod = new payment_method_vo_1.PaymentMethodVO(input.paymentMethod);
                            paymentUpdateData.method = paymentMethod;
                        }
                        if (input.paymentReference !== undefined) {
                            paymentUpdateData.reference = input.paymentReference.trim() || undefined;
                        }
                        if (Object.keys(paymentUpdateData).length > 0) {
                            await mongoPaymentRepo.update(firstPayment.id, paymentUpdateData, session);
                        }
                        if (input.billedAmount !== undefined) {
                            for (let i = 1; i < payments.length; i++) {
                                await mongoPaymentRepo.update(payments[i].id, { isDeleted: true }, session);
                            }
                        }
                    }
                    else if (needsPaymentUpdate && input.billedAmount !== undefined && input.billedAmount > 0) {
                        throw new validation_error_1.ValidationError('Payment record not found for this visit');
                    }
                    if (amountDifference !== 0) {
                        if (amountDifference > 0) {
                            await mongoCourseRepo.incrementTotalPaid(course.id, amountDifference, session);
                        }
                        else {
                            await mongoCourseRepo.decrementTotalPaid(course.id, Math.abs(amountDifference), session);
                        }
                    }
                    const updated = await mongoVisitRepo.update(id, updateData, session);
                    if (!updated) {
                        throw new not_found_error_1.NotFoundError('Visit', id);
                    }
                    await session.commitTransaction();
                    const finalVisit = await this.visitRepository.findById(updated.id);
                    return (0, visit_mapper_1.visitToDto)(finalVisit || updated);
                }
                catch (error) {
                    await session.abortTransaction();
                    throw error;
                }
                finally {
                    session.endSession();
                }
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
                const paymentUpdateData = {};
                if (input.paymentMethod !== undefined) {
                    const paymentMethod = new payment_method_vo_1.PaymentMethodVO(input.paymentMethod);
                    paymentUpdateData.method = paymentMethod;
                }
                if (input.paymentReference !== undefined) {
                    paymentUpdateData.reference = input.paymentReference.trim() || undefined;
                }
                const mongoPaymentRepo = this.paymentRepository;
                await mongoPaymentRepo.update(firstPayment.id, paymentUpdateData);
            }
            else {
                if (visit.billedAmount && visit.billedAmount > 0) {
                    throw new validation_error_1.ValidationError('Payment record not found for this visit');
                }
            }
        }
        const updated = await this.visitRepository.update(id, updateData);
        if (!updated) {
            throw new not_found_error_1.NotFoundError('Visit', id);
        }
        return (0, visit_mapper_1.visitToDto)(updated);
    }
};
exports.UpdateVisitUseCase = UpdateVisitUseCase;
exports.UpdateVisitUseCase = UpdateVisitUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(1, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(2, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __param(3, (0, tsyringe_1.inject)('IPaymentRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UpdateVisitUseCase);
