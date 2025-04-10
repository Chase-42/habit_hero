import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePickerInput({
  value,
  onChange,
  className,
  placeholder = "Select time",
}: TimePickerInputProps) {
  return (
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("w-full", className)}
      placeholder={placeholder}
    />
  );
}
