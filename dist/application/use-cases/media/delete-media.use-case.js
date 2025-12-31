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
exports.DeleteMediaUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
let DeleteMediaUseCase = class DeleteMediaUseCase {
    constructor(mediaRepository, fileStorageService) {
        this.mediaRepository = mediaRepository;
        this.fileStorageService = fileStorageService;
    }
    async execute(id, doctorId) {
        const media = await this.mediaRepository.findByIdAndDoctor(id, doctorId);
        if (!media) {
            throw new not_found_error_1.NotFoundError('Media', id);
        }
        if (media.url) {
            try {
                const fileKey = this.fileStorageService.extractKeyFromUrl(media.url);
                await this.fileStorageService.deleteFile(fileKey);
            }
            catch (error) {
                console.error(`Failed to delete media file from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        const deleted = await this.mediaRepository.delete(id);
        if (!deleted) {
            throw new not_found_error_1.NotFoundError('Media', id);
        }
    }
};
exports.DeleteMediaUseCase = DeleteMediaUseCase;
exports.DeleteMediaUseCase = DeleteMediaUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IMediaRepository')),
    __param(1, (0, tsyringe_1.inject)('IFileStorageService')),
    __metadata("design:paramtypes", [Object, Object])
], DeleteMediaUseCase);
