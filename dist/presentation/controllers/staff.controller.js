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
exports.StaffController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
let StaffController = class StaffController {
    constructor(createStaffUseCase, updateStaffUseCase, deleteStaffUseCase, getStaffUseCase, getAllStaffUseCase) {
        this.createStaffUseCase = createStaffUseCase;
        this.updateStaffUseCase = updateStaffUseCase;
        this.deleteStaffUseCase = deleteStaffUseCase;
        this.getStaffUseCase = getStaffUseCase;
        this.getAllStaffUseCase = getAllStaffUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const user = (0, user_context_util_1.getUserContext)(req);
        const result = await this.createStaffUseCase.execute(user.doctorId, req.body);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async update(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Staff ID is required');
        }
        const user = (0, user_context_util_1.getUserContext)(req);
        const result = await this.updateStaffUseCase.execute(id, user.doctorId, req.body);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
    async delete(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Staff ID is required');
        }
        const user = (0, user_context_util_1.getUserContext)(req);
        await this.deleteStaffUseCase.execute(id, user.doctorId);
        (0, constants_1.successResponse)(res, null, constants_1.HttpStatus.OK, constants_1.SuccessMessages.DELETED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Staff ID is required');
        }
        const user = (0, user_context_util_1.getUserContext)(req);
        const result = await this.getStaffUseCase.execute(id, user.doctorId);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const user = (0, user_context_util_1.getUserContext)(req);
        const params = {
            page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
            limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
            username: req.query.search ? String(req.query.search) : undefined,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' || req.query.isActive === '1' : undefined,
        };
        const result = await this.getAllStaffUseCase.execute(user.doctorId, params);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
};
exports.StaffController = StaffController;
exports.StaffController = StaffController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreateStaffUseCase')),
    __param(1, (0, tsyringe_1.inject)('IUpdateStaffUseCase')),
    __param(2, (0, tsyringe_1.inject)('IDeleteStaffUseCase')),
    __param(3, (0, tsyringe_1.inject)('IGetStaffUseCase')),
    __param(4, (0, tsyringe_1.inject)('IGetAllStaffUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], StaffController);
