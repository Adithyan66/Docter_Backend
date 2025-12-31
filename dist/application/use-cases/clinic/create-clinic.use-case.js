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
exports.CreateClinicUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const clinic_entity_1 = require("../../../domain/entities/clinic.entity");
const validation_error_1 = require("../../../domain/errors/validation.error");
const conflict_error_1 = require("../../../domain/errors/conflict.error");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const working_day_vo_1 = require("../../../domain/value-objects/working-day.vo");
let CreateClinicUseCase = class CreateClinicUseCase {
    constructor(clinicRepository) {
        this.clinicRepository = clinicRepository;
    }
    async execute(doctorId, input) {
        const trimmedInput = {
            ...input,
            clinicId: input.clinicId.trim().toUpperCase(),
            name: input.name.trim(),
            address: input.address?.trim(),
            city: input.city?.trim(),
            state: input.state?.trim(),
            pincode: input.pincode?.trim(),
            phone: input.phone?.trim(),
            website: input.website?.trim(),
            locationUrl: input.locationUrl?.trim(),
            notes: input.notes?.trim(),
        };
        this.validateInput(trimmedInput);
        const existingClinicByName = await this.clinicRepository.findByName(trimmedInput.name, doctorId);
        if (existingClinicByName) {
            throw new conflict_error_1.ConflictError(`Clinic with name "${trimmedInput.name}" already exists`);
        }
        const existingClinicById = await this.clinicRepository.findByClinicId(trimmedInput.clinicId, doctorId);
        if (existingClinicById) {
            throw new conflict_error_1.ConflictError(`Clinic with clinicId "${trimmedInput.clinicId}" already exists`);
        }
        let email;
        if (trimmedInput.email) {
            email = new email_vo_1.Email(trimmedInput.email);
        }
        let workingDays;
        if (trimmedInput.workingDays && trimmedInput.workingDays.length > 0) {
            workingDays = trimmedInput.workingDays.map(wd => new working_day_vo_1.WorkingDay(wd.day, wd.startTime, wd.endTime));
        }
        const clinic = new clinic_entity_1.Clinic('', trimmedInput.clinicId, doctorId, trimmedInput.name, undefined, undefined, trimmedInput.address, trimmedInput.city, trimmedInput.state, trimmedInput.pincode, trimmedInput.phone, email, trimmedInput.website, trimmedInput.locationUrl, workingDays, trimmedInput.treatments, undefined, undefined, trimmedInput.notes, trimmedInput.isActive);
        await this.clinicRepository.create(clinic);
    }
    validateInput(input) {
        if (!input.clinicId || input.clinicId.trim().length === 0) {
            throw new validation_error_1.ValidationError('clinicId is required');
        }
        const clinicIdRegex = /^[A-Z]{3}$/;
        if (!clinicIdRegex.test(input.clinicId.trim().toUpperCase())) {
            throw new validation_error_1.ValidationError('clinicId must be exactly 3 capital letters');
        }
        if (!input.name || input.name.trim().length === 0) {
            throw new validation_error_1.ValidationError('Name is required');
        }
        if (input.email) {
            try {
                new email_vo_1.Email(input.email);
            }
            catch (error) {
                throw new validation_error_1.ValidationError('Invalid email format');
            }
        }
        if (input.workingDays && input.workingDays.length > 0) {
            input.workingDays.forEach((wd, index) => {
                try {
                    new working_day_vo_1.WorkingDay(wd.day, wd.startTime, wd.endTime);
                }
                catch (error) {
                    throw new validation_error_1.ValidationError(`Invalid working day at index ${index}: ${error.message}`);
                }
            });
        }
    }
};
exports.CreateClinicUseCase = CreateClinicUseCase;
exports.CreateClinicUseCase = CreateClinicUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object])
], CreateClinicUseCase);
