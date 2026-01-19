import { injectable } from 'tsyringe';
import { Types, PipelineStage } from 'mongoose';
import { ICalendarEntryRepository } from '../../../domain/repositories/calendar-entry.repository';
import { CalendarEntry, Appointment } from '../../../domain/entities/calendar-entry.entity';
import { CalendarEntryModel, ICalendarEntry } from '../../database/mongoose/calendar-entry.model';

@injectable()
export class MongoCalendarEntryRepository implements ICalendarEntryRepository {
  async findById(id: string): Promise<CalendarEntry | null> {
    const doc = await CalendarEntryModel.findById(id);
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findAll(): Promise<CalendarEntry[]> {
    const docs = await CalendarEntryModel.find({});
    return docs.map((doc) => this.toDomain(doc));
  }

  async create(entity: CalendarEntry): Promise<CalendarEntry> {
    const doc = new CalendarEntryModel({
      doctor: new Types.ObjectId(entity.doctorId),
      date: this.normalizeDate(entity.date),
      clinic: new Types.ObjectId(entity.clinicId),
      startTime: entity.startTime,
      endTime: entity.endTime,
      notes: entity.notes,
      appointments: entity.appointments.map((apt) => ({
        patientId: apt.patientId,
        treatmentId: apt.treatmentId,
        startTime: apt.startTime,
        endTime: apt.endTime,
        notes: apt.notes,
        completed: apt.completed !== undefined ? apt.completed : false,
      })),
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async update(id: string, entity: Partial<CalendarEntry>): Promise<CalendarEntry | null> {
    const updateData: any = {};

    if (entity.doctorId !== undefined) {
      updateData.doctor = new Types.ObjectId(entity.doctorId);
    }
    if (entity.date !== undefined) {
      updateData.date = this.normalizeDate(entity.date);
    }
    if (entity.clinicId !== undefined) {
      updateData.clinic = new Types.ObjectId(entity.clinicId);
    }
    if (entity.startTime !== undefined) {
      updateData.startTime = entity.startTime;
    }
    if (entity.endTime !== undefined) {
      updateData.endTime = entity.endTime;
    }
    if (entity.notes !== undefined) {
      updateData.notes = entity.notes;
    }
    if (entity.appointments !== undefined) {
      updateData.appointments = entity.appointments.map((apt) => ({
        patientId: apt.patientId,
        treatmentId: apt.treatmentId,
        startTime: apt.startTime,
        endTime: apt.endTime,
        notes: apt.notes,
        completed: apt.completed !== undefined ? apt.completed : false,
      }));
    }

    const doc = await CalendarEntryModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async delete(id: string): Promise<boolean> {
    const result = await CalendarEntryModel.findByIdAndDelete(id);
    return !!result;
  }

  async findByDate(date: Date, doctorId: string): Promise<CalendarEntry[]> {
    const normalizedDate = this.normalizeDate(date);
    const docs = await CalendarEntryModel.find({
      doctor: new Types.ObjectId(doctorId),
      date: normalizedDate,
    }).sort({ startTime: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByDateRange(startDate: Date, endDate: Date, doctorId: string): Promise<CalendarEntry[]> {
    const normalizedStartDate = this.normalizeDate(startDate);
    const normalizedEndDate = this.normalizeDate(endDate);
    const docs = await CalendarEntryModel.find({
      doctor: new Types.ObjectId(doctorId),
      date: {
        $gte: normalizedStartDate,
        $lte: normalizedEndDate,
      },
    }).sort({ date: 1, startTime: 1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByDateAndId(id: string, date: Date, doctorId: string): Promise<CalendarEntry | null> {
    const normalizedDate = this.normalizeDate(date);
    const doc = await CalendarEntryModel.findOne({
      _id: new Types.ObjectId(id),
      doctor: new Types.ObjectId(doctorId),
      date: normalizedDate,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findOverlappingEntries(
    date: Date,
    doctorId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<CalendarEntry[]> {
    const normalizedDate = this.normalizeDate(date);
    const filter: any = {
      doctor: new Types.ObjectId(doctorId),
      date: normalizedDate,
      $expr: {
        $and: [
          { $lt: ['$startTime', endTime] },
          { $gt: ['$endTime', startTime] },
        ],
      },
    };

    if (excludeId) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const docs = await CalendarEntryModel.find(filter);
    return docs.map((doc) => this.toDomain(doc));
  }

  async findMonthlyCalendarData(startDate: Date, endDate: Date, doctorId: string): Promise<Array<{ date: string; clinics: string[] }>> {
    const normalizedStartDate = this.normalizeDate(startDate);
    const normalizedEndDate = this.normalizeDate(endDate);

    const timezoneOffset = -new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(timezoneOffset) / 60);
    const minutes = Math.abs(timezoneOffset) % 60;
    const timezoneString = `${timezoneOffset >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          doctor: new Types.ObjectId(doctorId),
          date: {
            $gte: normalizedStartDate,
            $lte: normalizedEndDate,
          },
        },
      },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinic',
          foreignField: '_id',
          as: 'clinicData',
          pipeline: [
            {
              $match: {
                doctor: new Types.ObjectId(doctorId),
                isDeleted: { $ne: true },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$clinicData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
              timezone: timezoneString,
            },
          },
          clinics: {
            $addToSet: '$clinicData.name',
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          clinics: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];

    const result = await CalendarEntryModel.aggregate(pipeline);
    return result.map((item) => ({
      date: item.date,
      clinics: item.clinics || [],
    }));
  }

  async findByDateWithDetails(date: Date, doctorId: string): Promise<Array<{
    id: string;
    clinic: { id: string; name: string };
    startTime: string;
    endTime: string;
    notes?: string;
    appointments: Array<{
      patientId: string;
      patient: { id: string; fullName: string; mobile?: string; email?: string; profilePicUrl?: string; patientId?: string };
      treatmentId?: string;
      treatment?: { id: string; name: string };
      startTime: string;
      endTime: string;
      notes?: string;
      completed: boolean;
    }>;
  }>> {
    const normalizedDate = this.normalizeDate(date);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          doctor: new Types.ObjectId(doctorId),
          date: normalizedDate,
        },
      },
      {
        $lookup: {
          from: 'clinics',
          localField: 'clinic',
          foreignField: '_id',
          as: 'clinicData',
          pipeline: [
            {
              $match: {
                doctor: new Types.ObjectId(doctorId),
                isDeleted: { $ne: true },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$clinicData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $addFields: {
          appointments: {
            $cond: {
              if: { $isArray: '$appointments' },
              then: '$appointments',
              else: [],
            },
          },
        },
      },
      {
        $facet: {
          withAppointments: [
            {
              $match: {
                $expr: { $gt: [{ $size: '$appointments' }, 0] },
              },
            },
            {
              $unwind: '$appointments',
            },
            {
              $lookup: {
                from: 'patients',
                let: { patientIdStr: '$appointments.patientId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $or: [
                              { $eq: [{ $toString: '$_id' }, '$$patientIdStr'] },
                              { $eq: ['$patientId', '$$patientIdStr'] },
                            ],
                          },
                          { $eq: ['$doctor', new Types.ObjectId(doctorId)] },
                          { $ne: ['$isDeleted', true] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      fullName: 1,
                      phone: 1,
                      email: 1,
                      profilePicUrl: 1,
                      patientId: 1,
                    },
                  },
                ],
                as: 'patientData',
              },
            },
            {
              $lookup: {
                from: 'treatments',
                let: { treatmentIdStr: '$appointments.treatmentId' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $cond: {
                              if: { $ne: ['$$treatmentIdStr', null] },
                              then: {
                                $eq: [{ $toString: '$_id' }, '$$treatmentIdStr'],
                              },
                              else: false,
                            },
                          },
                          { $eq: ['$doctor', new Types.ObjectId(doctorId)] },
                          { $ne: ['$isDeleted', true] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      name: 1,
                    },
                  },
                ],
                as: 'treatmentData',
              },
            },
            {
              $addFields: {
                appointment: {
                  $cond: {
                    if: { $gt: [{ $size: '$patientData' }, 0] },
                    then: {
                      patientId: '$appointments.patientId',
                      patient: {
                        id: { $toString: { $arrayElemAt: ['$patientData._id', 0] } },
                        fullName: { $arrayElemAt: ['$patientData.fullName', 0] },
                        mobile: { $arrayElemAt: ['$patientData.phone', 0] },
                        email: { $arrayElemAt: ['$patientData.email', 0] },
                        profilePicUrl: { $arrayElemAt: ['$patientData.profilePicUrl', 0] },
                        patientId: { $arrayElemAt: ['$patientData.patientId', 0] },
                      },
                      treatmentId: '$appointments.treatmentId',
                      treatment: {
                        $cond: {
                          if: { $gt: [{ $size: '$treatmentData' }, 0] },
                          then: {
                            id: { $toString: { $arrayElemAt: ['$treatmentData._id', 0] } },
                            name: { $arrayElemAt: ['$treatmentData.name', 0] },
                          },
                          else: null,
                        },
                      },
                      startTime: '$appointments.startTime',
                      endTime: '$appointments.endTime',
                      notes: '$appointments.notes',
                      completed: {
                        $ifNull: ['$appointments.completed', false],
                      },
                    },
                    else: null,
                  },
                },
              },
            },
            {
              $group: {
                _id: '$_id',
                clinic: { $first: '$clinicData' },
                clinicId: { $first: '$clinic' },
                startTime: { $first: '$startTime' },
                endTime: { $first: '$endTime' },
                notes: { $first: '$notes' },
                appointments: {
                  $push: {
                    $cond: {
                      if: { $ne: ['$appointment', null] },
                      then: '$appointment',
                      else: '$$REMOVE',
                    },
                  },
                },
              },
            },
          ],
          withoutAppointments: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: [{ $size: '$appointments' }, 0] },
                    { $not: { $isArray: '$appointments' } },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                clinicData: 1,
                clinic: 1,
                startTime: 1,
                endTime: 1,
                notes: 1,
                appointments: [],
              },
            },
            {
              $group: {
                _id: '$_id',
                clinic: { $first: '$clinicData' },
                clinicId: { $first: '$clinic' },
                startTime: { $first: '$startTime' },
                endTime: { $first: '$endTime' },
                notes: { $first: '$notes' },
                appointments: { $first: '$appointments' },
              },
            },
          ],
        },
      },
      {
        $project: {
          entries: { $concatArrays: ['$withAppointments', '$withoutAppointments'] },
        },
      },
      {
        $unwind: '$entries',
      },
      {
        $replaceRoot: { newRoot: '$entries' },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          clinic: {
            id: { $toString: '$clinicId' },
            name: '$clinic.name',
          },
          startTime: 1,
          endTime: 1,
          notes: 1,
          appointments: {
            $cond: {
              if: { $isArray: '$appointments' },
              then: '$appointments',
              else: [],
            },
          },
        },
      },
      {
        $sort: {
          startTime: 1,
        },
      },
    ];

    const result = await CalendarEntryModel.aggregate(pipeline);
    return result.map((item) => ({
      ...item,
      appointments: item.appointments || [],
    }));
  }

  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private toDomain(doc: ICalendarEntry | any): CalendarEntry {
    const appointments: Appointment[] = (doc.appointments || []).map((apt: any) => ({
      patientId: apt.patientId,
      treatmentId: apt.treatmentId,
      startTime: apt.startTime,
      endTime: apt.endTime,
      notes: apt.notes,
      completed: apt.completed !== undefined ? apt.completed : false,
    }));

    return new CalendarEntry(
      doc._id.toString(),
      doc.doctor ? doc.doctor.toString() : '',
      doc.date,
      doc.clinic ? doc.clinic.toString() : '',
      doc.startTime,
      doc.endTime,
      appointments,
      doc.createdAt,
      doc.updatedAt,
      doc.notes
    );
  }
}

