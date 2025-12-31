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
exports.VisitController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
let VisitController = class VisitController {
    constructor(createVisitUseCase, updateVisitUseCase, deleteVisitUseCase, getVisitUseCase, getAllVisitsUseCase, getVisitRemindersUseCase) {
        this.createVisitUseCase = createVisitUseCase;
        this.updateVisitUseCase = updateVisitUseCase;
        this.deleteVisitUseCase = deleteVisitUseCase;
        this.getVisitUseCase = getVisitUseCase;
        this.getAllVisitsUseCase = getAllVisitsUseCase;
        this.getVisitRemindersUseCase = getVisitRemindersUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const visit = await this.createVisitUseCase.execute(doctorId, input);
        (0, constants_1.successResponse)(res, visit, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async update(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Visit ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const visit = await this.updateVisitUseCase.execute(id, doctorId, input);
        (0, constants_1.successResponse)(res, visit, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Visit ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        await this.deleteVisitUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Visit ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const visit = await this.getVisitUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, visit, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const context = (0, user_context_util_1.getUserContext)(req);
        const query = this.buildQueryDto(req);
        if (context.role === 'staff' && context.clinicId) {
            query.clinicId = context.clinicId;
        }
        const result = await this.getAllVisitsUseCase.execute(context.doctorId, query);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getVisitReminders(req, res, next) {
        const context = (0, user_context_util_1.getUserContext)(req);
        const query = this.buildRemindersQueryDto(req);
        if (context.role === 'staff' && context.clinicId) {
            query.clinicId = context.clinicId;
        }
        const result = await this.getVisitRemindersUseCase.execute(context.doctorId, query);
        (0, constants_1.paginatedResponse)(res, result.reminders, {
            page: result.page,
            limit: result.limit,
            total: result.total,
        }, constants_1.SuccessMessages.RETRIEVED);
    }
    buildQueryDto(req) {
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const sortByCandidate = req.query.sortBy;
        const allowedSortBy = ['visitDate', 'createdAt'];
        const sortBy = sortByCandidate && allowedSortBy.includes(sortByCandidate) ? sortByCandidate : undefined;
        const sortOrderCandidate = req.query.sortOrder;
        const sortOrder = sortOrderCandidate && ['asc', 'desc'].includes(sortOrderCandidate) ? sortOrderCandidate : undefined;
        return {
            page,
            limit,
            patientId: req.query.patientId ? String(req.query.patientId) : undefined,
            courseId: req.query.courseId ? String(req.query.courseId) : undefined,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
            visitDateFrom: req.query.visitDateFrom ? String(req.query.visitDateFrom) : undefined,
            visitDateTo: req.query.visitDateTo ? String(req.query.visitDateTo) : undefined,
            notes: req.query.notes ? String(req.query.notes) : undefined,
            sortBy,
            sortOrder,
            include: req.query.include ? String(req.query.include) : undefined,
        };
    }
    buildRemindersQueryDto(req) {
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const daysBefore = req.query.daysBefore ? parseInt(String(req.query.daysBefore), 10) : undefined;
        const daysAfter = req.query.daysAfter ? parseInt(String(req.query.daysAfter), 10) : undefined;
        return {
            page,
            limit,
            daysBefore,
            daysAfter,
            treatmentId: req.query.treatmentId ? String(req.query.treatmentId) : undefined,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
        };
    }
};
exports.VisitController = VisitController;
exports.VisitController = VisitController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreateVisitUseCase')),
    __param(1, (0, tsyringe_1.inject)('IUpdateVisitUseCase')),
    __param(2, (0, tsyringe_1.inject)('IDeleteVisitUseCase')),
    __param(3, (0, tsyringe_1.inject)('IGetVisitUseCase')),
    __param(4, (0, tsyringe_1.inject)('IGetAllVisitsUseCase')),
    __param(5, (0, tsyringe_1.inject)('IGetVisitRemindersUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], VisitController);
