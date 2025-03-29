import type { Habit, CreateHabit, UpdateHabit } from "~/entities/models/habit";
import type { HabitLog } from "~/entities/models/habit-log";
import type { Goal } from "~/entities/models/goal";

/**
 * Maps a database habit record to a domain habit model
 */
export function mapDbHabitToDomain(dbHabit: any): Habit {
  return {
    ...dbHabit,
    // Handle any specific transformations if needed
  };
}

/**
 * Maps a domain habit model to a database record
 */
export function mapDomainHabitToDb(domainHabit: CreateHabit): any {
  return {
    ...domainHabit,
    // Handle any specific transformations if needed
  };
}

/**
 * Maps domain habit update data to database update data
 */
export function mapDomainHabitUpdateToDb(update: UpdateHabit): any {
  return {
    ...update,
    updatedAt: new Date(),
  };
}

/**
 * Maps a database habit log record to a domain habit log model
 */
export function mapDbHabitLogToDomain(dbLog: any): HabitLog {
  return {
    ...dbLog,
    // Handle any specific transformations if needed
  };
}

/**
 * Maps a domain habit log model to a database record
 */
export function mapDomainHabitLogToDb(domainLog: HabitLog): any {
  return {
    ...domainLog,
    // Handle any specific transformations if needed
  };
}

/**
 * Maps a database goal record to a domain goal model
 */
export function mapDbGoalToDomain(dbGoal: any): Goal {
  return {
    ...dbGoal,
    // Handle any specific transformations if needed
  };
}

/**
 * Maps a domain goal model to a database record
 */
export function mapDomainGoalToDb(domainGoal: Goal): any {
  return {
    ...domainGoal,
    // Handle any specific transformations if needed
  };
}
