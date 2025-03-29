CREATE TABLE `habit_hero_goals` (
	`id` text NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`target` int NOT NULL,
	`progress` int NOT NULL DEFAULT 0,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`isCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `habit_hero_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `habit_hero_goals` (`userId`);--> statement-breakpoint
CREATE TABLE `habit_hero_habit_logs` (
	`id` text NOT NULL,
	`habitId` text NOT NULL,
	`userId` text NOT NULL,
	`completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`hasPhoto` boolean NOT NULL DEFAULT false,
	`value` int,
	`notes` text,
	`details` json,
	`difficulty` int,
	`feeling` text,
	`photoUrl` text,
	CONSTRAINT `habit_hero_habit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `habitId_idx` ON `habit_hero_habit_logs` (`habitId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `habit_hero_habit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `completedAt_idx` ON `habit_hero_habit_logs` (`completedAt`);--> statement-breakpoint
CREATE TABLE `habit_hero_habits` (
	`id` text NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`frequencyType` text NOT NULL,
	`frequencyValue` json NOT NULL,
	`category` text NOT NULL,
	`streak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isArchived` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`description` text,
	`subCategory` text,
	`lastCompleted` timestamp,
	`goal` int,
	`metricType` text,
	`units` text,
	`notes` text,
	`reminder` timestamp,
	`reminderEnabled` boolean NOT NULL DEFAULT false,
	CONSTRAINT `habit_hero_habits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `habit_hero_habits` (`userId`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `habit_hero_habits` (`category`);