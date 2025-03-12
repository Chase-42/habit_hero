"use client"

import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"
import type React from "react"

interface TimePickerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number
  onChange: (value: number) => void
  max: number
  placeholder: string
}

export function TimePickerInput({ className, value, onChange, max, placeholder, ...props }: TimePickerInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10)
    if (isNaN(value)) {
      onChange(0)
    } else if (value >= 0 && value <= max) {
      onChange(value)
    }
  }

  return (
    <Input
      type="number"
      placeholder={placeholder}
      value={value.toString().padStart(2, "0")}
      onChange={handleChange}
      className={cn("w-16 text-center", className)}
      min={0}
      max={max}
      {...props}
    />
  )
}

