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
exports.GetAllTreatmentCoursesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const treatment_course_mapper_1 = require("../../mappers/treatment-course.mapper");
let GetAllTreatmentCoursesUseCase = class GetAllTreatmentCoursesUseCase {
    constructor(treatmentCourseRepository) {
        this.treatmentCourseRepository = treatmentCourseRepository;
    }
    async execute(doctorId, input) {
        const page = input.page && input.page > 0 ? input.page : 1;
        const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 100) : 10;
        const startDateFrom = input.startDateFrom ? this.parseDate(input.startDateFrom, 'startDateFrom') : undefined;
        const startDateTo = input.startDateTo ? this.parseDate(input.startDateTo, 'startDateTo') : undefined;
        if (startDateFrom && startDateTo && startDateFrom > startDateTo) {
            throw new validation_error_1.ValidationError('startDateFrom must be before or equal to startDateTo');
        }
        const options = {
            doctorId,
            page,
            limit,
            clinicId: input.clinicId?.trim(),
            treatmentId: input.treatmentId?.trim(),
            patientId: input.patientId?.trim(),
            status: input.status,
            startDateFrom,
            startDateTo,
            sortBy: input.sortBy,
            sortOrder: input.sortOrder,
        };
        const result = await this.treatmentCourseRepository.findPaginated(options);
        return {
            treatmentCourses: result.treatmentCourses.map((tc) => (0, treatment_course_mapper_1.treatmentCourseToDto)(tc)),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
    parseDate(value, field) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new validation_error_1.ValidationError(`Invalid ${field} value`);
        }
        return date;
    }
};
exports.GetAllTreatmentCoursesUseCase = GetAllTreatmentCoursesUseCase;
exports.GetAllTreatmentCoursesUseCase = GetAllTreatmentCoursesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __metadata("design:paramtypes", [Object])
], GetAllTreatmentCoursesUseCase);
