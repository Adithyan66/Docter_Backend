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
exports.GetMediaUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const media_mapper_1 = require("../../mappers/media.mapper");
let GetMediaUseCase = class GetMediaUseCase {
    constructor(mediaRepository) {
        this.mediaRepository = mediaRepository;
    }
    async execute(id, doctorId) {
        if (!id || id.trim().length === 0) {
            throw new validation_error_1.ValidationError('Media ID is required');
        }
        const media = await this.mediaRepository.findByIdAndDoctor(id.trim(), doctorId);
        if (!media) {
            throw new not_found_error_1.NotFoundError('Media', id);
        }
        return (0, media_mapper_1.mediaToDto)(media);
    }
};
exports.GetMediaUseCase = GetMediaUseCase;
exports.GetMediaUseCase = GetMediaUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IMediaRepository')),
    __metadata("design:paramtypes", [Object])
], GetMediaUseCase);
