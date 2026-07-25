export interface IPatientCascade {
  softDelete(patientId: string, doctorId: string): Promise<void>;
  restore(patientId: string, doctorId: string): Promise<void>;
}
