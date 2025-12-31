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
exports.GetPatientUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const patient_mapper_1 = require("../../mappers/patient.mapper");
let GetPatientUseCase = class GetPatientUseCase {
    constructor(patientRepository, treatmentCourseRepository, treatmentRepository, clinicRepository) {
        this.patientRepository = patientRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.treatmentRepository = treatmentRepository;
        this.clinicRepository = clinicRepository;
    }
    async execute(id, doctorId) {
        const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
        if (!patient) {
            throw new not_found_error_1.NotFoundError('Patient', id);
        }
        const treatmentCoursesData = await this.populateTreatmentCourses(patient.treatmentCourses);
        return (0, patient_mapper_1.patientToDto)(patient, treatmentCoursesData);
    }
    async executeDetail(id, doctorId) {
        const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
        if (!patient) {
            throw new not_found_error_1.NotFoundError('Patient', id);
        }
        const [primaryClinicName, treatmentCoursesData, treatmentCoursesSummary] = await Promise.all([
            this.getPrimaryClinicName(patient.primaryClinic),
            this.populateTreatmentCourses(patient.treatmentCourses),
            this.calculateTreatmentCoursesSummary(patient.treatmentCourses)
        ]);
        return (0, patient_mapper_1.patientToDetailDto)(patient, treatmentCoursesData, treatmentCoursesSummary, primaryClinicName);
    }
    async getPrimaryClinicName(clinicId) {
        if (!clinicId) {
            return undefined;
        }
        const clinic = await this.clinicRepository.findById(clinicId);
        return clinic?.name;
    }
    async populateTreatmentCourses(treatmentCourseIds) {
        if (!treatmentCourseIds || treatmentCourseIds.length === 0) {
            return [];
        }
        const treatmentCourses = await Promise.all(treatmentCourseIds.map(id => this.treatmentCourseRepository.findById(id)));
        const validCourses = treatmentCourses.filter(course => course !== null);
        const treatmentNamesMap = new Map();
        const uniqueTreatmentIds = [...new Set(validCourses.map(course => course.treatmentId))];
        await Promise.all(uniqueTreatmentIds.map(async (treatmentId) => {
            const treatment = await this.treatmentRepository.findById(treatmentId);
            if (treatment) {
                treatmentNamesMap.set(treatmentId, treatment.name);
            }
        }));
        return validCourses.map(course => ({
            id: course.id,
            treatmentName: treatmentNamesMap.get(course.treatmentId) || 'Unknown Treatment'
        }));
    }
    async calculateTreatmentCoursesSummary(treatmentCourseIds) {
        if (!treatmentCourseIds || treatmentCourseIds.length === 0) {
            return {
                totalCost: 0,
                totalPaid: 0,
                totalRemaining: 0
            };
        }
        const treatmentCourses = await Promise.all(treatmentCourseIds.map(id => this.treatmentCourseRepository.findById(id)));
        const validCourses = treatmentCourses.filter(course => course !== null && !course.isDeleted);
        const totalCost = validCourses.reduce((sum, course) => sum + (course.totalCost || 0), 0);
        const totalPaid = validCourses.reduce((sum, course) => sum + (course.totalPaid || 0), 0);
        const totalRemaining = Math.max(0, totalCost - totalPaid);
        return {
            totalCost,
            totalPaid,
            totalRemaining
        };
    }
};
exports.GetPatientUseCase = GetPatientUseCase;
exports.GetPatientUseCase = GetPatientUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(1, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(2, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __param(3, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GetPatientUseCase);
