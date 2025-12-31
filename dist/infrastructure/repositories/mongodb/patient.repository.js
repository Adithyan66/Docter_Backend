"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPatientRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const patient_entity_1 = require("../../../domain/entities/patient.entity");
const patient_model_1 = require("../../database/mongoose/patient.model");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const phone_vo_1 = require("../../../domain/value-objects/phone.vo");
const patient_id_vo_1 = require("../../../domain/value-objects/patient-id.vo");
let MongoPatientRepository = class MongoPatientRepository {
    async findById(id) {
        const doc = await patient_model_1.PatientModel.findOne({ _id: id, isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctor(id, doctorId) {
        const doc = await patient_model_1.PatientModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
            isDeleted: false,
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findByIdAndDoctorIncludingDeleted(id, doctorId) {
        const doc = await patient_model_1.PatientModel.findOne({
            _id: id,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
        });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findAll() {
        const docs = await patient_model_1.PatientModel.find({ isDeleted: false });
        return docs.map((doc) => this.toDomain(doc));
    }
    async findByPatientId(patientId) {
        const doc = await patient_model_1.PatientModel.findOne({ patientId: patientId.trim().toUpperCase(), isDeleted: false });
        if (!doc)
            return null;
        return this.toDomain(doc);
    }
    async findPaginated(options) {
        const { page, limit, doctorId, search, patientId, clinicId, gender, consultationType, minAge, maxAge, sortBy, sortOrder } = options;
        const skip = (page - 1) * limit;
        const baseMatch = {
            isDeleted: false,
            doctor: new mongoose_1.Types.ObjectId(doctorId),
        };
        const andConditions = [baseMatch];
        if (search && search.trim().length > 0) {
            const regex = new RegExp(search.trim(), 'i');
            andConditions.push({
                $or: [
                    { fullName: regex },
                    // { firstName: regex },
                    // { lastName: regex },
                    { patientId: regex },
                ],
            });
        }
        if (patientId && patientId.trim().length > 0) {
            andConditions.push({ patientId: patientId.trim().toUpperCase() });
        }
        if (clinicId && mongoose_1.Types.ObjectId.isValid(clinicId)) {
            const clinicObjectId = new mongoose_1.Types.ObjectId(clinicId);
            andConditions.push({
                $or: [{ primaryClinic: clinicObjectId }, { clinics: clinicObjectId }],
            });
        }
        if (gender) {
            andConditions.push({ gender });
        }
        if (consultationType) {
            andConditions.push({ consultationType });
        }
        if (minAge !== undefined || maxAge !== undefined) {
            const ageFilter = {};
            if (minAge !== undefined)
                ageFilter.$gte = minAge;
            if (maxAge !== undefined)
                ageFilter.$lte = maxAge;
            andConditions.push({ age: ageFilter });
        }
        const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];
        const sortFieldMap = {
            createdAt: 'createdAt',
            fullName: 'fullName',
            visitCount: 'visitCount',
            lastVisitAt: 'lastVisitAt',
        };
        const resolvedSortField = sortFieldMap[sortBy || 'createdAt'] || 'createdAt';
        const resolvedSortOrder = sortOrder === 'asc' ? 1 : -1;
        const pipeline = [
            { $match: matchStage },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { [resolvedSortField]: resolvedSortOrder, _id: resolvedSortOrder } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: 'clinics',
                                localField: 'primaryClinic',
                                foreignField: '_id',
                                as: 'primaryClinicData',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                doctor: 1,
                                primaryClinic: 1,
                                primaryClinicName: { $ifNull: [{ $arrayElemAt: ['$primaryClinicData.name', 0] }, null] },
                                clinics: 1,
                                patientId: 1,
                                firstName: 1,
                                lastName: 1,
                                fullName: 1,
                                dob: 1,
                                age: 1,
                                gender: 1,
                                phone: 1,
                                email: 1,
                                address: 1,
                                profilePicUrl: 1,
                                consultationType: 1,
                                tags: 1,
                                treatmentCourses: 1,
                                visitCount: 1,
                                lastVisitAt: 1,
                                isActive: 1,
                                isDeleted: 1,
                                createdAt: 1,
                                updatedAt: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    patients: '$data',
                    total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
                },
            },
        ];
        const result = await patient_model_1.PatientModel.aggregate(pipeline);
        if (!result || result.length === 0) {
            return {
                patients: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
                clinicNames: {},
            };
        }
        const aggregationResult = result[0];
        const total = aggregationResult.total || 0;
        const totalPages = Math.ceil(total / limit);
        const clinicNames = {};
        const patients = (aggregationResult.patients || []).map((doc) => {
            if (doc.primaryClinicName && doc._id) {
                clinicNames[doc._id.toString()] = doc.primaryClinicName;
            }
            return this.toDomainFromPlain(doc);
        });
        return {
            patients,
            total,
            page,
            limit,
            totalPages,
            clinicNames,
        };
    }
    async create(entity) {
        const doc = new patient_model_1.PatientModel({
            doctor: new mongoose_1.Types.ObjectId(entity.doctorId),
            primaryClinic: this.toObjectId(entity.primaryClinic),
            clinics: (entity.clinics || []).map((id) => this.toObjectId(id)).filter((c) => !!c),
            patientId: entity.patientId?.toString(),
            firstName: entity.firstName,
            lastName: entity.lastName,
            fullName: entity.fullName,
            dob: entity.dob,
            age: entity.age,
            gender: entity.gender,
            phone: entity.phone?.toString(),
            email: entity.email?.toString(),
            address: entity.address,
            profilePicUrl: entity.profilePicUrl,
            consultationType: entity.consultationType,
            tags: entity.tags || [],
            treatmentCourses: (entity.treatmentCourses || []).map((id) => this.toObjectId(id)).filter((c) => !!c),
            visitCount: entity.visitCount,
            lastVisitAt: entity.lastVisitAt,
            isActive: entity.isActive,
            isDeleted: entity.isDeleted,
        });
        const saved = await doc.save();
        return this.toDomain(saved);
    }
    async update(id, entity, session) {
        const updateData = {};
        if (entity.primaryClinic !== undefined) {
            updateData.primaryClinic = this.toObjectId(entity.primaryClinic);
        }
        if (entity.clinics !== undefined) {
            updateData.clinics = (entity.clinics || []).map((c) => this.toObjectId(c)).filter((c) => !!c);
        }
        if (entity.patientId !== undefined) {
            updateData.patientId = entity.patientId ? entity.patientId.toString() : undefined;
        }
        if (entity.firstName !== undefined)
            updateData.firstName = entity.firstName;
        if (entity.lastName !== undefined)
            updateData.lastName = entity.lastName;
        if (entity.fullName !== undefined)
            updateData.fullName = entity.fullName;
        if (entity.dob !== undefined)
            updateData.dob = entity.dob;
        if (entity.age !== undefined)
            updateData.age = entity.age;
        if (entity.gender !== undefined)
            updateData.gender = entity.gender;
        if (entity.phone !== undefined) {
            updateData.phone = entity.phone ? entity.phone.toString() : undefined;
        }
        if (entity.email !== undefined) {
            updateData.email = entity.email ? entity.email.toString() : undefined;
        }
        if (entity.address !== undefined)
            updateData.address = entity.address;
        if (entity.profilePicUrl !== undefined) {
            updateData.profilePicUrl = entity.profilePicUrl === null ? null : entity.profilePicUrl;
        }
        if (entity.consultationType !== undefined)
            updateData.consultationType = entity.consultationType;
        if (entity.tags !== undefined)
            updateData.tags = entity.tags;
        if (entity.treatmentCourses !== undefined) {
            updateData.treatmentCourses = (entity.treatmentCourses || []).map((c) => this.toObjectId(c)).filter((c) => !!c);
        }
        if (entity.visitCount !== undefined)
            updateData.visitCount = entity.visitCount;
        if (entity.lastVisitAt !== undefined)
            updateData.lastVisitAt = entity.lastVisitAt;
        if (entity.isActive !== undefined)
            updateData.isActive = entity.isActive;
        if (entity.isDeleted !== undefined)
            updateData.isDeleted = entity.isDeleted;
        const updateOptions = { new: true };
        if (session) {
            updateOptions.session = session;
        }
        await patient_model_1.PatientModel.findOneAndUpdate({ _id: id, isDeleted: false }, updateData, updateOptions);
        const updated = await patient_model_1.PatientModel.findOne({ _id: id, isDeleted: false }).session(session || null);
        if (!updated)
            return null;
        return this.toDomain(updated);
    }
    async delete(id) {
        const result = await patient_model_1.PatientModel.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, isActive: false }, { new: true });
        return !!result;
    }
    toDomain(doc) {
        const email = this.safeCreateEmail(doc.email);
        const phone = this.safeCreatePhone(doc.phone);
        const patientId = this.safeCreatePatientId(doc.patientId);
        return new patient_entity_1.Patient(doc._id.toString(), doc.doctor ? doc.doctor.toString() : '', doc.firstName, doc.consultationType, doc.createdAt, doc.updatedAt, doc.primaryClinic ? doc.primaryClinic.toString() : undefined, this.buildClinics(doc.clinics), patientId, doc.lastName, doc.fullName, doc.dob, doc.age, doc.gender, phone, email, doc.address, doc.profilePicUrl, doc.tags, this.buildTreatmentCourses(doc.treatmentCourses), doc.visitCount, doc.lastVisitAt, doc.isActive, doc.isDeleted);
    }
    toDomainFromPlain(doc) {
        const email = this.safeCreateEmail(doc.email);
        const phone = this.safeCreatePhone(doc.phone);
        const patientId = this.safeCreatePatientId(doc.patientId);
        return new patient_entity_1.Patient(doc._id ? doc._id.toString() : '', doc.doctor ? doc.doctor.toString() : '', doc.firstName, doc.consultationType, doc.createdAt, doc.updatedAt, doc.primaryClinic ? doc.primaryClinic.toString() : undefined, this.buildClinics(doc.clinics), patientId, doc.lastName, doc.fullName, doc.dob ? new Date(doc.dob) : undefined, doc.age, doc.gender, phone, email, doc.address, doc.profilePicUrl, doc.tags, this.buildTreatmentCourses(doc.treatmentCourses), doc.visitCount, doc.lastVisitAt ? new Date(doc.lastVisitAt) : undefined, doc.isActive, doc.isDeleted);
    }
    buildClinics(clinics) {
        if (!clinics || clinics.length === 0) {
            return [];
        }
        return clinics.map((clinic) => {
            if (!clinic)
                return '';
            if (typeof clinic === 'string')
                return clinic;
            if (clinic._id)
                return clinic._id.toString();
            return clinic.toString();
        }).filter((value) => !!value);
    }
    toObjectId(id) {
        if (!id)
            return undefined;
        if (!mongoose_1.Types.ObjectId.isValid(id))
            return undefined;
        return new mongoose_1.Types.ObjectId(id);
    }
    safeCreateEmail(email) {
        if (!email)
            return undefined;
        try {
            return new email_vo_1.Email(email);
        }
        catch {
            return undefined;
        }
    }
    safeCreatePhone(phone) {
        if (!phone)
            return undefined;
        try {
            return new phone_vo_1.Phone(phone);
        }
        catch {
            return undefined;
        }
    }
    safeCreatePatientId(id) {
        if (!id)
            return undefined;
        try {
            return new patient_id_vo_1.PatientId(id);
        }
        catch {
            return undefined;
        }
    }
    buildTreatmentCourses(treatmentCourses) {
        if (!treatmentCourses || treatmentCourses.length === 0) {
            return [];
        }
        return treatmentCourses.map((course) => {
            if (!course)
                return '';
            if (typeof course === 'string')
                return course;
            if (course._id)
                return course._id.toString();
            return course.toString();
        }).filter((value) => !!value);
    }
};
exports.MongoPatientRepository = MongoPatientRepository;
exports.MongoPatientRepository = MongoPatientRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoPatientRepository);
