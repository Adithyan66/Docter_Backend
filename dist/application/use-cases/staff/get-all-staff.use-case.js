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
exports.GetAllStaffUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let GetAllStaffUseCase = class GetAllStaffUseCase {
    constructor(staffRepository) {
        this.staffRepository = staffRepository;
    }
    async execute(doctorId, params = {}) {
        const page = params.page && params.page >= 1 ? params.page : 1;
        const limit = params.limit && params.limit >= 1 && params.limit <= 100 ? params.limit : 20;
        const username = params.username?.trim() || undefined;
        const clinicId = params.clinicId?.trim() || undefined;
        const isActive = params.isActive !== undefined ? params.isActive : undefined;
        const options = {
            doctorId,
            page,
            limit,
            username,
            clinicId,
            isActive,
        };
        const result = await this.staffRepository.findAllPaginated(options);
        return {
            staff: result.staff.map((staff) => ({
                id: staff.id,
                username: staff.username,
                clinicId: staff.clinicId,
                clinicName: staff.clinicName,
                doctorId: staff.doctorId,
                role: staff.role,
                isActive: staff.isActive,
                createdAt: staff.createdAt,
                updatedAt: staff.updatedAt,
            })),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetAllStaffUseCase = GetAllStaffUseCase;
exports.GetAllStaffUseCase = GetAllStaffUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IStaffRepository')),
    __metadata("design:paramtypes", [Object])
], GetAllStaffUseCase);
