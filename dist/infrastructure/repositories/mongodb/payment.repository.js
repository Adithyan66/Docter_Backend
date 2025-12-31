"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPaymentRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const payment_entity_1 = require("../../../domain/entities/payment.entity");
const payment_method_vo_1 = require("../../../domain/value-objects/payment-method.vo");
const refund_details_entity_1 = require("../../../domain/entities/refund-details.entity");
const payment_model_1 = require("../../database/mongoose/payment.model");
let MongoPaymentRepository = class MongoPaymentRepository {
    async findById(id) {
        const doc = await payment_model_1.PaymentModel.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctor(id, doctorId) {
        const doc = await payment_model_1.PaymentModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findAll() {
        const docs = await payment_model_1.PaymentModel.find({ isDeleted: false });
        return docs.map((doc) => this.toDomain(doc));
    }
    async create(entity, session) {
        const doc = new payment_model_1.PaymentModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctorId),
            patient: new mongoose_1.Types.ObjectId(entity.patientId),
            course: new mongoose_1.Types.ObjectId(entity.courseId),
            visit: entity.visitId ? new mongoose_1.Types.ObjectId(entity.visitId) : undefined,
            clinic: entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : undefined,
            amount: entity.amount,
            method: entity.method.getValue(),
            reference: entity.reference,
            paidAt: entity.paidAt,
            refunded: entity.refunded,
            refundDetails: entity.refundDetails
                ? {
                    refundedAt: entity.refundDetails.refundedAt,
                    refundReason: entity.refundDetails.refundReason,
                    refundAmount: entity.refundDetails.refundAmount,
                }
                : undefined,
            isDeleted: entity.isDeleted || false,
        });
        if (session) {
            await doc.save({ session });
        }
        else {
            await doc.save();
        }
        return this.toDomain(doc);
    }
    async update(id, entity, session) {
        const updateData = {};
        if (entity.doctorId !== undefined)
            updateData.doctor = new mongoose_1.Types.ObjectId(entity.doctorId);
        if (entity.patientId !== undefined)
            updateData.patient = new mongoose_1.Types.ObjectId(entity.patientId);
        if (entity.courseId !== undefined)
            updateData.course = new mongoose_1.Types.ObjectId(entity.courseId);
        if (entity.visitId !== undefined)
            updateData.visit = entity.visitId ? new mongoose_1.Types.ObjectId(entity.visitId) : null;
        if (entity.clinicId !== undefined)
            updateData.clinic = entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : null;
        if (entity.amount !== undefined)
            updateData.amount = entity.amount;
        if (entity.method !== undefined)
            updateData.method = entity.method.getValue();
        if (entity.reference !== undefined)
            updateData.reference = entity.reference;
        if (entity.paidAt !== undefined)
            updateData.paidAt = entity.paidAt;
        if (entity.refunded !== undefined)
            updateData.refunded = entity.refunded;
        if (entity.refundDetails !== undefined) {
            updateData.refundDetails = entity.refundDetails
                ? {
                    refundedAt: entity.refundDetails.refundedAt,
                    refundReason: entity.refundDetails.refundReason,
                    refundAmount: entity.refundDetails.refundAmount,
                }
                : null;
        }
        if (entity.isDeleted !== undefined)
            updateData.isDeleted = entity.isDeleted;
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        await payment_model_1.PaymentModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, updateOptions);
        const doc = await payment_model_1.PaymentModel.findOne({ _id: id, isDeleted: false }).session(session || null);
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async delete(id) {
        const result = await payment_model_1.PaymentModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
        return !!result;
    }
    async findPaginated(options) {
        const { page, limit, doctorId, patientId, courseId, clinicId, visitId, dateFrom, dateTo, method, refunded, sortBy = 'createdAt', sortOrder = 'desc', } = options;
        const skip = (page - 1) * limit;
        const baseMatch = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
        };
        const andConditions = [baseMatch];
        if (patientId && mongoose_1.Types.ObjectId.isValid(patientId)) {
            andConditions.push({ patient: new mongoose_1.Types.ObjectId(patientId) });
        }
        if (courseId && mongoose_1.Types.ObjectId.isValid(courseId)) {
            andConditions.push({ course: new mongoose_1.Types.ObjectId(courseId) });
        }
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            andConditions.push({ clinic: new mongoose_1.Types.ObjectId(clinicId) });
        }
        if (visitId && mongoose_1.Types.ObjectId.isValid(visitId)) {
            andConditions.push({ visit: new mongoose_1.Types.ObjectId(visitId) });
        }
        if (dateFrom || dateTo) {
            const dateFilter = {};
            if (dateFrom)
                dateFilter.$gte = dateFrom;
            if (dateTo)
                dateFilter.$lte = dateTo;
            andConditions.push({ paidAt: dateFilter });
        }
        if (method) {
            andConditions.push({ method });
        }
        if (refunded !== undefined) {
            andConditions.push({ refunded });
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const sortFieldMap = {
            createdAt: 'createdAt',
            paidAt: 'paidAt',
            amount: 'amount',
        };
        const sortField = sortFieldMap[sortBy] || 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const pipeline = [
            { $match: matchStage },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { [sortField]: sortDirection } },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                },
            },
            {
                $project: {
                    payments: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await payment_model_1.PaymentModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                payments: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const payments = aggregationResult.payments.map((doc) => this.toDomainFromPlainObject(doc));
        return {
            payments,
            total,
            page,
            limit,
            totalPages,
        };
    }
    toDomain(doc) {
        const refundDetails = doc.refundDetails && doc.refundDetails.refundedAt
            ? new refund_details_entity_1.RefundDetails(doc.refundDetails.refundedAt, doc.refundDetails.refundAmount, doc.refundDetails.refundReason)
            : undefined;
        return new payment_entity_1.Payment(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.course ? doc.course.toString() : '', doc.amount, new payment_method_vo_1.PaymentMethodVO(doc.method), doc.paidAt, doc.createdAt, doc.updatedAt, doc.visit ? doc.visit.toString() : undefined, doc.clinic ? doc.clinic.toString() : undefined, doc.reference, doc.refunded, refundDetails, doc.isDeleted || false);
    }
    toDomainFromPlainObject(doc) {
        const id = doc._id ? doc._id.toString() : '';
        const refundDetails = doc.refundDetails && doc.refundDetails.refundedAt
            ? new refund_details_entity_1.RefundDetails(doc.refundDetails.refundedAt, doc.refundDetails.refundAmount, doc.refundDetails.refundReason)
            : undefined;
        return new payment_entity_1.Payment(id, doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.course ? doc.course.toString() : '', doc.amount || 0, new payment_method_vo_1.PaymentMethodVO(doc.method || 'cash'), doc.paidAt || new Date(), doc.createdAt, doc.updatedAt, doc.visit ? doc.visit.toString() : undefined, doc.clinic ? doc.clinic.toString() : undefined, doc.reference, doc.refunded || false, refundDetails, doc.isDeleted || false);
    }
    async markDeletedByPatientId(patientId, doctorId, session) {
        const result = await payment_model_1.PaymentModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        }, {
            isDeleted: true,
        }, { session });
        return result.modifiedCount;
    }
    async markRestoredByPatientId(patientId, doctorId, session) {
        const result = await payment_model_1.PaymentModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: true,
        }, {
            isDeleted: false,
        }, { session });
        return result.modifiedCount;
    }
};
exports.MongoPaymentRepository = MongoPaymentRepository;
exports.MongoPaymentRepository = MongoPaymentRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoPaymentRepository);
