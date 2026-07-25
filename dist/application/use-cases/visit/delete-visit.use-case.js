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
exports.DeleteVisitUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
let DeleteVisitUseCase = class DeleteVisitUseCase {
    constructor(visitRepository, patientRepository, treatmentCourseRepository, txManager) {
        this.visitRepository = visitRepository;
        this.patientRepository = patientRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
        this.txManager = txManager;
    }
    async execute(id, doctorId) {
        const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
        if (!visit) {
            throw new not_found_error_1.NotFoundError('Visit', id);
        }
        await this.txManager.runInTransaction(async (tx) => {
            const deleted = await this.visitRepository.delete(id);
            if (!deleted) {
                throw new not_found_error_1.NotFoundError('Visit', id);
            }
            const patient = await this.patientRepository.findById(visit.patientId);
            if (patient) {
                patient.decrementVisitCount();
                await this.patientRepository.update(patient.id, patient, tx);
            }
            const course = await this.treatmentCourseRepository.findById(visit.courseId);
            if (course) {
                course.removeVisit(visit.id);
                await this.treatmentCourseRepository.update(course.id, course, tx);
                if (visit.billedAmount && visit.billedAmount > 0) {
                    await this.treatmentCourseRepository.decrementTotalPaid(course.id, visit.billedAmount, tx);
                }
            }
        });
    }
};
exports.DeleteVisitUseCase = DeleteVisitUseCase;
exports.DeleteVisitUseCase = DeleteVisitUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(1, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(2, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __param(3, (0, tsyringe_1.inject)('ITransactionManager')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DeleteVisitUseCase);
