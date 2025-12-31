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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoStaffRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const staff_entity_1 = require("../../../domain/entities/staff.entity");
const staff_model_1 = require("../../database/mongoose/staff.model");
let MongoStaffRepository = class MongoStaffRepository {
    constructor(passwordService) {
        this.passwordService = passwordService;
    }
    async findById(id) {
        const doc = await staff_model_1.StaffModel.findById(id);
        return doc ? this.toDomain(doc) : null;
    }
    async findAll() {
        const docs = await staff_model_1.StaffModel.find();
        return docs.map((doc) => this.toDomain(doc));
    }
    async create(entity) {
        const passwordToSave = entity.password.startsWith('$2') ? entity.password : await this.passwordService.hash(entity.password);
        const doc = new staff_model_1.StaffModel({
            username: entity.username.toLowerCase(),
            password: passwordToSave,
            clinicId: new mongoose_1.default.Types.ObjectId(entity.clinicId),
            doctorId: new mongoose_1.default.Types.ObjectId(entity.doctorId),
            role: entity.role,
            refreshToken: entity.refreshToken,
            isActive: entity.isActive,
        });
        const saved = await doc.save();
        return this.toDomain(saved);
    }
    async update(id, entity) {
        const updateData = {};
        if (entity.username)
            updateData.username = entity.username.toLowerCase();
        if (entity.clinicId)
            updateData.clinicId = new mongoose_1.default.Types.ObjectId(entity.clinicId);
        if (entity.doctorId)
            updateData.doctorId = new mongoose_1.default.Types.ObjectId(entity.doctorId);
        if (entity.role)
            updateData.role = entity.role;
        if (entity.refreshToken !== undefined)
            updateData.refreshToken = entity.refreshToken;
        if (entity.isActive !== undefined)
            updateData.isActive = entity.isActive;
        if (entity.password) {
            updateData.password = entity.password.startsWith('$2')
                ? entity.password
                : await this.passwordService.hash(entity.password);
        }
        const updated = await staff_model_1.StaffModel.findByIdAndUpdate(id, updateData, { new: true });
        return updated ? this.toDomain(updated) : null;
    }
    async delete(id) {
        const result = await staff_model_1.StaffModel.findByIdAndDelete(id);
        return !!result;
    }
    async findByUsername(username) {
        const doc = await staff_model_1.StaffModel.findOne({ username: username.toLowerCase() });
        return doc ? this.toDomain(doc) : null;
    }
    async findByDoctorId(doctorId) {
        const docs = await staff_model_1.StaffModel.find({ doctorId: new mongoose_1.default.Types.ObjectId(doctorId) });
        return docs.map((doc) => this.toDomain(doc));
    }
    async findByClinicId(clinicId) {
        const docs = await staff_model_1.StaffModel.find({ clinicId: new mongoose_1.default.Types.ObjectId(clinicId) });
        return docs.map((doc) => this.toDomain(doc));
    }
    async updateRefreshToken(id, refreshToken) {
        await staff_model_1.StaffModel.findByIdAndUpdate(id, { refreshToken });
    }
    async findAllPaginated(options) {
        const { doctorId, page, limit, username, clinicId, isActive } = options;
        const skip = (page - 1) * limit;
        const matchStage = {
            doctorId: new mongoose_1.default.Types.ObjectId(doctorId),
        };
        if (username) {
            matchStage.username = { $regex: username, $options: 'i' };
        }
        if (clinicId) {
            matchStage.clinicId = new mongoose_1.default.Types.ObjectId(clinicId);
        }
        if (isActive !== undefined) {
            matchStage.isActive = isActive;
        }
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'clinics',
                    localField: 'clinicId',
                    foreignField: '_id',
                    as: 'clinic',
                },
            },
            {
                $unwind: {
                    path: '$clinic',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                username: 1,
                                password: 1,
                                clinicId: 1,
                                doctorId: 1,
                                role: 1,
                                refreshToken: 1,
                                isActive: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                clinicName: '$clinic.name',
                            },
                        },
                    ],
                    total: [{ $count: 'count' }],
                },
            },
        ];
        const result = await staff_model_1.StaffModel.aggregate(pipeline);
        const data = result[0]?.data || [];
        const total = result[0]?.total[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);
        const staff = data.map((doc) => {
            const staffEntity = this.toDomain({
                _id: doc._id,
                username: doc.username,
                password: doc.password,
                clinicId: doc.clinicId,
                doctorId: doc.doctorId,
                role: doc.role,
                refreshToken: doc.refreshToken,
                isActive: doc.isActive,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
            });
            return {
                ...staffEntity,
                clinicName: doc.clinicName,
            };
        });
        return {
            staff,
            total,
            page,
            limit,
            totalPages,
        };
    }
    toDomain(doc) {
        return new staff_entity_1.Staff(doc._id.toString(), doc.username, doc.password, doc.clinicId.toString(), doc.doctorId.toString(), doc.refreshToken, doc.isActive, doc.createdAt, doc.updatedAt);
    }
};
exports.MongoStaffRepository = MongoStaffRepository;
exports.MongoStaffRepository = MongoStaffRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPasswordService')),
    __metadata("design:paramtypes", [Object])
], MongoStaffRepository);
