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
exports.PatientModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PatientSchema = new mongoose_1.Schema({
    doctor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true,
    },
    primaryClinic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Clinic' },
    clinics: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Clinic' }],
    patientId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, trim: true },
    dob: { type: Date },
    age: { type: Number },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'unknown'],
        default: 'unknown',
    },
    phone: { type: String, index: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, trim: true },
    profilePicUrl: { type: String, trim: true },
    consultationType: {
        type: String,
        enum: ['one-time', 'treatment-plan'],
        required: true,
    },
    tags: { type: [String], default: [] },
    treatmentCourses: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'TreatmentCourse' }],
    visitCount: { type: Number, default: 0 },
    lastVisitAt: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
PatientSchema.index({ fullName: 'text' });
PatientSchema.index({ doctor: 1, isDeleted: 1 });
PatientSchema.index({ doctor: 1, phone: 1 }, { partialFilterExpression: { phone: { $exists: true } } });
PatientSchema.pre('save', function (next) {
    if (!this.fullName) {
        this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
    }
    if (this.dob) {
        const today = new Date();
        let age = today.getFullYear() - this.dob.getFullYear();
        const monthDiff = today.getMonth() - this.dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dob.getDate())) {
            age -= 1;
        }
        this.age = age;
    }
    next();
});
exports.PatientModel = mongoose_1.default.model('Patient', PatientSchema);
