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
exports.AddTreatmentImagesUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
let AddTreatmentImagesUseCase = class AddTreatmentImagesUseCase {
    constructor(treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }
    async execute(treatmentId, doctorId, imageUrls) {
        if (!imageUrls || imageUrls.length === 0) {
            throw new validation_error_1.ValidationError('At least one image URL is required');
        }
        const treatment = await this.treatmentRepository.findById(treatmentId);
        if (!treatment || treatment.doctorId !== doctorId) {
            throw new not_found_error_1.NotFoundError('Treatment', treatmentId);
        }
        for (const url of imageUrls) {
            if (!url || typeof url !== 'string' || url.trim().length === 0) {
                throw new validation_error_1.ValidationError('All image URLs must be valid non-empty strings');
            }
        }
        const added = await this.treatmentRepository.addTreatmentImages(treatmentId, imageUrls);
        if (!added) {
            throw new not_found_error_1.NotFoundError('Treatment', treatmentId);
        }
    }
};
exports.AddTreatmentImagesUseCase = AddTreatmentImagesUseCase;
exports.AddTreatmentImagesUseCase = AddTreatmentImagesUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __metadata("design:paramtypes", [Object])
], AddTreatmentImagesUseCase);
