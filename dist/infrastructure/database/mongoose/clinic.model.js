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
exports.ClinicModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const WorkingDaySchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, { _id: false });
const ClinicSchema = new mongoose_1.Schema({
    clinicId: {
        type: String,
        required: true,
        immutable: true,
        uppercase: true,
        validate: {
            validator: function (v) {
                return /^[A-Z]{3}$/.test(v);
            },
            message: 'clinicId must be exactly 3 capital letters'
        }
    },
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    name: { type: String, required: true },
    address: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    pincode: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    website: { type: String, required: false },
    locationUrl: { type: String, required: false },
    workingDays: { type: [WorkingDaySchema], required: false, default: [] },
    treatments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Treatment' }],
    images: { type: [String], required: false, default: [] },
    notes: { type: String, required: false },
    isActive: { type: Boolean, required: false, default: true },
    isDeleted: { type: Boolean, required: false, default: false },
}, {
    timestamps: true,
});
ClinicSchema.index({ isDeleted: 1, createdAt: -1 });
ClinicSchema.index({ doctor: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
ClinicSchema.index({ doctor: 1, clinicId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
ClinicSchema.index({ name: 'text', city: 'text' });
exports.ClinicModel = mongoose_1.default.model('Clinic', ClinicSchema);
