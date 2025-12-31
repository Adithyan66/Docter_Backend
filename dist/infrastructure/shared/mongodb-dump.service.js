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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDbDumpService = void 0;
const tsyringe_1 = require("tsyringe");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = require("fs");
const path_1 = require("path");
const path_2 = require("path");
const config_1 = require("../config");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let MongoDbDumpService = class MongoDbDumpService {
    constructor() {
        this.tempDir = process.env.BACKUP_TEMP_DIR || './backups';
        if (!(0, fs_1.existsSync)(this.tempDir)) {
            (0, fs_1.mkdirSync)(this.tempDir, { recursive: true });
        }
    }
    async createMongoDump() {
        const timestamp = Date.now();
        const useDirectArchive = process.env.BACKUP_USE_DIRECT_ARCHIVE !== 'false';
        if (useDirectArchive) {
            return this.createMongoDumpDirect(timestamp);
        }
        return this.createMongoDumpLegacy(timestamp);
    }
    async createMongoDumpDirect(timestamp) {
        const compressedPath = (0, path_1.join)(this.tempDir, `backup-${timestamp}.tar.gz`);
        try {
            const mongoUri = config_1.config.mongoUri;
            const mongodumpCommand = `mongodump --uri="${mongoUri}" --archive="${compressedPath}" --gzip`;
            await execAsync(mongodumpCommand);
            if (!(0, fs_1.existsSync)(compressedPath)) {
                throw new Error(`MongoDB dump archive was not created: ${compressedPath}`);
            }
            return compressedPath;
        }
        catch (error) {
            if ((0, fs_1.existsSync)(compressedPath)) {
                (0, fs_1.rmSync)(compressedPath, { recursive: true, force: true });
            }
            throw new Error(`Failed to create MongoDB dump: ${error.message}`);
        }
    }
    async createMongoDumpLegacy(timestamp) {
        const dumpDir = (0, path_1.join)(this.tempDir, `dump-${timestamp}`);
        try {
            const mongoUri = config_1.config.mongoUri;
            const dbName = this.extractDatabaseName(mongoUri);
            const mongodumpCommand = `mongodump --uri="${mongoUri}" --out="${dumpDir}"`;
            await execAsync(mongodumpCommand);
            if (!(0, fs_1.existsSync)(dumpDir)) {
                throw new Error(`MongoDB dump directory was not created: ${dumpDir}`);
            }
            const dbDumpPath = (0, path_1.join)(dumpDir, dbName);
            if (!(0, fs_1.existsSync)(dbDumpPath)) {
                throw new Error(`Database dump directory was not created: ${dbDumpPath}`);
            }
            return dumpDir;
        }
        catch (error) {
            if ((0, fs_1.existsSync)(dumpDir)) {
                (0, fs_1.rmSync)(dumpDir, { recursive: true, force: true });
            }
            throw new Error(`Failed to create MongoDB dump: ${error.message}`);
        }
    }
    async compressDump(dumpPath) {
        if (dumpPath.endsWith('.tar.gz')) {
            return dumpPath;
        }
        const timestamp = Date.now();
        const compressedPath = (0, path_1.join)(this.tempDir, `backup-${timestamp}.tar.gz`);
        const { execSync } = await Promise.resolve().then(() => __importStar(require('child_process')));
        try {
            // ✅ FIXED: Use dirname/basename properly
            execSync(`tar -czf "${compressedPath}" -C "${(0, path_2.dirname)(dumpPath)}" "${(0, path_2.basename)(dumpPath)}"`, { stdio: 'inherit' });
            if (!(0, fs_1.existsSync)(compressedPath)) {
                throw new Error('Tar compression failed');
            }
            return compressedPath;
        }
        catch (error) {
            if ((0, fs_1.existsSync)(compressedPath))
                (0, fs_1.rmSync)(compressedPath, { force: true });
            throw new Error(`Compression failed: ${error.message}`);
        }
    }
    async cleanup(path) {
        try {
            if ((0, fs_1.existsSync)(path)) {
                (0, fs_1.rmSync)(path, { recursive: true, force: true });
            }
        }
        catch (error) {
            throw new Error(`Failed to cleanup path ${path}: ${error.message}`);
        }
    }
    extractDatabaseName(uri) {
        try {
            const url = new URL(uri);
            const pathname = url.pathname;
            if (pathname && pathname.length > 1) {
                return pathname.substring(1).split('/')[0];
            }
            return 'test';
        }
        catch (error) {
            const match = uri.match(/\/([^/?]+)/);
            if (match && match[1]) {
                return match[1];
            }
            return 'test';
        }
    }
};
exports.MongoDbDumpService = MongoDbDumpService;
exports.MongoDbDumpService = MongoDbDumpService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoDbDumpService);
