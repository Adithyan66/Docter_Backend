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
exports.UpdateStaffUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
let UpdateStaffUseCase = class UpdateStaffUseCase {
    constructor(staffRepository, clinicRepository) {
        this.staffRepository = staffRepository;
        this.clinicRepository = clinicRepository;
    }
    async execute(id, doctorId, input) {
        const staff = await this.staffRepository.findById(id);
        if (!staff || staff.doctorId !== doctorId) {
            throw new not_found_error_1.NotFoundError('Staff');
        }
        if (input.username) {
            const other = await this.staffRepository.findByUsername(input.username);
            if (other && other.id !== id) {
                throw new validation_error_1.ValidationError('username already exists');
            }
        }
        if (input.clinicId) {
            const clinic = await this.clinicRepository.findById(input.clinicId);
            if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
                throw new validation_error_1.ValidationError('clinicId is invalid');
            }
        }
        const updated = await this.staffRepository.update(id, {
            username: input.username,
            password: input.password,
            clinicId: input.clinicId,
            isActive: input.isActive,
        });
        if (!updated) {
            throw new not_found_error_1.NotFoundError('Staff');
        }
        return {
            id: updated.id,
            username: updated.username,
            clinicId: updated.clinicId,
            doctorId: updated.doctorId,
            role: updated.role,
            isActive: updated.isActive,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
        };
    }
};
exports.UpdateStaffUseCase = UpdateStaffUseCase;
exports.UpdateStaffUseCase = UpdateStaffUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IStaffRepository')),
    __param(1, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object, Object])
], UpdateStaffUseCase);
