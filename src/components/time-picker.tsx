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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TimePickerProps {
  value?: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const parseTimeValue = (
    timeStr?: string
  ): { hours: number; minutes: number; period: "AM" | "PM" } => {
    if (!timeStr) return { hours: 12, minutes: 0, period: "AM" };
    const [hoursStr, minutesStr = "0"] = timeStr.split(":");
    const hours = parseInt(hoursStr ?? "12", 10);
    const minutes = parseInt(minutesStr, 10);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return {
      hours: displayHours,
      minutes: isNaN(minutes) ? 0 : minutes,
      period,
    };
  };

  const { hours, minutes, period } = parseTimeValue(value);
  const [selectedHours, setHours] = useState(hours);
  const [selectedMinutes, setMinutes] = useState(minutes);
  const [selectedPeriod, setPeriod] = useState<"AM" | "PM">(period);

  const handleTimeChange = (
    hours: number,
    minutes: number,
    period: "AM" | "PM"
  ) => {
    let h = hours % 12;
    if (period === "PM") h += 12;
    const timeString = `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    onChange(timeString);
  };

  const handleHoursChange = (h: number) => {
    setHours(h);
    handleTimeChange(h, selectedMinutes, selectedPeriod);
  };

  const handleMinutesChange = (m: number) => {
    setMinutes(m);
    handleTimeChange(selectedHours, m, selectedPeriod);
  };

  const handlePeriodChange = (p: "AM" | "PM") => {
    setPeriod(p);
    handleTimeChange(selectedHours, selectedMinutes, p);
  };

  const formatDisplayTime = (value?: string) => {
    if (!value) return "Set time";
    const { hours, minutes, period } = parseTimeValue(value);
    return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
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
          {formatDisplayTime(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-4 p-4">
        <div className="flex items-end justify-between space-x-2">
          <div>
            <div className="text-sm font-medium">Hours</div>
            <TimePickerInput
              value={selectedHours}
              onChange={handleHoursChange}
              max={12}
              min={1}
              className="w-16"
            />
          </div>
          <span className="pb-2 text-sm">:</span>
          <div>
            <div className="text-sm font-medium">Minutes</div>
            <TimePickerInput
              value={selectedMinutes}
              onChange={handleMinutesChange}
              max={59}
              className="w-16"
            />
          </div>
          <div>
            <div className="text-sm font-medium">Period</div>
            <Select
              value={selectedPeriod}
              onValueChange={(value: "AM" | "PM") => handlePeriodChange(value)}
            >
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
