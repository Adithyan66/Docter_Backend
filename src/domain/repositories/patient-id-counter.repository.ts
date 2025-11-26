export interface IPatientIdCounterRepository {
  getNextSequence(clinicCode: string): Promise<number>;
}


