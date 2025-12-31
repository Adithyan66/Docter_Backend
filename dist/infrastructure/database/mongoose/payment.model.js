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
exports.PaymentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const PaymentSchema = new mongoose_1.Schema({
    doctor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patient: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    course: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TreatmentCourse', required: true },
    visit: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Visit' },
    clinic: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Clinic' },
    amount: { type: Number, required: true, min: 0 },
    method: {
        type: String,
        enum: ['cash', 'card', 'upi', 'bank', 'insurance', 'online'],
        default: 'cash',
    },
    reference: { type: String },
    paidAt: { type: Date, default: Date.now },
    refunded: { type: Boolean, default: false },
    refundDetails: {
        refundedAt: { type: Date },
        refundReason: { type: String },
        refundAmount: { type: Number },
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
PaymentSchema.index({ doctor: 1, clinic: 1, paidAt: -1 });
PaymentSchema.index({ doctor: 1, patient: 1 });
PaymentSchema.index({ course: 1 });
PaymentSchema.index({ isDeleted: 1, createdAt: -1 });
exports.PaymentModel = mongoose_1.default.model('Payment', PaymentSchema);
