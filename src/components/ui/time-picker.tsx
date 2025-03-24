"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

interface TimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [timeInput, setTimeInput] = React.useState(
    value ? format(value, "HH:mm") : ""
  );

  // Update input when value changes externally
  React.useEffect(() => {
    setTimeInput(value ? format(value, "HH:mm") : "");
  }, [value]);

  const handleTimeChange = (input: string) => {
    setTimeInput(input);

    // Validate time format (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(input)) return;

    const parts = input.split(":");
    if (parts.length !== 2) return;

    const [hoursStr, minutesStr] = parts;
    if (!hoursStr || !minutesStr) return;

    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    // Additional validation
    if (isNaN(hours) || isNaN(minutes)) return;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return;

    const newDate = new Date();
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    onChange(newDate);
  };

  const handleClear = () => {
    setTimeInput("");
    onChange(null);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value ? format(value, "h:mm a") : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div>
            <Input
              type="time"
              value={timeInput}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
