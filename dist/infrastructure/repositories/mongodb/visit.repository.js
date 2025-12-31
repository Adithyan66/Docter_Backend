"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoVisitRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const visit_entity_1 = require("../../../domain/entities/visit.entity");
const visit_model_1 = require("../../database/mongoose/visit.model");
let MongoVisitRepository = class MongoVisitRepository {
    async findById(id) {
        const doc = await visit_model_1.VisitModel.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctor(id, doctorId) {
        const doc = await visit_model_1.VisitModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findAll() {
        const docs = await visit_model_1.VisitModel.find({ isDeleted: false });
        return docs.map((doc) => this.toDomain(doc));
    }
    async create(entity, session) {
        const doc = new visit_model_1.VisitModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctorId),
            patient: new mongoose_1.Types.ObjectId(entity.patientId),
            course: new mongoose_1.Types.ObjectId(entity.courseId),
            clinic: entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : undefined,
            visitDate: entity.visitDate,
            notes: entity.notes,
            billedAmount: entity.billedAmount,
            media: entity.mediaIds.map((id) => new mongoose_1.Types.ObjectId(id)),
            prescription: entity.prescriptionId ? new mongoose_1.Types.ObjectId(entity.prescriptionId) : undefined,
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
        if (entity.clinicId !== undefined)
            updateData.clinic = entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : null;
        if (entity.visitDate !== undefined)
            updateData.visitDate = entity.visitDate;
        if (entity.notes !== undefined)
            updateData.notes = entity.notes;
        if (entity.billedAmount !== undefined)
            updateData.billedAmount = entity.billedAmount;
        if (entity.mediaIds !== undefined)
            updateData.media = entity.mediaIds.map((id) => new mongoose_1.Types.ObjectId(id));
        if (entity.prescriptionId !== undefined)
            updateData.prescription = entity.prescriptionId ? new mongoose_1.Types.ObjectId(entity.prescriptionId) : null;
        if (entity.isDeleted !== undefined)
            updateData.isDeleted = entity.isDeleted;
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        await visit_model_1.VisitModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, updateOptions);
        const doc = await visit_model_1.VisitModel.findOne({ _id: id, isDeleted: false }).session(session || null);
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async delete(id, session) {
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        const result = await visit_model_1.VisitModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, updateOptions);
        return !!result;
    }
    async findPaginated(options) {
        const { page, limit, doctorId, patientId, courseId, clinicId, visitDateFrom, visitDateTo, notes, sortBy = 'visitDate', sortOrder = 'desc' } = options;
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
        if (visitDateFrom || visitDateTo) {
            const dateFilter = {};
            if (visitDateFrom)
                dateFilter.$gte = visitDateFrom;
            if (visitDateTo)
                dateFilter.$lte = visitDateTo;
            andConditions.push({ visitDate: dateFilter });
        }
        if (notes && notes.trim().length > 0) {
            const regex = new RegExp(notes.trim(), 'i');
            andConditions.push({ notes: regex });
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const sortFieldMap = {
            visitDate: 'visitDate',
            createdAt: 'createdAt',
        };
        const sortField = sortFieldMap[sortBy] || 'visitDate';
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
                    visits: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await visit_model_1.VisitModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                visits: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const visits = aggregationResult.visits.map((doc) => this.toDomainFromPlainObject(doc));
        return {
            visits,
            total,
            page,
            limit,
            totalPages,
        };
    }
    toDomain(doc) {
        return new visit_entity_1.Visit(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.course ? doc.course.toString() : '', doc.visitDate, doc.createdAt, doc.updatedAt, doc.clinic ? doc.clinic.toString() : undefined, doc.notes, doc.billedAmount, doc.media ? doc.media.map((m) => m.toString()) : [], doc.prescription ? doc.prescription.toString() : undefined, doc.isDeleted || false);
    }
    toDomainFromPlainObject(doc) {
        const id = doc._id ? doc._id.toString() : '';
        return new visit_entity_1.Visit(id, doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.course ? doc.course.toString() : '', doc.visitDate || new Date(), doc.createdAt, doc.updatedAt, doc.clinic ? doc.clinic.toString() : undefined, doc.notes, doc.billedAmount || 0, doc.media ? doc.media.map((m) => m.toString()) : [], doc.prescription ? doc.prescription.toString() : undefined, doc.isDeleted || false);
    }
    async getDailyActivitiesAggregated(options) {
        const { doctorId, date, page, limit, clinicId } = options;
        const skip = (page - 1) * limit;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const matchConditions = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            visitDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
        };
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            matchConditions.clinic = new mongoose_1.Types.ObjectId(clinicId);
        }
        const pipeline = [
            { $match: matchConditions },
            {
                $lookup: {
                    from: 'patients',
                    localField: 'patient',
                    foreignField: '_id',
                    as: 'patientData',
                },
            },
            {
                $lookup: {
                    from: 'treatmentcourses',
                    localField: 'course',
                    foreignField: '_id',
                    as: 'courseData',
                },
            },
            {
                $lookup: {
                    from: 'treatments',
                    let: { treatmentId: { $arrayElemAt: ['$courseData.treatment', 0] } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$_id', '$$treatmentId'] },
                                        { $eq: ['$isDeleted', false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'treatmentData',
                },
            },
            {
                $lookup: {
                    from: 'clinics',
                    localField: 'clinic',
                    foreignField: '_id',
                    as: 'clinicData',
                },
            },
            {
                $addFields: {
                    patientName: {
                        $ifNull: [
                            { $arrayElemAt: ['$patientData.fullName', 0] },
                            'Unknown',
                        ],
                    },
                    treatmentName: {
                        $ifNull: [
                            { $arrayElemAt: ['$treatmentData.name', 0] },
                            'Unknown',
                        ],
                    },
                    amountPaid: {
                        $ifNull: ['$billedAmount', 0],
                    },
                    clinicName: {
                        $ifNull: [
                            { $arrayElemAt: ['$clinicData.name', 0] },
                            null,
                        ],
                    },
                },
            },
            {
                $facet: {
                    summary: [
                        {
                            $group: {
                                _id: null,
                                totalPatientsVisited: {
                                    $addToSet: { $toString: '$patient' },
                                },
                                totalVisits: { $sum: 1 },
                                totalAmount: { $sum: '$amountPaid' },
                                visitStartTime: { $min: '$visitDate' },
                                visitEndTime: { $max: '$visitDate' },
                                clinicNames: {
                                    $addToSet: '$clinicName',
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                totalPatientsVisited: { $size: '$totalPatientsVisited' },
                                totalVisits: 1,
                                totalAmount: 1,
                                averageAmountPerVisit: {
                                    $cond: [
                                        { $eq: ['$totalVisits', 0] },
                                        0,
                                        { $divide: ['$totalAmount', '$totalVisits'] },
                                    ],
                                },
                                visitStartTime: 1,
                                visitEndTime: 1,
                                totalHoursWorked: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ['$visitStartTime', null] },
                                                { $ne: ['$visitEndTime', null] },
                                            ],
                                        },
                                        {
                                            $divide: [
                                                { $subtract: ['$visitEndTime', '$visitStartTime'] },
                                                3600000,
                                            ],
                                        },
                                        0,
                                    ],
                                },
                                clinicNames: {
                                    $filter: {
                                        input: '$clinicNames',
                                        as: 'clinic',
                                        cond: { $ne: ['$$clinic', null] },
                                    },
                                },
                            },
                        },
                    ],
                    activities: [
                        { $sort: { visitDate: 1, _id: 1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 0,
                                visitId: { $toString: '$_id' },
                                visitTime: '$visitDate',
                                patientId: { $toString: '$patient' },
                                patientName: 1,
                                courseId: { $toString: '$course' },
                                treatmentName: 1,
                                amountPaid: 1,
                                clinicId: {
                                    $cond: [
                                        { $ne: ['$clinic', null] },
                                        { $toString: '$clinic' },
                                        null,
                                    ],
                                },
                                clinicName: 1,
                            },
                        },
                    ],
                    totalCount: [{ $count: 'total' }],
                },
            },
            {
                $project: {
                    summary: {
                        $ifNull: [{ $arrayElemAt: ['$summary', 0] }, {
                                totalPatientsVisited: 0,
                                totalVisits: 0,
                                totalAmount: 0,
                                averageAmountPerVisit: 0,
                                visitStartTime: null,
                                visitEndTime: null,
                                totalHoursWorked: 0,
                                clinicNames: [],
                            }],
                    },
                    activities: 1,
                    total: {
                        $ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0],
                    },
                },
            },
        ];
        const result = await visit_model_1.VisitModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                summary: {
                    totalPatientsVisited: 0,
                    totalVisits: 0,
                    totalAmount: 0,
                    averageAmountPerVisit: 0,
                    visitStartTime: null,
                    visitEndTime: null,
                    totalHoursWorked: 0,
                    clinicNames: [],
                },
                activities: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const summary = aggregationResult.summary || {
            totalPatientsVisited: 0,
            totalVisits: 0,
            totalAmount: 0,
            averageAmountPerVisit: 0,
            visitStartTime: null,
            visitEndTime: null,
            totalHoursWorked: 0,
            clinicNames: [],
        };
        if (summary.clinicNames && Array.isArray(summary.clinicNames)) {
            summary.clinicNames.sort();
        }
        else {
            summary.clinicNames = [];
        }
        return {
            summary,
            activities: aggregationResult.activities || [],
            total,
            page,
            limit,
            totalPages,
        };
    }
    async markDeletedByPatientId(patientId, doctorId, session) {
        const result = await visit_model_1.VisitModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        }, {
            isDeleted: true,
        }, { session });
        return result.modifiedCount;
    }
    async markRestoredByPatientId(patientId, doctorId, session) {
        const result = await visit_model_1.VisitModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: true,
        }, {
            isDeleted: false,
        }, { session });
        return result.modifiedCount;
    }
};
exports.MongoVisitRepository = MongoVisitRepository;
exports.MongoVisitRepository = MongoVisitRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoVisitRepository);
