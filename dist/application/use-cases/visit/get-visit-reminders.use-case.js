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
exports.GetVisitRemindersUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let GetVisitRemindersUseCase = class GetVisitRemindersUseCase {
    constructor(treatmentCourseRepository) {
        this.treatmentCourseRepository = treatmentCourseRepository;
    }
    async execute(doctorId, input) {
        const page = input.page && input.page > 0 ? input.page : 1;
        const limit = input.limit && input.limit > 0 ? Math.min(input.limit, 100) : 10;
        const daysBefore = input.daysBefore !== undefined ? input.daysBefore : 5;
        const daysAfter = input.daysAfter !== undefined ? input.daysAfter : 5;
        const treatmentIds = input.treatmentId
            ? input.treatmentId.split(',').map(id => id.trim()).filter(id => id.length > 0)
            : undefined;
        const clinicIds = input.clinicId
            ? input.clinicId.split(',').map(id => id.trim()).filter(id => id.length > 0)
            : undefined;
        const options = {
            doctorId,
            page,
            limit,
            daysBefore,
            daysAfter,
            treatmentIds,
            clinicIds,
        };
        const result = await this.treatmentCourseRepository.findVisitReminders(options);
        return {
            reminders: result.reminders,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetVisitRemindersUseCase = GetVisitRemindersUseCase;
exports.GetVisitRemindersUseCase = GetVisitRemindersUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentCourseRepository')),
    __metadata("design:paramtypes", [Object])
], GetVisitRemindersUseCase);
