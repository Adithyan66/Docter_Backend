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
exports.UpdatePatientUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const conflict_error_1 = require("../../../domain/errors/conflict.error");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const phone_vo_1 = require("../../../domain/value-objects/phone.vo");
const patient_id_vo_1 = require("../../../domain/value-objects/patient-id.vo");
const patient_mapper_1 = require("../../mappers/patient.mapper");
let UpdatePatientUseCase = class UpdatePatientUseCase {
    constructor(patientRepository, fileStorageService) {
        this.patientRepository = patientRepository;
        this.fileStorageService = fileStorageService;
    }
    async execute(id, doctorId, input) {
        if (!input || Object.keys(input).length === 0) {
            throw new validation_error_1.ValidationError('At least one field must be provided for update');
        }
        const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
        if (!patient) {
            throw new not_found_error_1.NotFoundError('Patient', id);
        }
        const updateData = {};
        let hasChanges = false;
        const oldProfilePicUrl = patient.profilePicUrl;
        if (input.firstName !== undefined || input.lastName !== undefined) {
            const firstName = input.firstName !== undefined ? input.firstName.trim() : patient.firstName;
            const lastName = input.lastName !== undefined ? input.lastName.trim() : patient.lastName;
            patient.updateNames(firstName, lastName);
            updateData.firstName = patient.firstName;
            updateData.lastName = patient.lastName;
            updateData.fullName = patient.fullName;
            hasChanges = true;
        }
        if ('dob' in input) {
            const dob = this.parseDate(input.dob, 'dob');
            patient.setDob(dob);
            updateData.dob = patient.dob;
            updateData.age = patient.age;
            hasChanges = true;
        }
        if (input.age !== undefined && !('dob' in input)) {
            if (input.age < 0) {
                throw new validation_error_1.ValidationError('age cannot be negative');
            }
            patient.age = input.age;
            updateData.age = input.age;
            hasChanges = true;
        }
        if (input.gender !== undefined) {
            patient.gender = input.gender;
            updateData.gender = input.gender;
            hasChanges = true;
        }
        if ('phone' in input) {
            const phone = this.buildPhone(input.phone);
            patient.setPhone(phone);
            updateData.phone = phone;
            hasChanges = true;
        }
        if ('email' in input) {
            const email = this.buildEmail(input.email);
            patient.setEmail(email);
            updateData.email = email;
            hasChanges = true;
        }
        if (input.address !== undefined) {
            patient.address = input.address ? input.address.trim() : undefined;
            updateData.address = patient.address;
            hasChanges = true;
        }
        if (input.profilePicUrl !== undefined) {
            const newProfilePicUrl = input.profilePicUrl === null || input.profilePicUrl === ''
                ? null
                : input.profilePicUrl.trim();
            const profilePicChanged = oldProfilePicUrl !== newProfilePicUrl;
            if (profilePicChanged && oldProfilePicUrl) {
                try {
                    const fileKey = this.fileStorageService.extractKeyFromUrl(oldProfilePicUrl);
                    await this.fileStorageService.deleteFile(fileKey);
                }
                catch (error) {
                    console.error(`Failed to delete old profile picture from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            patient.profilePicUrl = newProfilePicUrl || undefined;
            updateData.profilePicUrl = newProfilePicUrl;
            hasChanges = true;
        }
        if (input.consultationType !== undefined) {
            patient.setConsultationType(input.consultationType);
            updateData.consultationType = patient.consultationType;
            hasChanges = true;
        }
        if (input.primaryClinic !== undefined) {
            patient.primaryClinic = input.primaryClinic;
            updateData.primaryClinic = patient.primaryClinic;
            hasChanges = true;
        }
        if (input.clinics !== undefined) {
            patient.clinics = this.normalizeStrings(input.clinics);
            updateData.clinics = patient.clinics;
            hasChanges = true;
        }
        if (input.tags !== undefined) {
            patient.tags = this.normalizeStrings(input.tags);
            updateData.tags = patient.tags;
            hasChanges = true;
        }
        if (input.visitCount !== undefined) {
            if (input.visitCount < 0) {
                throw new validation_error_1.ValidationError('visitCount cannot be negative');
            }
            patient.visitCount = input.visitCount;
            updateData.visitCount = patient.visitCount;
            hasChanges = true;
        }
        if ('lastVisitAt' in input) {
            const lastVisit = this.parseDate(input.lastVisitAt, 'lastVisitAt');
            patient.lastVisitAt = lastVisit;
            updateData.lastVisitAt = lastVisit;
            hasChanges = true;
        }
        if (input.isActive !== undefined) {
            patient.isActive = input.isActive;
            updateData.isActive = input.isActive;
            hasChanges = true;
        }
        if (input.isDeleted !== undefined) {
            patient.isDeleted = input.isDeleted;
            updateData.isDeleted = input.isDeleted;
            hasChanges = true;
        }
        if (input.defaultTreatmentCourse !== undefined) {
            try {
                patient.setDefaultTreatmentCourse(input.defaultTreatmentCourse);
                updateData.treatmentCourses = patient.treatmentCourses;
                hasChanges = true;
            }
            catch (error) {
                throw new validation_error_1.ValidationError(error.message);
            }
        }
        if (!hasChanges) {
            return (0, patient_mapper_1.patientToDto)(patient);
        }
        const updated = await this.patientRepository.update(id, updateData);
        if (!updated) {
            throw new not_found_error_1.NotFoundError('Patient', id);
        }
        return (0, patient_mapper_1.patientToDto)(updated);
    }
    async ensurePatientId(patientId, currentId) {
        if (!patientId || patientId.trim().length === 0) {
            return undefined;
        }
        let value;
        try {
            value = new patient_id_vo_1.PatientId(patientId);
        }
        catch (error) {
            throw new validation_error_1.ValidationError(error.message);
        }
        const existing = await this.patientRepository.findByPatientId(value.toString());
        if (existing && existing.id !== currentId) {
            throw new conflict_error_1.ConflictError(`Patient with patientId "${value.toString()}" already exists`);
        }
        return value;
    }
    buildEmail(email) {
        if (!email || email.trim().length === 0) {
            return undefined;
        }
        try {
            return new email_vo_1.Email(email.trim());
        }
        catch (error) {
            throw new validation_error_1.ValidationError(error.message);
        }
    }
    buildPhone(phone) {
        if (!phone || phone.trim().length === 0) {
            return undefined;
        }
        try {
            return new phone_vo_1.Phone(phone);
        }
        catch (error) {
            throw new validation_error_1.ValidationError(error.message);
        }
    }
    parseDate(value, field) {
        if (!value) {
            return undefined;
        }
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new validation_error_1.ValidationError(`Invalid ${field || 'date'} value`);
        }
        return date;
    }
    normalizeStrings(values) {
        if (!values || values.length === 0) {
            return [];
        }
        const normalized = values
            .map((value) => (value ? value.trim() : ''))
            .filter((value) => value.length > 0);
        return Array.from(new Set(normalized));
    }
};
exports.UpdatePatientUseCase = UpdatePatientUseCase;
exports.UpdatePatientUseCase = UpdatePatientUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(1, (0, tsyringe_1.inject)('IFileStorageService')),
    __metadata("design:paramtypes", [Object, Object])
], UpdatePatientUseCase);
