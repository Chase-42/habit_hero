-- First, add the deletedAt column if it doesn't exist
ALTER TABLE habit_hero_habits
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL;

-- Update the deletedAt column for existing habits to epoch time (representing null)
UPDATE habit_hero_habits
SET deletedAt = '1970-01-01 00:00:00'
WHERE deletedAt IS NULL;

-- Ensure boolean columns have proper defaults
ALTER TABLE habit_hero_habits
MODIFY COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE,
MODIFY COLUMN isArchived BOOLEAN NOT NULL DEFAULT FALSE,
MODIFY COLUMN reminderEnabled BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure habit_logs hasPhoto has proper default
ALTER TABLE habit_hero_habit_logs
MODIFY COLUMN hasPhoto BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure frequencyValue is properly typed as JSON
ALTER TABLE habit_hero_habits
MODIFY COLUMN frequencyValue JSON NOT NULL; 