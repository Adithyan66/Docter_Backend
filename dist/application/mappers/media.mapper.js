"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaToDto = void 0;
const mediaToDto = (media) => ({
    id: media.id,
    doctorId: media.doctorId,
    patientId: media.patientId,
    courseId: media.courseId,
    visitId: media.visitId,
    clinicId: media.clinicId,
    url: media.url,
    filename: media.filename,
    mimeType: media.mimeType,
    size: media.size,
    type: media.type,
    notes: media.notes,
    isDeleted: media.isDeleted,
    createdAt: media.createdAt,
    updatedAt: media.updatedAt,
});
exports.mediaToDto = mediaToDto;
