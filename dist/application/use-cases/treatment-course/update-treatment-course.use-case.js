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
exports.UpdateTreatmentCourseUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const treatment_course_mapper_1 = require("../../mappers/treatment-course.mapper");
let UpdateTreatmentCourseUseCase = class UpdateTreatmentCourseUseCase {
    constructor(treatmentCourseRepository, doctorRepository, patientRepository, treatmentRepository, clinicRepository) {
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.treatmentRepository = treatmentRepository;
        this.clinicRepository = clinicRepository;
    }
    async execute(id, doctorId, input) {
        if (!input || Object.keys(input).length === 0) {
            throw new validation_error_1.ValidationError('At least one field must be provided for update');
        }
        const treatmentCourse = await this.treatmentCourseRepository.findByIdAndDoctor(id, doctorId);
        if (!treatmentCourse) {
            throw new not_found_error_1.NotFoundError('TreatmentCourse', id);
        }
        const updateData = {};
        if (input.startDate !== undefined) {
            const startDate = this.parseDate(input.startDate, 'startDate');
            updateData.startDate = startDate;
            if (treatmentCourse.expectedEndDate && treatmentCourse.expectedEndDate <= startDate) {
                throw new validation_error_1.ValidationError('expectedEndDate must be after startDate');
            }
        }
        if (input.expectedEndDate !== undefined) {
            if (input.expectedEndDate === null) {
                updateData.expectedEndDate = undefined;
            }
            else {
                const expectedEndDate = this.parseDate(input.expectedEndDate, 'expectedEndDate');
                const startDate = input.startDate ? this.parseDate(input.startDate, 'startDate') : treatmentCourse.startDate;
                if (expectedEndDate <= startDate) {
                    throw new validation_error_1.ValidationError('expectedEndDate must be after startDate');
                }
                updateData.expectedEndDate = expectedEndDate;
            }
        }
        if (input.lastVisitDate !== undefined) {
            if (input.lastVisitDate === null) {
                updateData.lastVisitDate = undefined;
            }
            else {
                const lastVisitDate = this.parseDate(input.lastVisitDate, 'lastVisitDate');
                const currentNextVisitDate = input.nextVisitDate ? this.parseDate(input.nextVisitDate, 'nextVisitDate') : treatmentCourse.nextVisitDate;
                if (currentNextVisitDate && lastVisitDate >= currentNextVisitDate) {
                    throw new validation_error_1.ValidationError('nextVisitDate must be after lastVisitDate');
                }
                updateData.lastVisitDate = lastVisitDate;
            }
        }
        if (input.nextVisitDate !== undefined) {
            if (input.nextVisitDate === null) {
                updateData.nextVisitDate = undefined;
            }
            else {
                const nextVisitDate = this.parseDate(input.nextVisitDate, 'nextVisitDate');
                if (nextVisitDate <= new Date()) {
                    throw new validation_error_1.ValidationError('nextVisitDate must be in the future');
                }
                const currentLastVisitDate = input.lastVisitDate ? this.parseDate(input.lastVisitDate, 'lastVisitDate') : treatmentCourse.lastVisitDate;
                if (currentLastVisitDate && nextVisitDate <= currentLastVisitDate) {
                    throw new validation_error_1.ValidationError('nextVisitDate must be after lastVisitDate');
                }
                updateData.nextVisitDate = nextVisitDate;
            }
        }
        if (input.totalPaid !== undefined) {
            if (input.totalPaid < 0) {
                throw new validation_error_1.ValidationError('totalPaid must be non-negative');
            }
            updateData.totalPaid = input.totalPaid;
        }
        if (input.totalCost !== undefined) {
            if (input.totalCost < 0) {
                throw new validation_error_1.ValidationError('totalCost must be non-negative');
            }
            const currentOrNewTotalPaid = input.totalPaid !== undefined ? input.totalPaid : treatmentCourse.totalPaid;
            if (input.totalCost < currentOrNewTotalPaid) {
                throw new validation_error_1.ValidationError(`totalCost cannot be less than totalPaid (${currentOrNewTotalPaid})`);
            }
            updateData.totalCost = input.totalCost;
        }
        if (input.isPaymentCompleted !== undefined) {
            updateData.isPaymentCompleted = input.isPaymentCompleted;
        }
        if (input.status !== undefined) {
            updateData.status = input.status;
            if (input.status === 'completed') {
                updateData.isMedicallyCompleted = true;
            }
            else if (treatmentCourse.status === 'completed') {
                updateData.isMedicallyCompleted = false;
            }
        }
        if (input.notes !== undefined) {
            updateData.notes = input.notes === null ? undefined : input.notes.trim();
        }
        if (input.visits !== undefined) {
            updateData.visits = input.visits;
        }
        if (input.payments !== undefined) {
            updateData.payments = input.payments;
        }
        const updated = await this.treatmentCourseRepository.update(id, updateData);
        if (!updated) {
            throw new not_found_error_1.NotFoundError('TreatmentCourse', id);
        }
        if (updateData.totalPaid !== undefined || updateData.totalCost !== undefined) {
            updated.recalcPaymentStatus();
            const finalUpdated = await this.treatmentCourseRepository.update(id, { isPaymentCompleted: updated.isPaymentCompleted });
            if (finalUpdated) {
                return (0, treatment_course_mapper_1.treatmentCourseToDto)(finalUpdated);
            }
        }
        return (0, treatment_course_mapper_1.treatmentCourseToDto)(updated);
    }
    parseDate(value, field) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new validation_error_1.ValidationError(`Invalid ${field} value`);
        }
        return date;
    }
};
exports.UpdateTreatmentCourseUseCase = UpdateTreatmentCourseUseCase;
exports.UpdateTreatmentCourseUseCase = UpdateTreatmentCourseUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(1, (0, tsyringe_1.inject)('IDoctorRepository')),
    __param(2, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(3, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __param(4, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UpdateTreatmentCourseUseCase);
