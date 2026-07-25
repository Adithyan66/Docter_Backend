CREATE TABLE `clinics` (
	`id` text PRIMARY KEY NOT NULL,
	`clinic_id` text NOT NULL,
	`doctor_id` text NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`city` text,
	`state` text,
	`pincode` text,
	`phone` text,
	`email` text,
	`website` text,
	`location_url` text,
	`working_days` text,
	`treatments` text,
	`images` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `clinics_doctor_idx` ON `clinics` (`doctor_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `clinics_doctor_name_uq` ON `clinics` (`doctor_id`,`name`) WHERE "clinics"."is_deleted" = 0;--> statement-breakpoint
CREATE UNIQUE INDEX `clinics_doctor_clinicid_uq` ON `clinics` (`doctor_id`,`clinic_id`) WHERE "clinics"."is_deleted" = 0;--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`refresh_token` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `doctors_email_unique` ON `doctors` (`email`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`patient_id` text,
	`course_id` text,
	`visit_id` text,
	`clinic_id` text,
	`url` text NOT NULL,
	`filename` text,
	`mime_type` text,
	`size` integer,
	`type` text DEFAULT 'image',
	`notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `treatment_courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `media_doctor_patient_idx` ON `media` (`doctor_id`,`patient_id`);--> statement-breakpoint
CREATE INDEX `media_doctor_course_idx` ON `media` (`doctor_id`,`course_id`);--> statement-breakpoint
CREATE INDEX `media_visit_idx` ON `media` (`visit_id`);--> statement-breakpoint
CREATE TABLE `patient_id_counters` (
	`clinic_id` text PRIMARY KEY NOT NULL,
	`sequence` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`primary_clinic_id` text,
	`patient_id` text,
	`first_name` text NOT NULL,
	`last_name` text,
	`full_name` text,
	`dob` integer,
	`age` integer,
	`gender` text DEFAULT 'unknown',
	`phone` text,
	`email` text,
	`address` text,
	`profile_pic_url` text,
	`consultation_type` text NOT NULL,
	`tags` text,
	`clinics` text,
	`treatment_courses` text,
	`visit_count` integer DEFAULT 0 NOT NULL,
	`last_visit_at` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`primary_clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_patient_id_unique` ON `patients` (`patient_id`);--> statement-breakpoint
CREATE INDEX `patients_doctor_deleted_idx` ON `patients` (`doctor_id`,`is_deleted`);--> statement-breakpoint
CREATE INDEX `patients_phone_idx` ON `patients` (`phone`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`course_id` text NOT NULL,
	`visit_id` text,
	`clinic_id` text,
	`amount` real NOT NULL,
	`method` text DEFAULT 'cash' NOT NULL,
	`reference` text,
	`paid_at` integer NOT NULL,
	`refunded` integer DEFAULT false NOT NULL,
	`refund_refunded_at` integer,
	`refund_reason` text,
	`refund_amount` real,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `treatment_courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_doctor_clinic_paidat_idx` ON `payments` (`doctor_id`,`clinic_id`,`paid_at`);--> statement-breakpoint
CREATE INDEX `payments_doctor_patient_idx` ON `payments` (`doctor_id`,`patient_id`);--> statement-breakpoint
CREATE INDEX `payments_course_idx` ON `payments` (`course_id`);--> statement-breakpoint
CREATE TABLE `prescriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`visit_id` text NOT NULL,
	`clinic_id` text,
	`diagnosis` text,
	`items` text,
	`notes` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`visit_id`) REFERENCES `visits`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `prescriptions_doctor_patient_idx` ON `prescriptions` (`doctor_id`,`patient_id`);--> statement-breakpoint
CREATE INDEX `prescriptions_visit_idx` ON `prescriptions` (`visit_id`);--> statement-breakpoint
CREATE TABLE `staff` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`clinic_id` text NOT NULL,
	`doctor_id` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`refresh_token` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_username_unique` ON `staff` (`username`);--> statement-breakpoint
CREATE INDEX `staff_doctor_idx` ON `staff` (`doctor_id`);--> statement-breakpoint
CREATE INDEX `staff_clinic_idx` ON `staff` (`clinic_id`);--> statement-breakpoint
CREATE TABLE `treatment_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`clinic_id` text,
	`treatment_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`expected_end_date` integer,
	`last_visit_date` integer,
	`next_visit_date` integer,
	`total_cost` real DEFAULT 0 NOT NULL,
	`total_paid` real DEFAULT 0 NOT NULL,
	`is_payment_completed` integer DEFAULT false NOT NULL,
	`is_medically_completed` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`visits` text,
	`payments` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`treatment_id`) REFERENCES `treatments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `courses_doctor_patient_status_idx` ON `treatment_courses` (`doctor_id`,`patient_id`,`status`);--> statement-breakpoint
CREATE INDEX `courses_clinic_idx` ON `treatment_courses` (`clinic_id`);--> statement-breakpoint
CREATE INDEX `courses_next_visit_idx` ON `treatment_courses` (`next_visit_date`);--> statement-breakpoint
CREATE TABLE `treatments` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`min_duration` integer,
	`max_duration` integer,
	`avg_duration` integer,
	`min_fees` real,
	`max_fees` real,
	`avg_fees` real,
	`steps` text,
	`aftercare` text,
	`follow_up_required` integer DEFAULT false,
	`follow_up_after_days` integer,
	`risks` text,
	`images` text,
	`is_one_time` integer,
	`regular_visit_interval_value` integer,
	`regular_visit_interval_unit` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `treatments_doctor_idx` ON `treatments` (`doctor_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `treatments_doctor_name_uq` ON `treatments` (`doctor_id`,`name`) WHERE "treatments"."is_deleted" = 0;--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`patient_id` text NOT NULL,
	`course_id` text NOT NULL,
	`clinic_id` text,
	`visit_date` integer NOT NULL,
	`notes` text,
	`billed_amount` real DEFAULT 0,
	`media_ids` text,
	`prescription_id` text,
	`is_deleted` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `treatment_courses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `visits_doctor_patient_date_idx` ON `visits` (`doctor_id`,`patient_id`,`visit_date`);--> statement-breakpoint
CREATE INDEX `visits_course_idx` ON `visits` (`course_id`);--> statement-breakpoint
CREATE INDEX `visits_clinic_idx` ON `visits` (`clinic_id`);