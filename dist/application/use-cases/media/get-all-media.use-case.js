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
exports.GetAllMediaUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const media_mapper_1 = require("../../mappers/media.mapper");
let GetAllMediaUseCase = class GetAllMediaUseCase {
    constructor(mediaRepository) {
        this.mediaRepository = mediaRepository;
    }
    async execute(doctorId, query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const options = {
            doctorId,
            page,
            limit,
            patientId: query.patientId,
            courseId: query.courseId,
            visitId: query.visitId,
            clinicId: query.clinicId,
            type: query.type,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
        };
        const result = await this.mediaRepository.findPaginated(options);
        return {
            media: result.media.map((media) => (0, media_mapper_1.mediaToDto)(media)),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
};
exports.GetAllMediaUseCase = GetAllMediaUseCase;
exports.GetAllMediaUseCase = GetAllMediaUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IMediaRepository')),
    __metadata("design:paramtypes", [Object])
], GetAllMediaUseCase);
