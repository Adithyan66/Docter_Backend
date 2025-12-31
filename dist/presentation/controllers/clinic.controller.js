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
exports.ClinicController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
const unauthorized_error_1 = require("../../domain/errors/unauthorized.error");
const error_messages_1 = require("../../infrastructure/constants/error-messages");
let ClinicController = class ClinicController {
    constructor(createClinicUseCase, updateClinicUseCase, deleteClinicUseCase, getClinicUseCase, getAllClinicsUseCase, getClinicNamesUseCase, getClinicImagesUseCase, deleteClinicImageUseCase, addClinicImagesUseCase) {
        this.createClinicUseCase = createClinicUseCase;
        this.updateClinicUseCase = updateClinicUseCase;
        this.deleteClinicUseCase = deleteClinicUseCase;
        this.getClinicUseCase = getClinicUseCase;
        this.getAllClinicsUseCase = getAllClinicsUseCase;
        this.getClinicNamesUseCase = getClinicNamesUseCase;
        this.getClinicImagesUseCase = getClinicImagesUseCase;
        this.deleteClinicImageUseCase = deleteClinicImageUseCase;
        this.addClinicImagesUseCase = addClinicImagesUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const userContext = (0, user_context_util_1.getUserContext)(req);
        const doctorId = userContext.doctorId;
        const input = req.body;
        await this.createClinicUseCase.execute(doctorId, input);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async update(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Clinic ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        await this.updateClinicUseCase.execute(id, doctorId, input);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Clinic ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        await this.deleteClinicUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Clinic ID is required');
        }
        const userContext = (0, user_context_util_1.getUserContext)(req);
        const doctorId = userContext.doctorId;
        const staffClinicId = (0, user_context_util_1.getClinicId)(req);
        if (userContext.role === 'staff') {
            if (!staffClinicId || staffClinicId !== id) {
                throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
            }
        }
        const includeStatistics = req.query.includeStatistics === 'true' || req.query.includeStatistics === '1';
        const startDateFrom = req.query.startDateFrom ? new Date(String(req.query.startDateFrom)) : undefined;
        const startDateTo = req.query.startDateTo ? new Date(String(req.query.startDateTo)) : undefined;
        const treatmentId = req.query.treatmentId ? String(req.query.treatmentId) : undefined;
        const include = req.query.include ? String(req.query.include).split(',').map(s => s.trim()) : undefined;
        const exclude = req.query.exclude ? String(req.query.exclude).split(',').map(s => s.trim()) : undefined;
        if (startDateFrom && isNaN(startDateFrom.getTime())) {
            throw new validation_error_1.ValidationError('Invalid startDateFrom format. Use ISO date string.');
        }
        if (startDateTo && isNaN(startDateTo.getTime())) {
            throw new validation_error_1.ValidationError('Invalid startDateTo format. Use ISO date string.');
        }
        const result = await this.getClinicUseCase.execute(id, {
            doctorId,
            role: userContext.role,
            clinicId: staffClinicId,
        }, {
            includeStatistics,
            startDateFrom,
            startDateTo,
            treatmentId,
            include,
            exclude,
        });
        const response = this.toResponseDto(result.clinic, result.statistics);
        (0, constants_1.successResponse)(res, response, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const params = {
            page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
            limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
            search: req.query.search,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const result = await this.getAllClinicsUseCase.execute(doctorId, params);
        const response = {
            clinics: result.clinics,
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
        const names = await this.getClinicNamesUseCase.execute(doctorId, search);
        (0, constants_1.successResponse)(res, names, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getImages(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Clinic ID is required');
        }
        const userContext = (0, user_context_util_1.getUserContext)(req);
        const doctorId = userContext.doctorId;
        const staffClinicId = (0, user_context_util_1.getClinicId)(req);
        const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const result = await this.getClinicImagesUseCase.execute(id, {
            doctorId,
            role: userContext.role,
            clinicId: staffClinicId,
        }, {
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
    async deleteImage(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Clinic ID is required');
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
        await this.deleteClinicImageUseCase.execute(id, imageIndex, body.imageUrl, {
            doctorId,
            role: userContext.role,
            clinicId: staffClinicId,
        });
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async addImages(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Clinic ID is required');
        }
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const body = req.body;
        if (!body.images || !Array.isArray(body.images)) {
            throw new validation_error_1.ValidationError('images must be an array of image URLs');
        }
        await this.addClinicImagesUseCase.execute(id, doctorId, body.images);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    toResponseDto(clinic, statistics) {
        const dto = {
            id: clinic.id,
            clinicId: clinic.clinicId,
            doctorId: clinic.doctorId,
            name: clinic.name,
            address: clinic.address,
            city: clinic.city,
            state: clinic.state,
            pincode: clinic.pincode,
            phone: clinic.phone,
            email: clinic.email?.toString(),
            website: clinic.website,
            locationUrl: clinic.locationUrl,
            workingDays: clinic.workingDays?.map(wd => wd.toJSON()),
            treatments: clinic.populatedTreatments || undefined,
            images: clinic.images,
            notes: clinic.notes,
            isActive: clinic.isActive,
            isDeleted: clinic.isDeleted,
            createdAt: clinic.createdAt,
            updatedAt: clinic.updatedAt,
        };
        if (statistics) {
            dto.statistics = statistics;
        }
        return dto;
    }
};
exports.ClinicController = ClinicController;
exports.ClinicController = ClinicController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreateClinicUseCase')),
    __param(1, (0, tsyringe_1.inject)('IUpdateClinicUseCase')),
    __param(2, (0, tsyringe_1.inject)('IDeleteClinicUseCase')),
    __param(3, (0, tsyringe_1.inject)('IGetClinicUseCase')),
    __param(4, (0, tsyringe_1.inject)('IGetAllClinicsUseCase')),
    __param(5, (0, tsyringe_1.inject)('IGetClinicNamesUseCase')),
    __param(6, (0, tsyringe_1.inject)('IGetClinicImagesUseCase')),
    __param(7, (0, tsyringe_1.inject)('IDeleteClinicImageUseCase')),
    __param(8, (0, tsyringe_1.inject)('IAddClinicImagesUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ClinicController);
