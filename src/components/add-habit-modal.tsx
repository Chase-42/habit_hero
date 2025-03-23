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
import type { Habit, HabitColor, HabitCategory, FrequencyType } from "~/types";

type Category = {
  label: string;
  value: HabitCategory;
};

type Frequency = {
  label: string;
  value: FrequencyType;
};

type Day = {
  label: string;
  value: number;
};

type Color = {
  label: string;
  value: HabitColor;
  class: string;
};

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "updatedAt" | "streak" | "longestStreak"
>;

const categories: Category[] = [
  { label: "Fitness", value: "fitness" },
  { label: "Nutrition", value: "nutrition" },
  { label: "Mindfulness", value: "mindfulness" },
  { label: "Productivity", value: "productivity" },
  { label: "Other", value: "other" },
];

const frequencies: Frequency[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
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

const colors: Color[] = [
  { label: "Red", value: "red", class: "bg-red-500" },
  { label: "Green", value: "green", class: "bg-green-500" },
  { label: "Blue", value: "blue", class: "bg-blue-500" },
  { label: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { label: "Purple", value: "purple", class: "bg-purple-500" },
  { label: "Pink", value: "pink", class: "bg-pink-500" },
  { label: "Orange", value: "orange", class: "bg-orange-500" },
];

interface AddHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onAddHabit: (habit: NewHabit) => Promise<void>;
  isLoading?: boolean;
}

export function AddHabitModal({
  open,
  onOpenChange,
  userId,
  onAddHabit,
  isLoading = false,
}: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<HabitCategory>("other");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timesPerFrequency, setTimesPerFrequency] = useState(1);
  const [color, setColor] = useState<HabitColor>("blue");
  const [reminder, setReminder] = useState<Date | null>(null);
  const [goal, setGoal] = useState<number | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setCategory("other");
    setFrequencyType("daily");
    setSelectedDays([]);
    setTimesPerFrequency(1);
    setColor("blue");
    setReminder(null);
    setGoal(null);
    setNotes(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!name) {
      alert("Please enter a habit name");
      return;
    }

    if (frequencyType === "weekly" && selectedDays.length === 0) {
      alert("Please select at least one day for weekly habits");
      return;
    }

    const habit = {
      name,
      userId,
      category,
      frequencyType,
      frequencyValue: {
        days: frequencyType === "weekly" ? selectedDays : [],
        times: timesPerFrequency,
      },
      color,
      isActive: true,
      isArchived: false,
      description: null,
      subCategory: null,
      goal,
      metricType: null,
      units: null,
      notes,
      reminder,
      reminderEnabled: reminder !== null,
      lastCompleted: null,
    };

    try {
      await onAddHabit(habit);
      resetForm();
    } catch (err) {
      console.error("Error submitting habit:", err);
      alert(err instanceof Error ? err.message : "Failed to create habit");
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
                    !category && "text-muted-foreground",
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
                              category === c.value
                                ? "opacity-100"
                                : "opacity-0",
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
              onValueChange={(value: FrequencyType) => setFrequencyType(value)}
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

          {frequencyType === "weekly" && (
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
                            : selectedDays.filter((d) => d !== day.value),
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
                    color === c.value && "border-black dark:border-white",
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
            <TimePicker
              value={reminder?.toISOString()}
              onChange={(value) => setReminder(value ? new Date(value) : null)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Goal (Optional)</label>
            <Input
              type="number"
              placeholder="e.g., 5 (for 5km daily)"
              value={goal ?? ""}
              onChange={(e) =>
                setGoal(e.target.value ? Number(e.target.value) : null)
              }
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
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
