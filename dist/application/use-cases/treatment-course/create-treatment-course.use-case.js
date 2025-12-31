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
exports.CreateTreatmentCourseUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const treatment_course_entity_1 = require("../../../domain/entities/treatment-course.entity");
const validation_error_1 = require("../../../domain/errors/validation.error");
const treatment_course_mapper_1 = require("../../mappers/treatment-course.mapper");
let CreateTreatmentCourseUseCase = class CreateTreatmentCourseUseCase {
    constructor(treatmentCourseRepository, doctorRepository, patientRepository, treatmentRepository, clinicRepository) {
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.treatmentRepository = treatmentRepository;
        this.clinicRepository = clinicRepository;
    }
    async execute(doctorId, input) {
        this.validateInput(input);
        await this.validateReferences(doctorId, input);
        const startDate = this.parseDate(input.startDate, 'startDate');
        const expectedEndDate = input.expectedEndDate ? this.parseDate(input.expectedEndDate, 'expectedEndDate') : undefined;
        const lastVisitDate = input.lastVisitDate ? this.parseDate(input.lastVisitDate, 'lastVisitDate') : undefined;
        const nextVisitDate = input.nextVisitDate ? this.parseDate(input.nextVisitDate, 'nextVisitDate') : undefined;
        if (expectedEndDate && expectedEndDate <= startDate) {
            throw new validation_error_1.ValidationError('expectedEndDate must be after startDate');
        }
        if (lastVisitDate && nextVisitDate && nextVisitDate <= lastVisitDate) {
            throw new validation_error_1.ValidationError('nextVisitDate must be after lastVisitDate');
        }
        if (nextVisitDate && nextVisitDate <= new Date()) {
            throw new validation_error_1.ValidationError('nextVisitDate must be in the future');
        }
        const treatmentCourse = new treatment_course_entity_1.TreatmentCourse('', doctorId, input.patientId.trim(), input.treatmentId.trim(), startDate, input.totalCost, undefined, undefined, input.clinicId ? input.clinicId.trim() : undefined, expectedEndDate, lastVisitDate, nextVisitDate, input.totalPaid || 0, false, false, input.status || 'active', input.notes ? input.notes.trim() : undefined, input.visits || [], input.payments || [], false);
        treatmentCourse.recalcPaymentStatus();
        const created = await this.treatmentCourseRepository.create(treatmentCourse);
        const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
        if (patient) {
            patient.addTreatmentCourse(created.id);
            await this.patientRepository.update(patient.id, patient);
        }
        return (0, treatment_course_mapper_1.treatmentCourseToDto)(created);
    }
    validateInput(input) {
        if (!input.patientId || input.patientId.trim().length === 0) {
            throw new validation_error_1.ValidationError('patientId is required');
        }
        if (!input.treatmentId || input.treatmentId.trim().length === 0) {
            throw new validation_error_1.ValidationError('treatmentId is required');
        }
        if (!input.startDate) {
            throw new validation_error_1.ValidationError('startDate is required');
        }
        if (input.totalCost === undefined || input.totalCost < 0) {
            throw new validation_error_1.ValidationError('totalCost is required and must be non-negative');
        }
        if (input.totalPaid !== undefined && input.totalPaid < 0) {
            throw new validation_error_1.ValidationError('totalPaid must be non-negative');
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
        const treatment = await this.treatmentRepository.findById(input.treatmentId.trim());
        if (!treatment || treatment.doctorId !== doctorId) {
            throw new validation_error_1.ValidationError('Treatment not found or does not belong to doctor');
        }
        if (input.clinicId) {
            const clinic = await this.clinicRepository.findById(input.clinicId.trim());
            if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
                throw new validation_error_1.ValidationError('Clinic not found or does not belong to doctor');
            }
        }
        const existingTreatmentCourse = await this.treatmentCourseRepository.findByPatientAndTreatmentAndStatus(doctorId, input.patientId.trim(), input.treatmentId.trim(), ['active', 'paused']);
        if (existingTreatmentCourse) {
            throw new validation_error_1.ValidationError('Treatment course with this treatment already exists for this patient');
        }
    }
    parseDate(value, field) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new validation_error_1.ValidationError(`Invalid ${field} value`);
        }
        return date;
    }
};
exports.CreateTreatmentCourseUseCase = CreateTreatmentCourseUseCase;
exports.CreateTreatmentCourseUseCase = CreateTreatmentCourseUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(1, (0, tsyringe_1.inject)('IDoctorRepository')),
    __param(2, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(3, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __param(4, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CreateTreatmentCourseUseCase);
