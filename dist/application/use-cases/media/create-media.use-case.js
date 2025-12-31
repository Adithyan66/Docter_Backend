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
exports.CreateMediaUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const media_entity_1 = require("../../../domain/entities/media.entity");
const validation_error_1 = require("../../../domain/errors/validation.error");
const media_mapper_1 = require("../../mappers/media.mapper");
let CreateMediaUseCase = class CreateMediaUseCase {
    constructor(mediaRepository, doctorRepository, patientRepository, treatmentCourseRepository, visitRepository, clinicRepository) {
        this.mediaRepository = mediaRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.visitRepository = visitRepository;
        this.clinicRepository = clinicRepository;
    }
    async execute(doctorId, input) {
        this.validateInput(input);
        await this.validateReferences(doctorId, input);
        const media = new media_entity_1.Media('', doctorId, input.url.trim(), input.type || 'image', undefined, undefined, input.patientId ? input.patientId.trim() : undefined, input.courseId ? input.courseId.trim() : undefined, input.visitId ? input.visitId.trim() : undefined, input.clinicId ? input.clinicId.trim() : undefined, input.filename ? input.filename.trim() : undefined, input.mimeType ? input.mimeType.trim() : undefined, input.size, input.notes ? input.notes.trim() : undefined, false);
        const created = await this.mediaRepository.create(media);
        return (0, media_mapper_1.mediaToDto)(created);
    }
    validateInput(input) {
        if (!input.url || input.url.trim().length === 0) {
            throw new validation_error_1.ValidationError('url is required');
        }
        if (input.size !== undefined && input.size < 0) {
            throw new validation_error_1.ValidationError('size must be non-negative');
        }
    }
    async validateReferences(doctorId, input) {
        const doctor = await this.doctorRepository.findById(doctorId);
        if (!doctor) {
            throw new validation_error_1.ValidationError('Doctor not found');
        }
        if (input.patientId) {
            const patient = await this.patientRepository.findByIdAndDoctor(input.patientId.trim(), doctorId);
            if (!patient) {
                throw new validation_error_1.ValidationError('Patient not found or does not belong to doctor');
            }
        }
        if (input.courseId) {
            const course = await this.treatmentCourseRepository.findById(input.courseId.trim());
            if (!course || course.doctorId !== doctorId) {
                throw new validation_error_1.ValidationError('TreatmentCourse not found or does not belong to doctor');
            }
        }
        if (input.visitId) {
            const visit = await this.visitRepository.findById(input.visitId.trim());
            if (!visit || visit.doctorId !== doctorId) {
                throw new validation_error_1.ValidationError('Visit not found or does not belong to doctor');
            }
        }
        if (input.clinicId) {
            const clinic = await this.clinicRepository.findById(input.clinicId.trim());
            if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
                throw new validation_error_1.ValidationError('Clinic not found or does not belong to doctor');
            }
        }
    }
};
exports.CreateMediaUseCase = CreateMediaUseCase;
exports.CreateMediaUseCase = CreateMediaUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IMediaRepository')),
    __param(1, (0, tsyringe_1.inject)('IDoctorRepository')),
    __param(2, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(3, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(4, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(5, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], CreateMediaUseCase);
