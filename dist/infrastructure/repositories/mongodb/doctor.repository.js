"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDoctorRepository = void 0;
const tsyringe_1 = require("tsyringe");
const doctor_entity_1 = require("../../../domain/entities/doctor.entity");
const doctor_model_1 = require("../../database/mongoose/doctor.model");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
let MongoDoctorRepository = class MongoDoctorRepository {
    async findById(id) {
        const doctorDoc = await doctor_model_1.DoctorModel.findById(id);
        if (!doctorDoc)
            return null;
        return this.toDomain(doctorDoc);
    }
    async findAll() {
        const doctorDocs = await doctor_model_1.DoctorModel.find();
        return doctorDocs.map((doc) => this.toDomain(doc));
    }
    async create(entity) {
        const doctorDoc = new doctor_model_1.DoctorModel({
            email: entity.email.toString(),
            password: entity.password,
            refreshToken: entity.refreshToken,
        });
        const saved = await doctorDoc.save();
        return this.toDomain(saved);
    }
    async update(id, entity) {
        const updateData = {};
        if (entity.email)
            updateData.email = entity.email.toString();
        if (entity.password)
            updateData.password = entity.password;
        if (entity.refreshToken !== undefined)
            updateData.refreshToken = entity.refreshToken;
        const doctorDoc = await doctor_model_1.DoctorModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!doctorDoc)
            return null;
        return this.toDomain(doctorDoc);
    }
    async delete(id) {
        const result = await doctor_model_1.DoctorModel.findByIdAndDelete(id);
        return !!result;
    }
    async findByEmail(email) {
        const doctorDoc = await doctor_model_1.DoctorModel.findOne({ email: email.toLowerCase() });
        if (!doctorDoc)
            return null;
        return this.toDomain(doctorDoc);
    }
    async updateRefreshToken(id, refreshToken) {
        await doctor_model_1.DoctorModel.findByIdAndUpdate(id, { refreshToken });
    }
    toDomain(doc) {
        return new doctor_entity_1.Doctor(doc._id.toString(), new email_vo_1.Email(doc.email), doc.password, doc.createdAt, doc.updatedAt, doc.refreshToken);
    }
};
exports.MongoDoctorRepository = MongoDoctorRepository;
exports.MongoDoctorRepository = MongoDoctorRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MongoDoctorRepository);
