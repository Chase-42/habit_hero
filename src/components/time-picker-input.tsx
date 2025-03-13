"use client";

import * as React from "react";
import { cn } from "~/lib/utils";

interface TimePickerInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  value: number;
  onChange: (value: number) => void;
  max: number;
  min?: number;
  className?: string;
}

export function TimePickerInput({
  className,
  value,
  onChange,
  max,
  min = 0,
  ...props
}: TimePickerInputProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <input
      {...props}
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      className={cn(
        "w-16 rounded-md border border-input bg-background px-3 py-1 text-center text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    />
  );
}
