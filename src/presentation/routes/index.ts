import { DependencyContainer } from 'tsyringe';
import { Router } from '../interfaces';
import { setupAuthRoutes } from './auth/auth.routes';
import { setupImageRoutes } from './image/image.routes';
import { setupTreatmentRoutes } from './treatment/treatment.routes';
import { setupClinicRoutes } from './clinic/clinic.routes';
import { setupPatientRoutes } from './patient/patient.routes';
import { setupTreatmentCourseRoutes } from './treatment-course/treatment-course.routes';
import { setupVisitRoutes } from './visit/visit.routes';
import { setupPaymentRoutes } from './payment/payment.routes';
import { setupPrescriptionRoutes } from './prescription/prescription.routes';
import { setupMediaRoutes } from './media/media.routes';
import { setupDailyActivityRoutes } from './daily-activity/daily-activity.routes';
import { setupStaffRoutes } from './staff/staff.routes';

export const setupRoutes = (router: Router, resolver: DependencyContainer): void => {
  setupAuthRoutes(router, resolver);
  setupImageRoutes(router, resolver);
  setupTreatmentRoutes(router, resolver);
  setupClinicRoutes(router, resolver);
  setupPatientRoutes(router, resolver);
  setupTreatmentCourseRoutes(router, resolver);
  setupVisitRoutes(router, resolver);
  setupPaymentRoutes(router, resolver);
  setupPrescriptionRoutes(router, resolver);
  setupMediaRoutes(router, resolver);
  setupDailyActivityRoutes(router, resolver);
  setupStaffRoutes(router, resolver);
};

