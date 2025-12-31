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
exports.GetPatientsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const patient_mapper_1 = require("../../mappers/patient.mapper");
let GetPatientsUseCase = class GetPatientsUseCase {
    constructor(patientRepository) {
        this.patientRepository = patientRepository;
    }
    async execute(doctorId, input) {
        const page = input.page && input.page > 0 ? input.page : 1;
        const limit = input.limit && input.limit > 0 ? input.limit : 10;
        if (input.minAge !== undefined && input.minAge < 0) {
            throw new validation_error_1.ValidationError('minAge cannot be negative');
        }
        if (input.maxAge !== undefined && input.maxAge < 0) {
            throw new validation_error_1.ValidationError('maxAge cannot be negative');
        }
        if (input.minAge !== undefined && input.maxAge !== undefined && input.minAge > input.maxAge) {
            throw new validation_error_1.ValidationError('minAge cannot be greater than maxAge');
        }
        const options = {
            doctorId,
            page,
            limit,
            search: input.search?.trim(),
            patientId: input.patientId?.trim(),
            clinicId: input.clinicId,
            gender: input.gender,
            consultationType: input.consultationType,
            minAge: input.minAge,
            maxAge: input.maxAge,
            sortBy: input.sortBy,
            sortOrder: input.sortOrder,
        };
        const result = await this.patientRepository.findPaginated(options);
        return {
            patients: result.patients.map((patient) => (0, patient_mapper_1.patientToDto)(patient, undefined, result.clinicNames?.[patient.id])),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetPatientsUseCase = GetPatientsUseCase;
exports.GetPatientsUseCase = GetPatientsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPatientRepository')),
    __metadata("design:paramtypes", [Object])
], GetPatientsUseCase);
