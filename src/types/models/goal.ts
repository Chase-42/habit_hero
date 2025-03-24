import type { BaseEntity, UserOwned } from "../common/utils";

export interface Goal extends BaseEntity, UserOwned {
  name: string;
  description: string | null;
  notes: string | null;
  isCompleted: boolean;
}
