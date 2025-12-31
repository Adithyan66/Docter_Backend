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
exports.CreatePatientUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const phone_vo_1 = require("../../../domain/value-objects/phone.vo");
const patient_id_vo_1 = require("../../../domain/value-objects/patient-id.vo");
const patient_entity_1 = require("../../../domain/entities/patient.entity");
const patient_mapper_1 = require("../../mappers/patient.mapper");
let CreatePatientUseCase = class CreatePatientUseCase {
    constructor(patientRepository, clinicRepository, patientIdCounterRepository) {
        this.patientRepository = patientRepository;
        this.clinicRepository = clinicRepository;
        this.patientIdCounterRepository = patientIdCounterRepository;
    }
    async execute(doctorId, input) {
        this.validateInput(input);
        const clinicInfo = await this.resolvePrimaryClinic(doctorId, input.primaryClinic);
        const generatedPatientId = await this.generatePatientId(clinicInfo.clinicCode);
        const email = this.buildEmail(input.email);
        const phone = this.buildPhone(input.phone);
        const dob = this.parseDate(input.dob, 'dob');
        const lastVisitAt = this.parseDate(input.lastVisitAt, 'lastVisitAt');
        const clinics = this.buildClinicsList(clinicInfo.primaryClinicId, input.clinics);
        const tags = this.normalizeStrings(input.tags);
        const patient = new patient_entity_1.Patient('', doctorId, input.firstName.trim(), input.consultationType, undefined, undefined, clinicInfo.primaryClinicId, clinics, generatedPatientId, input.lastName ? input.lastName.trim() : undefined, input.fullName ? input.fullName.trim() : undefined, dob, input.age, input.gender, phone, email, input.address ? input.address.trim() : undefined, input.profilePicUrl ? input.profilePicUrl.trim() : undefined, tags, [], input.visitCount ?? 0, lastVisitAt, input.isActive, false);
        const created = await this.patientRepository.create(patient);
        return (0, patient_mapper_1.patientToDto)(created);
    }
    validateInput(input) {
        if (!input.firstName || input.firstName.trim().length === 0) {
            throw new validation_error_1.ValidationError('firstName is required');
        }
        if (!input.consultationType) {
            throw new validation_error_1.ValidationError('consultationType is required');
        }
        if (!input.primaryClinic || input.primaryClinic.trim().length === 0) {
            throw new validation_error_1.ValidationError('primaryClinic is required');
        }
        if (input.age !== undefined && input.age < 0) {
            throw new validation_error_1.ValidationError('age cannot be negative');
        }
        if (input.visitCount !== undefined && input.visitCount < 0) {
            throw new validation_error_1.ValidationError('visitCount cannot be negative');
        }
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
    async resolvePrimaryClinic(doctorId, primaryClinicId) {
        const clinic = await this.clinicRepository.findById(primaryClinicId);
        if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
            throw new validation_error_1.ValidationError('primaryClinic is invalid');
        }
        const clinicCode = clinic.clinicId?.trim().toUpperCase();
        if (!clinicCode || clinicCode.length !== 3) {
            throw new validation_error_1.ValidationError('Clinic is missing a valid clinicId');
        }
        return { primaryClinicId, clinicCode };
    }
    async generatePatientId(clinicCode) {
        const sequence = await this.patientIdCounterRepository.getNextSequence(clinicCode);
        return new patient_id_vo_1.PatientId(`${clinicCode}-${sequence}`);
    }
    buildClinicsList(primaryClinicId, clinics) {
        const sanitized = this.normalizeStrings(clinics);
        const trimmedPrimary = primaryClinicId.trim();
        if (!sanitized.includes(trimmedPrimary)) {
            sanitized.unshift(trimmedPrimary);
        }
        return sanitized;
    }
};
exports.CreatePatientUseCase = CreatePatientUseCase;
exports.CreatePatientUseCase = CreatePatientUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(1, (0, tsyringe_1.inject)('IClinicRepository')),
    __param(2, (0, tsyringe_1.inject)('IPatientIdCounterRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], CreatePatientUseCase);
