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
exports.TreatmentCourseController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
let TreatmentCourseController = class TreatmentCourseController {
    constructor(createTreatmentCourseUseCase, updateTreatmentCourseUseCase, deleteTreatmentCourseUseCase, getTreatmentCourseUseCase, getAllTreatmentCoursesUseCase) {
        this.createTreatmentCourseUseCase = createTreatmentCourseUseCase;
        this.updateTreatmentCourseUseCase = updateTreatmentCourseUseCase;
        this.deleteTreatmentCourseUseCase = deleteTreatmentCourseUseCase;
        this.getTreatmentCourseUseCase = getTreatmentCourseUseCase;
        this.getAllTreatmentCoursesUseCase = getAllTreatmentCoursesUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const treatmentCourse = await this.createTreatmentCourseUseCase.execute(doctorId, input);
        (0, constants_1.successResponse)(res, treatmentCourse, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async update(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('TreatmentCourse ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const treatmentCourse = await this.updateTreatmentCourseUseCase.execute(id, doctorId, input);
        (0, constants_1.successResponse)(res, treatmentCourse, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('TreatmentCourse ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        await this.deleteTreatmentCourseUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('TreatmentCourse ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const treatmentCourse = await this.getTreatmentCourseUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, treatmentCourse, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const context = (0, user_context_util_1.getUserContext)(req);
        const query = this.buildQueryDto(req);
        if (context.role === 'staff' && context.clinicId) {
            query.clinicId = context.clinicId;
        }
        const result = await this.getAllTreatmentCoursesUseCase.execute(context.doctorId, query);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    buildQueryDto(req) {
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const sortByCandidate = req.query.sortBy;
        const allowedSortBy = ['createdAt', 'startDate', 'totalCost', 'status'];
        const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
        const sortOrderCandidate = req.query.sortOrder;
        const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;
        const statusCandidate = req.query.status;
        const allowedStatuses = ['active', 'paused', 'completed', 'cancelled'];
        const status = statusCandidate && allowedStatuses.includes(statusCandidate) ? statusCandidate : undefined;
        return {
            page,
            limit,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
            treatmentId: req.query.treatmentId ? String(req.query.treatmentId) : undefined,
            patientId: req.query.patientId ? String(req.query.patientId) : undefined,
            status,
            startDateFrom: req.query.startDateFrom ? String(req.query.startDateFrom) : undefined,
            startDateTo: req.query.startDateTo ? String(req.query.startDateTo) : undefined,
            sortBy,
            sortOrder,
        };
    }
};
exports.TreatmentCourseController = TreatmentCourseController;
exports.TreatmentCourseController = TreatmentCourseController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreateTreatmentCourseUseCase')),
    __param(1, (0, tsyringe_1.inject)('IUpdateTreatmentCourseUseCase')),
    __param(2, (0, tsyringe_1.inject)('IDeleteTreatmentCourseUseCase')),
    __param(3, (0, tsyringe_1.inject)('IGetTreatmentCourseUseCase')),
    __param(4, (0, tsyringe_1.inject)('IGetAllTreatmentCoursesUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TreatmentCourseController);
