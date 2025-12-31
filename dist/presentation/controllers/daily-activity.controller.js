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
exports.DailyActivityController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const user_context_util_1 = require("../utils/user-context.util");
let DailyActivityController = class DailyActivityController {
    constructor(getDailyActivitiesUseCase) {
        this.getDailyActivitiesUseCase = getDailyActivitiesUseCase;
    }
    async getAll(req, res, next) {
        const context = (0, user_context_util_1.getUserContext)(req);
        const query = this.buildQueryDto(req);
        if (context.role === 'staff' && context.clinicId) {
            query.clinicId = context.clinicId;
        }
        const result = await this.getDailyActivitiesUseCase.execute(context.doctorId, query);
        (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, constants_1.SuccessMessages.RETRIEVED);
    }
    buildQueryDto(req) {
        return {
            date: req.query.date ? String(req.query.date) : '',
            page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
            limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
            clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
        };
    }
};
exports.DailyActivityController = DailyActivityController;
exports.DailyActivityController = DailyActivityController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IGetDailyActivitiesUseCase')),
    __metadata("design:paramtypes", [Object])
], DailyActivityController);
