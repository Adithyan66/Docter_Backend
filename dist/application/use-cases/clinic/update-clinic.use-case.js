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
exports.UpdateClinicUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const conflict_error_1 = require("../../../domain/errors/conflict.error");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const working_day_vo_1 = require("../../../domain/value-objects/working-day.vo");
let UpdateClinicUseCase = class UpdateClinicUseCase {
    constructor(clinicRepository) {
        this.clinicRepository = clinicRepository;
    }
    async execute(id, doctorId, input) {
        const existingClinic = await this.clinicRepository.findById(id);
        if (!existingClinic || existingClinic.doctorId !== doctorId) {
            throw new not_found_error_1.NotFoundError('Clinic', id);
        }
        if ('clinicId' in input && input.clinicId !== undefined) {
            throw new validation_error_1.ValidationError('clinicId cannot be updated');
        }
        const trimmedInput = {
            ...input,
            name: input.name !== undefined ? input.name.trim() : undefined,
            address: input.address !== undefined ? input.address.trim() : undefined,
            city: input.city !== undefined ? input.city.trim() : undefined,
            state: input.state !== undefined ? input.state.trim() : undefined,
            pincode: input.pincode !== undefined ? input.pincode.trim() : undefined,
            phone: input.phone !== undefined ? input.phone.trim() : undefined,
            website: input.website !== undefined ? input.website.trim() : undefined,
            locationUrl: input.locationUrl !== undefined ? input.locationUrl.trim() : undefined,
            notes: input.notes !== undefined ? input.notes.trim() : undefined,
        };
        this.validateInput(trimmedInput, existingClinic);
        if (trimmedInput.name !== undefined && trimmedInput.name !== existingClinic.name) {
            const clinicWithSameName = await this.clinicRepository.findByName(trimmedInput.name, doctorId);
            if (clinicWithSameName) {
                throw new conflict_error_1.ConflictError(`Clinic with name "${trimmedInput.name}" already exists`);
            }
        }
        const updateData = {};
        if (trimmedInput.name !== undefined)
            updateData.name = trimmedInput.name;
        if (trimmedInput.address !== undefined)
            updateData.address = trimmedInput.address;
        if (trimmedInput.city !== undefined)
            updateData.city = trimmedInput.city;
        if (trimmedInput.state !== undefined)
            updateData.state = trimmedInput.state;
        if (trimmedInput.pincode !== undefined)
            updateData.pincode = trimmedInput.pincode;
        if (trimmedInput.phone !== undefined)
            updateData.phone = trimmedInput.phone;
        if (trimmedInput.email !== undefined) {
            updateData.email = trimmedInput.email ? new email_vo_1.Email(trimmedInput.email) : undefined;
        }
        if (trimmedInput.website !== undefined)
            updateData.website = trimmedInput.website;
        if (trimmedInput.locationUrl !== undefined)
            updateData.locationUrl = trimmedInput.locationUrl;
        if (trimmedInput.workingDays !== undefined) {
            updateData.workingDays = trimmedInput.workingDays.length > 0
                ? trimmedInput.workingDays.map(wd => new working_day_vo_1.WorkingDay(wd.day, wd.startTime, wd.endTime))
                : undefined;
        }
        if (trimmedInput.treatments !== undefined)
            updateData.treatments = trimmedInput.treatments;
        if (trimmedInput.notes !== undefined)
            updateData.notes = trimmedInput.notes;
        if (trimmedInput.isActive !== undefined)
            updateData.isActive = trimmedInput.isActive;
        const updated = await this.clinicRepository.update(id, updateData);
        if (!updated) {
            throw new not_found_error_1.NotFoundError('Clinic', id);
        }
    }
    validateInput(input, existingClinic) {
        if (input.name !== undefined && input.name.trim().length === 0) {
            throw new validation_error_1.ValidationError('Name cannot be empty');
        }
        if (input.email !== undefined && input.email) {
            try {
                new email_vo_1.Email(input.email);
            }
            catch (error) {
                throw new validation_error_1.ValidationError('Invalid email format');
            }
        }
        if (input.workingDays !== undefined && input.workingDays.length > 0) {
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
exports.UpdateClinicUseCase = UpdateClinicUseCase;
exports.UpdateClinicUseCase = UpdateClinicUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateClinicUseCase);
