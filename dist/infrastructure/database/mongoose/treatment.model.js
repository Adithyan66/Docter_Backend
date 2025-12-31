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
exports.TreatmentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TreatmentSchema = new mongoose_1.Schema({
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    minDuration: { type: Number, required: false },
    maxDuration: { type: Number, required: false },
    avgDuration: { type: Number, required: false },
    minFees: { type: Number, required: false },
    maxFees: { type: Number, required: false },
    avgFees: { type: Number, required: false },
    steps: { type: [String], required: false, default: [] },
    aftercare: { type: [String], required: false, default: [] },
    followUpRequired: { type: Boolean, required: false, default: false },
    followUpAfterDays: { type: Number, required: false },
    risks: { type: [String], required: false, default: [] },
    images: { type: [String], required: false, default: [] },
    isOneTime: { type: Boolean, required: false },
    regularVisitInterval: {
        interval: { type: Number, required: false },
        unit: {
            type: String,
            enum: ['days', 'weeks', 'months', 'years'],
            required: false,
        },
    },
    isDeleted: { type: Boolean, required: false, default: false },
    isActive: { type: Boolean, required: false, default: true },
}, {
    timestamps: true,
});
TreatmentSchema.index({ isDeleted: 1, createdAt: -1 });
TreatmentSchema.index({ isDeleted: 1, avgFees: -1 });
TreatmentSchema.index({ isDeleted: 1, avgDuration: -1 });
TreatmentSchema.index({ isDeleted: 1, name: 'text', description: 'text' });
TreatmentSchema.index({ doctor: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
exports.TreatmentModel = mongoose_1.default.model('Treatment', TreatmentSchema);
