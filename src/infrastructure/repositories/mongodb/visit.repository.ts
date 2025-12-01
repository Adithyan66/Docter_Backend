import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IVisitRepository, VisitSearchOptions, DailyActivitySearchOptions, DailyActivityAggregatedResult } from '../../../domain/repositories/visit.repository';
import { Visit } from '../../../domain/entities/visit.entity';
import { VisitModel, IVisit } from '../../database/mongoose/visit.model';

@injectable()
export class MongoVisitRepository implements IVisitRepository {
  async findById(id: string): Promise<Visit | null> {
    const doc = await VisitModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIdAndDoctor(id: string, doctorId: string): Promise<Visit | null> {
    const doc = await VisitModel.findOne({
      _id: id,
      doctor: new Types.ObjectId(doctorId),
      isDeleted: false,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<Visit[]> {
    const docs = await VisitModel.find({ isDeleted: false });
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: Visit, session?: any): Promise<Visit> {
    const doc = new VisitModel({
      doctor: new Types.ObjectId(entity.doctorId),
      patient: new Types.ObjectId(entity.patientId),
      course: new Types.ObjectId(entity.courseId),
      clinic: entity.clinicId ? new Types.ObjectId(entity.clinicId) : undefined,
      visitDate: entity.visitDate,
      notes: entity.notes,
      billedAmount: entity.billedAmount,
      media: entity.mediaIds.map((id) => new Types.ObjectId(id)),
      prescription: entity.prescriptionId ? new Types.ObjectId(entity.prescriptionId) : undefined,
      isDeleted: entity.isDeleted || false,
    });
    if (session) {
      await doc.save({ session });
    } else {
      await doc.save();
    }
    return this.toDomain(doc);
  }

  async update(id: string, entity: Partial<Visit>, session?: any): Promise<Visit | null> {
    const updateData: any = {};
    if (entity.doctorId !== undefined) updateData.doctor = new Types.ObjectId(entity.doctorId);
    if (entity.patientId !== undefined) updateData.patient = new Types.ObjectId(entity.patientId);
    if (entity.courseId !== undefined) updateData.course = new Types.ObjectId(entity.courseId);
    if (entity.clinicId !== undefined) updateData.clinic = entity.clinicId ? new Types.ObjectId(entity.clinicId) : null;
    if (entity.visitDate !== undefined) updateData.visitDate = entity.visitDate;
    if (entity.notes !== undefined) updateData.notes = entity.notes;
    if (entity.billedAmount !== undefined) updateData.billedAmount = entity.billedAmount;
    if (entity.mediaIds !== undefined) updateData.media = entity.mediaIds.map((id) => new Types.ObjectId(id));
    if (entity.prescriptionId !== undefined) updateData.prescription = entity.prescriptionId ? new Types.ObjectId(entity.prescriptionId) : null;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    await VisitModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      updateOptions
    );
    const doc = await VisitModel.findOne({ _id: id, isDeleted: false }).session(session || null);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string, session?: any): Promise<boolean> {
    const updateOptions: any = { new: true };
    if (session) {
      updateOptions.session = session;
    }

    const result = await VisitModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      updateOptions
    );
    return !!result;
  }

  async findPaginated(options: VisitSearchOptions): Promise<{
    visits: Visit[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page, limit, doctorId, patientId, courseId, clinicId, visitDateFrom, visitDateTo, notes, sortBy = 'visitDate', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const baseMatch: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
    };

    const andConditions: any[] = [baseMatch];

    if (patientId && Types.ObjectId.isValid(patientId)) {
      andConditions.push({ patient: new Types.ObjectId(patientId) });
    }

    if (courseId && Types.ObjectId.isValid(courseId)) {
      andConditions.push({ course: new Types.ObjectId(courseId) });
    }

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      andConditions.push({ clinic: new Types.ObjectId(clinicId) });
    }

    if (visitDateFrom || visitDateTo) {
      const dateFilter: any = {};
      if (visitDateFrom) dateFilter.$gte = visitDateFrom;
      if (visitDateTo) dateFilter.$lte = visitDateTo;
      andConditions.push({ visitDate: dateFilter });
    }

    if (notes && notes.trim().length > 0) {
      const regex = new RegExp(notes.trim(), 'i');
      andConditions.push({ notes: regex });
    }

    const matchStage = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const sortFieldMap: Record<string, string> = {
      visitDate: 'visitDate',
      createdAt: 'createdAt',
    };

    const sortField = sortFieldMap[sortBy] || 'visitDate';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { [sortField]: sortDirection, _id: sortDirection } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
      {
        $project: {
          visits: '$data',
          total: { $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0] },
        },
      },
    ];

    const result = await VisitModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        visits: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const visits = aggregationResult.visits.map((doc: any) => this.toDomainFromPlainObject(doc));

