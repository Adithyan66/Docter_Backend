import { injectable, inject } from 'tsyringe';
import { HttpRequest, HttpResponse, HttpNext } from '../interfaces';
import { IPaymentController } from '../interfaces/controllers/payment-controller.interface';
import { successResponse, HttpStatus, SuccessMessages } from '../../infrastructure/constants';
import { CreatePaymentUseCase } from '../../application/use-cases/payment/create-payment.use-case';
import { GetPaymentUseCase } from '../../application/use-cases/payment/get-payment.use-case';
import { GetAllPaymentsUseCase } from '../../application/use-cases/payment/get-all-payments.use-case';
import { RefundPaymentUseCase } from '../../application/use-cases/payment/refund-payment.use-case';
import { ValidationError } from '../../domain/errors/validation.error';
import {
  CreatePaymentRequestDto,
  PaymentResponseDto,
  GetPaymentsQueryDto,
  PaginatedPaymentsResponseDto,
  RefundPaymentRequestDto,
} from '../dto/payment.dto';
import { getUserId, getUserContext } from '../utils/user-context.util';

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject('CreatePaymentUseCase') private readonly createPaymentUseCase: CreatePaymentUseCase,
    @inject('GetPaymentUseCase') private readonly getPaymentUseCase: GetPaymentUseCase,
    @inject('GetAllPaymentsUseCase') private readonly getAllPaymentsUseCase: GetAllPaymentsUseCase,
    @inject('RefundPaymentUseCase') private readonly refundPaymentUseCase: RefundPaymentUseCase
  ) {}

  async create(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as CreatePaymentRequestDto;
    const payment = await this.createPaymentUseCase.execute(doctorId, input);

    successResponse(res, payment, HttpStatus.CREATED, SuccessMessages.CREATED);
  }

  async getById(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Payment ID is required');
    }

    const doctorId = getUserId(req);
    const payment = await this.getPaymentUseCase.execute(id, doctorId);

    successResponse(res, payment, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async getAll(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    const context = getUserContext(req);
    const query: GetPaymentsQueryDto = {
      page: req.query.page ? parseInt(String(req.query.page), 10) : undefined,
      limit: req.query.limit ? parseInt(String(req.query.limit), 10) : undefined,
      patientId: req.query.patientId ? String(req.query.patientId) : undefined,
      courseId: req.query.courseId ? String(req.query.courseId) : undefined,
      clinicId: req.query.clinicId ? String(req.query.clinicId) : undefined,
      visitId: req.query.visitId ? String(req.query.visitId) : undefined,
      dateFrom: req.query.dateFrom ? String(req.query.dateFrom) : undefined,
      dateTo: req.query.dateTo ? String(req.query.dateTo) : undefined,
      method: req.query.method as any,
      refunded: req.query.refunded ? req.query.refunded === 'true' : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    };

    if (context.role === 'staff' && context.clinicId) {
      query.clinicId = context.clinicId;
    }

    const result = await this.getAllPaymentsUseCase.execute(context.doctorId, query);

    successResponse(res, result, HttpStatus.OK, SuccessMessages.RETRIEVED);
  }

  async refund(req: HttpRequest, res: HttpResponse, next?: HttpNext): Promise<void> {
    if (!req.body || typeof req.body !== 'object') {
      throw new ValidationError('Request body is required');
    }

    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Payment ID is required');
    }

    const doctorId = getUserId(req);
    const input = req.body as RefundPaymentRequestDto;
    const payment = await this.refundPaymentUseCase.execute(id, doctorId, input);

    successResponse(res, payment, HttpStatus.OK, SuccessMessages.UPDATED);
  }
}

