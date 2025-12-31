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
exports.GetAllPrescriptionsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const prescription_mapper_1 = require("../../mappers/prescription.mapper");
let GetAllPrescriptionsUseCase = class GetAllPrescriptionsUseCase {
    constructor(prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }
    async execute(doctorId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
        const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
        if (dateFrom && isNaN(dateFrom.getTime())) {
            throw new validation_error_1.ValidationError('Invalid dateFrom format');
        }
        if (dateTo && isNaN(dateTo.getTime())) {
            throw new validation_error_1.ValidationError('Invalid dateTo format');
        }
        const result = await this.prescriptionRepository.findPaginated({
            doctorId,
            page,
            limit,
            patientId: query.patientId,
            visitId: query.visitId,
            clinicId: query.clinicId,
            dateFrom,
            dateTo,
            medicineName: query.medicineName,
            sortBy: query.sortBy || 'createdAt',
            sortOrder: query.sortOrder || 'desc',
        });
        return {
            prescriptions: result.prescriptions.map(prescription_mapper_1.prescriptionToDto),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetAllPrescriptionsUseCase = GetAllPrescriptionsUseCase;
exports.GetAllPrescriptionsUseCase = GetAllPrescriptionsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPrescriptionRepository')),
    __metadata("design:paramtypes", [Object])
], GetAllPrescriptionsUseCase);
