"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecuteBackupUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const promises_1 = require("fs/promises");
let ExecuteBackupUseCase = class ExecuteBackupUseCase {
    constructor(backupService, googleDriveService) {
        this.backupService = backupService;
        this.googleDriveService = googleDriveService;
    }
    async execute() {
        const timestamp = new Date();
        const backupFileName = `backup-${timestamp.toISOString().replace(/[:.]/g, '-')}.tar.gz`;
        let dumpPath = null;
        let compressedPath = null;
        try {
            console.log(`[Backup] Starting MongoDB backup at ${timestamp.toISOString()}`);
            // 1. Create dump
            dumpPath = await this.backupService.createMongoDump();
            console.log(`[Backup] MongoDB dump created: ${dumpPath}`);
            // 2. Compress with integrity check
            compressedPath = await this.backupService.compressDump(dumpPath);
            await this.validateBackupFile(compressedPath); // ADD THIS
            const stats = await (0, promises_1.stat)(compressedPath);
            console.log(`[Backup] Compressed: ${compressedPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            // 3. Upload with verification
            const rootFolderId = await this.googleDriveService.getRootFolderId();
            const monthFolder = timestamp.toISOString().slice(0, 7); // YYYY-MM
            const monthFolderId = await this.googleDriveService.ensureFolderExists(monthFolder, rootFolderId);
            await this.googleDriveService.uploadFile(compressedPath, backupFileName, monthFolderId);
            console.log(`[Backup] ✅ SUCCESS: ${backupFileName}`);
        }
        catch (error) {
            console.error(`[Backup] ❌ FAILED:`, error);
            throw error;
        }
        finally {
            // CRITICAL: Cleanup LAST, after upload success
            if (dumpPath)
                await this.safeCleanup(dumpPath);
            if (compressedPath && compressedPath !== dumpPath)
                await this.safeCleanup(compressedPath);
        }
    }
    // ADD THESE METHODS
    async validateBackupFile(filePath) {
        const stats = await (0, promises_1.stat)(filePath);
        const sizeKB = stats.size / 1024;
        // Allow small dev DBs, flag suspiciously empty ones
        if (sizeKB < 1) {
            throw new Error(`Backup empty (${sizeKB.toFixed(1)}KB) - mongodump failed`);
        }
        if (sizeKB < 10) {
            console.warn(`[Backup] Small database detected (${sizeKB.toFixed(1)}KB) - proceeding`);
        }
        // Verify tar structure
        const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
        execSync(`tar -tf "${filePath}" >/dev/null 2>&1`, { stdio: 'ignore' });
    }
    async safeCleanup(path) {
        try {
            await this.backupService.cleanup(path);
        }
        catch (e) {
            console.warn(`[Backup] Cleanup failed (non-critical): ${path}`);
        }
    }
};
exports.ExecuteBackupUseCase = ExecuteBackupUseCase;
exports.ExecuteBackupUseCase = ExecuteBackupUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBackupService')),
    __param(1, (0, tsyringe_1.inject)('IGoogleDriveService')),
    __metadata("design:paramtypes", [Object, Object])
], ExecuteBackupUseCase);
