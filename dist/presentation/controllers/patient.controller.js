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
exports.PatientController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
let PatientController = class PatientController {
    constructor(createPatientUseCase, updatePatientUseCase, deletePatientUseCase, restorePatientUseCase, getPatientsUseCase, getPatientUseCase) {
        this.createPatientUseCase = createPatientUseCase;
        this.updatePatientUseCase = updatePatientUseCase;
        this.deletePatientUseCase = deletePatientUseCase;
        this.restorePatientUseCase = restorePatientUseCase;
        this.getPatientsUseCase = getPatientsUseCase;
        this.getPatientUseCase = getPatientUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const patient = await this.createPatientUseCase.execute(doctorId, input);
        (0, constants_1.successResponse)(res, patient, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async update(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Patient ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const patient = await this.updatePatientUseCase.execute(id, doctorId, input);
        (0, constants_1.successResponse)(res, patient, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Patient ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        await this.deletePatientUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async restore(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Patient ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        await this.restorePatientUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Patient ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const patient = await this.getPatientUseCase.executeDetail(id, doctorId);
        (0, constants_1.successResponse)(res, patient, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const context = (0, user_context_util_1.getUserContext)(req);
        const query = this.buildQueryDto(req);
        if (context.role === 'staff' && context.clinicId) {
            query.clinicId = context.clinicId;
        }
        const result = await this.getPatientsUseCase.execute(context.doctorId, query);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    buildQueryDto(req) {
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const minAge = req.query.minAge ? parseInt(String(req.query.minAge), 10) : undefined;
        const maxAge = req.query.maxAge ? parseInt(String(req.query.maxAge), 10) : undefined;
        const sortByCandidate = req.query.sortBy;
        const allowedSortBy = ['createdAt', 'fullName', 'visitCount', 'lastVisitAt'];
        const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
        const sortOrderCandidate = req.query.sortOrder;
        const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;
        const genderCandidate = req.query.gender;
        const allowedGenders = ['male', 'female', 'other', 'unknown'];
        const gender = genderCandidate && allowedGenders.includes(genderCandidate) ? genderCandidate : undefined;
        const consultationCandidate = req.query.consultationType;
        const allowedConsultations = ['one-time', 'treatment-plan'];
        const consultationType = consultationCandidate && allowedConsultations.includes(consultationCandidate) ? consultationCandidate : undefined;
        return {
            page,
            limit,
            search: req.query.search ? String(req.query.search) : undefined,
            patientId: req.query.patientId ? String(req.query.patientId) : undefined,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
            gender,
            consultationType,
            minAge,
            maxAge,
            sortBy,
            sortOrder,
        };
    }
};
exports.PatientController = PatientController;
exports.PatientController = PatientController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreatePatientUseCase')),
    __param(1, (0, tsyringe_1.inject)('IUpdatePatientUseCase')),
    __param(2, (0, tsyringe_1.inject)('IDeletePatientUseCase')),
    __param(3, (0, tsyringe_1.inject)('IRestorePatientUseCase')),
    __param(4, (0, tsyringe_1.inject)('IGetPatientsUseCase')),
    __param(5, (0, tsyringe_1.inject)('IGetPatientUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], PatientController);
