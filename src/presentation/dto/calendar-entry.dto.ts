export interface AppointmentDto {
  patientId: string;
  treatmentId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  completed?: boolean;
}

export interface CreateCalendarEntryRequestDto {
  date: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  appointments?: AppointmentDto[];
}

export interface UpdateCalendarEntryRequestDto {
  date?: string;
  clinicId?: string;
  startTime?: string;
  endTime?: string;
  notes?: string;
  appointments?: AppointmentDto[];
}

export interface CalendarEntryResponseDto {
  id: string;
  doctorId: string;
  date: Date;
  clinicId: string;
  clinic?: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  notes?: string;
  appointments: Array<{
    patientId: string;
    patient?: {
      id: string;
      fullName: string;
      mobile?: string;
    };
    treatmentId?: string;
    treatment?: {
      id: string;
      name: string;
    };
    startTime?: string;
    endTime?: string;
    notes?: string;
    completed: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEntryByDateResponseDto {
  date: string;
  entries: Array<{
    id: string;
    clinic: {
      id: string;
      name: string;
    };
    startTime: string;
    endTime: string;
    notes?: string;
    appointments: Array<{
      patientId: string;
      patient: {
        id: string;
        fullName: string;
        mobile?: string;
      };
      treatmentId?: string;
      treatment?: {
        id: string;
        name: string;
      };
      startTime?: string;
      endTime?: string;
      notes?: string;
      completed?: boolean;
    }>;
  }>;
}

export interface CalendarEntryListDto {
  id: string;
  date: Date;
  clinicId: string;
  clinicName?: string;
  startTime: string;
  endTime: string;
  appointmentCount: number;
}

export interface PaginatedCalendarEntriesResponseDto {
  entries: CalendarEntryListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

