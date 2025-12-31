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
exports.UpdatePrescriptionUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const prescription_mapper_1 = require("../../mappers/prescription.mapper");
let UpdatePrescriptionUseCase = class UpdatePrescriptionUseCase {
    constructor(prescriptionRepository, visitRepository, clinicRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.visitRepository = visitRepository;
        this.clinicRepository = clinicRepository;
    }
    async execute(id, doctorId, input) {
        const prescription = await this.prescriptionRepository.findByIdAndDoctor(id, doctorId);
        if (!prescription) {
            throw new not_found_error_1.NotFoundError('Prescription', id);
        }
        if (input.items !== undefined) {
            if (input.items.length === 0) {
                throw new validation_error_1.ValidationError('At least one prescription item is required');
            }
            input.items.forEach((item, index) => {
                if (!item.medicineName || item.medicineName.trim().length === 0) {
                    throw new validation_error_1.ValidationError(`Item ${index + 1}: medicineName is required`);
                }
            });
        }
        if (input.visitId) {
            const visit = await this.visitRepository.findById(input.visitId.trim());
            if (!visit || visit.doctorId !== doctorId) {
                throw new validation_error_1.ValidationError('Visit not found or does not belong to doctor');
            }
            if (visit.patientId !== prescription.patient) {
                throw new validation_error_1.ValidationError('Patient mismatch: Prescription.patient must equal Visit.patient');
            }
        }
        if (input.clinicId !== undefined) {
            if (input.clinicId) {
                const clinic = await this.clinicRepository.findById(input.clinicId.trim());
                if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
                    throw new validation_error_1.ValidationError('Clinic not found or does not belong to doctor');
                }
            }
        }
        const updateData = {};
        if (input.visitId !== undefined) {
            updateData.visit = input.visitId.trim();
        }
        if (input.clinicId !== undefined) {
            updateData.clinic = input.clinicId ? input.clinicId.trim() : undefined;
        }
        if (input.diagnosis !== undefined) {
            updateData.diagnosis = input.diagnosis;
        }
        if (input.items !== undefined) {
            updateData.items = input.items;
        }
        if (input.notes !== undefined) {
            updateData.notes = input.notes ? input.notes.trim() : undefined;
        }
        const updated = await this.prescriptionRepository.update(id, updateData);
        if (!updated) {
            throw new not_found_error_1.NotFoundError('Prescription', id);
        }
        return (0, prescription_mapper_1.prescriptionToDto)(updated);
    }
};
exports.UpdatePrescriptionUseCase = UpdatePrescriptionUseCase;
exports.UpdatePrescriptionUseCase = UpdatePrescriptionUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPrescriptionRepository')),
    __param(1, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(2, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], UpdatePrescriptionUseCase);
