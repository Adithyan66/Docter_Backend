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

export const setupRoutes = (router: Router): void => {
  setupAuthRoutes(router);
  setupImageRoutes(router);
  setupTreatmentRoutes(router);
  setupClinicRoutes(router);
  setupPatientRoutes(router);
  setupTreatmentCourseRoutes(router);
  setupVisitRoutes(router);
  setupPaymentRoutes(router);
  setupPrescriptionRoutes(router);
  setupMediaRoutes(router);
  setupDailyActivityRoutes(router);
};

