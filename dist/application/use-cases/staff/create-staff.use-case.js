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
exports.CreateStaffUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const staff_entity_1 = require("../../../domain/entities/staff.entity");
const validation_error_1 = require("../../../domain/errors/validation.error");
let CreateStaffUseCase = class CreateStaffUseCase {
    constructor(staffRepository, clinicRepository, passwordService) {
        this.staffRepository = staffRepository;
        this.clinicRepository = clinicRepository;
        this.passwordService = passwordService;
    }
    async execute(doctorId, input) {
        const existing = await this.staffRepository.findByUsername(input.username);
        if (existing) {
            throw new validation_error_1.ValidationError('username already exists');
        }
        const clinic = await this.clinicRepository.findById(input.clinicId);
        if (!clinic || clinic.doctorId !== doctorId || clinic.isDeleted) {
            throw new validation_error_1.ValidationError('clinicId is invalid');
        }
        const hashedPassword = await this.passwordService.hash(input.password);
        const staff = new staff_entity_1.Staff('', input.username, hashedPassword, input.clinicId, doctorId, null, true);
        const created = await this.staffRepository.create(staff);
        return {
            id: created.id,
            username: created.username,
            clinicId: created.clinicId,
            doctorId: created.doctorId,
            role: created.role,
            isActive: created.isActive,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        };
    }
};
exports.CreateStaffUseCase = CreateStaffUseCase;
exports.CreateStaffUseCase = CreateStaffUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IStaffRepository')),
    __param(1, (0, tsyringe_1.inject)('IClinicRepository')),
    __param(2, (0, tsyringe_1.inject)('IPasswordService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], CreateStaffUseCase);
