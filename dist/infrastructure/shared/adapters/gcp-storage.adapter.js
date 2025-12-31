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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcpStorageAdapter = void 0;
const storage_1 = require("@google-cloud/storage");
const tsyringe_1 = require("tsyringe");
const config_1 = require("../../config");
let GcpStorageAdapter = class GcpStorageAdapter {
    constructor() {
        const storageConfig = {
            projectId: config_1.config.storage.gcp.projectId,
        };
        if (config_1.config.storage.gcp.keyFilename) {
            storageConfig.keyFilename = config_1.config.storage.gcp.keyFilename;
        }
        this.storage = new storage_1.Storage(storageConfig);
        this.bucketName = config_1.config.storage.gcp.bucketName;
    }
    async generateUploadUrl(key, contentType) {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(key);
        const [url] = await file.getSignedUrl({
            action: 'write',
            expires: Date.now() + 300 * 1000,
            contentType: contentType,
        });
        return url;
    }
    async generateDownloadUrl(key) {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(key);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 300 * 1000,
        });
        return url;
    }
    async deleteFile(key) {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(key);
        await file.delete();
    }
    async getPublicUrl(key) {
        return `https://storage.googleapis.com/${this.bucketName}/${key}`;
    }
    extractKeyFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            if (hostname === 'storage.googleapis.com' || hostname === 'storage.cloud.google.com') {
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                if (pathParts.length >= 2) {
                    return pathParts.slice(1).join('/');
                }
                return pathParts[0] || '';
            }
            const pathname = urlObj.pathname;
            return pathname.startsWith('/') ? pathname.substring(1) : pathname;
        }
        catch (error) {
            throw new Error(`Invalid image URL format: ${url}`);
        }
    }
};
exports.GcpStorageAdapter = GcpStorageAdapter;
exports.GcpStorageAdapter = GcpStorageAdapter = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], GcpStorageAdapter);
