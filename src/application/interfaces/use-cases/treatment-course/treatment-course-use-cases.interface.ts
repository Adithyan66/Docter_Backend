import {
  CreateTreatmentCourseRequestDto,
  UpdateTreatmentCourseRequestDto,
  TreatmentCourseResponseDto,
  GetTreatmentCoursesQueryDto,
  PaginatedTreatmentCoursesResponseDto,
} from '../../../../presentation/dto/treatment-course.dto';

export {
  CreateTreatmentCourseRequestDto,
  UpdateTreatmentCourseRequestDto,
  TreatmentCourseResponseDto,
  GetTreatmentCoursesQueryDto,
  PaginatedTreatmentCoursesResponseDto,
};

export interface ICreateTreatmentCourseUseCase {
  execute(doctorId: string, input: CreateTreatmentCourseRequestDto): Promise<TreatmentCourseResponseDto>;
}

export interface IUpdateTreatmentCourseUseCase {
  execute(id: string, doctorId: string, input: UpdateTreatmentCourseRequestDto): Promise<TreatmentCourseResponseDto>;
}

export interface IDeleteTreatmentCourseUseCase {
  execute(id: string, doctorId: string): Promise<void>;
}

export interface IGetTreatmentCourseUseCase {
  execute(id: string, doctorId: string): Promise<TreatmentCourseResponseDto>;
}

export interface IGetAllTreatmentCoursesUseCase {
  execute(doctorId: string, input: GetTreatmentCoursesQueryDto): Promise<PaginatedTreatmentCoursesResponseDto>;
}
