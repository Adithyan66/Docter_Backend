"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTreatmentRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const treatment_entity_1 = require("../../../domain/entities/treatment.entity");
const treatment_model_1 = require("../../database/mongoose/treatment.model");
const treatment_course_model_1 = require("../../database/mongoose/treatment-course.model");
let MongoTreatmentRepository = class MongoTreatmentRepository {
    async findById(id) {
        const pipeline = [
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(id),
                    isDeleted: false,
                },
            },
            {
                $project: {
                    _id: 1,
                    doctor: 1,
                    name: 1,
                    description: 1,
                    minDuration: 1,
                    maxDuration: 1,
                    avgDuration: 1,
                    minFees: 1,
                    maxFees: 1,
                    avgFees: 1,
                    steps: 1,
                    aftercare: 1,
                    followUpRequired: 1,
                    followUpAfterDays: 1,
                    risks: 1,
                    images: {
                        $cond: {
                            if: { $and: [{ $isArray: '$images' }, { $gt: [{ $size: '$images' }, 0] }] },
                            then: [{ $arrayElemAt: ['$images', 0] }],
                            else: '$$REMOVE',
                        },
                    },
                    isOneTime: 1,
                    regularVisitInterval: 1,
                    isActive: 1,
                    isDeleted: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ];
        const result = await treatment_model_1.TreatmentModel.aggregate(pipeline);
        if (!result || result.length === 0)
            return null;
        return this.toDomainFromPlainObject(result[0]);
    }
    async findAll() {
        const treatmentDocs = await treatment_model_1.TreatmentModel.find({ isDeleted: false });
        return treatmentDocs.map((doc) => this.toDomain(doc));
    }
    async findAllActive(doctorId) {
        const treatmentDocs = await treatment_model_1.TreatmentModel.find({ isDeleted: false, doctor: new mongoose_1.Types.ObjectId(doctorId) });
        return treatmentDocs.map((doc) => this.toDomain(doc));
    }
    async findByName(name, doctorId) {
        const treatmentDoc = await treatment_model_1.TreatmentModel.findOne({ name: name.trim(), doctor: new mongoose_1.Types.ObjectId(doctorId), isDeleted: false });
        if (!treatmentDoc)
            return null;
        return this.toDomain(treatmentDoc);
    }
    async findNames(doctorId, search) {
        const filter = { isActive: true, isDeleted: false, doctor: new mongoose_1.Types.ObjectId(doctorId) };
        if (search && search.trim().length > 0) {
            const regex = new RegExp(search.trim(), 'i');
            filter.$or = [{ name: regex }, { description: regex }];
        }
        const documents = await treatment_model_1.TreatmentModel.find(filter).sort({ name: 1 }).select({ name: 1 });
        return documents.map((doc) => ({
            id: doc._id.toString(),
            name: doc.name,
        }));
    }
    async findAllPaginated(options) {
        const { page, limit, sortBy = '', sortOrder = 'desc', search, doctorId } = options;
        const skip = (page - 1) * limit;
        const matchStage = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
        };
        if (search && search.trim().length > 0) {
            const searchRegex = { $regex: search.trim(), $options: 'i' };
            matchStage.$or = [
                { name: searchRegex },
                { description: searchRegex },
            ];
        }
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const pipeline = [
            {
                $match: matchStage,
            },
            {
                $lookup: {
                    from: 'treatmentcourses',
                    let: { treatmentId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$treatment', '$$treatmentId'] },
                                        { $eq: ['$isDeleted', false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'treatmentCourses',
                },
            },
            {
                $addFields: {
                    numberOfPatients: { $size: '$treatmentCourses' },
                    ongoing: {
                        $size: {
                            $filter: {
                                input: '$treatmentCourses',
                                as: 'tc',
                                cond: { $eq: ['$$tc.status', 'active'] },
                            },
                        },
                    },
                    completed: {
                        $size: {
                            $filter: {
                                input: '$treatmentCourses',
                                as: 'tc',
                                cond: { $eq: ['$$tc.status', 'completed'] },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    isActive: 1,
                    avgFees: 1,
                    avgDuration: 1,
                    numberOfPatients: 1,
                    ongoing: 1,
                    completed: 1,
                    createdAt: 1,
                },
            },
        ];
        const sortStage = {};
        switch (sortBy) {
            case 'averageAmount':
                sortStage.avgFees = sortDirection;
                break;
            case 'averageDuration':
                sortStage.avgDuration = sortDirection;
                break;
            case 'numberOfPatients':
                sortStage.numberOfPatients = sortDirection;
                break;
            case 'ongoing':
                sortStage.ongoing = sortDirection;
                break;
            case 'completed':
                sortStage.completed = sortDirection;
                break;
            default:
                sortStage.createdAt = sortDirection;
        }
        pipeline.push({
            $facet: {
                metadata: [
                    {
                        $count: 'total',
                    },
                ],
                data: [
                    {
                        $sort: sortStage,
                    },
                    {
                        $skip: skip,
                    },
                    {
                        $limit: limit,
                    },
                ],
            },
        }, {
            $project: {
                treatments: '$data',
                total: {
                    $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0],
                },
            },
        });
        const result = await treatment_model_1.TreatmentModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                treatments: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const treatments = aggregationResult.treatments.map((doc) => ({
            id: doc._id.toString(),
            name: doc.name,
            isActive: doc.isActive,
            avgFees: doc.avgFees,
            avgDuration: doc.avgDuration,
            numberOfPatients: doc.numberOfPatients || 0,
            ongoing: doc.ongoing || 0,
            completed: doc.completed || 0,
        }));
        return {
            treatments,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async create(entity) {
        const treatmentDoc = new treatment_model_1.TreatmentModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctorId),
            name: entity.name,
            description: entity.description,
            minDuration: entity.minDuration,
            maxDuration: entity.maxDuration,
            avgDuration: entity.avgDuration,
            minFees: entity.minFees,
            maxFees: entity.maxFees,
            avgFees: entity.avgFees,
            steps: entity.steps,
            aftercare: entity.aftercare,
            followUpRequired: entity.followUpRequired,
            followUpAfterDays: entity.followUpAfterDays,
            risks: entity.risks,
            isActive: entity.isActive !== undefined ? entity.isActive : true,
            images: entity.images,
            isOneTime: entity.isOneTime,
            regularVisitInterval: entity.regularVisitInterval,
            isDeleted: entity.isDeleted || false,
        });
        const saved = await treatmentDoc.save();
        return this.toDomain(saved);
    }
    async update(id, entity) {
        const updateData = {};
        const unsetData = {};
        if (entity.name !== undefined)
            updateData.name = entity.name;
        if (entity.description !== undefined)
            updateData.description = entity.description;
        if (entity.minDuration !== undefined) {
            if (entity.minDuration === null) {
                unsetData.minDuration = '';
            }
            else {
                updateData.minDuration = entity.minDuration;
            }
        }
        if (entity.maxDuration !== undefined) {
            if (entity.maxDuration === null) {
                unsetData.maxDuration = '';
            }
            else {
                updateData.maxDuration = entity.maxDuration;
            }
        }
        if (entity.avgDuration !== undefined) {
            if (entity.avgDuration === null) {
                unsetData.avgDuration = '';
            }
            else {
                updateData.avgDuration = entity.avgDuration;
            }
        }
        if (entity.minFees !== undefined)
            updateData.minFees = entity.minFees;
        if (entity.maxFees !== undefined)
            updateData.maxFees = entity.maxFees;
        if (entity.avgFees !== undefined)
            updateData.avgFees = entity.avgFees;
        if (entity.steps !== undefined)
            updateData.steps = entity.steps;
        if (entity.aftercare !== undefined)
            updateData.aftercare = entity.aftercare;
        if (entity.followUpRequired !== undefined)
            updateData.followUpRequired = entity.followUpRequired;
        if (entity.followUpAfterDays !== undefined)
            updateData.followUpAfterDays = entity.followUpAfterDays;
        if (entity.risks !== undefined)
            updateData.risks = entity.risks;
        if (entity.images !== undefined)
            updateData.images = entity.images;
        if (entity.isOneTime !== undefined)
            updateData.isOneTime = entity.isOneTime;
        if (entity.regularVisitInterval !== undefined) {
            if (entity.regularVisitInterval === null) {
                unsetData.regularVisitInterval = '';
            }
            else {
                updateData.regularVisitInterval = entity.regularVisitInterval;
            }
        }
        if (entity.isActive !== undefined)
            updateData.isActive = entity.isActive;
        if (entity.isDeleted !== undefined)
            updateData.isDeleted = entity.isDeleted;
        const updateQuery = {};
        if (Object.keys(updateData).length > 0) {
            updateQuery.$set = updateData;
        }
        if (Object.keys(unsetData).length > 0) {
            updateQuery.$unset = unsetData;
        }
        const treatmentDoc = await treatment_model_1.TreatmentModel.findOneAndUpdate({ _id: id, isDeleted: false }, Object.keys(updateQuery).length > 0 ? updateQuery : updateData, { new: true });
        if (!treatmentDoc)
            return null;
        return this.toDomain(treatmentDoc);
    }
    async delete(id) {
        const result = await treatment_model_1.TreatmentModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
        return !!result;
    }
    async getStatistics(treatmentId, options) {
        const { doctorId, startDateFrom, startDateTo, clinicId } = options;
        const treatmentObjectId = new mongoose_1.Types.ObjectId(treatmentId);
        const doctorObjectId = new mongoose_1.Types.ObjectId(doctorId);
        const courseMatch = {
            treatment: treatmentObjectId,
            doctor: doctorObjectId,
            isDeleted: false,
        };
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            courseMatch.clinic = new mongoose_1.Types.ObjectId(clinicId);
        }
        if (startDateFrom || startDateTo) {
            courseMatch.startDate = {};
            if (startDateFrom)
                courseMatch.startDate.$gte = startDateFrom;
            if (startDateTo)
                courseMatch.startDate.$lte = startDateTo;
        }
        const pipeline = [
            { $match: courseMatch },
            {
                $lookup: {
                    from: 'visits',
                    let: { courseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$course', '$$courseId'] },
                                        { $eq: ['$isDeleted', false] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                billedAmount: { $ifNull: ['$billedAmount', 0] },
                            },
                        },
                    ],
                    as: 'visits',
                },
            },
            {
                $lookup: {
                    from: 'payments',
                    let: { courseId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$course', '$$courseId'] },
                                        { $eq: ['$isDeleted', false] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                amount: 1,
                                method: { $ifNull: ['$method', 'cash'] },
                                refunded: { $ifNull: ['$refunded', false] },
                                refundAmount: { $ifNull: ['$refundDetails.refundAmount', 0] },
                            },
                        },
                    ],
                    as: 'payments',
                },
            },
            {
                $lookup: {
                    from: 'clinics',
                    localField: 'clinic',
                    foreignField: '_id',
                    as: 'clinicInfo',
                    pipeline: [
                        {
                            $match: { isDeleted: false },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            },
                        },
                    ],
                },
            },
            {
                $facet: {
                    overallStats: [
                        {
                            $group: {
                                _id: null,
                                totalCourses: { $sum: 1 },
                                uniquePatients: { $addToSet: '$patient' },
                                totalPaid: { $sum: { $ifNull: ['$totalPaid', 0] } },
                                totalCost: { $sum: { $ifNull: ['$totalCost', 0] } },
                                medicallyCompleted: {
                                    $sum: { $cond: [{ $ifNull: ['$isMedicallyCompleted', false] }, 1, 0] },
                                },
                                paymentCompleted: {
                                    $sum: { $cond: [{ $ifNull: ['$isPaymentCompleted', false] }, 1, 0] },
                                },
                                statusActive: {
                                    $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'active'] }, 1, 0] },
                                },
                                statusPaused: {
                                    $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'paused'] }, 1, 0] },
                                },
                                statusCompleted: {
                                    $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'completed'] }, 1, 0] },
                                },
                                statusCancelled: {
                                    $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'cancelled'] }, 1, 0] },
                                },
                                totalVisits: { $sum: { $size: '$visits' } },
                                totalBilledAmount: {
                                    $sum: {
                                        $reduce: {
                                            input: '$visits',
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.billedAmount', 0] }] },
                                        },
                                    },
                                },
                                earliestStartDate: { $min: '$startDate' },
                                latestStartDate: { $max: '$startDate' },
                                completedCoursesWithDates: {
                                    $push: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $eq: [{ $ifNull: ['$status', 'active'] }, 'completed'] },
                                                    { $ifNull: ['$isMedicallyCompleted', false] },
                                                    { $ne: ['$startDate', null] },
                                                    { $ne: ['$expectedEndDate', null] },
                                                ],
                                            },
                                            {
                                                startDate: '$startDate',
                                                expectedEndDate: '$expectedEndDate',
                                            },
                                            '$$REMOVE',
                                        ],
                                    },
                                },
                                paymentCash: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.method', 'cash'] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                                        },
                                    },
                                },
                                paymentCard: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.method', 'card'] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                                        },
                                    },
                                },
                                paymentUpi: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.method', 'upi'] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                                        },
                                    },
                                },
                                paymentBank: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.method', 'bank'] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                                        },
                                    },
                                },
                                paymentInsurance: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.method', 'insurance'] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                                        },
                                    },
                                },
                                paymentOnline: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.method', 'online'] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                                        },
                                    },
                                },
                                refundTotal: {
                                    $sum: {
                                        $reduce: {
                                            input: {
                                                $filter: {
                                                    input: '$payments',
                                                    as: 'p',
                                                    cond: { $eq: ['$$p.refunded', true] },
                                                },
                                            },
                                            initialValue: 0,
                                            in: { $add: ['$$value', { $ifNull: ['$$this.refundAmount', 0] }] },
                                        },
                                    },
                                },
                                refundCount: {
                                    $sum: {
                                        $size: {
                                            $filter: {
                                                input: '$payments',
                                                as: 'p',
                                                cond: { $eq: ['$$p.refunded', true] },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                patients: {
                                    totalCount: '$totalCourses',
                                    uniqueCount: { $size: '$uniquePatients' },
                                },
                                treatmentCourses: {
                                    totalCount: '$totalCourses',
                                    statusBreakdown: {
                                        active: '$statusActive',
                                        paused: '$statusPaused',
                                        completed: '$statusCompleted',
                                        cancelled: '$statusCancelled',
                                    },
                                    medicallyCompleted: '$medicallyCompleted',
                                    paymentCompleted: '$paymentCompleted',
                                },
                                revenue: {
                                    totalPaid: '$totalPaid',
                                    totalCost: '$totalCost',
                                    outstanding: { $subtract: ['$totalCost', '$totalPaid'] },
                                    averagePerCourse: {
                                        paid: {
                                            $cond: [
                                                { $gt: ['$totalCourses', 0] },
                                                { $divide: ['$totalPaid', '$totalCourses'] },
                                                0,
                                            ],
                                        },
                                        cost: {
                                            $cond: [
                                                { $gt: ['$totalCourses', 0] },
                                                { $divide: ['$totalCost', '$totalCourses'] },
                                                0,
                                            ],
                                        },
                                    },
                                    byPaymentMethod: {
                                        cash: '$paymentCash',
                                        card: '$paymentCard',
                                        upi: '$paymentUpi',
                                        bank: '$paymentBank',
                                        insurance: '$paymentInsurance',
                                        online: '$paymentOnline',
                                    },
                                    refunds: {
                                        totalAmount: '$refundTotal',
                                        count: '$refundCount',
                                    },
                                },
                                visits: {
                                    totalCount: '$totalVisits',
                                    averagePerCourse: {
                                        $cond: [
                                            { $gt: ['$totalCourses', 0] },
                                            { $divide: ['$totalVisits', '$totalCourses'] },
                                            0,
                                        ],
                                    },
                                    totalBilledAmount: '$totalBilledAmount',
                                    averageBilledAmount: {
                                        $cond: [
                                            { $gt: ['$totalVisits', 0] },
                                            { $divide: ['$totalBilledAmount', '$totalVisits'] },
                                            0,
                                        ],
                                    },
                                },
                                timeMetrics: {
                                    earliestStartDate: '$earliestStartDate',
                                    latestStartDate: '$latestStartDate',
                                    averageDuration: {
                                        $cond: [
                                            {
                                                $and: [
                                                    { $gt: [{ $size: '$completedCoursesWithDates' }, 0] },
                                                ],
                                            },
                                            {
                                                $divide: [
                                                    {
                                                        $reduce: {
                                                            input: '$completedCoursesWithDates',
                                                            initialValue: 0,
                                                            in: {
                                                                $add: [
                                                                    '$$value',
                                                                    {
                                                                        $divide: [
                                                                            {
                                                                                $subtract: [
                                                                                    '$$this.expectedEndDate',
                                                                                    '$$this.startDate',
                                                                                ],
                                                                            },
                                                                            86400000,
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    { $size: '$completedCoursesWithDates' },
                                                ],
                                            },
                                            null,
                                        ],
                                    },
                                },
                                completionRates: {
                                    treatment: {
                                        $cond: [
                                            { $gt: ['$totalCourses', 0] },
                                            { $multiply: [{ $divide: ['$statusCompleted', '$totalCourses'] }, 100] },
                                            0,
                                        ],
                                    },
                                    payment: {
                                        $cond: [
                                            { $gt: ['$totalCourses', 0] },
                                            { $multiply: [{ $divide: ['$paymentCompleted', '$totalCourses'] }, 100] },
                                            0,
                                        ],
                                    },
                                    medical: {
                                        $cond: [
                                            { $gt: ['$totalCourses', 0] },
                                            { $multiply: [{ $divide: ['$medicallyCompleted', '$totalCourses'] }, 100] },
                                            0,
                                        ],
                                    },
                                    cancellation: {
                                        $cond: [
                                            { $gt: ['$totalCourses', 0] },
                                            { $multiply: [{ $divide: ['$statusCancelled', '$totalCourses'] }, 100] },
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                    clinicStats: [
                        {
                            $match: {
                                clinic: { $ne: null },
                            },
                        },
                        {
                            $group: {
                                _id: '$clinic',
                                clinicName: { $first: { $arrayElemAt: ['$clinicInfo.name', 0] } },
                                courseCount: { $sum: 1 },
                                totalPaid: { $sum: { $ifNull: ['$totalPaid', 0] } },
                                totalCost: { $sum: { $ifNull: ['$totalCost', 0] } },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                clinicId: { $toString: '$_id' },
                                clinicName: { $ifNull: ['$clinicName', 'Unknown Clinic'] },
                                courseCount: 1,
                                totalPaid: 1,
                                totalCost: 1,
                                outstanding: { $subtract: ['$totalCost', '$totalPaid'] },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    _id: 0,
                    stats: { $arrayElemAt: ['$overallStats', 0] },
                    clinics: '$clinicStats',
                },
            },
        ];
        const result = await treatment_course_model_1.TreatmentCourseModel.aggregate(pipeline);
        if (!result || result.length === 0 || !result[0].stats) {
            return this.getEmptyStatistics();
        }
        const stats = result[0].stats;
        const clinics = result[0].clinics || [];
        return {
            patients: stats.patients,
            treatmentCourses: stats.treatmentCourses,
            revenue: stats.revenue,
            clinics: clinics,
            visits: stats.visits,
            timeMetrics: {
                earliestStartDate: stats.timeMetrics.earliestStartDate || undefined,
                latestStartDate: stats.timeMetrics.latestStartDate || undefined,
                averageDuration: stats.timeMetrics.averageDuration || undefined,
            },
            completionRates: stats.completionRates,
        };
    }
    getEmptyStatistics() {
        return {
            patients: {
                totalCount: 0,
                uniqueCount: 0,
            },
            treatmentCourses: {
                totalCount: 0,
                statusBreakdown: {
                    active: 0,
                    paused: 0,
                    completed: 0,
                    cancelled: 0,
                },
                medicallyCompleted: 0,
                paymentCompleted: 0,
            },
            revenue: {
                totalPaid: 0,
                totalCost: 0,
                outstanding: 0,
                averagePerCourse: {
                    paid: 0,
                    cost: 0,
                },
                byPaymentMethod: {
                    cash: 0,
                    card: 0,
                    upi: 0,
                    bank: 0,
                    insurance: 0,
                    online: 0,
                },
                refunds: {
                    totalAmount: 0,
                    count: 0,
                },
            },
            clinics: [],
            visits: {
                totalCount: 0,
                averagePerCourse: 0,
                totalBilledAmount: 0,
                averageBilledAmount: 0,
            },
            timeMetrics: {},
            completionRates: {
                treatment: 0,
                payment: 0,
                medical: 0,
                cancellation: 0,
            },
        };
    }
    toDomain(doc) {
        return new treatment_entity_1.Treatment(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.name, doc.createdAt, doc.updatedAt, doc.description, doc.minDuration, doc.maxDuration, doc.avgDuration, doc.minFees, doc.maxFees, doc.avgFees, doc.steps, doc.aftercare, doc.followUpRequired, doc.followUpAfterDays, doc.risks, doc.images, doc.isOneTime, doc.regularVisitInterval, doc.isDeleted, doc.isActive);
    }
    toDomainFromPlainObject(doc) {
        const id = doc._id ? doc._id.toString() : '';
        return new treatment_entity_1.Treatment(id, doc.doctor ? doc.doctor.toString() : '', doc.name || '', doc.createdAt, doc.updatedAt, doc.description, doc.minDuration, doc.maxDuration, doc.avgDuration, doc.minFees, doc.maxFees, doc.avgFees, doc.steps, doc.aftercare, doc.followUpRequired, doc.followUpAfterDays, doc.risks, doc.images, doc.isOneTime, doc.regularVisitInterval, doc.isDeleted, doc.isActive);
    }
    async addTreatmentImages(treatmentId, imageUrls) {
        if (!imageUrls || imageUrls.length === 0) {
            return false;
        }
        const result = await treatment_model_1.TreatmentModel.findOneAndUpdate({ _id: treatmentId, isDeleted: false }, {
            $push: {
                images: {
                    $each: imageUrls
                }
            }
        }, { new: false });
        return result !== null;
    }
    async getTreatmentImages(treatmentId, options) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const pipeline = [
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(treatmentId),
                    isDeleted: false,
                },
            },
            {
                $facet: {
                    metadata: [
                        {
                            $project: {
                                total: {
                                    $cond: {
                                        if: { $isArray: '$images' },
                                        then: { $size: '$images' },
                                        else: 0,
                                    },
                                },
                            },
                        },
                    ],
                    data: [
                        {
                            $project: {
                                images: {
                                    $cond: {
                                        if: {
                                            $and: [
                                                { $isArray: '$images' },
                                                { $gt: [{ $size: { $ifNull: ['$images', []] } }, 0] },
                                            ],
                                        },
                                        then: {
                                            $slice: ['$images', skip, limit],
                                        },
                                        else: [],
                                    },
                                },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    images: { $arrayElemAt: ['$data.images', 0] },
                    total: { $arrayElemAt: ['$metadata.total', 0] },
                },
            },
        ];
        const result = await treatment_model_1.TreatmentModel.aggregate(pipeline);
        if (!result || result.length === 0 || !result[0].total) {
            return {
                images: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const images = aggregationResult.images || [];
        const totalPages = Math.ceil(total / limit);
        return {
            images,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async deleteTreatmentImage(treatmentId, imageIndex) {
        if (imageIndex < 0) {
            return false;
        }
        const result = await treatment_model_1.TreatmentModel.findOneAndUpdate({
            _id: treatmentId,
            isDeleted: false,
            $expr: {
                $and: [
                    { $isArray: '$images' },
                    { $gte: [{ $size: '$images' }, { $add: [imageIndex, 1] }] }
                ]
            }
        }, [
            {
                $set: {
                    images: {
                        $concatArrays: [
                            { $slice: ['$images', imageIndex] },
                            {
                                $slice: [
                                    '$images',
                                    { $add: [imageIndex, 1] },
                                    { $size: '$images' }
                                ]
                            }
                        ]
                    }
                }
            }
        ], { new: false });
        return result !== null;
    }
};
exports.MongoTreatmentRepository = MongoTreatmentRepository;
exports.MongoTreatmentRepository = MongoTreatmentRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoTreatmentRepository);
