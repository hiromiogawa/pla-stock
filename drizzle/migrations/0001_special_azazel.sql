PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_kit_stocks` (
	`user_id` text NOT NULL,
	`kit_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `kit_id`),
	FOREIGN KEY (`kit_id`) REFERENCES `kits`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "kit_stocks_count_non_negative" CHECK("__new_kit_stocks"."count" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_kit_stocks`("user_id", "kit_id", "count") SELECT "user_id", "kit_id", "count" FROM `kit_stocks`;--> statement-breakpoint
DROP TABLE `kit_stocks`;--> statement-breakpoint
ALTER TABLE `__new_kit_stocks` RENAME TO `kit_stocks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_paint_stocks` (
	`user_id` text NOT NULL,
	`paint_id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `paint_id`),
	FOREIGN KEY (`paint_id`) REFERENCES `paints`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "paint_stocks_count_non_negative" CHECK("__new_paint_stocks"."count" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_paint_stocks`("user_id", "paint_id", "count") SELECT "user_id", "paint_id", "count" FROM `paint_stocks`;--> statement-breakpoint
DROP TABLE `paint_stocks`;--> statement-breakpoint
ALTER TABLE `__new_paint_stocks` RENAME TO `paint_stocks`;