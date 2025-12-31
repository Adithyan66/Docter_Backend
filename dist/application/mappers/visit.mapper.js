"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitToDto = void 0;
const prescription_mapper_1 = require("./prescription.mapper");
const media_mapper_1 = require("./media.mapper");
const visitToDto = (visit, prescription, media) => {
    const dto = {
        id: visit.id,
        doctorId: visit.doctorId,
        patientId: visit.patientId,
        courseId: visit.courseId,
        clinicId: visit.clinicId,
        visitDate: visit.visitDate,
        notes: visit.notes,
        billedAmount: visit.billedAmount,
        mediaIds: visit.mediaIds || [],
        prescriptionId: visit.prescriptionId,
        isDeleted: visit.isDeleted,
        createdAt: visit.createdAt,
        updatedAt: visit.updatedAt,
    };
    if (prescription !== undefined) {
        dto.prescription = prescription ? (0, prescription_mapper_1.prescriptionToDto)(prescription) : null;
    }
    if (media !== undefined) {
        dto.media = media.map(media_mapper_1.mediaToDto);
    }
    return dto;
};
exports.visitToDto = visitToDto;
