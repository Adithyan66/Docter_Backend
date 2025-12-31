"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
const base_entity_1 = require("./base.entity");
class Media extends base_entity_1.BaseEntity {
    constructor(id, doctorId, url, type, createdAt, updatedAt, patientId, courseId, visitId, clinicId, filename, mimeType, size, notes, isDeleted) {
        super(id, createdAt, updatedAt);
        this.doctorId = doctorId;
        this.url = url;
        this.type = type;
        this.patientId = patientId;
        this.courseId = courseId;
        this.visitId = visitId;
        this.clinicId = clinicId;
        this.filename = filename;
        this.mimeType = mimeType;
        this.size = size;
        this.notes = notes;
        this.isDeleted = isDeleted !== undefined ? isDeleted : false;
    }
    setNotes(notes) {
        this.notes = notes;
    }
    markDeleted() {
        this.isDeleted = true;
    }
    restore() {
        this.isDeleted = false;
    }
}
exports.Media = Media;
