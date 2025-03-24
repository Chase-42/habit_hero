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
  notes?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
