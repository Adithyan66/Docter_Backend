import { BaseRepository } from './base.repository';
import { Visit } from '../entities/visit.entity';

export interface VisitSearchOptions {
  doctorId: string;
  page: number;
  limit: number;
  patientId?: string;
  courseId?: string;
  clinicId?: string;
  visitDateFrom?: Date;
  visitDateTo?: Date;
  notes?: string;
  sortBy?: 'visitDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface DailyActivityAggregatedResult {
  summary: {
    totalPatientsVisited: number;
    totalVisits: number;
    totalAmount: number;
    averageAmountPerVisit: number;
    visitStartTime: Date | null;
    visitEndTime: Date | null;
    totalHoursWorked: number;
    clinicNames: string[];
  };
  activities: Array<{
    visitId: string;
    visitTime: Date;
    patientId: string;
    patientName: string;
    courseId: string;
    treatmentName: string;
    amountPaid: number;
    clinicId?: string | null;
    clinicName?: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DailyActivitySearchOptions {
  doctorId: string;
  date: Date;
  page: number;
  limit: number;
  clinicId?: string;
}

export interface IVisitRepository extends BaseRepository<Visit> {
  findByIdAndDoctor(id: string, doctorId: string): Promise<Visit | null>;
  findPaginated(options: VisitSearchOptions): Promise<{
    visits: Visit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  getDailyActivitiesAggregated(options: DailyActivitySearchOptions): Promise<DailyActivityAggregatedResult>;
  markDeletedByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
  markRestoredByPatientId(patientId: string, doctorId: string, session?: any): Promise<number>;
}

