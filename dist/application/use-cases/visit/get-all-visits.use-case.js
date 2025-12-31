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
exports.GetAllVisitsUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const validation_error_1 = require("../../../domain/errors/validation.error");
const visit_mapper_1 = require("../../mappers/visit.mapper");
let GetAllVisitsUseCase = class GetAllVisitsUseCase {
    constructor(visitRepository, prescriptionRepository, mediaRepository) {
        this.visitRepository = visitRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.mediaRepository = mediaRepository;
    }
    async execute(doctorId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const visitDateFrom = query.visitDateFrom ? new Date(query.visitDateFrom) : undefined;
        const visitDateTo = query.visitDateTo ? new Date(query.visitDateTo) : undefined;
        if (visitDateFrom && isNaN(visitDateFrom.getTime())) {
            throw new validation_error_1.ValidationError('Invalid visitDateFrom format');
        }
        if (visitDateTo && isNaN(visitDateTo.getTime())) {
            throw new validation_error_1.ValidationError('Invalid visitDateTo format');
        }
        const result = await this.visitRepository.findPaginated({
            doctorId,
            page,
            limit,
            patientId: query.patientId,
            courseId: query.courseId,
            clinicId: query.clinicId,
            visitDateFrom,
            visitDateTo,
            notes: query.notes,
            sortBy: query.sortBy || 'visitDate',
            sortOrder: query.sortOrder || 'desc',
        });
        const includeOptions = this.parseIncludeOptions(query.include);
        const prescriptionIds = includeOptions.prescription
            ? result.visits.map((v) => v.prescriptionId).filter((id) => !!id)
            : [];
        const visitIds = includeOptions.media
            ? result.visits.map((v) => v.id)
            : [];
        const prescriptionsMap = new Map();
        if (includeOptions.prescription && prescriptionIds.length > 0) {
            const prescriptions = await Promise.all(prescriptionIds.map(async (id) => {
                try {
                    const prescription = await this.prescriptionRepository.findById(id);
                    return prescription ? { id, prescription } : null;
                }
                catch (error) {
                    return null;
                }
            }));
            prescriptions.forEach((item) => {
                if (item) {
                    prescriptionsMap.set(item.id, item.prescription);
                }
            });
        }
        const mediaMap = new Map();
        if (includeOptions.media && visitIds.length > 0) {
            try {
                const allMedia = await this.mediaRepository.findAll();
                visitIds.forEach((visitId) => {
                    const visitMedia = allMedia.filter((m) => m.visitId === visitId && !m.isDeleted);
                    mediaMap.set(visitId, visitMedia);
                });
            }
            catch (error) {
                visitIds.forEach((visitId) => {
                    mediaMap.set(visitId, []);
                });
            }
        }
        const visits = result.visits.map((visit) => {
            const prescription = includeOptions.prescription && visit.prescriptionId
                ? prescriptionsMap.get(visit.prescriptionId) || null
                : undefined;
            const media = includeOptions.media
                ? mediaMap.get(visit.id) || []
                : undefined;
            return (0, visit_mapper_1.visitToDto)(visit, prescription, media);
        });
        return {
            visits,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        };
    }
    parseIncludeOptions(include) {
        if (!include) {
            return { prescription: false, media: false };
        }
        const options = include.split(',').map((opt) => opt.trim().toLowerCase());
        return {
            prescription: options.includes('prescription'),
            media: options.includes('media'),
        };
    }
};
exports.GetAllVisitsUseCase = GetAllVisitsUseCase;
exports.GetAllVisitsUseCase = GetAllVisitsUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVisitRepository')),
    __param(1, (0, tsyringe_1.inject)('IPrescriptionRepository')),
    __param(2, (0, tsyringe_1.inject)('IMediaRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], GetAllVisitsUseCase);
