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
exports.ImageUploadService = void 0;
const tsyringe_1 = require("tsyringe");
let ImageUploadService = class ImageUploadService {
    constructor(fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    async generateUploadUrl(type, fileExtension) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const key = `${type}/${timestamp}-${random}.${fileExtension}`;
        const contentType = this.getContentType(fileExtension);
        const uploadUrl = await this.fileStorageService.generateUploadUrl(key, contentType);
        const publicUrl = await this.fileStorageService.getPublicUrl(key);
        return {
            uploadUrl,
            publicUrl,
            key
        };
    }
    getContentType(fileExtension) {
        const extension = fileExtension.toLowerCase();
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp'
        };
        return contentTypes[extension] || 'application/octet-stream';
    }
};
exports.ImageUploadService = ImageUploadService;
exports.ImageUploadService = ImageUploadService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IFileStorageService')),
    __metadata("design:paramtypes", [Object])
], ImageUploadService);
