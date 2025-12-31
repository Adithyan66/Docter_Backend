"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prescriptionToDto = void 0;
const prescriptionToDto = (prescription) => ({
    id: prescription.id,
    doctorId: prescription.doctor,
    patientId: prescription.patient,
    visitId: prescription.visit,
    clinicId: prescription.clinic,
    diagnosis: prescription.diagnosis || [],
    items: prescription.items || [],
    notes: prescription.notes,
    createdAt: prescription.createdAt,
    updatedAt: prescription.updatedAt,
});
exports.prescriptionToDto = prescriptionToDto;
