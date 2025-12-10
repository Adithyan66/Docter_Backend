export interface CreateStaffRequestDto {
  username: string;
  password: string;
  clinicId: string;
}

export interface UpdateStaffRequestDto {
  username?: string;
  password?: string;
  clinicId?: string;
  isActive?: boolean;
}

export interface StaffResponseDto {
  id: string;
  username: string;
  clinicId: string;
  clinicName?: string;
  doctorId: string;
  role: 'staff';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaginatedStaffResponseDto {
  staff: StaffResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


