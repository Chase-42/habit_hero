import { FrequencyType } from "../enums/frequency-type";

export type FrequencyValue = {
  days?: number[]; // 0-6 for weekly (0 = Sunday)
  times?: number; // X times per period
};

export const DEFAULT_FREQUENCY_VALUE: FrequencyValue = {
  days: [],
  times: 1,
};

export const DEFAULT_FREQUENCY_TYPE = FrequencyType.DAILY;
