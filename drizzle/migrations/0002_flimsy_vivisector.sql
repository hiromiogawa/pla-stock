PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_project_paint_use` (
	`project_id` text NOT NULL,
	`paint_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`project_id`, `paint_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paint_id`) REFERENCES `paints`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_project_paint_use`("project_id", "paint_id", "created_at") SELECT "project_id", "paint_id", "created_at" FROM `project_paint_use`;--> statement-breakpoint
DROP TABLE `project_paint_use`;--> statement-breakpoint
ALTER TABLE `__new_project_paint_use` RENAME TO `project_paint_use`;--> statement-breakpoint
PRAGMA foreign_keys=ON;