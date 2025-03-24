export type RelatedHabits = {
  habitIds: string[];
  relationship: "supports" | "conflicts" | "prerequisite";
  notes?: string;
};

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetDate?: Date;
  isCompleted?: boolean;
  category?: string;
  metricType?: string;
  startValue?: number;
  currentValue?: number;
  targetValue?: number;
  units?: string;
  relatedHabits?: RelatedHabits[];
  createdAt?: Date;
  updatedAt?: Date;
}
