"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoMediaRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const media_entity_1 = require("../../../domain/entities/media.entity");
const media_model_1 = require("../../database/mongoose/media.model");
let MongoMediaRepository = class MongoMediaRepository {
    async findById(id) {
        const doc = await media_model_1.MediaModel.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctor(id, doctorId) {
        const doc = await media_model_1.MediaModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findAll() {
        const docs = await media_model_1.MediaModel.find({ isDeleted: false });
        return docs.map((doc) => this.toDomain(doc));
    }
    async create(entity) {
        const doc = new media_model_1.MediaModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctorId),
            patient: entity.patientId ? new mongoose_1.Types.ObjectId(entity.patientId) : undefined,
            course: entity.courseId ? new mongoose_1.Types.ObjectId(entity.courseId) : undefined,
            visit: entity.visitId ? new mongoose_1.Types.ObjectId(entity.visitId) : undefined,
            clinic: entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : undefined,
            url: entity.url,
            filename: entity.filename,
            mimeType: entity.mimeType,
            size: entity.size,
            type: entity.type || 'image',
            notes: entity.notes,
            isDeleted: entity.isDeleted || false,
        });
        const saved = await doc.save();
        return this.toDomain(saved);
    }
    async update(id, entity) {
        const updateData = {};
        if (entity.doctorId !== undefined)
            updateData.doctor = new mongoose_1.Types.ObjectId(entity.doctorId);
        if (entity.patientId !== undefined)
            updateData.patient = entity.patientId ? new mongoose_1.Types.ObjectId(entity.patientId) : null;
        if (entity.courseId !== undefined)
            updateData.course = entity.courseId ? new mongoose_1.Types.ObjectId(entity.courseId) : null;
        if (entity.visitId !== undefined)
            updateData.visit = entity.visitId ? new mongoose_1.Types.ObjectId(entity.visitId) : null;
        if (entity.clinicId !== undefined)
            updateData.clinic = entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : null;
        if (entity.url !== undefined)
            updateData.url = entity.url;
        if (entity.filename !== undefined)
            updateData.filename = entity.filename;
        if (entity.mimeType !== undefined)
            updateData.mimeType = entity.mimeType;
        if (entity.size !== undefined)
            updateData.size = entity.size;
        if (entity.type !== undefined)
            updateData.type = entity.type;
        if (entity.notes !== undefined)
            updateData.notes = entity.notes;
        if (entity.isDeleted !== undefined)
            updateData.isDeleted = entity.isDeleted;
        const doc = await media_model_1.MediaModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, { new: true });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async delete(id) {
        const result = await media_model_1.MediaModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
        return !!result;
    }
    async findPaginated(options) {
        const { page, limit, doctorId, patientId, courseId, visitId, clinicId, type, sortBy = 'createdAt', sortOrder = 'desc' } = options;
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
        if (visitId && mongoose_1.Types.ObjectId.isValid(visitId)) {
            andConditions.push({ visit: new mongoose_1.Types.ObjectId(visitId) });
        }
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            andConditions.push({ clinic: new mongoose_1.Types.ObjectId(clinicId) });
        }
        if (type) {
            andConditions.push({ type });
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const sortFieldMap = {
            createdAt: 'createdAt',
            type: 'type',
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
                    media: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await media_model_1.MediaModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                media: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const media = aggregationResult.media.map((doc) => this.toDomainFromPlainObject(doc));
        return {
            media,
            total,
            page,
            limit,
            totalPages,
        };
    }
    toDomain(doc) {
        return new media_entity_1.Media(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.url, (doc.type || 'image'), doc.createdAt, doc.updatedAt, doc.patient ? doc.patient.toString() : undefined, doc.course ? doc.course.toString() : undefined, doc.visit ? doc.visit.toString() : undefined, doc.clinic ? doc.clinic.toString() : undefined, doc.filename, doc.mimeType, doc.size, doc.notes, doc.isDeleted || false);
    }
    toDomainFromPlainObject(doc) {
        const id = doc._id ? doc._id.toString() : '';
        return new media_entity_1.Media(id, doc.doctor ? doc.doctor.toString() : '', doc.url || '', (doc.type || 'image'), doc.createdAt, doc.updatedAt, doc.patient ? doc.patient.toString() : undefined, doc.course ? doc.course.toString() : undefined, doc.visit ? doc.visit.toString() : undefined, doc.clinic ? doc.clinic.toString() : undefined, doc.filename, doc.mimeType, doc.size, doc.notes, doc.isDeleted || false);
    }
    async markDeletedByPatientId(patientId, doctorId, session) {
        const result = await media_model_1.MediaModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        }, {
            isDeleted: true,
        }, { session });
        return result.modifiedCount;
    }
    async markRestoredByPatientId(patientId, doctorId, session) {
        const result = await media_model_1.MediaModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: true,
        }, {
            isDeleted: false,
        }, { session });
        return result.modifiedCount;
    }
};
exports.MongoMediaRepository = MongoMediaRepository;
exports.MongoMediaRepository = MongoMediaRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoMediaRepository);
