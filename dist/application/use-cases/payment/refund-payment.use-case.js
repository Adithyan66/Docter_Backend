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
exports.RefundPaymentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const refund_details_entity_1 = require("../../../domain/entities/refund-details.entity");
const validation_error_1 = require("../../../domain/errors/validation.error");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const payment_mapper_1 = require("../../mappers/payment.mapper");
let RefundPaymentUseCase = class RefundPaymentUseCase {
    constructor(paymentRepository, treatmentCourseRepository, txManager) {
        this.paymentRepository = paymentRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.txManager = txManager;
    }
    async execute(id, doctorId, input) {
        if (!id || id.trim().length === 0) {
            throw new validation_error_1.ValidationError('Payment ID is required');
        }
        const payment = await this.paymentRepository.findByIdAndDoctor(id.trim(), doctorId);
        if (!payment) {
            throw new not_found_error_1.NotFoundError('Payment', id);
        }
        if (payment.refunded) {
            throw new validation_error_1.ValidationError('Payment is already refunded');
        }
        const refundAmount = input.refundAmount !== undefined ? input.refundAmount : payment.amount;
        if (refundAmount > payment.amount) {
            throw new validation_error_1.ValidationError('Refund amount cannot exceed payment amount');
        }
        if (refundAmount <= 0) {
            throw new validation_error_1.ValidationError('Refund amount must be greater than zero');
        }
        const refundDetails = new refund_details_entity_1.RefundDetails(new Date(), refundAmount, input.refundReason);
        return this.txManager.runInTransaction(async (tx) => {
            payment.markRefunded(refundDetails);
            const updated = await this.paymentRepository.update(payment.id, payment, tx);
            if (!updated) {
                throw new not_found_error_1.NotFoundError('Payment', id);
            }
            await this.treatmentCourseRepository.decrementTotalPaid(payment.courseId, refundAmount, tx);
            return (0, payment_mapper_1.paymentToDto)(updated);
        });
    }
};
exports.RefundPaymentUseCase = RefundPaymentUseCase;
exports.RefundPaymentUseCase = RefundPaymentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPaymentRepository')),
    __param(1, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(2, (0, tsyringe_1.inject)('ITransactionManager')),
    __metadata("design:paramtypes", [Object, Object, Object])
], RefundPaymentUseCase);
