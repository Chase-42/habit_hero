"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { TimePicker } from "~/components/time-picker";
import { toast } from "sonner";
import type { Habit } from "~/types";
import { HabitCategory, FrequencyType, HabitColor } from "~/types/common/enums";
import type { Day } from "~/types/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { LoadingSpinner } from "~/components/ui/loading-spinner";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (habit: NewHabit) => Promise<Habit | void>;
  userId: string;
}

interface CategoryOption {
  value: HabitCategory;
  label: string;
}

interface FrequencyOption {
  value: FrequencyType;
  label: string;
}

interface ColorOption {
  value: HabitColor;
  label: string;
  class: string;
}

const categories: CategoryOption[] = [
  { value: HabitCategory.Fitness, label: "Fitness" },
  { value: HabitCategory.Nutrition, label: "Nutrition" },
  { value: HabitCategory.Mindfulness, label: "Mindfulness" },
  { value: HabitCategory.Productivity, label: "Productivity" },
  { value: HabitCategory.Other, label: "Other" },
];

const frequencies: FrequencyOption[] = [
  { value: FrequencyType.Daily, label: "Daily" },
  { value: FrequencyType.Weekly, label: "Weekly" },
  { value: FrequencyType.Monthly, label: "Monthly" },
];

const days: Day[] = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const colors: ColorOption[] = [
  { value: HabitColor.Red, label: "Red", class: "bg-red-500" },
  { value: HabitColor.Blue, label: "Blue", class: "bg-blue-500" },
  { value: HabitColor.Green, label: "Green", class: "bg-green-500" },
  { value: HabitColor.Purple, label: "Purple", class: "bg-purple-500" },
  { value: HabitColor.Orange, label: "Orange", class: "bg-orange-500" },
];

export function AddHabitModal({
  open,
  onOpenChange,
  onAddHabit,
  userId,
}: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategoryOption["value"]>(
    HabitCategory.Other
  );
  const [frequencyType, setFrequencyType] = useState<FrequencyOption["value"]>(
    FrequencyType.Daily
  );
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerFrequency, setTimesPerFrequency] = useState(1);
  const [color, setColor] = useState<ColorOption["value"]>(HabitColor.Blue);
  const [reminderTime, setReminderTime] = useState<string | undefined>();
  const [goal, setGoal] = useState<number | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [units, setUnits] = useState<string>("times");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setCategory(HabitCategory.Other);
    setFrequencyType(FrequencyType.Daily);
    setSelectedDays([]);
    setTimesPerFrequency(1);
    setColor(HabitColor.Blue);
    setReminderTime(undefined);
    setGoal(null);
    setNotes(null);
    setUnits("times");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name) {
      alert("Please enter a habit name");
      return;
    }

    if (frequencyType === FrequencyType.Weekly && selectedDays.length === 0) {
      alert("Please select at least one day for weekly habits");
      return;
    }

    const habit: NewHabit = {
      name,
      userId,
      category,
      frequencyType,
      frequencyValue: {
        days: frequencyType === FrequencyType.Weekly ? selectedDays : [],
        times: timesPerFrequency,
      },
      color,
      isActive: true,
      isArchived: false,
      description: null,
      subCategory: null,
      goal,
      metricType: null,
      units,
      notes,
      reminder: reminderTime ? new Date(reminderTime) : null,
      reminderEnabled: reminderTime !== undefined,
      lastCompleted: null,
    };

    try {
      setIsSubmitting(true);
      await onAddHabit(habit);
      resetForm();
      // Only close the modal after successful submission
      onOpenChange(false);
    } catch (err) {
      console.error("Error submitting habit:", err);
      alert(err instanceof Error ? err.message : "Failed to create habit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Habit Name</label>
            <Input
              placeholder="e.g., Morning Run"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !category && "text-muted-foreground"
                  )}
                >
                  {categories.find((c) => c.value === category)?.label ??
                    "Select category"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search category..." />
                  <CommandList>
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {categories.map((c) => (
                        <CommandItem
                          key={c.value}
                          value={c.label}
                          onSelect={() => setCategory(c.value)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              category === c.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {c.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Frequency</label>
            <RadioGroup
              value={frequencyType}
              onValueChange={(value: FrequencyOption["value"]) =>
                setFrequencyType(value)
              }
              className="flex flex-col space-y-1"
            >
              {frequencies.map((frequency) => (
                <div
                  key={frequency.value}
                  className="flex items-center space-x-3"
                >
                  <RadioGroupItem value={frequency.value} />
                  <label className="text-sm">{frequency.label}</label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <label className="text-sm font-medium">
              Times per {frequencyType}
            </label>
            <Input
              type="number"
              min={1}
              value={timesPerFrequency}
              onChange={(e) =>
                setTimesPerFrequency(Number(e.target.value) || 1)
              }
              placeholder={`e.g., 2 times per ${frequencyType}`}
            />
          </div>

          {frequencyType === FrequencyType.Weekly && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Select Days</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {days.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={(checked) => {
                        setSelectedDays(
                          checked
                            ? [...selectedDays, day.value]
                            : selectedDays.filter((d) => d !== day.value)
                        );
                      }}
                    />
                    <label className="text-sm">{day.label}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Color Tag</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <Button
                  key={c.value}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-8 w-8 rounded-full border-2 p-0",
                    color === c.value && "border-black dark:border-white"
                  )}
                  onClick={() => setColor(c.value)}
                >
                  <div className={cn("h-6 w-6 rounded-full", c.class)} />
                  <span className="sr-only">{c.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">
              Reminder Time (Optional)
            </label>
            <TimePicker value={reminderTime} onChange={setReminderTime} />
          </div>

          <div>
            <label className="text-sm font-medium">Goal (Optional)</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="e.g., 5"
                  value={goal ?? ""}
                  onChange={(e) =>
                    setGoal(e.target.value ? Number(e.target.value) : null)
                  }
                />
                <Select value={units} onValueChange={setUnits}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="times">times</SelectItem>
                    <SelectItem value="minutes">minutes</SelectItem>
                    <SelectItem value="hours">hours</SelectItem>
                    <SelectItem value="kilometers">km</SelectItem>
                    <SelectItem value="miles">miles</SelectItem>
                    <SelectItem value="pages">pages</SelectItem>
                    <SelectItem value="custom">custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Set a target value for your habit. For example: 5km of running,
                30 minutes of meditation, etc.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Textarea
              placeholder="Any additional notes about this habit..."
              className="resize-none"
              value={notes ?? ""}
              onChange={(e) => setNotes(e.target.value || null)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Habit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
