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
exports.LoginUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const not_found_error_1 = require("../../../domain/errors/not-found.error");
const validation_error_1 = require("../../../domain/errors/validation.error");
const error_messages_1 = require("../../../infrastructure/constants/error-messages");
let LoginUseCase = class LoginUseCase {
    constructor(doctorRepository, staffRepository, clinicRepository, passwordService, jwtService) {
        this.doctorRepository = doctorRepository;
        this.staffRepository = staffRepository;
        this.clinicRepository = clinicRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }
    async execute(params) {
        const role = params.role || 'doctor';
        if (role === 'staff') {
            if (!params.username) {
                throw new validation_error_1.ValidationError('username is required for staff login');
            }
            const staff = await this.staffRepository.findByUsername(params.username);
            if (!staff) {
                throw new not_found_error_1.NotFoundError('Staff');
            }
            if (!staff.isActive) {
                throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_CREDENTIALS);
            }
            const isPasswordValid = await this.passwordService.compare(params.password, staff.password);
            if (!isPasswordValid) {
                throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_CREDENTIALS);
            }
            const clinic = staff.clinicId ? await this.clinicRepository.findById(staff.clinicId) : null;
            const clinicName = clinic?.name;
            const payload = {
                id: staff.id,
                email: staff.username,
                role: 'staff',
                clinicId: staff.clinicId,
                doctorId: staff.doctorId,
            };
            const accessToken = this.jwtService.generateAccessToken(payload);
            const refreshToken = this.jwtService.generateRefreshToken(payload);
            await this.staffRepository.updateRefreshToken(staff.id, refreshToken);
            return {
                accessToken,
                refreshToken,
                user: {
                    id: staff.id,
                    email: staff.username,
                    role: 'staff',
                    clinicId: staff.clinicId,
                    doctorId: staff.doctorId,
                    clinicName,
                },
            };
        }
        if (!params.email) {
            throw new validation_error_1.ValidationError('email is required for doctor login');
        }
        const doctor = await this.doctorRepository.findByEmail(params.email);
        if (!doctor) {
            throw new not_found_error_1.NotFoundError('Doctor');
        }
        const isPasswordValid = await this.passwordService.compare(params.password, doctor.password);
        if (!isPasswordValid) {
            throw new validation_error_1.ValidationError(error_messages_1.AuthenticationErrors.INVALID_CREDENTIALS);
        }
        const payload = {
            id: doctor.id,
            email: doctor.email.toString(),
            role: 'doctor',
        };
        const accessToken = this.jwtService.generateAccessToken(payload);
        const refreshToken = this.jwtService.generateRefreshToken(payload);
        await this.doctorRepository.updateRefreshToken(doctor.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: {
                id: doctor.id,
                email: doctor.email.toString(),
                role: 'doctor',
            },
        };
    }
};
exports.LoginUseCase = LoginUseCase;
exports.LoginUseCase = LoginUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IDoctorRepository')),
    __param(1, (0, tsyringe_1.inject)('IStaffRepository')),
    __param(2, (0, tsyringe_1.inject)('IClinicRepository')),
    __param(3, (0, tsyringe_1.inject)('IPasswordService')),
    __param(4, (0, tsyringe_1.inject)('IJwtService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], LoginUseCase);
