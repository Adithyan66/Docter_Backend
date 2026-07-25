import { PaymentMethod } from '../../../../domain/value-objects/payment-method.vo';

export interface StatCourse {
  id: string;
  patientId: string;
  treatmentId: string;
  clinicId: string | null;
  totalPaid: number;
  totalCost: number;
  isMedicallyCompleted: boolean;
  isPaymentCompleted: boolean;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: Date;
  expectedEndDate: Date | null;
}

export interface StatVisit {
  courseId: string;
  billedAmount: number;
}

export interface StatPayment {
  courseId: string;
  amount: number;
  method: PaymentMethod;
  refunded: boolean;
  refundAmount: number;
}

export interface OverallCourseStats {
  patients: { totalCount: number; uniqueCount: number };
  treatmentCourses: {
    totalCount: number;
    statusBreakdown: { active: number; paused: number; completed: number; cancelled: number };
    medicallyCompleted: number;
    paymentCompleted: number;
  };
  revenue: {
    totalPaid: number;
    totalCost: number;
    outstanding: number;
    averagePerCourse: { paid: number; cost: number };
    byPaymentMethod: { cash: number; card: number; upi: number; bank: number; insurance: number; online: number };
    refunds: { totalAmount: number; count: number };
  };
  visits: { totalCount: number; averagePerCourse: number; totalBilledAmount: number; averageBilledAmount: number };
  timeMetrics: { earliestStartDate?: Date; latestStartDate?: Date; averageDuration?: number };
  completionRates: { treatment: number; payment: number; medical: number; cancellation: number };
}

const DAY_MS = 86400000;

export const computeOverallStats = (
  courses: StatCourse[],
  visits: StatVisit[],
  payments: StatPayment[]
): OverallCourseStats => {
  const totalCourses = courses.length;

  const uniquePatients = new Set(courses.map((c) => c.patientId)).size;
  const totalPaid = courses.reduce((s, c) => s + (c.totalPaid || 0), 0);
  const totalCost = courses.reduce((s, c) => s + (c.totalCost || 0), 0);
  const medicallyCompleted = courses.filter((c) => c.isMedicallyCompleted).length;
  const paymentCompleted = courses.filter((c) => c.isPaymentCompleted).length;

  const statusActive = courses.filter((c) => c.status === 'active').length;
  const statusPaused = courses.filter((c) => c.status === 'paused').length;
  const statusCompleted = courses.filter((c) => c.status === 'completed').length;
  const statusCancelled = courses.filter((c) => c.status === 'cancelled').length;

  const totalVisits = visits.length;
  const totalBilledAmount = visits.reduce((s, v) => s + (v.billedAmount || 0), 0);

  const startTimes = courses.map((c) => c.startDate.getTime());
  const earliestStartDate = startTimes.length ? new Date(Math.min(...startTimes)) : undefined;
  const latestStartDate = startTimes.length ? new Date(Math.max(...startTimes)) : undefined;

  const completedWithDates = courses.filter(
    (c) => c.status === 'completed' && c.isMedicallyCompleted && c.startDate && c.expectedEndDate
  );
  const averageDuration =
    completedWithDates.length > 0
      ? completedWithDates.reduce((s, c) => s + (c.expectedEndDate!.getTime() - c.startDate.getTime()) / DAY_MS, 0) /
        completedWithDates.length
      : undefined;

  const methodSum = (m: PaymentMethod): number =>
    payments.filter((p) => p.method === m).reduce((s, p) => s + (p.amount || 0), 0);

  const refundedPayments = payments.filter((p) => p.refunded);
  const refundTotal = refundedPayments.reduce((s, p) => s + (p.refundAmount || 0), 0);

  return {
    patients: { totalCount: totalCourses, uniqueCount: uniquePatients },
    treatmentCourses: {
      totalCount: totalCourses,
      statusBreakdown: { active: statusActive, paused: statusPaused, completed: statusCompleted, cancelled: statusCancelled },
      medicallyCompleted,
      paymentCompleted,
    },
    revenue: {
      totalPaid,
      totalCost,
      outstanding: totalCost - totalPaid,
      averagePerCourse: {
        paid: totalCourses > 0 ? totalPaid / totalCourses : 0,
        cost: totalCourses > 0 ? totalCost / totalCourses : 0,
      },
      byPaymentMethod: {
        cash: methodSum('cash'),
        card: methodSum('card'),
        upi: methodSum('upi'),
        bank: methodSum('bank'),
        insurance: methodSum('insurance'),
        online: methodSum('online'),
      },
      refunds: { totalAmount: refundTotal, count: refundedPayments.length },
    },
    visits: {
      totalCount: totalVisits,
      averagePerCourse: totalCourses > 0 ? totalVisits / totalCourses : 0,
      totalBilledAmount,
      averageBilledAmount: totalVisits > 0 ? totalBilledAmount / totalVisits : 0,
    },
    timeMetrics: { earliestStartDate, latestStartDate, averageDuration },
    completionRates: {
      treatment: totalCourses > 0 ? (statusCompleted / totalCourses) * 100 : 0,
      payment: totalCourses > 0 ? (paymentCompleted / totalCourses) * 100 : 0,
      medical: totalCourses > 0 ? (medicallyCompleted / totalCourses) * 100 : 0,
      cancellation: totalCourses > 0 ? (statusCancelled / totalCourses) * 100 : 0,
    },
  };
};

export interface GroupedCourseSum {
  key: string;
  courseCount: number;
  totalPaid: number;
  totalCost: number;
}

export const groupCourseSums = (courses: StatCourse[], keyOf: (c: StatCourse) => string | null): GroupedCourseSum[] => {
  const map = new Map<string, GroupedCourseSum>();
  for (const c of courses) {
    const key = keyOf(c);
    if (!key) continue;
    const existing = map.get(key) ?? { key, courseCount: 0, totalPaid: 0, totalCost: 0 };
    existing.courseCount += 1;
    existing.totalPaid += c.totalPaid || 0;
    existing.totalCost += c.totalCost || 0;
    map.set(key, existing);
  }
  return [...map.values()];
};
