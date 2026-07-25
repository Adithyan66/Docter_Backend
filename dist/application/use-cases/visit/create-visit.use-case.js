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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVisitUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const visit_entity_1 = require("../../../domain/entities/visit.entity");
const prescription_entity_1 = require("../../../domain/entities/prescription.entity");
const media_entity_1 = require("../../../domain/entities/media.entity");
const payment_entity_1 = require("../../../domain/entities/payment.entity");
const payment_method_vo_1 = require("../../../domain/value-objects/payment-method.vo");
const validation_error_1 = require("../../../domain/errors/validation.error");
const visit_mapper_1 = require("../../mappers/visit.mapper");
let CreateVisitUseCase = class CreateVisitUseCase {
    constructor(visitRepository, treatmentCourseRepository, patientRepository, doctorRepository, prescriptionRepository, mediaRepository, clinicRepository, treatmentRepository, paymentRepository, txManager) {
        this.visitRepository = visitRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.mediaRepository = mediaRepository;
        this.clinicRepository = clinicRepository;
        this.treatmentRepository = treatmentRepository;
        this.paymentRepository = paymentRepository;
        this.txManager = txManager;
    }
    async execute(doctorId, input) {
        this.validateInput(input);
        await this.validateReferences(doctorId, input);
        const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
        if (!course) {
            throw new validation_error_1.ValidationError('TreatmentCourse not found');
        }
        if (course.patientId !== input.patientId.trim()) {
            throw new validation_error_1.ValidationError('Patient mismatch: Visit.patient must equal TreatmentCourse.patient');
        }
        let clinicId = input.clinicId ? input.clinicId.trim() : undefined;
        if (!clinicId && course.clinicId) {
            clinicId = course.clinicId;
        }
        const visitDate = input.visitDate ? new Date(input.visitDate) : new Date();
        const billedAmount = input.billedAmount !== undefined ? input.billedAmount : 0;
        const treatment = await this.treatmentRepository.findById(course.treatmentId);
        if (!treatment) {
            throw new validation_error_1.ValidationError('Treatment not found');
        }
        const isOneTime = treatment.isOneTime === true;
        if (isOneTime && input.nextVisitDate) {
            throw new validation_error_1.ValidationError('nextVisitDate cannot be set for one-time treatments');
        }
        if (!isOneTime && billedAmount > course.remaining) {
            throw new validation_error_1.ValidationError('billedAmount cannot exceed remaining treatment course balance');
        }
        if (input.nextVisitDate) {
            const nextVisitDate = new Date(input.nextVisitDate);
            if (nextVisitDate <= new Date()) {
                throw new validation_error_1.ValidationError('nextVisitDate must be in the future');
            }
            if (nextVisitDate <= visitDate) {
                throw new validation_error_1.ValidationError('nextVisitDate must be after visitDate');
            }
        }
        const visit = new visit_entity_1.Visit('', doctorId, input.patientId.trim(), input.courseId.trim(), visitDate, undefined, undefined, clinicId, input.notes ? input.notes.trim() : undefined, billedAmount, input.mediaIds || [], input.prescriptionId ? input.prescriptionId.trim() : undefined, false);
        return this.txManager.runInTransaction(async (tx) => {
            const created = await this.visitRepository.create(visit, tx);
            let prescriptionId = input.prescriptionId ? input.prescriptionId.trim() : undefined;
            const mediaIds = [...(input.mediaIds || [])];
            if (input.prescription) {
                this.validatePrescriptionInput(input.prescription);
                const prescription = new prescription_entity_1.Prescription('', doctorId, input.patientId.trim(), created.id, input.prescription.items || [], undefined, undefined, input.prescription.clinicId ? input.prescription.clinicId.trim() : clinicId, input.prescription.diagnosis || [], input.prescription.notes ? input.prescription.notes.trim() : undefined);
                const createdPrescription = await this.prescriptionRepository.create(prescription);
                prescriptionId = createdPrescription.id;
            }
            if (input.media && input.media.length > 0) {
                for (const mediaData of input.media) {
                    this.validateMediaInput(mediaData);
                    const media = new media_entity_1.Media('', doctorId, mediaData.url.trim(), mediaData.type || 'image', undefined, undefined, input.patientId.trim(), input.courseId.trim(), created.id, clinicId, mediaData.filename ? mediaData.filename.trim() : undefined, mediaData.mimeType ? mediaData.mimeType.trim() : undefined, mediaData.size, mediaData.notes ? mediaData.notes.trim() : undefined, false);
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
            let paymentId;
            if (billedAmount > 0) {
                const paymentMethod = new payment_method_vo_1.PaymentMethodVO(input.paymentMethod);
                const paidAt = new Date();
                const payment = new payment_entity_1.Payment('', doctorId, input.patientId.trim(), input.courseId.trim(), billedAmount, paymentMethod, paidAt, undefined, undefined, created.id, clinicId, input.paymentReference ? input.paymentReference.trim() : undefined, false, undefined, false);
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
            return (0, visit_mapper_1.visitToDto)(updatedVisit || created);
        });
    }
    validateInput(input) {
        if (!input.patientId || input.patientId.trim().length === 0) {
            throw new validation_error_1.ValidationError('patientId is required');
        }
        if (!input.courseId || input.courseId.trim().length === 0) {
            throw new validation_error_1.ValidationError('courseId is required');
        }
        if (input.billedAmount !== undefined && input.billedAmount < 0) {
            throw new validation_error_1.ValidationError('billedAmount must be non-negative');
        }
        if (input.billedAmount !== undefined && input.billedAmount > 0) {
            if (!input.paymentMethod) {
                throw new validation_error_1.ValidationError('paymentMethod is required when billedAmount is greater than zero');
            }
        }
    }
    async validateReferences(doctorId, input) {
        const doctor = await this.doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new validation_error_1.ValidationError('Doctor not found');
        }
        const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
        if (!patient) {
            throw new validation_error_1.ValidationError('Patient not found or does not belong to doctor');
        }
        const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
        if (!course || course.doctorId !== doctorId) {
            throw new validation_error_1.ValidationError('TreatmentCourse not found or does not belong to doctor');
        }
        if (input.prescription?.clinicId) {
            const clinic = await this.clinicRepository.findById(input.prescription.clinicId.trim());
            if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
                throw new validation_error_1.ValidationError('Clinic not found or does not belong to doctor');
            }
        }
        if (input.clinicId) {
            const clinic = await this.clinicRepository.findById(input.clinicId.trim());
            if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
                throw new validation_error_1.ValidationError('Clinic not found or does not belong to doctor');
            }
        }
    }
    validatePrescriptionInput(prescription) {
        if (!prescription) {
            return;
        }
        if (!prescription.items || prescription.items.length === 0) {
            throw new validation_error_1.ValidationError('At least one prescription item is required');
        }
        prescription.items.forEach((item, index) => {
            if (!item.medicineName || item.medicineName.trim().length === 0) {
                throw new validation_error_1.ValidationError(`Item ${index + 1}: medicineName is required`);
            }
        });
    }
    validateMediaInput(media) {
        if (!media.url || media.url.trim().length === 0) {
            throw new validation_error_1.ValidationError('Media url is required');
        }
        if (media.size !== undefined && media.size < 0) {
            throw new validation_error_1.ValidationError('Media size must be non-negative');
        }
    }
};
exports.CreateVisitUseCase = CreateVisitUseCase;
exports.CreateVisitUseCase = CreateVisitUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(1, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(2, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(3, (0, tsyringe_1.inject)('IDoctorRepository')),
    __param(4, (0, tsyringe_1.inject)('IPrescriptionRepository')),
    __param(5, (0, tsyringe_1.inject)('IMediaRepository')),
    __param(6, (0, tsyringe_1.inject)('IClinicRepository')),
    __param(7, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __param(8, (0, tsyringe_1.inject)('IPaymentRepository')),
    __param(9, (0, tsyringe_1.inject)('ITransactionManager')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], CreateVisitUseCase);
