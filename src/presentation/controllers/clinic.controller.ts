import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreateClinicUseCase } from '../../application/use-cases/clinic/create-clinic.use-case';
import { UpdateClinicUseCase } from '../../application/use-cases/clinic/update-clinic.use-case';
import { DeleteClinicUseCase } from '../../application/use-cases/clinic/delete-clinic.use-case';
import { GetClinicUseCase } from '../../application/use-cases/clinic/get-clinic.use-case';
import { GetAllClinicsUseCase } from '../../application/use-cases/clinic/get-all-clinics.use-case';
import { GetClinicNamesUseCase } from '../../application/use-cases/clinic/get-clinic-names.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import { CreateClinicRequestDto, UpdateClinicRequestDto, ClinicResponseDto, PaginatedClinicsResponseDto } from '../dto/clinic.dto';
import { Clinic } from '../../domain/entities/clinic.entity';

@injectable()
export class ClinicController {
  constructor(
    @inject('CreateClinicUseCase') private readonly createClinicUseCase: CreateClinicUseCase,
    @inject('UpdateClinicUseCase') private readonly updateClinicUseCase: UpdateClinicUseCase,
    @inject('DeleteClinicUseCase') private readonly deleteClinicUseCase: DeleteClinicUseCase,
    @inject('GetClinicUseCase') private readonly getClinicUseCase: GetClinicUseCase,
    @inject('GetAllClinicsUseCase') private readonly getAllClinicsUseCase: GetAllClinicsUseCase,
    @inject('GetClinicNamesUseCase') private readonly getClinicNamesUseCase: GetClinicNamesUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const input = req.body as CreateClinicRequestDto;
    await this.createClinicUseCase.execute(input);
    
    successResponse(res, null, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async update(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const input = req.body as UpdateClinicRequestDto;
    await this.updateClinicUseCase.execute(id, input);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.UPDATED);
  }

  async delete(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    await this.deleteClinicUseCase.execute(id);
    
    successResponse(res, null, HttpStatus.OK, SuccessMessages.DELETED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Clinic ID is required');
    }

    const clinic = await this.getClinicUseCase.execute(id);
    const response: ClinicResponseDto = this.toResponseDto(clinic);
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 10;
    const search = req.query.search as string | undefined;

    const result = await this.getAllClinicsUseCase.execute(page, limit, search);
    const response: PaginatedClinicsResponseDto = {
      clinics: result.clinics.map(c => this.toResponseDto(c)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
    
    successResponse(res, response, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getNames(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const search = req.query.search ? String(req.query.search) : undefined;
    const names = await this.getClinicNamesUseCase.execute(search);
    successResponse(res, names, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  private toResponseDto(clinic: Clinic): ClinicResponseDto {
    return {
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      city: clinic.city,
      state: clinic.state,
      pincode: clinic.pincode,
      phone: clinic.phone,
      email: clinic.email?.toString(),
      website: clinic.website,
      locationUrl: clinic.locationUrl,
      workingDays: clinic.workingDays?.map(wd => wd.toJSON()),
      treatments: clinic.populatedTreatments || undefined,
      images: clinic.images,
      notes: clinic.notes,
      isActive: clinic.isActive,
      isDeleted: clinic.isDeleted,
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    };
  }
}

