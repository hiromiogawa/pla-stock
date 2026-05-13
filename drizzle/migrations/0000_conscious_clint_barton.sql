CREATE TABLE `kit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kit_id` text NOT NULL,
	`delta` integer NOT NULL,
	`reason` text NOT NULL,
	`project_id` text,
	`purchased_at` text,
	`price_yen` integer,
	`purchase_location` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`kit_id`) REFERENCES `kits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `kit_events_user_created_idx` ON `kit_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `kit_stocks` (
	`user_id` text NOT NULL,
	`kit_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `kit_id`),
	FOREIGN KEY (`kit_id`) REFERENCES `kits`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`grade` text NOT NULL,
	`scale` text NOT NULL,
	`retail_price_yen` integer,
	`box_art_url` text
);
--> statement-breakpoint
CREATE TABLE `paint_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`paint_id` text NOT NULL,
	`delta` integer NOT NULL,
	`reason` text NOT NULL,
	`purchased_at` text,
	`price_yen` integer,
	`purchase_location` text,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`paint_id`) REFERENCES `paints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `paint_events_user_created_idx` ON `paint_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `paint_stocks` (
	`user_id` text NOT NULL,
	`paint_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `paint_id`),
	FOREIGN KEY (`paint_id`) REFERENCES `paints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `paints` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`color_family` text,
	`finish_type` text,
	`swatch_url` text
);
--> statement-breakpoint
CREATE TABLE `project_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`url` text NOT NULL,
	`r2_key` text,
	`caption` text,
	`taken_at` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kit_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`started_at` text,
	`completed_at` text
);
--> statement-breakpoint
CREATE TABLE `project_paint_use` (
	`project_id` text NOT NULL,
	`paint_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `paint_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paint_id`) REFERENCES `paints`(`id`) ON UPDATE no action ON DELETE no action
);
