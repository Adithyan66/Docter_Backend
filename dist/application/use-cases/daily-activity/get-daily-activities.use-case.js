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
exports.GetDailyActivitiesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const daily_activity_mapper_1 = require("../../mappers/daily-activity.mapper");
let GetDailyActivitiesUseCase = class GetDailyActivitiesUseCase {
    constructor(visitRepository) {
        this.visitRepository = visitRepository;
    }
    async execute(doctorId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        if (!query.date) {
            throw new validation_error_1.ValidationError('Date parameter is required');
        }
        const date = new Date(query.date);
        if (isNaN(date.getTime())) {
            throw new validation_error_1.ValidationError('Invalid date format. Expected YYYY-MM-DD format');
        }
        if (page < 1) {
            throw new validation_error_1.ValidationError('Page must be greater than 0');
        }
        if (limit < 1 || limit > 100) {
            throw new validation_error_1.ValidationError('Limit must be between 1 and 100');
        }
        const result = await this.visitRepository.getDailyActivitiesAggregated({
            doctorId,
            date,
            page,
            limit,
            clinicId: query.clinicId,
        });
        return (0, daily_activity_mapper_1.mapToDailyActivityResponse)(result);
    }
};
exports.GetDailyActivitiesUseCase = GetDailyActivitiesUseCase;
exports.GetDailyActivitiesUseCase = GetDailyActivitiesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVisitRepository')),
    __metadata("design:paramtypes", [Object])
], GetDailyActivitiesUseCase);
