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
exports.GetAllPaymentsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const payment_mapper_1 = require("../../mappers/payment.mapper");
let GetAllPaymentsUseCase = class GetAllPaymentsUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }
    async execute(doctorId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const options = {
            doctorId,
            page,
            limit,
            patientId: query.patientId,
            courseId: query.courseId,
            clinicId: query.clinicId,
            visitId: query.visitId,
            dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
            dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
            method: query.method,
            refunded: query.refunded,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        };
        const result = await this.paymentRepository.findPaginated(options);
        return {
            payments: result.payments.map((payment) => (0, payment_mapper_1.paymentToDto)(payment)),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetAllPaymentsUseCase = GetAllPaymentsUseCase;
exports.GetAllPaymentsUseCase = GetAllPaymentsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPaymentRepository')),
    __metadata("design:paramtypes", [Object])
], GetAllPaymentsUseCase);
