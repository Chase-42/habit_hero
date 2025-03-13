"use client";
import { Check, ChevronsUpDown } from "lucide-react";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { TimePicker } from "~/components/time-picker";
import type { Habit } from "~/types";

type NewHabit = Omit<
  Habit,
  "id" | "createdAt" | "completedDates" | "streak"
> & {
  completedDates: string[];
  streak: number;
};

const categories = [
  { label: "Fitness", value: "fitness" },
  { label: "Mindfulness", value: "mindfulness" },
  { label: "Productivity", value: "productivity" },
  { label: "Health", value: "health" },
  { label: "Custom", value: "custom" },
];

const frequencies = [
  { label: "Daily", value: "daily" },
  { label: "Weekdays", value: "weekdays" },
  { label: "Custom days", value: "custom" },
];

const days = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const colors = [
  { label: "Red", value: "red", class: "bg-red-500" },
  { label: "Green", value: "green", class: "bg-green-500" },
  { label: "Blue", value: "blue", class: "bg-blue-500" },
  { label: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { label: "Purple", value: "purple", class: "bg-purple-500" },
  { label: "Pink", value: "pink", class: "bg-pink-500" },
  { label: "Indigo", value: "indigo", class: "bg-indigo-500" },
  { label: "Teal", value: "teal", class: "bg-teal-500" },
];

const formSchema = z.object({
  name: z.string().min(1, { message: "Habit name is required" }),
  category: z.string({ required_error: "Please select a category" }),
  frequency: z.string({ required_error: "Please select a frequency" }),
  days: z.array(z.number()).optional(),
  reminder: z.string().optional(),
  color: z.string({ required_error: "Please select a color" }),
  goal: z.string().optional(),
  notes: z.string().optional(),
});

export function AddHabitModal({
  open,
  onOpenChange,
  onAddHabit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (habit: NewHabit) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      frequency: "daily",
      days: [],
      reminder: "",
      color: "blue",
      goal: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddHabit({
      ...values,
      streak: 0,
      completedDates: [],
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
          <DialogDescription>
            Create a new habit to track. Fill out the details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Run" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {categories.find(
                            (category) => category.value === field.value,
                          )?.label ?? "Select category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((category) => (
                              <CommandItem
                                value={category.label}
                                key={category.value}
                                onSelect={() => {
                                  form.setValue("category", category.value);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category.value === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {category.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {frequencies.map((frequency) => (
                        <FormItem
                          key={frequency.value}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={frequency.value} />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {frequency.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("frequency") === "custom" && (
              <FormField
                control={form.control}
                name="days"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Select Days</FormLabel>
                      <FormDescription>
                        Choose which days of the week to perform this habit.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {days.map((day) => (
                        <FormItem
                          key={day.value}
                          className="flex items-center space-x-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const currentValues = field.value ?? [];
                                const newValues = checked
                                  ? [...currentValues, day.value]
                                  : currentValues.filter(
                                      (value) => value !== day.value,
                                    );
                                field.onChange(newValues);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reminder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Time (Optional)</FormLabel>
                  <FormControl>
                    <TimePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Tag</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <Button
                          key={color.value}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-8 w-8 rounded-full border-2 p-0",
                            color.value === field.value &&
                              "border-black dark:border-white",
                          )}
                          onClick={() => form.setValue("color", color.value)}
                        >
                          <div
                            className={cn("h-6 w-6 rounded-full", color.class)}
                          />
                          <span className="sr-only">{color.label}</span>
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Run 5km daily" {...field} />
                  </FormControl>
                  <FormDescription>
                    Set a specific goal for this habit.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this habit..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Create Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
