CREATE TABLE `habit_hero_goals_table` (
	`id` text NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`notes` text,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `habit_hero_goals_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `habit_hero_goals_table` (`userId`);--> statement-breakpoint
CREATE TABLE `habit_hero_habit_logs_table` (
	`id` text NOT NULL,
	`habitId` text NOT NULL,
	`userId` text NOT NULL,
	`completedAt` timestamp NOT NULL,
	`value` int,
	`notes` text,
	`details` text,
	`difficulty` int,
	`feeling` text,
	`hasPhoto` boolean NOT NULL DEFAULT false,
	`photoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `habit_hero_habit_logs_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `habitId_idx` ON `habit_hero_habit_logs_table` (`habitId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `habit_hero_habit_logs_table` (`userId`);--> statement-breakpoint
CREATE INDEX `completedAt_idx` ON `habit_hero_habit_logs_table` (`completedAt`);--> statement-breakpoint
CREATE TABLE `habit_hero_habits_table` (
	`id` text NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`frequencyType` text NOT NULL,
	`frequencyValue` text NOT NULL,
	`streak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`isArchived` boolean NOT NULL DEFAULT false,
	`lastCompleted` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `habit_hero_habits_table_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `habit_hero_habits_table` (`userId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `habit_hero_habits_table` (`category`);--> statement-breakpoint
DROP TABLE `habit_hero_goals`;--> statement-breakpoint
DROP TABLE `habit_hero_habit_logs`;--> statement-breakpoint
DROP TABLE `habit_hero_habits`;