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
exports.DeleteVisitUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const not_found_error_1 = require("../../../domain/errors/not-found.error");
let DeleteVisitUseCase = class DeleteVisitUseCase {
    constructor(visitRepository, patientRepository, treatmentCourseRepository) {
        this.visitRepository = visitRepository;
        this.patientRepository = patientRepository;
        this.treatmentCourseRepository = treatmentCourseRepository;
    }
    async execute(id, doctorId) {
        const visit = await this.visitRepository.findByIdAndDoctor(id, doctorId);
        if (!visit) {
            throw new not_found_error_1.NotFoundError('Visit', id);
        }
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const mongoVisitRepo = this.visitRepository;
            const mongoPatientRepo = this.patientRepository;
            const mongoCourseRepo = this.treatmentCourseRepository;
            const deleted = await mongoVisitRepo.delete(id, session);
            if (!deleted) {
                throw new not_found_error_1.NotFoundError('Visit', id);
            }
            const patient = await this.patientRepository.findById(visit.patientId);
            if (patient) {
                patient.decrementVisitCount();
                await mongoPatientRepo.update(patient.id, patient, session);
            }
            const course = await this.treatmentCourseRepository.findById(visit.courseId);
            if (course) {
                course.removeVisit(visit.id);
                await mongoCourseRepo.update(course.id, course, session);
                if (visit.billedAmount && visit.billedAmount > 0) {
                    await mongoCourseRepo.decrementTotalPaid(course.id, visit.billedAmount, session);
                }
            }
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
exports.DeleteVisitUseCase = DeleteVisitUseCase;
exports.DeleteVisitUseCase = DeleteVisitUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(1, (0, tsyringe_1.inject)('IPatientRepository')),
    __param(2, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], DeleteVisitUseCase);
