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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupSchedulerService = void 0;
const tsyringe_1 = require("tsyringe");
const cron = __importStar(require("node-cron"));
let BackupSchedulerService = class BackupSchedulerService {
    constructor() {
        this.tasks = new Map();
        this.isRunning = false;
        this.currentBackup = null;
        this.backupTimeout = parseInt(process.env.BACKUP_TIMEOUT_MS || '3600000', 10);
    }
    schedule(cronExpression, task) {
        if (this.tasks.has(cronExpression)) {
            throw new Error(`Task with cron expression ${cronExpression} already exists`);
        }
        const scheduledTask = cron.schedule(cronExpression, async () => {
            if (this.isRunning) {
                console.warn(`[Scheduler] Backup already running, skipping this execution`);
                return;
            }
            this.isRunning = true;
            const timeoutId = setTimeout(() => {
                console.error(`[Scheduler] Backup timeout after ${this.backupTimeout / 1000 / 60} minutes`);
                this.isRunning = false;
                this.currentBackup = null;
            }, this.backupTimeout);
            try {
                this.currentBackup = task();
                await this.currentBackup;
            }
            catch (error) {
                console.error(`[Scheduler] Task execution failed:`, error);
            }
            finally {
                clearTimeout(timeoutId);
                this.isRunning = false;
                this.currentBackup = null;
            }
        }, {
            timezone: 'UTC'
        });
        scheduledTask.stop();
        this.tasks.set(cronExpression, scheduledTask);
    }
    start() {
        this.tasks.forEach((task, expression) => {
            task.start();
            console.log(`[Scheduler] Started cron job with expression: ${expression}`);
        });
    }
    stop() {
        this.tasks.forEach((task, expression) => {
            task.stop();
            console.log(`[Scheduler] Stopped cron job with expression: ${expression}`);
        });
    }
};
exports.BackupSchedulerService = BackupSchedulerService;
exports.BackupSchedulerService = BackupSchedulerService = __decorate([
    (0, tsyringe_1.injectable)()
], BackupSchedulerService);
