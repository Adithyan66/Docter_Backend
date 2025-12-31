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
exports.ImageServiceController = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../infrastructure/constants");
const bad_request_error_1 = require("../../domain/errors/bad-request.error");
let ImageServiceController = class ImageServiceController {
    constructor(generateUploadUrlUseCase, generateDownloadUrlUseCase) {
        this.generateUploadUrlUseCase = generateUploadUrlUseCase;
        this.generateDownloadUrlUseCase = generateDownloadUrlUseCase;
        this.generateUploadUrl = async (req, res, next) => {
            const { type } = req.params;
            if (!type) {
                throw new bad_request_error_1.BadRequestError('Type is required');
            }
            const { fileExtension } = req.body;
            if (!fileExtension) {
                throw new bad_request_error_1.BadRequestError('File extension is required');
            }
            const result = await this.generateUploadUrlUseCase.execute(type, { fileExtension });
            (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, 'Upload URL generated successfully');
        };
        this.generateDownloadUrl = async (req, res, next) => {
            const imageUrl = req.query.url;
            if (!imageUrl) {
                throw new bad_request_error_1.BadRequestError('Image URL is required as query parameter');
            }
            const result = await this.generateDownloadUrlUseCase.execute(imageUrl);
            (0, constants_1.successResponse)(res, result, constants_1.HttpStatus.OK, 'Download URL generated successfully');
        };
    }
};
exports.ImageServiceController = ImageServiceController;
exports.ImageServiceController = ImageServiceController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IGenerateImageUploadUrlUseCase')),
    __param(1, (0, tsyringe_1.inject)('IGenerateImageDownloadUrlUseCase')),
    __metadata("design:paramtypes", [Object, Object])
], ImageServiceController);
