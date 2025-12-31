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
exports.GetClinicImagesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const unauthorized_error_1 = require("../../../domain/errors/unauthorized.error");
const error_messages_1 = require("../../../infrastructure/constants/error-messages");
let GetClinicImagesUseCase = class GetClinicImagesUseCase {
    constructor(clinicRepository) {
        this.clinicRepository = clinicRepository;
    }
    async execute(clinicId, requester, options) {
        const { doctorId, role, clinicId: staffClinicId } = requester;
        const clinic = await this.clinicRepository.findById(clinicId);
        if (!clinic || clinic.doctorId !== doctorId) {
            throw new not_found_error_1.NotFoundError('Clinic', clinicId);
        }
        if (role === 'staff') {
            if (!staffClinicId || staffClinicId !== clinic.id) {
                throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
            }
        }
        const page = options.page && options.page >= 1 ? options.page : 1;
        const limit = options.limit && options.limit >= 1 && options.limit <= 100 ? options.limit : 25;
        const getOptions = {
            page,
            limit,
        };
        return await this.clinicRepository.getClinicImages(clinicId, getOptions);
    }
};
exports.GetClinicImagesUseCase = GetClinicImagesUseCase;
exports.GetClinicImagesUseCase = GetClinicImagesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object])
], GetClinicImagesUseCase);
