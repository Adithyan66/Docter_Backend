"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treatmentCourseToDto = void 0;
const treatmentCourseToDto = (treatmentCourse) => ({
    id: treatmentCourse.id,
    doctorId: treatmentCourse.doctorId,
    patientId: treatmentCourse.patientId,
    clinicId: treatmentCourse.clinicId,
    treatmentId: treatmentCourse.treatmentId,
    startDate: treatmentCourse.startDate,
    expectedEndDate: treatmentCourse.expectedEndDate,
    lastVisitDate: treatmentCourse.lastVisitDate,
    nextVisitDate: treatmentCourse.nextVisitDate,
    totalCost: treatmentCourse.totalCost,
    totalPaid: treatmentCourse.totalPaid,
    remaining: treatmentCourse.remaining,
    isPaymentCompleted: treatmentCourse.isPaymentCompleted,
    isMedicallyCompleted: treatmentCourse.isMedicallyCompleted,
    status: treatmentCourse.status,
    notes: treatmentCourse.notes,
    visits: treatmentCourse.visits || [],
    payments: treatmentCourse.payments || [],
    isDeleted: treatmentCourse.isDeleted,
    createdAt: treatmentCourse.createdAt,
    updatedAt: treatmentCourse.updatedAt,
});
exports.treatmentCourseToDto = treatmentCourseToDto;
