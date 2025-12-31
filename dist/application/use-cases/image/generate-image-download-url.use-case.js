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
exports.GenerateImageDownloadUrlUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
let GenerateImageDownloadUrlUseCase = class GenerateImageDownloadUrlUseCase {
    constructor(fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    async execute(imageUrl) {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            throw new validation_error_1.ValidationError('Image URL is required');
        }
        try {
            const key = this.fileStorageService.extractKeyFromUrl(imageUrl);
            if (!key || key.trim().length === 0) {
                throw new validation_error_1.ValidationError('Invalid image URL format');
            }
            const downloadUrl = await this.fileStorageService.generateDownloadUrl(key);
            return {
                downloadUrl,
                expiresIn: 300,
            };
        }
        catch (error) {
            if (error instanceof validation_error_1.ValidationError) {
                throw error;
            }
            throw new validation_error_1.ValidationError('Invalid image URL or unable to generate download URL');
        }
    }
};
exports.GenerateImageDownloadUrlUseCase = GenerateImageDownloadUrlUseCase;
exports.GenerateImageDownloadUrlUseCase = GenerateImageDownloadUrlUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IFileStorageService')),
    __metadata("design:paramtypes", [Object])
], GenerateImageDownloadUrlUseCase);
