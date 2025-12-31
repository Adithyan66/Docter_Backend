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
exports.PaymentController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const validation_error_1 = require("../../domain/errors/validation.error");
const user_context_util_1 = require("../utils/user-context.util");
let PaymentController = class PaymentController {
    constructor(createPaymentUseCase, getPaymentUseCase, getAllPaymentsUseCase, refundPaymentUseCase) {
        this.createPaymentUseCase = createPaymentUseCase;
        this.getPaymentUseCase = getPaymentUseCase;
        this.getAllPaymentsUseCase = getAllPaymentsUseCase;
        this.refundPaymentUseCase = refundPaymentUseCase;
    }
    async create(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const payment = await this.createPaymentUseCase.execute(doctorId, input);
        (0, constants_1.successResponse)(res, payment, constants_1.HttpStatus.CREATED, constants_1.SuccessMessages.CREATED);
    }
    async getById(req, res, next) {
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Payment ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const payment = await this.getPaymentUseCase.execute(id, doctorId);
        (0, constants_1.successResponse)(res, payment, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async getAll(req, res, next) {
        const context = (0, user_context_util_1.getUserContext)(req);
        const query = {
            page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
            limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
            patientId: req.query.patientId ? String(req.query.patientId) : undefined,
            courseId: req.query.courseId ? String(req.query.courseId) : undefined,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
            visitId: req.query.visitId ? String(req.query.visitId) : undefined,
            dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
            dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
            method: req.query.method,
            refunded: req.query.refunded ? req.query.refunded === 'true' : undefined,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        if (context.role === 'staff' && context.clinicId) {
            query.clinicId = context.clinicId;
        }
        const result = await this.getAllPaymentsUseCase.execute(context.doctorId, query);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    async refund(req, res, next) {
        if (!req.body || typeof req.body !== 'object') {
            throw new validation_error_1.ValidationError('Request body is required');
        }
        const id = req.params.id;
        if (!id) {
            throw new validation_error_1.ValidationError('Payment ID is required');
        }
        const doctorId = (0, user_context_util_1.getUserId)(req);
        const input = req.body;
        const payment = await this.refundPaymentUseCase.execute(id, doctorId, input);
        (0, constants_1.successResponse)(res, payment, constants_1.HttpStatus.OK, constants_1.SuccessMessages.UPDATED);
    }
};
exports.PaymentController = PaymentController;
exports.PaymentController = PaymentController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICreatePaymentUseCase')),
    __param(1, (0, tsyringe_1.inject)('IGetPaymentUseCase')),
    __param(2, (0, tsyringe_1.inject)('IGetAllPaymentsUseCase')),
    __param(3, (0, tsyringe_1.inject)('IRefundPaymentUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], PaymentController);
