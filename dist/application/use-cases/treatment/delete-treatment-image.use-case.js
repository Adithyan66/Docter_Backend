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
exports.DeleteTreatmentImageUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const unauthorized_error_1 = require("../../../domain/errors/unauthorized.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const error_messages_1 = require("../../../infrastructure/constants/error-messages");
const url_util_1 = require("../../../presentation/utils/url.util");
let DeleteTreatmentImageUseCase = class DeleteTreatmentImageUseCase {
    constructor(treatmentRepository, fileStorageService) {
        this.treatmentRepository = treatmentRepository;
        this.fileStorageService = fileStorageService;
    }
    async execute(treatmentId, imageIndex, imageUrl, requester) {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            throw new validation_error_1.ValidationError('Image URL is required');
        }
        const { doctorId, role } = requester;
        const treatment = await this.treatmentRepository.findById(treatmentId);
        if (!treatment || treatment.doctorId !== doctorId) {
            throw new not_found_error_1.NotFoundError('Treatment', treatmentId);
        }
        if (role === 'staff') {
            throw new unauthorized_error_1.UnauthorizedError(error_messages_1.AuthenticationErrors.UNAUTHORIZED);
        }
        const imagesResult = await this.treatmentRepository.getTreatmentImages(treatmentId, {
            page: 1,
            limit: imageIndex + 1,
        });
        if (!imagesResult.images || imagesResult.images.length === 0) {
            throw new not_found_error_1.NotFoundError('Image', imageIndex.toString());
        }
        if (imageIndex < 0 || imageIndex >= imagesResult.images.length) {
            throw new not_found_error_1.NotFoundError('Image', imageIndex.toString());
        }
        const storedImageUrl = imagesResult.images[imageIndex];
        const normalizedStoredUrl = (0, url_util_1.normalizeUrl)(storedImageUrl);
        const normalizedProvidedUrl = (0, url_util_1.normalizeUrl)(imageUrl);
        if (normalizedStoredUrl !== normalizedProvidedUrl) {
            throw new validation_error_1.ValidationError('Image URL does not match the image at the specified index');
        }
        const fileKey = this.fileStorageService.extractKeyFromUrl(storedImageUrl);
        try {
            await this.fileStorageService.deleteFile(fileKey);
        }
        catch (error) {
            throw new Error(`Failed to delete image from cloud storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        const deleted = await this.treatmentRepository.deleteTreatmentImage(treatmentId, imageIndex);
        if (!deleted) {
            throw new not_found_error_1.NotFoundError('Image', imageIndex.toString());
        }
        return true;
    }
};
exports.DeleteTreatmentImageUseCase = DeleteTreatmentImageUseCase;
exports.DeleteTreatmentImageUseCase = DeleteTreatmentImageUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __param(1, (0, tsyringe_1.inject)('IFileStorageService')),
    __metadata("design:paramtypes", [Object, Object])
], DeleteTreatmentImageUseCase);
