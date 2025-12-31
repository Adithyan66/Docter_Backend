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
exports.GetAllClinicsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
let GetAllClinicsUseCase = class GetAllClinicsUseCase {
    constructor(clinicRepository) {
        this.clinicRepository = clinicRepository;
    }
    async execute(doctorId, params = {}) {
        const page = params.page && params.page >= 1 ? params.page : 1;
        const limit = params.limit && params.limit >= 1 && params.limit <= 100 ? params.limit : 10;
        const search = params.search?.trim() || undefined;
        const sortBy = params.sortBy || 'createdAt';
        const sortOrder = params.sortOrder || 'desc';
        const options = {
            page,
            limit,
            search,
            doctorId,
            sortBy,
            sortOrder,
        };
        return await this.clinicRepository.findAllPaginated(options);
    }
};
exports.GetAllClinicsUseCase = GetAllClinicsUseCase;
exports.GetAllClinicsUseCase = GetAllClinicsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IClinicRepository')),
    __metadata("design:paramtypes", [Object])
], GetAllClinicsUseCase);
