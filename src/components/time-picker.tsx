"use client";

import { Clock } from "lucide-react";
import { TimePickerInput } from "./time-picker-input";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { useState } from "react";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const parseTimeValue = (index: 0 | 1, timeStr?: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    const value = parts[index];
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const [hours, setHours] = useState(() => parseTimeValue(0, value));
  const [minutes, setMinutes] = useState(() => parseTimeValue(1, value));

  const handleHoursChange = (hours: number) => {
    setHours(hours);
    onChange(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    );
  };

  const handleMinutesChange = (minutes: number) => {
    setMinutes(minutes);
    onChange(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ?? "Set time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex items-center justify-center space-x-2">
          <TimePickerInput
            value={hours}
            onChange={handleHoursChange}
            max={23}
            className="w-16"
          />
          <span className="text-sm">:</span>
          <TimePickerInput
            value={minutes}
            onChange={handleMinutesChange}
            max={59}
            className="w-16"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
