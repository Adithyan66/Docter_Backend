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
exports.TreatmentController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
let TreatmentController = class TreatmentController {
    constructor(createTreatmentUseCase, updateTreatmentUseCase, deleteTreatmentUseCase, getTreatmentUseCase, getAllTreatmentsUseCase, getTreatmentNamesUseCase, addTreatmentImagesUseCase, getTreatmentImagesUseCase, deleteTreatmentImageUseCase) {
        this.createTreatmentUseCase = createTreatmentUseCase;
        this.updateTreatmentUseCase = updateTreatmentUseCase;
        this.deleteTreatmentUseCase = deleteTreatmentUseCase;
        this.getTreatmentUseCase = getTreatmentUseCase;
        this.getAllTreatmentsUseCase = getAllTreatmentsUseCase;
        this.getTreatmentNamesUseCase = getTreatmentNamesUseCase;
        this.addTreatmentImagesUseCase = addTreatmentImagesUseCase;
        this.getTreatmentImagesUseCase = getTreatmentImagesUseCase;
        this.deleteTreatmentImageUseCase = deleteTreatmentImageUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        await this.createTreatmentUseCase.execute(doctorId, input);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async update(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Treatment ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        await this.updateTreatmentUseCase.execute(id, doctorId, input);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Treatment ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        await this.deleteTreatmentUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Treatment ID is required');
        }
        const context = (0, user_context_util_1.getUserContext)(req);
        const includeStatistics = req.query.includeStatistics === 'true' || req.query.includeStatistics === '1';
        const startDateFrom = req.query.startDateFrom ? new Date(String(req.query.startDateFrom)) : undefined;
        const startDateTo = req.query.startDateTo ? new Date(String(req.query.startDateTo)) : undefined;
        let clinicId = req.query.clinicId ? String(req.query.clinicId) : undefined;
        const include = req.query.include ? String(req.query.include).split(',').map(s => s.trim()) : undefined;
        const exclude = req.query.exclude ? String(req.query.exclude).split(',').map(s => s.trim()) : undefined;
        if (context.role === 'staff' && context.clinicId) {
            clinicId = context.clinicId;
        }
        if (startDateFrom && isNaN(startDateFrom.getTime())) {
            throw new validation_error_1.ValidationError('Invalid startDateFrom format. Use ISO date string.');
        }
        if (startDateTo && isNaN(startDateTo.getTime())) {
            throw new validation_error_1.ValidationError('Invalid startDateTo format. Use ISO date string.');
        }
        const result = await this.getTreatmentUseCase.execute(id, context.doctorId, {
            includeStatistics,
            startDateFrom,
            startDateTo,
            clinicId,
            include,
            exclude,
        });
        const response = this.toResponseDto(result.treatment, result.statistics);
        (0, constants_1.successResponse)(res, response, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
        const sortBy = req.query.sortBy;
        const sortOrder = req.query.sortOrder;
        const search = req.query.search;
        const validSortBy = sortBy && ['averageAmount', 'averageDuration', 'numberOfPatients', 'ongoing', 'completed', ''].includes(sortBy) ? sortBy : '';
        const validSortOrder = sortOrder && ['asc', 'desc'].includes(sortOrder) ? sortOrder : undefined;
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const result = await this.getAllTreatmentsUseCase.execute(doctorId, page, limit, validSortBy, validSortOrder, search);
        const response = {
            treatments: result.treatments,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
        (0, constants_1.successResponse)(res, response, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getNames(req, res, next) {
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const search = req.query.search ? String(req.query.search) : undefined;
        const names = await this.getTreatmentNamesUseCase.execute(doctorId, search);
        (0, constants_1.successResponse)(res, names, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getImages(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Treatment ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const result = await this.getTreatmentImagesUseCase.execute(id, doctorId, {
            page,
            limit,
        });
        const response = {
            images: result.images,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
        (0, constants_1.successResponse)(res, response, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async addImages(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Treatment ID is required');
        }
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const body = req.body;
        if (!body.images || !Array.isArray(body.images)) {
            throw new validation_error_1.ValidationError('images must be an array of image URLs');
        }
        await this.addTreatmentImagesUseCase.execute(id, doctorId, body.images);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async deleteImage(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Treatment ID is required');
        }
        const imageIndexParam = req.params.imageIndex;
        if (!imageIndexParam) {
            throw new validation_error_1.ValidationError('Image index is required');
        }
        const imageIndex = parseInt(imageIndexParam, 10);
        if (isNaN(imageIndex) || imageIndex < 0) {
            throw new validation_error_1.ValidationError('Invalid image index');
        }
        const body = req.body;
        if (!body || !body.imageUrl || typeof body.imageUrl !== 'string' || body.imageUrl.trim().length === 0) {
            throw new validation_error_1.ValidationError('Image URL is required in request body');
        }
        const userContext = (0, user_context_util_1.getUserContext)(req);
        const doctorId = userContext.doctorId;
        const staffClinicId = (0, user_context_util_1.getClinicId)(req);
        await this.deleteTreatmentImageUseCase.execute(id, imageIndex, body.imageUrl, {
            doctorId,
            role: userContext.role,
            clinicId: staffClinicId,
        });
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    toResponseDto(treatment, statistics) {
        const dto = {
            id: treatment.id,
            doctorId: treatment.doctorId,
            name: treatment.name,
            description: treatment.description,
            minDuration: treatment.minDuration,
            maxDuration: treatment.maxDuration,
            avgDuration: treatment.avgDuration,
            minFees: treatment.minFees,
            maxFees: treatment.maxFees,
            avgFees: treatment.avgFees,
            steps: treatment.steps,
            aftercare: treatment.aftercare,
            followUpRequired: treatment.followUpRequired,
            followUpAfterDays: treatment.followUpAfterDays,
            risks: treatment.risks,
            images: treatment.images,
            isOneTime: treatment.isOneTime,
            regularVisitInterval: treatment.regularVisitInterval,
            isActive: treatment.isActive,
            createdAt: treatment.createdAt,
            updatedAt: treatment.updatedAt,
        };
        if (statistics) {
            dto.statistics = statistics;
        }
        return dto;
    }
};
exports.TreatmentController = TreatmentController;
exports.TreatmentController = TreatmentController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreateTreatmentUseCase')),
    __param(1, (0, tsyringe_1.inject)('IUpdateTreatmentUseCase')),
    __param(2, (0, tsyringe_1.inject)('IDeleteTreatmentUseCase')),
    __param(3, (0, tsyringe_1.inject)('IGetTreatmentUseCase')),
    __param(4, (0, tsyringe_1.inject)('IGetAllTreatmentsUseCase')),
    __param(5, (0, tsyringe_1.inject)('IGetTreatmentNamesUseCase')),
    __param(6, (0, tsyringe_1.inject)('IAddTreatmentImagesUseCase')),
    __param(7, (0, tsyringe_1.inject)('IGetTreatmentImagesUseCase')),
    __param(8, (0, tsyringe_1.inject)('IDeleteTreatmentImageUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TreatmentController);
