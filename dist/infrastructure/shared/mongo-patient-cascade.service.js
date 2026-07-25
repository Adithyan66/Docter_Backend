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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPatientCascadeService = void 0;
const tsyringe_1 = require("tsyringe");
let MongoPatientCascadeService = class MongoPatientCascadeService {
    constructor(patientRepository, visitRepository, treatmentCourseRepository, paymentRepository, mediaRepository, txManager) {
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.paymentRepository = paymentRepository;
        this.mediaRepository = mediaRepository;
        this.txManager = txManager;
    }
    async softDelete(patientId, doctorId) {
        await this.txManager.runInTransaction(async (tx) => {
            await this.patientRepository.update(patientId, { isDeleted: true, isActive: false }, tx);
            await this.visitRepository.markDeletedByPatientId(patientId, doctorId, tx);
            await this.treatmentCourseRepository.markDeletedByPatientId(patientId, doctorId, tx);
            await this.paymentRepository.markDeletedByPatientId(patientId, doctorId, tx);
            await this.mediaRepository.markDeletedByPatientId(patientId, doctorId, tx);
        });
    }
    async restore(patientId, doctorId) {
        await this.txManager.runInTransaction(async (tx) => {
            await this.patientRepository.update(patientId, { isDeleted: false, isActive: true }, tx);
            await this.visitRepository.markRestoredByPatientId(patientId, doctorId, tx);
            await this.treatmentCourseRepository.markRestoredByPatientId(patientId, doctorId, tx);
            await this.paymentRepository.markRestoredByPatientId(patientId, doctorId, tx);
            await this.mediaRepository.markRestoredByPatientId(patientId, doctorId, tx);
        });
    }
};
exports.MongoPatientCascadeService = MongoPatientCascadeService;
exports.MongoPatientCascadeService = MongoPatientCascadeService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(1, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(2, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(3, (0, tsyringe_1.inject)('IPaymentRepository')),
    __param(4, (0, tsyringe_1.inject)('IMediaRepository')),
    __param(5, (0, tsyringe_1.inject)('ITransactionManager')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], MongoPatientCascadeService);