    return {
      visits,
      total,
      page,
      limit,
      totalPages,
    };
  }

  private toDomain(doc: IVisit): Visit {
    return new Visit(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.course ? doc.course.toString() : '',
      doc.visitDate,
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.notes,
      doc.billedAmount,
      doc.media ? doc.media.map((m) => m.toString()) : [],
      doc.prescription ? doc.prescription.toString() : undefined,
      doc.isDeleted || false
    );
  }

  private toDomainFromPlainObject(doc: any): Visit {
    const id = doc._id ? doc._id.toString() : '';
    return new Visit(
      id,
      doc.doctor ? doc.doctor.toString() : '',
      doc.patient ? doc.patient.toString() : '',
      doc.course ? doc.course.toString() : '',
      doc.visitDate || new Date(),
      doc.createdAt,
      doc.updatedAt,
      doc.clinic ? doc.clinic.toString() : undefined,
      doc.notes,
      doc.billedAmount || 0,
      doc.media ? doc.media.map((m: any) => m.toString()) : [],
      doc.prescription ? doc.prescription.toString() : undefined,
      doc.isDeleted || false
    );
  }

  async getDailyActivitiesAggregated(options: DailyActivitySearchOptions): Promise<DailyActivityAggregatedResult> {
    const { doctorId, date, page, limit, clinicId } = options;
    const skip = (page - 1) * limit;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const matchConditions: any = {
      isDeleted: false,
      doctor: new Types.ObjectId(doctorId),
      visitDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };

    if (clinicId && Types.ObjectId.isValid(clinicId)) {
      matchConditions.clinic = new Types.ObjectId(clinicId);
    }

    const pipeline: PipelineStage[] = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientData',
        },
      },
      {
        $lookup: {
          from: 'treatmentcourses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData',
        },
      },
      {
        $lookup: {
          from: 'treatments',
          let: { treatmentId: { $arrayElemAt: ['$courseData.treatment', 0] } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$treatmentId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
          ],
          as: 'treatmentData',
        },
      },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinic',
          foreignField: '_id',
          as: 'clinicData',
        },
      },
      {
        $addFields: {
          patientName: {
            $ifNull: [
              { $arrayElemAt: ['$patientData.fullName', 0] },
              'Unknown',
            ],
          },
          treatmentName: {
            $ifNull: [
              { $arrayElemAt: ['$treatmentData.name', 0] },
              'Unknown',
            ],
          },
          amountPaid: {
            $ifNull: ['$billedAmount', 0],
          },
          clinicName: {
            $ifNull: [
              { $arrayElemAt: ['$clinicData.name', 0] },
              null,
            ],
          },
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalPatientsVisited: {
                  $addToSet: { $toString: '$patient' },
                },
                totalVisits: { $sum: 1 },
                totalAmount: { $sum: '$amountPaid' },
                visitStartTime: { $min: '$visitDate' },
                visitEndTime: { $max: '$visitDate' },
                clinicNames: {
                  $addToSet: '$clinicName',
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalPatientsVisited: { $size: '$totalPatientsVisited' },
                totalVisits: 1,
                totalAmount: 1,
                averageAmountPerVisit: {
                  $cond: [
                    { $eq: ['$totalVisits', 0] },
                    0,
                    { $divide: ['$totalAmount', '$totalVisits'] },
                  ],
                },
                visitStartTime: 1,
                visitEndTime: 1,
                totalHoursWorked: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$visitStartTime', null] },
                        { $ne: ['$visitEndTime', null] },
                      ],
                    },
                    {
                      $divide: [
                        { $subtract: ['$visitEndTime', '$visitStartTime'] },
                        3600000,
                      ],
                    },
                    0,
                  ],
                },
                clinicNames: {
                  $filter: {
                    input: '$clinicNames',
                    as: 'clinic',
                    cond: { $ne: ['$$clinic', null] },
                  },
                },
              },
            },
          ],
          activities: [
            { $sort: { visitDate: 1, _id: 1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                visitId: { $toString: '$_id' },
                visitTime: '$visitDate',
                patientId: { $toString: '$patient' },
                patientName: 1,
                courseId: { $toString: '$course' },
                treatmentName: 1,
                amountPaid: 1,
                clinicId: {
                  $cond: [
                    { $ne: ['$clinic', null] },
                    { $toString: '$clinic' },
                    null,
                  ],
                },
                clinicName: 1,
              },
            },
          ],
          totalCount: [{ $count: 'total' }],
        },
      },
      {
        $project: {
          summary: {
            $ifNull: [{ $arrayElemAt: ['$summary', 0] }, {
              totalPatientsVisited: 0,
              totalVisits: 0,
              totalAmount: 0,
              averageAmountPerVisit: 0,
              visitStartTime: null,
              visitEndTime: null,
              totalHoursWorked: 0,
              clinicNames: [],
            }],
          },
          activities: 1,
          total: {
            $ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0],
          },
        },
      },
    ];

    const result = await VisitModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        summary: {
          totalPatientsVisited: 0,
          totalVisits: 0,
          totalAmount: 0,
          averageAmountPerVisit: 0,
          visitStartTime: null,
          visitEndTime: null,
          totalHoursWorked: 0,
          clinicNames: [],
        },
        activities: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const summary = aggregationResult.summary || {
      totalPatientsVisited: 0,
      totalVisits: 0,
      totalAmount: 0,
      averageAmountPerVisit: 0,
      visitStartTime: null,
      visitEndTime: null,
      totalHoursWorked: 0,
      clinicNames: [],
    };

    if (summary.clinicNames && Array.isArray(summary.clinicNames)) {
      summary.clinicNames.sort();
    } else {
      summary.clinicNames = [];
    }

    return {
      summary,
      activities: aggregationResult.activities || [],
      total,
      page,
      limit,
      totalPages,
    };
  }

  async markDeletedByPatientId(patientId: string, doctorId: string, session?: any): Promise<number> {
    const result = await VisitModel.updateMany(
      {
        patient: new Types.ObjectId(patientId),
        doctor: new Types.ObjectId(doctorId),
        isDeleted: false,
      },
      {
        isDeleted: true,
      },
      { session }
    );
    return result.modifiedCount;
  }

  async markRestoredByPatientId(patientId: string, doctorId: string, session?: any): Promise<number> {
    const result = await VisitModel.updateMany(
      {
        patient: new Types.ObjectId(patientId),
        doctor: new Types.ObjectId(doctorId),
        isDeleted: true,
      },
      {
        isDeleted: false,
      },
      { session }
    );
    return result.modifiedCount;
  }
}

