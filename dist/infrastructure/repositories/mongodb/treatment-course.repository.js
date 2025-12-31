"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTreatmentCourseRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const treatment_course_entity_1 = require("../../../domain/entities/treatment-course.entity");
const treatment_course_model_1 = require("../../database/mongoose/treatment-course.model");
let MongoTreatmentCourseRepository = class MongoTreatmentCourseRepository {
    async findById(id) {
        const doc = await treatment_course_model_1.TreatmentCourseModel.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctor(id, doctorId) {
        const doc = await treatment_course_model_1.TreatmentCourseModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findAll() {
        const docs = await treatment_course_model_1.TreatmentCourseModel.find({ isDeleted: false });
        return docs.map((doc) => this.toDomain(doc));
    }
    async create(entity) {
        const doc = new treatment_course_model_1.TreatmentCourseModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctorId),
            patient: new mongoose_1.Types.ObjectId(entity.patientId),
            clinic: entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : undefined,
            treatment: new mongoose_1.Types.ObjectId(entity.treatmentId),
            startDate: entity.startDate,
            expectedEndDate: entity.expectedEndDate,
            lastVisitDate: entity.lastVisitDate,
            nextVisitDate: entity.nextVisitDate,
            totalCost: entity.totalCost,
            totalPaid: entity.totalPaid,
            isPaymentCompleted: entity.isPaymentCompleted,
            isMedicallyCompleted: entity.isMedicallyCompleted,
            status: entity.status,
            notes: entity.notes,
            visits: entity.visits.map((v) => new mongoose_1.Types.ObjectId(v)),
            payments: entity.payments.map((p) => new mongoose_1.Types.ObjectId(p)),
            isDeleted: entity.isDeleted || false,
        });
        const saved = await doc.save();
        return this.toDomain(saved);
    }
    async update(id, entity, session) {
        const updateData = {};
        if (entity.doctorId !== undefined)
            updateData.doctor = new mongoose_1.Types.ObjectId(entity.doctorId);
        if (entity.patientId !== undefined)
            updateData.patient = new mongoose_1.Types.ObjectId(entity.patientId);
        if (entity.clinicId !== undefined)
            updateData.clinic = entity.clinicId ? new mongoose_1.Types.ObjectId(entity.clinicId) : null;
        if (entity.treatmentId !== undefined)
            updateData.treatment = new mongoose_1.Types.ObjectId(entity.treatmentId);
        if (entity.startDate !== undefined)
            updateData.startDate = entity.startDate;
        if (entity.expectedEndDate !== undefined)
            updateData.expectedEndDate = entity.expectedEndDate;
        if (entity.lastVisitDate !== undefined)
            updateData.lastVisitDate = entity.lastVisitDate;
        if (entity.nextVisitDate !== undefined)
            updateData.nextVisitDate = entity.nextVisitDate;
        if (entity.totalCost !== undefined)
            updateData.totalCost = entity.totalCost;
        if (entity.totalPaid !== undefined)
            updateData.totalPaid = entity.totalPaid;
        if (entity.isPaymentCompleted !== undefined)
            updateData.isPaymentCompleted = entity.isPaymentCompleted;
        if (entity.isMedicallyCompleted !== undefined)
            updateData.isMedicallyCompleted = entity.isMedicallyCompleted;
        if (entity.status !== undefined)
            updateData.status = entity.status;
        if (entity.notes !== undefined)
            updateData.notes = entity.notes;
        if (entity.visits !== undefined)
            updateData.visits = entity.visits.map((v) => new mongoose_1.Types.ObjectId(v));
        if (entity.payments !== undefined)
            updateData.payments = entity.payments.map((p) => new mongoose_1.Types.ObjectId(p));
        if (entity.isDeleted !== undefined)
            updateData.isDeleted = entity.isDeleted;
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        await treatment_course_model_1.TreatmentCourseModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, updateOptions);
        const doc = await treatment_course_model_1.TreatmentCourseModel.findOne({ _id: id, isDeleted: false }).session(session || null);
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async delete(id) {
        const result = await treatment_course_model_1.TreatmentCourseModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
        return !!result;
    }
    async findByPatientAndTreatmentAndStatus(doctorId, patientId, treatmentId, statuses) {
        const doc = await treatment_course_model_1.TreatmentCourseModel.findOne({
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            patient: new mongoose_1.Types.ObjectId(patientId),
            treatment: new mongoose_1.Types.ObjectId(treatmentId),
            status: { $in: statuses },
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findPaginated(options) {
        const { page, limit, doctorId, clinicId, treatmentId, patientId, status, startDateFrom, startDateTo, sortBy = 'createdAt', sortOrder = 'desc' } = options;
        const skip = (page - 1) * limit;
        const baseMatch = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
        };
        const andConditions = [baseMatch];
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            andConditions.push({ clinic: new mongoose_1.Types.ObjectId(clinicId) });
        }
        if (treatmentId && mongoose_1.Types.ObjectId.isValid(treatmentId)) {
            andConditions.push({ treatment: new mongoose_1.Types.ObjectId(treatmentId) });
        }
        if (patientId && mongoose_1.Types.ObjectId.isValid(patientId)) {
            andConditions.push({ patient: new mongoose_1.Types.ObjectId(patientId) });
        }
        if (status) {
            andConditions.push({ status });
        }
        if (startDateFrom || startDateTo) {
            const dateFilter = {};
            if (startDateFrom)
                dateFilter.$gte = startDateFrom;
            if (startDateTo)
                dateFilter.$lte = startDateTo;
            andConditions.push({ startDate: dateFilter });
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const sortFieldMap = {
            createdAt: 'createdAt',
            startDate: 'startDate',
            totalCost: 'totalCost',
            status: 'status',
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
                    treatmentCourses: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await treatment_course_model_1.TreatmentCourseModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                treatmentCourses: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const treatmentCourses = aggregationResult.treatmentCourses.map((doc) => this.toDomainFromPlainObject(doc));
        return {
            treatmentCourses,
            total,
            page,
            limit,
            totalPages,
        };
    }
    toDomain(doc) {
        return new treatment_course_entity_1.TreatmentCourse(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.treatment ? doc.treatment.toString() : '', doc.startDate, doc.totalCost, doc.createdAt, doc.updatedAt, doc.clinic ? doc.clinic.toString() : undefined, doc.expectedEndDate, doc.lastVisitDate, doc.nextVisitDate, doc.totalPaid, doc.isPaymentCompleted, doc.isMedicallyCompleted, doc.status, doc.notes, doc.visits ? doc.visits.map((v) => v.toString()) : [], doc.payments ? doc.payments.map((p) => p.toString()) : [], doc.isDeleted || false);
    }
    async incrementTotalPaid(courseId, amount, session, paymentId) {
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        const updateData = { $inc: { totalPaid: amount } };
        if (paymentId) {
            updateData.$addToSet = { payments: new mongoose_1.Types.ObjectId(paymentId) };
        }
        await treatment_course_model_1.TreatmentCourseModel.findOneAndUpdate({ _id: courseId, isDeleted: false }, updateData, updateOptions);
        const updated = await treatment_course_model_1.TreatmentCourseModel.findOne({ _id: courseId, isDeleted: false }).session(session || null);
        if (!updated)
            return null;
        if (updated.totalPaid >= updated.totalCost) {
            await treatment_course_model_1.TreatmentCourseModel.findOneAndUpdate({ _id: courseId, isDeleted: false }, { $set: { isPaymentCompleted: true } }, updateOptions);
            updated.isPaymentCompleted = true;
        }
        else {
            updated.isPaymentCompleted = false;
        }
        return this.toDomain(updated);
    }
    async decrementTotalPaid(courseId, amount, session) {
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        const doc = await treatment_course_model_1.TreatmentCourseModel.findOneAndUpdate({ _id: courseId, isDeleted: false }, { $inc: { totalPaid: -amount } }, updateOptions);
        if (!doc)
            return null;
        const updated = await treatment_course_model_1.TreatmentCourseModel.findOne({ _id: courseId, isDeleted: false }).session(session || null);
        if (!updated)
            return null;
        if (updated.totalPaid >= updated.totalCost) {
            await treatment_course_model_1.TreatmentCourseModel.findOneAndUpdate({ _id: courseId, isDeleted: false }, { $set: { isPaymentCompleted: true } }, updateOptions);
            updated.isPaymentCompleted = true;
        }
        else {
            updated.isPaymentCompleted = false;
        }
        return this.toDomain(updated);
    }
    toDomainFromPlainObject(doc) {
        const id = doc._id ? doc._id.toString() : '';
        return new treatment_course_entity_1.TreatmentCourse(id, doc.doctor ? doc.doctor.toString() : '', doc.patient ? doc.patient.toString() : '', doc.treatment ? doc.treatment.toString() : '', doc.startDate || new Date(), doc.totalCost || 0, doc.createdAt, doc.updatedAt, doc.clinic ? doc.clinic.toString() : undefined, doc.expectedEndDate, doc.lastVisitDate, doc.nextVisitDate, doc.totalPaid || 0, doc.isPaymentCompleted || false, doc.isMedicallyCompleted || false, doc.status || 'active', doc.notes, doc.visits ? doc.visits.map((v) => v.toString()) : [], doc.payments ? doc.payments.map((p) => p.toString()) : [], doc.isDeleted || false);
    }
    async markDeletedByPatientId(patientId, doctorId, session) {
        const result = await treatment_course_model_1.TreatmentCourseModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        }, {
            isDeleted: true,
        }, { session });
        return result.modifiedCount;
    }
    async markRestoredByPatientId(patientId, doctorId, session) {
        const result = await treatment_course_model_1.TreatmentCourseModel.updateMany({
            patient: new mongoose_1.Types.ObjectId(patientId),
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: true,
        }, {
            isDeleted: false,
        }, { session });
        return result.modifiedCount;
    }
    async findVisitReminders(options) {
        const { page, limit, doctorId, daysBefore, daysAfter, treatmentIds, clinicIds } = options;
        const skip = (page - 1) * limit;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let dateFrom;
        let dateTo;
        if (daysBefore >= 0 && daysAfter >= 0) {
            dateFrom = new Date(today);
            dateFrom.setDate(dateFrom.getDate() - daysBefore);
            dateTo = new Date(today);
            dateTo.setDate(dateTo.getDate() + daysAfter);
        }
        else {
            dateFrom = new Date(today);
            dateFrom.setDate(dateFrom.getDate() + daysBefore);
            dateTo = new Date(today);
            dateTo.setDate(dateTo.getDate() + daysAfter);
            if (dateFrom > dateTo) {
                const temp = new Date(dateFrom);
                dateFrom = new Date(dateTo);
                dateTo = temp;
            }
        }
        dateTo.setHours(23, 59, 59, 999);
        const baseMatch = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            status: 'active',
            nextVisitDate: { $ne: null, $gte: dateFrom, $lte: dateTo },
        };
        const andConditions = [baseMatch];
        if (treatmentIds && treatmentIds.length > 0) {
            const validTreatmentIds = treatmentIds
                .map(id => id.trim())
                .filter(id => mongoose_1.Types.ObjectId.isValid(id))
                .map(id => new mongoose_1.Types.ObjectId(id));
            if (validTreatmentIds.length > 0) {
                andConditions.push({ treatment: { $in: validTreatmentIds } });
            }
        }
        if (clinicIds && clinicIds.length > 0) {
            const validClinicIds = clinicIds
                .map(id => id.trim())
                .filter(id => mongoose_1.Types.ObjectId.isValid(id))
                .map(id => new mongoose_1.Types.ObjectId(id));
            if (validClinicIds.length > 0) {
                andConditions.push({ clinic: { $in: validClinicIds } });
            }
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const pipeline = [
            { $match: matchStage },
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
                    from: 'treatments',
                    localField: 'treatment',
                    foreignField: '_id',
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
                $unwind: {
                    path: '$patientData',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $unwind: {
                    path: '$treatmentData',
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $unwind: {
                    path: '$clinicData',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { nextVisitDate: 1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                treatmentCourseId: { $toString: '$_id' },
                                patientName: '$patientData.fullName',
                                treatmentName: '$treatmentData.name',
                                clinicName: { $ifNull: ['$clinicData.name', null] },
                                nextVisitDate: '$nextVisitDate',
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    reminders: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await treatment_course_model_1.TreatmentCourseModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                reminders: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const reminders = aggregationResult.reminders.map((item) => ({
            treatmentCourseId: item.treatmentCourseId,
            patientName: item.patientName,
            treatmentName: item.treatmentName,
            clinicName: item.clinicName || undefined,
            nextVisitDate: item.nextVisitDate,
        }));
        return {
            reminders,
            total,
            page,
            limit,
            totalPages,
        };
    }
};
exports.MongoTreatmentCourseRepository = MongoTreatmentCourseRepository;
exports.MongoTreatmentCourseRepository = MongoTreatmentCourseRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoTreatmentCourseRepository);
