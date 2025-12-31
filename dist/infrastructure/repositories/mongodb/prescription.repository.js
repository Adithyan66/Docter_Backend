"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPrescriptionRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const prescription_entity_1 = require("../../../domain/entities/prescription.entity");
const prescription_model_1 = require("../../database/mongoose/prescription.model");
let MongoPrescriptionRepository = class MongoPrescriptionRepository {
    async findById(id) {
        const doc = await prescription_model_1.PrescriptionModel.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctor(id, doctorId) {
        const doc = await prescription_model_1.PrescriptionModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findAll() {
        const docs = await prescription_model_1.PrescriptionModel.find({ isDeleted: false });
        return docs.map((doc) => this.toDomain(doc));
    }
    async create(entity) {
        const doc = new prescription_model_1.PrescriptionModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctor),
            patient: new mongoose_1.Types.ObjectId(entity.patient),
            visit: new mongoose_1.Types.ObjectId(entity.visit),
            clinic: entity.clinic ? new mongoose_1.Types.ObjectId(entity.clinic) : undefined,
            diagnosis: entity.diagnosis || [],
            items: entity.items || [],
            notes: entity.notes,
            isDeleted: false,
        });
        const saved = await doc.save();
        return this.toDomain(saved);
    }
    async update(id, entity) {
        const updateData = {};
        if (entity.doctor !== undefined)
            updateData.doctor = new mongoose_1.Types.ObjectId(entity.doctor);
        if (entity.patient !== undefined)
            updateData.patient = new mongoose_1.Types.ObjectId(entity.patient);
        if (entity.visit !== undefined)
            updateData.visit = new mongoose_1.Types.ObjectId(entity.visit);
        if (entity.clinic !== undefined)
            updateData.clinic = entity.clinic ? new mongoose_1.Types.ObjectId(entity.clinic) : null;
        if (entity.diagnosis !== undefined)
            updateData.diagnosis = entity.diagnosis;
        if (entity.items !== undefined)
            updateData.items = entity.items;
        if (entity.notes !== undefined)
            updateData.notes = entity.notes;
        const doc = await prescription_model_1.PrescriptionModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async delete(id) {
        const result = await prescription_model_1.PrescriptionModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
        return !!result;
    }
    async findPaginated(options) {
        const { page, limit, doctorId, patientId, visitId, clinicId, dateFrom, dateTo, medicineName, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const baseMatch = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
        };
        const andConditions = [baseMatch];
        if (patientId && mongoose_1.Types.ObjectId.isValid(patientId)) {
            andConditions.push({ patient: new mongoose_1.Types.ObjectId(patientId) });
        }
        if (visitId && mongoose_1.Types.ObjectId.isValid(visitId)) {
            andConditions.push({ visit: new mongoose_1.Types.ObjectId(visitId) });
        }
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            andConditions.push({ clinic: new mongoose_1.Types.ObjectId(clinicId) });
        }
        if (dateFrom || dateTo) {
            const dateFilter = {};
            if (dateFrom)
                dateFilter.$gte = dateFrom;
            if (dateTo)
                dateFilter.$lte = dateTo;
            andConditions.push({ createdAt: dateFilter });
        }
        if (medicineName && medicineName.trim().length > 0) {
            const regex = new RegExp(medicineName.trim(), 'i');
            andConditions.push({
                'items.medicineName': regex,
            });
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const sortFieldMap = {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        };
        const sortField = sortFieldMap[sortBy] || 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const pipeline = [
            { $match: matchStage },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { [sortField]: sortDirection, _id: sortDirection } },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                },
            },
            {
                $project: {
                    prescriptions: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await prescription_model_1.PrescriptionModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                prescriptions: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const prescriptions = aggregationResult.prescriptions.map((doc) => this.toDomainFromPlainObject(doc));
        return {
            prescriptions,
            total,
            page,
            limit,
            totalPages,
        };
    }
    toDomain(doc) {
        return new prescription_entity_1.Prescription(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.visit ? doc.visit.toString() : '', doc.items || [], doc.createdAt, doc.updatedAt, doc.clinic ? doc.clinic.toString() : undefined, doc.diagnosis || [], doc.notes);
    }
    toDomainFromPlainObject(doc) {
        const id = doc._id ? doc._id.toString() : '';
        return new prescription_entity_1.Prescription(id, doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.visit ? doc.visit.toString() : '', doc.items || [], doc.createdAt, doc.updatedAt, doc.clinic ? doc.clinic.toString() : undefined, doc.diagnosis || [], doc.notes);
    }
};
exports.MongoPrescriptionRepository = MongoPrescriptionRepository;
exports.MongoPrescriptionRepository = MongoPrescriptionRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoPrescriptionRepository);
