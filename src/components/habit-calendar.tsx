"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { ScrollArea } from "~/components/ui/scroll-area"

interface HabitCalendarProps {
  habits: any[]
}

export function HabitCalendar({ habits }: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)

  const monthName = currentMonth.toLocaleString("default", { month: "long" })

  // Generate calendar days
  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null) // Empty cells for days before the 1st of the month
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Check if a habit was completed on a specific day
  const getCompletedHabitsForDay = (day: number) => {
    if (!day) return []

    const date = new Date(year, month, day).toISOString().split("T")[0]
    return habits.filter((habit) => habit.completedDates?.includes(date))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {monthName} {year}
        </h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2 text-sm font-medium">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const completedHabits = day ? getCompletedHabitsForDay(day) : []
          const isToday =
            day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

          return (
            <div key={index} className={cn("aspect-square p-1 relative", isToday && "bg-muted/50 rounded-md")}>
              {day && (
                <>
                  <div className="text-sm">{day}</div>
                  {completedHabits.length > 0 && (
                    <div className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-1 max-w-full">
                      {completedHabits.slice(0, 3).map((habit, i) => (
                        <div
                          key={i}
                          className={cn("w-2 h-2 rounded-full", `bg-${habit.color}-500`)}
                          title={habit.name}
                        />
                      ))}
                      {completedHabits.length > 3 && (
                        <div className="w-2 h-2 rounded-full bg-gray-400" title="More habits" />
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      <ScrollArea className="h-[100px]">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today's Completed Habits</h4>
          {getCompletedHabitsForDay(new Date().getDate()).length > 0 ? (
            getCompletedHabitsForDay(new Date().getDate()).map((habit) => (
              <div key={habit.id} className="flex items-center gap-2 text-sm">
                <div className={cn("w-3 h-3 rounded-full", `bg-${habit.color}-500`)} />
                <span>{habit.name}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No habits completed today</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

