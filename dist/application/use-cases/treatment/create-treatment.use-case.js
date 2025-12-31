"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTreatmentUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const treatment_entity_1 = require("../../../domain/entities/treatment.entity");
const validation_error_1 = require("../../../domain/errors/validation.error");
const conflict_error_1 = require("../../../domain/errors/conflict.error");
let CreateTreatmentUseCase = class CreateTreatmentUseCase {
    constructor(treatmentRepository) {
        this.treatmentRepository = treatmentRepository;
    }
    async execute(doctorId, input) {
        const trimmedInput = {
            ...input,
            name: input.name.trim(),
        };
        this.validateInput(trimmedInput);
        this.validateVisitType(trimmedInput);
        const existingTreatment = await this.treatmentRepository.findByName(trimmedInput.name, doctorId);
        if (existingTreatment) {
            throw new conflict_error_1.ConflictError(`Treatment with name "${trimmedInput.name}" already exists`);
        }
        const treatment = new treatment_entity_1.Treatment('', doctorId, trimmedInput.name, undefined, undefined, trimmedInput.description, trimmedInput.minDuration, trimmedInput.maxDuration, trimmedInput.avgDuration, trimmedInput.minFees, trimmedInput.maxFees, trimmedInput.avgFees, trimmedInput.steps, trimmedInput.aftercare, trimmedInput.followUpRequired, trimmedInput.followUpAfterDays, trimmedInput.risks, trimmedInput.images, trimmedInput.isOneTime, trimmedInput.regularVisitInterval);
        await this.treatmentRepository.create(treatment);
    }
    validateInput(input) {
        if (!input.name || input.name.trim().length === 0) {
            throw new validation_error_1.ValidationError('Name is required');
        }
        const MIN_DURATION_MONTHS = 0;
        const MAX_DURATION_MONTHS = 120;
        const MIN_FEES = 0;
        const MAX_FEES = 1000000;
        if (input.minDuration !== undefined) {
            if (input.minDuration < MIN_DURATION_MONTHS || input.minDuration > MAX_DURATION_MONTHS) {
                throw new validation_error_1.ValidationError(`minDuration must be between ${MIN_DURATION_MONTHS} and ${MAX_DURATION_MONTHS} months`);
            }
        }
        if (input.maxDuration !== undefined) {
            if (input.maxDuration < MIN_DURATION_MONTHS || input.maxDuration > MAX_DURATION_MONTHS) {
                throw new validation_error_1.ValidationError(`maxDuration must be between ${MIN_DURATION_MONTHS} and ${MAX_DURATION_MONTHS} months`);
            }
        }
        if (input.avgDuration !== undefined) {
            if (input.avgDuration < MIN_DURATION_MONTHS || input.avgDuration > MAX_DURATION_MONTHS) {
                throw new validation_error_1.ValidationError(`avgDuration must be between ${MIN_DURATION_MONTHS} and ${MAX_DURATION_MONTHS} months`);
            }
        }
        if (input.minDuration !== undefined && input.maxDuration !== undefined) {
            if (input.minDuration > input.maxDuration) {
                throw new validation_error_1.ValidationError('minDuration must be less than or equal to maxDuration');
            }
        }
        if (input.minFees !== undefined) {
            if (input.minFees < MIN_FEES) {
                throw new validation_error_1.ValidationError(`minFees must be at least ${MIN_FEES}`);
            }
            if (input.minFees > MAX_FEES) {
                throw new validation_error_1.ValidationError(`minFees must not exceed ${MAX_FEES} (10 lakh)`);
            }
        }
        if (input.maxFees !== undefined) {
            if (input.maxFees < MIN_FEES) {
                throw new validation_error_1.ValidationError(`maxFees must be at least ${MIN_FEES}`);
            }
            if (input.maxFees > MAX_FEES) {
                throw new validation_error_1.ValidationError(`maxFees must not exceed ${MAX_FEES} (10 lakh)`);
            }
        }
        if (input.minFees !== undefined && input.maxFees !== undefined) {
            if (input.minFees > input.maxFees) {
                throw new validation_error_1.ValidationError('minFees must be less than or equal to maxFees');
            }
        }
        if (input.avgDuration !== undefined) {
            if (input.minDuration !== undefined && input.avgDuration < input.minDuration) {
                throw new validation_error_1.ValidationError('avgDuration must be greater than or equal to minDuration');
            }
            if (input.maxDuration !== undefined && input.avgDuration > input.maxDuration) {
                throw new validation_error_1.ValidationError('avgDuration must be less than or equal to maxDuration');
            }
        }
        if (input.avgFees !== undefined) {
            if (input.avgFees < MIN_FEES) {
                throw new validation_error_1.ValidationError(`avgFees must be at least ${MIN_FEES}`);
            }
            if (input.avgFees > MAX_FEES) {
                throw new validation_error_1.ValidationError(`avgFees must not exceed ${MAX_FEES} (10 lakh)`);
            }
            if (input.minFees !== undefined && input.avgFees < input.minFees) {
                throw new validation_error_1.ValidationError('avgFees must be greater than or equal to minFees');
            }
            if (input.maxFees !== undefined && input.avgFees > input.maxFees) {
                throw new validation_error_1.ValidationError('avgFees must be less than or equal to maxFees');
            }
        }
    }
    validateVisitType(input) {
        if (input.isOneTime === true && input.regularVisitInterval !== undefined && input.regularVisitInterval !== null) {
            throw new validation_error_1.ValidationError('Cannot set regularVisitInterval when isOneTime is true');
        }
        if (input.regularVisitInterval !== undefined && input.regularVisitInterval !== null) {
            if (input.regularVisitInterval.interval <= 0) {
                throw new validation_error_1.ValidationError('regularVisitInterval.interval must be a positive number');
            }
            const validUnits = ['days', 'weeks', 'months', 'years'];
            if (!input.regularVisitInterval.unit || !validUnits.includes(input.regularVisitInterval.unit)) {
                throw new validation_error_1.ValidationError(`regularVisitInterval.unit must be one of: ${validUnits.join(', ')}`);
            }
        }
    }
};
exports.CreateTreatmentUseCase = CreateTreatmentUseCase;
exports.CreateTreatmentUseCase = CreateTreatmentUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITreatmentRepository')),
    __metadata("design:paramtypes", [Object])
], CreateTreatmentUseCase);
