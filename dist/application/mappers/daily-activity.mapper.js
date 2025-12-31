"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToDailyActivityResponse = void 0;
const mapToDailyActivityResponse = (result) => {
    const summary = {
        totalPatientsVisited: result.summary.totalPatientsVisited,
        totalVisits: result.summary.totalVisits,
        totalAmount: result.summary.totalAmount,
        averageAmountPerVisit: result.summary.averageAmountPerVisit,
        visitStartTime: result.summary.visitStartTime,
        visitEndTime: result.summary.visitEndTime,
        totalHoursWorked: result.summary.totalHoursWorked,
        clinicNames: result.summary.clinicNames || [],
    };
    const activities = result.activities.map((activity) => ({
        visitId: activity.visitId,
        visitTime: activity.visitTime,
        patientId: activity.patientId,
        patientName: activity.patientName,
        courseId: activity.courseId,
        treatmentName: activity.treatmentName,
        amountPaid: activity.amountPaid,
        clinicId: activity.clinicId || undefined,
        clinicName: activity.clinicName || undefined,
    }));
    return {
        summary,
        activities,
        pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
        },
    };
};
exports.mapToDailyActivityResponse = mapToDailyActivityResponse;
