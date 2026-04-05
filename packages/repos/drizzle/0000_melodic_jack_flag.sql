CREATE TABLE `case_assets` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`asset_details` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_damages` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`damage_details` text,
	`value` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_description_logs` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`input_description` text,
	`input_entity` text,
	`description` text,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_entity_logs` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`input_description` text,
	`input_entity` text,
	`entity` text,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_events` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`occurrence_time` text,
	`event_details` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_evidence` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`evidence_details` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_links` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`source_id` text NOT NULL,
	`target_id` text NOT NULL,
	`relation` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`, `source_id`, `target_id`)
);
--> statement-breakpoint
CREATE TABLE `case_locations` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`location_details` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_organizations` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`organization_details` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_persons` (
	`case_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text,
	`types` text,
	`name` text,
	`person_details` text,
	`condition` text,
	`confidence` real,
	PRIMARY KEY(`case_id`, `created_at`)
);
--> statement-breakpoint
CREATE TABLE `case_suggestions` (
	`case_id` text NOT NULL,
	`case_type` text NOT NULL,
	`suggestion` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	PRIMARY KEY(`case_id`, `case_type`)
);
--> statement-breakpoint
CREATE TABLE `case_types` (
	`case_id` text NOT NULL,
	`case_type` text NOT NULL,
	`reason` text,
	`confidence` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	PRIMARY KEY(`case_id`, `case_type`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` text PRIMARY KEY NOT NULL,
	`case_number` text,
	`title` text,
	`status` integer,
	`priority` integer,
	`summary` text,
	`description` text,
	`entity` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `usage_logs` (
	`agent_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`provider` text,
	`model` text,
	`input` integer,
	`output` integer,
	`total` integer,
	PRIMARY KEY(`agent_name`, `created_at`)
);
