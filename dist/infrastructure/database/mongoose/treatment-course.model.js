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
exports.TreatmentCourseModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TreatmentCourseSchema = new mongoose_1.Schema({
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    clinic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Clinic' },
    treatment: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Treatment', required: true },
    startDate: { type: Date, required: true },
    expectedEndDate: { type: Date },
    lastVisitDate: { type: Date },
    nextVisitDate: { type: Date },
    totalCost: { type: Number, default: 0, min: 0 },
    totalPaid: { type: Number, default: 0, min: 0 },
    isPaymentCompleted: { type: Boolean, default: false },
    isMedicallyCompleted: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active',
    },
    notes: { type: String },
    visits: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Visit' }],
    payments: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' }],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
TreatmentCourseSchema.virtual('remaining').get(function () {
    return Math.max(0, (this.totalCost || 0) - (this.totalPaid || 0));
});
TreatmentCourseSchema.index({ doctor: 1, patient: 1, status: 1 });
TreatmentCourseSchema.index({ clinic: 1, startDate: -1 });
TreatmentCourseSchema.index({ isDeleted: 1, createdAt: -1 });
TreatmentCourseSchema.index({ lastVisitDate: -1 });
TreatmentCourseSchema.index({ nextVisitDate: 1 });
TreatmentCourseSchema.methods.recalcPaymentStatus = async function () {
    const tc = this;
    tc.isPaymentCompleted = tc.totalPaid >= tc.totalCost;
    await tc.save();
};
TreatmentCourseSchema.statics.addPayment = async function (courseId, amount, session) {
    const update = { $inc: { totalPaid: amount } };
    const opts = { new: true };
    if (session)
        opts.session = session;
    const updated = await this.findByIdAndUpdate(courseId, update, opts);
    if (updated) {
        updated.isPaymentCompleted = updated.totalPaid >= updated.totalCost;
        await updated.save(opts);
    }
    return updated;
};
exports.TreatmentCourseModel = mongoose_1.default.model('TreatmentCourse', TreatmentCourseSchema);
