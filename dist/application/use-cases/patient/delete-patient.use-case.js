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
exports.DeletePatientUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
let DeletePatientUseCase = class DeletePatientUseCase {
    constructor(patientRepository, visitRepository, treatmentCourseRepository, paymentRepository, mediaRepository) {
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.paymentRepository = paymentRepository;
        this.mediaRepository = mediaRepository;
    }
    async execute(id, doctorId) {
        const patient = await this.patientRepository.findByIdAndDoctor(id, doctorId);
        if (!patient) {
            throw new not_found_error_1.NotFoundError('Patient', id);
        }
        if (patient.isDeleted) {
            throw new validation_error_1.ValidationError('Patient is already deleted');
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            patient.markDeleted();
            await this.patientRepository.update(id, { isDeleted: patient.isDeleted, isActive: patient.isActive }, session);
            await this.visitRepository.markDeletedByPatientId(id, doctorId, session);
            await this.treatmentCourseRepository.markDeletedByPatientId(id, doctorId, session);
            await this.paymentRepository.markDeletedByPatientId(id, doctorId, session);
            await this.mediaRepository.markDeletedByPatientId(id, doctorId, session);
            await session.commitTransaction();
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
};
exports.DeletePatientUseCase = DeletePatientUseCase;
exports.DeletePatientUseCase = DeletePatientUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(1, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(2, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(3, (0, tsyringe_1.inject)('IPaymentRepository')),
    __param(4, (0, tsyringe_1.inject)('IMediaRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], DeletePatientUseCase);
