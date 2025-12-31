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
exports.S3StorageAdapter = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const tsyringe_1 = require("tsyringe");
const config_1 = require("../../config");
let S3StorageAdapter = class S3StorageAdapter {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: config_1.config.storage.s3.accessKeyId,
                secretAccessKey: config_1.config.storage.s3.secretAccessKey,
            },
            region: config_1.config.storage.s3.region
        });
        this.bucketName = config_1.config.storage.s3.bucketName;
    }
    async generateUploadUrl(key, contentType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 300 });
    }
    async generateDownloadUrl(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 300 });
    }
    async deleteFile(key) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });
        await this.s3Client.send(command);
    }
    async getPublicUrl(key) {
        return `https://${this.bucketName}.s3.${config_1.config.storage.s3.region}.amazonaws.com/${key}`;
    }
    extractKeyFromUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            return pathname.startsWith('/') ? pathname.substring(1) : pathname;
        }
        catch (error) {
            throw new Error(`Invalid image URL format: ${url}`);
        }
    }
};
exports.S3StorageAdapter = S3StorageAdapter;
exports.S3StorageAdapter = S3StorageAdapter = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], S3StorageAdapter);
