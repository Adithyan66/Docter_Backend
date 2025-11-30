import { injectable } from 'tsyringe';
import { PipelineStage, Types } from 'mongoose';
import { IClinicRepository, FindAllPaginatedOptions, ClinicListResult, ClinicStatisticsOptions, ClinicStatistics } from '../../../domain/repositories/clinic.repository';
import { Clinic } from '../../../domain/entities/clinic.entity';
import { ClinicModel, IClinic } from '../../database/mongoose/clinic.model';
import { TreatmentCourseModel } from '../../database/mongoose/treatment-course.model';
import { Email } from '../../../domain/value-objects/email.vo';
import { WorkingDay } from '../../../domain/value-objects/working-day.vo';

@injectable()
export class MongoClinicRepository implements IClinicRepository {
  async findById(id: string): Promise<Clinic | null> {
    const clinicDoc = await ClinicModel.findOne({ _id: id, isDeleted: false }).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async findAll(): Promise<Clinic[]> {
    const clinicDocs = await ClinicModel.find({ isDeleted: false }).populate('treatments', 'name');
    return clinicDocs.map((doc) => this.toDomain(doc));
  }

  async findByName(name: string, doctorId: string): Promise<Clinic | null> {
    const clinicDoc = await ClinicModel.findOne({ name: name.trim(), doctor: new Types.ObjectId(doctorId), isDeleted: false }).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async findByClinicId(clinicId: string, doctorId: string): Promise<Clinic | null> {
    const clinicDoc = await ClinicModel.findOne({ clinicId: clinicId.toUpperCase(), doctor: new Types.ObjectId(doctorId), isDeleted: false }).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async findNames(doctorId: string, search?: string): Promise<Array<{ id: string; name: string }>> {
    const filter: any = { isDeleted: false, doctor: new Types.ObjectId(doctorId) };
    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { city: regex }];
    }

    const documents = await ClinicModel.find(filter).sort({ name: 1 }).select({ name: 1 });
    return documents.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
    }));
  }

  async findAllPaginated(options: FindAllPaginatedOptions): Promise<{ clinics: ClinicListResult[]; total: number; page: number; limit: number; totalPages: number }> {
    const { page, limit, search, doctorId, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;
    const doctorObjectId = new Types.ObjectId(doctorId);

    const matchStage: any = { isDeleted: false, doctor: doctorObjectId };

    if (search && search.trim().length > 0) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      matchStage.$or = [
        { name: searchRegex },
        { city: searchRegex },
      ];
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortField = sortBy === 'createdAt' ? 'createdAt' : sortBy;

    const pipeline: PipelineStage[] = [
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: 'treatmentcourses',
          let: { clinicId: '$_id', doctorId: '$doctor' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$doctor', '$$doctorId'] },
                    { $eq: ['$clinic', '$$clinicId'] },
                    { $ne: ['$clinic', null] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
          ],
          as: 'treatmentCourses',
        },
      },
      {
        $addFields: {
          patientIds: {
            $map: {
              input: { $ifNull: ['$treatmentCourses', []] },
              as: 'tc',
              in: '$$tc.patient',
            },
          },
        },
      },
      {
        $addFields: {
          numOfPatients: {
            $size: {
              $setUnion: ['$patientIds'],
            },
          },
          onGoingTreatments: {
            $size: {
              $filter: {
                input: { $ifNull: ['$treatmentCourses', []] },
                as: 'tc',
                cond: { $eq: ['$$tc.status', 'active'] },
              },
            },
          },
          completedTreatments: {
            $size: {
              $filter: {
                input: { $ifNull: ['$treatmentCourses', []] },
                as: 'tc',
                cond: { $eq: ['$$tc.status', 'completed'] },
              },
            },
          },
        },
      },
      {
        $facet: {
          metadata: [
            {
              $count: 'total',
            },
          ],
          data: [
            {
              $sort: { [sortField]: sortDirection },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $project: {
                id: { $toString: '$_id' },
                name: 1,
                clinicId: 1,
                city: { $ifNull: ['$city', ''] },
                numOfPatients: 1,
                onGoingTreatments: 1,
                completedTreatments: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          clinics: '$data',
          total: {
            $ifNull: [{ $arrayElemAt: ['$metadata.total', 0] }, 0],
          },
        },
      }
    ];

    const result = await ClinicModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return {
        clinics: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const aggregationResult = result[0];
    const total = aggregationResult.total || 0;
    const totalPages = Math.ceil(total / limit);

    const clinics: ClinicListResult[] = aggregationResult.clinics.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      clinicId: doc.clinicId,
      city: doc.city || '',
      numOfPatients: doc.numOfPatients || 0,
      onGoingTreatments: doc.onGoingTreatments || 0,
      completedTreatments: doc.completedTreatments || 0,
    }));

    return {
      clinics,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(entity: Clinic): Promise<Clinic> {
    const clinicDoc = new ClinicModel({
      clinicId: entity.clinicId.toUpperCase(),
      doctor: new Types.ObjectId(entity.doctorId),
      name: entity.name,
      address: entity.address,
      city: entity.city,
      state: entity.state,
      pincode: entity.pincode,
      phone: entity.phone,
      email: entity.email?.toString(),
      website: entity.website,
      locationUrl: entity.locationUrl,
      workingDays: entity.workingDays?.map(wd => ({
        day: wd.getDay(),
        startTime: wd.getStartTime(),
        endTime: wd.getEndTime(),
      })),
      treatments: entity.treatments?.map(t => t) || [],
      images: entity.images,
      notes: entity.notes,
      isActive: entity.isActive !== undefined ? entity.isActive : true,
      isDeleted: entity.isDeleted !== undefined ? entity.isDeleted : false,
    });
    const saved = await clinicDoc.save();
    const populated = await ClinicModel.findById(saved._id).populate('treatments', 'name');
    return this.toDomain(populated || saved);
  }

  async update(id: string, entity: Partial<Clinic>): Promise<Clinic | null> {
    const updateData: any = {};
    if (entity.clinicId !== undefined) {
      throw new Error('clinicId cannot be updated');
    }
    if (entity.name !== undefined) updateData.name = entity.name;
    if (entity.address !== undefined) updateData.address = entity.address;
    if (entity.city !== undefined) updateData.city = entity.city;
    if (entity.state !== undefined) updateData.state = entity.state;
    if (entity.pincode !== undefined) updateData.pincode = entity.pincode;
    if (entity.phone !== undefined) updateData.phone = entity.phone;
    if (entity.email !== undefined) {
      updateData.email = entity.email ? entity.email.toString() : undefined;
    }
    if (entity.website !== undefined) updateData.website = entity.website;
    if (entity.locationUrl !== undefined) updateData.locationUrl = entity.locationUrl;
    if (entity.workingDays !== undefined) {
      updateData.workingDays = entity.workingDays.length > 0
        ? entity.workingDays.map(wd => ({
            day: wd.getDay(),
            startTime: wd.getStartTime(),
            endTime: wd.getEndTime(),
          }))
        : [];
    }
    if (entity.treatments !== undefined) updateData.treatments = entity.treatments;
    if (entity.images !== undefined) updateData.images = entity.images;
    if (entity.notes !== undefined) updateData.notes = entity.notes;
    if (entity.isActive !== undefined) updateData.isActive = entity.isActive;
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    const clinicDoc = await ClinicModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updateData,
      { new: true }
    ).populate('treatments', 'name');
    if (!clinicDoc) return null;
    return this.toDomain(clinicDoc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await ClinicModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    return !!result;
  }

  async getStatistics(clinicId: string, options: ClinicStatisticsOptions): Promise<ClinicStatistics> {
    const { doctorId, startDateFrom, startDateTo, treatmentId } = options;
    const clinicObjectId = new Types.ObjectId(clinicId);
    const doctorObjectId = new Types.ObjectId(doctorId);

    const courseMatch: any = {
      clinic: clinicObjectId,
      doctor: doctorObjectId,
      isDeleted: false,
    };

    if (treatmentId && Types.ObjectId.isValid(treatmentId)) {
      courseMatch.treatment = new Types.ObjectId(treatmentId);
    }

    if (startDateFrom || startDateTo) {
      courseMatch.startDate = {};
      if (startDateFrom) courseMatch.startDate.$gte = startDateFrom;
      if (startDateTo) courseMatch.startDate.$lte = startDateTo;
    }

    const pipeline: PipelineStage[] = [
      { $match: courseMatch },
      {
        $lookup: {
          from: 'visits',
          let: { courseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course', '$$courseId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $project: {
                billedAmount: { $ifNull: ['$billedAmount', 0] },
              },
            },
          ],
          as: 'visits',
        },
      },
      {
        $lookup: {
          from: 'payments',
          let: { courseId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$course', '$$courseId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $project: {
                amount: 1,
                method: { $ifNull: ['$method', 'cash'] },
                refunded: { $ifNull: ['$refunded', false] },
                refundAmount: { $ifNull: ['$refundDetails.refundAmount', 0] },
              },
            },
          ],
          as: 'payments',
        },
      },
      {
        $lookup: {
          from: 'treatments',
          localField: 'treatment',
          foreignField: '_id',
          as: 'treatmentInfo',
          pipeline: [
            {
              $match: { isDeleted: false },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                totalCourses: { $sum: 1 },
                uniquePatients: { $addToSet: '$patient' },
                totalPaid: { $sum: { $ifNull: ['$totalPaid', 0] } },
                totalCost: { $sum: { $ifNull: ['$totalCost', 0] } },
                medicallyCompleted: {
                  $sum: { $cond: [{ $ifNull: ['$isMedicallyCompleted', false] }, 1, 0] },
                },
                paymentCompleted: {
                  $sum: { $cond: [{ $ifNull: ['$isPaymentCompleted', false] }, 1, 0] },
                },
                statusActive: {
                  $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'active'] }, 1, 0] },
                },
                statusPaused: {
                  $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'paused'] }, 1, 0] },
                },
                statusCompleted: {
                  $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'completed'] }, 1, 0] },
                },
                statusCancelled: {
                  $sum: { $cond: [{ $eq: [{ $ifNull: ['$status', 'active'] }, 'cancelled'] }, 1, 0] },
                },
                totalVisits: { $sum: { $size: '$visits' } },
                totalBilledAmount: {
                  $sum: {
                    $reduce: {
                      input: '$visits',
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.billedAmount', 0] }] },
                    },
                  },
                },
                earliestStartDate: { $min: '$startDate' },
                latestStartDate: { $max: '$startDate' },
                completedCoursesWithDates: {
                  $push: {
                    $cond: [
                      {
                        $and: [
                          { $eq: [{ $ifNull: ['$status', 'active'] }, 'completed'] },
                          { $ifNull: ['$isMedicallyCompleted', false] },
                          { $ne: ['$startDate', null] },
                          { $ne: ['$expectedEndDate', null] },
                        ],
                      },
                      {
                        startDate: '$startDate',
                        expectedEndDate: '$expectedEndDate',
                      },
                      '$$REMOVE',
                    ],
                  },
                },
                paymentCash: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.method', 'cash'] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                    },
                  },
                },
                paymentCard: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.method', 'card'] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                    },
                  },
                },
                paymentUpi: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.method', 'upi'] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                    },
                  },
                },
                paymentBank: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.method', 'bank'] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                    },
                  },
                },
                paymentInsurance: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.method', 'insurance'] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                    },
                  },
                },
                paymentOnline: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.method', 'online'] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.amount', 0] }] },
                    },
                  },
                },
                refundTotal: {
                  $sum: {
                    $reduce: {
                      input: {
                        $filter: {
                          input: '$payments',
                          as: 'p',
                          cond: { $eq: ['$$p.refunded', true] },
                        },
                      },
                      initialValue: 0,
                      in: { $add: ['$$value', { $ifNull: ['$$this.refundAmount', 0] }] },
                    },
                  },
                },
                refundCount: {
                  $sum: {
                    $size: {
                      $filter: {
                        input: '$payments',
                        as: 'p',
                        cond: { $eq: ['$$p.refunded', true] },
                      },
                    },
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                patients: {
                  totalCount: '$totalCourses',
                  uniqueCount: { $size: '$uniquePatients' },
                },
                treatmentCourses: {
                  totalCount: '$totalCourses',
                  statusBreakdown: {
                    active: '$statusActive',
                    paused: '$statusPaused',
                    completed: '$statusCompleted',
                    cancelled: '$statusCancelled',
                  },
                  medicallyCompleted: '$medicallyCompleted',
                  paymentCompleted: '$paymentCompleted',
                },
                revenue: {
                  totalPaid: '$totalPaid',
                  totalCost: '$totalCost',
                  outstanding: { $subtract: ['$totalCost', '$totalPaid'] },
                  averagePerCourse: {
                    paid: {
                      $cond: [
                        { $gt: ['$totalCourses', 0] },
                        { $divide: ['$totalPaid', '$totalCourses'] },
                        0,
                      ],
                    },
                    cost: {
                      $cond: [
                        { $gt: ['$totalCourses', 0] },
                        { $divide: ['$totalCost', '$totalCourses'] },
                        0,
                      ],
                    },
                  },
                  byPaymentMethod: {
                    cash: '$paymentCash',
                    card: '$paymentCard',
                    upi: '$paymentUpi',
                    bank: '$paymentBank',
                    insurance: '$paymentInsurance',
                    online: '$paymentOnline',
                  },
                  refunds: {
                    totalAmount: '$refundTotal',
                    count: '$refundCount',
                  },
                },
                visits: {
                  totalCount: '$totalVisits',
                  averagePerCourse: {
                    $cond: [
                      { $gt: ['$totalCourses', 0] },
                      { $divide: ['$totalVisits', '$totalCourses'] },
                      0,
                    ],
                  },
                  totalBilledAmount: '$totalBilledAmount',
                  averageBilledAmount: {
                    $cond: [
                      { $gt: ['$totalVisits', 0] },
                      { $divide: ['$totalBilledAmount', '$totalVisits'] },
                      0,
                    ],
                  },
                },
                timeMetrics: {
                  earliestStartDate: '$earliestStartDate',
                  latestStartDate: '$latestStartDate',
                  averageDuration: {
                    $cond: [
                      {
                        $and: [
                          { $gt: [{ $size: '$completedCoursesWithDates' }, 0] },
                        ],
                      },
                      {
                        $divide: [
                          {
                            $reduce: {
                              input: '$completedCoursesWithDates',
                              initialValue: 0,
                              in: {
                                $add: [
                                  '$$value',
                                  {
                                    $divide: [
                                      {
                                        $subtract: [
                                          '$$this.expectedEndDate',
                                          '$$this.startDate',
                                        ],
                                      },
                                      86400000,
                                    ],
                                  },
                                ],
                              },
                            },
                          },
                          { $size: '$completedCoursesWithDates' },
                        ],
                      },
                      null,
                    ],
                  },
                },
                completionRates: {
                  treatment: {
                    $cond: [
                      { $gt: ['$totalCourses', 0] },
                      { $multiply: [{ $divide: ['$statusCompleted', '$totalCourses'] }, 100] },
                      0,
                    ],
                  },
                  payment: {
                    $cond: [
                      { $gt: ['$totalCourses', 0] },
                      { $multiply: [{ $divide: ['$paymentCompleted', '$totalCourses'] }, 100] },
                      0,
                    ],
                  },
                  medical: {
                    $cond: [
                      { $gt: ['$totalCourses', 0] },
                      { $multiply: [{ $divide: ['$medicallyCompleted', '$totalCourses'] }, 100] },
                      0,
                    ],
                  },
                  cancellation: {
                    $cond: [
                      { $gt: ['$totalCourses', 0] },
                      { $multiply: [{ $divide: ['$statusCancelled', '$totalCourses'] }, 100] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
          treatmentStats: [
            {
              $match: {
                treatment: { $ne: null },
              },
            },
            {
              $group: {
                _id: '$treatment',
                treatmentName: { $first: { $arrayElemAt: ['$treatmentInfo.name', 0] } },
                courseCount: { $sum: 1 },
                totalPaid: { $sum: { $ifNull: ['$totalPaid', 0] } },
                totalCost: { $sum: { $ifNull: ['$totalCost', 0] } },
              },
            },
            {
              $project: {
                _id: 0,
                treatmentId: { $toString: '$_id' },
                treatmentName: { $ifNull: ['$treatmentName', 'Unknown Treatment'] },
                courseCount: 1,
                totalPaid: 1,
                totalCost: 1,
                outstanding: { $subtract: ['$totalCost', '$totalPaid'] },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          stats: { $arrayElemAt: ['$overallStats', 0] },
          treatments: '$treatmentStats',
        },
      },
    ];

    const result = await TreatmentCourseModel.aggregate(pipeline);

    if (!result || result.length === 0 || !result[0].stats) {
      return this.getEmptyStatistics();
    }

    const stats = result[0].stats;
    const treatments = result[0].treatments || [];

    return {
      patients: stats.patients,
      treatmentCourses: stats.treatmentCourses,
      revenue: stats.revenue,
      treatments: treatments,
      visits: stats.visits,
      timeMetrics: {
        earliestStartDate: stats.timeMetrics.earliestStartDate || undefined,
        latestStartDate: stats.timeMetrics.latestStartDate || undefined,
        averageDuration: stats.timeMetrics.averageDuration || undefined,
      },
      completionRates: stats.completionRates,
    };
  }

  private getEmptyStatistics(): ClinicStatistics {
    return {
      patients: {
        totalCount: 0,
        uniqueCount: 0,
      },
      treatmentCourses: {
        totalCount: 0,
        statusBreakdown: {
          active: 0,
          paused: 0,
          completed: 0,
          cancelled: 0,
        },
        medicallyCompleted: 0,
        paymentCompleted: 0,
      },
      revenue: {
        totalPaid: 0,
        totalCost: 0,
        outstanding: 0,
        averagePerCourse: {
          paid: 0,
          cost: 0,
        },
        byPaymentMethod: {
          cash: 0,
          card: 0,
          upi: 0,
          bank: 0,
          insurance: 0,
          online: 0,
        },
        refunds: {
          totalAmount: 0,
          count: 0,
        },
      },
      treatments: [],
      visits: {
        totalCount: 0,
        averagePerCourse: 0,
        totalBilledAmount: 0,
        averageBilledAmount: 0,
      },
      timeMetrics: {},
      completionRates: {
        treatment: 0,
        payment: 0,
        medical: 0,
        cancellation: 0,
      },
    };
  }

  private toDomain(doc: IClinic | any): Clinic {
    let email: Email | undefined;
    if (doc.email) {
      try {
        email = new Email(doc.email);
      } catch {
        email = undefined;
      }
    }

    let workingDays: WorkingDay[] | undefined;
    if (doc.workingDays && doc.workingDays.length > 0) {
      const mapped = doc.workingDays.map((wd: any) => {
        try {
          return new WorkingDay(wd.day as any, wd.startTime, wd.endTime);
        } catch {
          return null;
        }
      }).filter((wd: WorkingDay | null): wd is WorkingDay => wd !== null);
      workingDays = mapped.length > 0 ? mapped : undefined;
    }

    let treatmentIds: string[] | undefined;
    let populatedTreatmentsData: Array<{ id: string; name: string }> | undefined;
    
    const populatedTreatments = this.extractPopulatedTreatments(doc);
    if (populatedTreatments && populatedTreatments.length > 0) {
      populatedTreatmentsData = populatedTreatments.map((t: any) => ({
        id: typeof t === 'object' && t._id ? t._id.toString() : (typeof t === 'object' && t.id ? t.id : t.toString()),
        name: typeof t === 'object' && (t.name || t.name) ? t.name : undefined,
      })).filter((t: any) => t.id && t.name);
      treatmentIds = populatedTreatmentsData.map(t => t.id);
    } else if (doc.treatments) {
      treatmentIds = doc.treatments.map((t: any) => {
        if (typeof t === 'object' && t._id) return t._id.toString();
        return t.toString();
      });
    }

    return new Clinic(
      doc._id.toString(),
      doc.clinicId,
      doc.doctor ? doc.doctor.toString() : '',
      doc.name,
      doc.createdAt,
      doc.updatedAt,
      doc.address,
      doc.city,
      doc.state,
      doc.pincode,
      doc.phone,
      email,
      doc.website,
      doc.locationUrl,
      workingDays,
      treatmentIds,
      populatedTreatmentsData,
      doc.images,
      doc.notes,
      doc.isActive,
      doc.isDeleted
    );
  }

  private extractPopulatedTreatments(doc: any): any[] | null {
    if (!doc.treatments || !Array.isArray(doc.treatments)) {
      return null;
    }
    
    if (doc.treatments.length > 0 && typeof doc.treatments[0] === 'object' && doc.treatments[0].name) {
      return doc.treatments;
    }
    
    if (doc.populatedTreatments && Array.isArray(doc.populatedTreatments)) {
      return doc.populatedTreatments;
    }
    
    return null;
  }

  private toDomainFromPlainObject(doc: any): Clinic {
    const id = doc._id ? doc._id.toString() : '';
    
    let email: Email | undefined;
    if (doc.email) {
      try {
        email = new Email(doc.email);
      } catch {
        email = undefined;
      }
    }

    let workingDays: WorkingDay[] | undefined;
    if (doc.workingDays && doc.workingDays.length > 0) {
      const mapped = doc.workingDays.map((wd: any) => {
        try {
          return new WorkingDay(wd.day, wd.startTime, wd.endTime);
        } catch {
          return null;
        }
      }).filter((wd: WorkingDay | null): wd is WorkingDay => wd !== null);
      workingDays = mapped.length > 0 ? mapped : undefined;
    }

    let treatmentIds: string[] | undefined;
    let populatedTreatmentsData: Array<{ id: string; name: string }> | undefined;
    
    if (doc.populatedTreatments && Array.isArray(doc.populatedTreatments)) {
      populatedTreatmentsData = doc.populatedTreatments
        .filter((t: any) => t && t.id && t.name)
        .map((t: any) => ({ id: t.id, name: t.name }));
      treatmentIds = populatedTreatmentsData ? populatedTreatmentsData.map(t => t.id) : undefined;
    } else if (doc.treatments) {
      if (doc.treatments.length > 0 && typeof doc.treatments[0] === 'object' && doc.treatments[0].name) {
        populatedTreatmentsData = doc.treatments.map((t: any) => ({
          id: t._id ? t._id.toString() : t.toString(),
          name: t.name,
        })).filter((t: any) => t.id && t.name);
        treatmentIds = populatedTreatmentsData ? populatedTreatmentsData.map(t => t.id) : undefined;
      } else {
        treatmentIds = doc.treatments.map((t: any) => {
          if (typeof t === 'object' && t._id) {
            return t._id.toString();
          }
          return t.toString();
        });
      }
    }

    return new Clinic(
      id,
      doc.clinicId || '',
      doc.doctor ? doc.doctor.toString() : '',
      doc.name || '',
      doc.createdAt,
      doc.updatedAt,
      doc.address,
      doc.city,
      doc.state,
      doc.pincode,
      doc.phone,
      email,
      doc.website,
      doc.locationUrl,
      workingDays,
      treatmentIds,
      populatedTreatmentsData,
      doc.images,
      doc.notes,
      doc.isActive,
      doc.isDeleted
    );
  }
}

