CREATE TABLE `calendar_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`doctor_id` text NOT NULL,
	`clinic_id` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`notes` text,
	`appointments` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`clinic_id`) REFERENCES `clinics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `calendar_entries_doctor_date_idx` ON `calendar_entries` (`doctor_id`,`date`);--> statement-breakpoint
CREATE INDEX `calendar_entries_doctor_date_clinic_idx` ON `calendar_entries` (`doctor_id`,`date`,`clinic_id`);