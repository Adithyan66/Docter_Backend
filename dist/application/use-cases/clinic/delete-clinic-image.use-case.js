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
exports.DeleteClinicImageUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const unauthorized_error_1 = require("../../../domain/errors/unauthorized.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const error_messages_1 = require("../../../infrastructure/constants/error-messages");
const url_util_1 = require("../../../presentation/utils/url.util");
let DeleteClinicImageUseCase = class DeleteClinicImageUseCase {
    constructor(clinicRepository, fileStorageService) {
        this.clinicRepository = clinicRepository;
        this.fileStorageService = fileStorageService;
    }
    async execute(clinicId, imageIndex, imageUrl, requester) {
        if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
            throw new validation_error_1.ValidationError('Image URL is required');
        }
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
        if (!clinic.images || clinic.images.length === 0) {
            throw new not_found_error_1.NotFoundError('Image', imageIndex.toString());
        }
        if (imageIndex < 0 || imageIndex >= clinic.images.length) {
            throw new not_found_error_1.NotFoundError('Image', imageIndex.toString());
        }
        const storedImageUrl = clinic.images[imageIndex];
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
        const deleted = await this.clinicRepository.deleteClinicImage(clinicId, imageIndex);
        if (!deleted) {
            throw new not_found_error_1.NotFoundError('Image', imageIndex.toString());
        }
        return true;
    }
};
exports.DeleteClinicImageUseCase = DeleteClinicImageUseCase;
exports.DeleteClinicImageUseCase = DeleteClinicImageUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IClinicRepository')),
    __param(1, (0, tsyringe_1.inject)('IFileStorageService')),
    __metadata("design:paramtypes", [Object, Object])
], DeleteClinicImageUseCase);
