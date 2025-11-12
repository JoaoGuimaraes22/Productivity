"use client";

import {
  BaseWeekTemplate,
  SpecificDayTasks,
  getDayOfWeek,
  mergeTasks,
} from "@/app/lib/types";
import { useState, useMemo } from "react";

interface WeekTimeBlockViewProps {
  baseWeek: BaseWeekTemplate;
  specificTasks: SpecificDayTasks;
  onTaskClick: (date: string, taskId: string) => void;
  onTimeSlotClick: (date: string, time: string) => void;
}

const CATEGORY_COLORS_DARK = {
  routine: "bg-blue-600 border-blue-500",
  fitness: "bg-red-600 border-red-500",
  rest: "bg-green-600 border-green-500",
  work: "bg-purple-600 border-purple-500",
  variable: "bg-yellow-600 border-yellow-500",
};

// Convert HH:MM to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Get Monday of current week
const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function WeekTimeBlockView({
  baseWeek,
  specificTasks,
  onTaskClick,
  onTimeSlotClick,
}: WeekTimeBlockViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getMondayOfWeek(new Date())
  );

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate dates for the current week
  const weekDates = useMemo(
    () =>
      days.map((_, index) => {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + index);
        return date;
      }),
    [currentWeekStart]
  );

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getMondayOfWeek(new Date()));
  };

  const isCurrentWeek = () => {
    const thisWeekMonday = getMondayOfWeek(new Date());
    return formatDate(currentWeekStart) === formatDate(thisWeekMonday);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Get earliest and latest task times to determine view range
  const timeRange = useMemo(() => {
    let earliest = 24 * 60; // Start with end of day
    let latest = 0;

    weekDates.forEach((date) => {
      const dateString = formatDate(date);
      const tasks = mergeTasks(dateString, baseWeek, specificTasks);

      tasks.forEach((task) => {
        const start = timeToMinutes(task.startTime);
        const end = timeToMinutes(task.endTime);
        earliest = Math.min(earliest, start);
        latest = Math.max(latest, end);
      });
    });

    // Add padding
    const startHour = Math.max(0, Math.floor(earliest / 60) - 1);
    const endHour = Math.min(24, Math.ceil(latest / 60) + 1);

    return { startHour, endHour };
  }, [weekDates, baseWeek, specificTasks]);

  const visibleHours = useMemo(() => {
    return HOURS.slice(timeRange.startHour, timeRange.endHour);
  }, [timeRange]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={previousWeek}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous week"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>

          <div className="flex items-center space-x-3">
            <h2 className="text-lg md:text-xl font-bold text-white">
              Week of {formatDate(weekDates[0])}
            </h2>
            {!isCurrentWeek() && (
              <button
                onClick={goToThisWeek}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                This Week
              </button>
            )}
          </div>

          <button
            onClick={nextWeek}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next week"
          >
            <svg
              className="w-5 h-5 text-gray-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="flex">
          <div className="w-16 flex-shrink-0" /> {/* Time column spacer */}
          {weekDates.map((date, index) => (
            <div
              key={formatDate(date)}
              className={`flex-1 text-center pb-2 border-b-2 ${
                isToday(date) ? "border-blue-500" : "border-transparent"
              }`}
            >
              <div className="text-xs text-gray-400">{dayLabels[index]}</div>
              <div
                className={`text-sm font-semibold ${
                  isToday(date) ? "text-blue-400" : "text-white"
                }`}
              >
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div
          className="relative"
          style={{ height: `${visibleHours.length * 60}px` }}
        >
          {/* Hour lines */}
          {visibleHours.map((hour, index) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-700"
              style={{ top: `${index * 60}px` }}
            >
              <div className="flex">
                {/* Time label */}
                <div className="w-16 flex-shrink-0 pr-2 pt-1">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatHour(hour)}
                  </span>
                </div>

                {/* Day columns */}
                {weekDates.map((date) => (
                  <button
                    key={`${formatDate(date)}-${hour}`}
                    onClick={() =>
                      onTimeSlotClick(
                        formatDate(date),
                        `${String(hour).padStart(2, "0")}:00`
                      )
                    }
                    className="flex-1 border-l border-gray-800 hover:bg-gray-800/50 transition-colors"
                    style={{ height: "60px" }}
                  />
                ))}
              </div>

              {/* Half-hour line */}
              <div
                className="absolute left-16 right-0 border-t border-gray-800"
                style={{ top: "30px" }}
              />
            </div>
          ))}

          {/* Task blocks for each day */}
          {weekDates.map((date, dayIndex) => {
            const dateString = formatDate(date);
            const tasks = mergeTasks(dateString, baseWeek, specificTasks);

            return (
              <div
                key={dateString}
                className="absolute top-0 bottom-0"
                style={{
                  left: `calc(4rem + ${dayIndex} * (100% - 4rem) / 7)`,
                  width: `calc((100% - 4rem) / 7)`,
                }}
              >
                {tasks.map((task) => {
                  const startMinutes = timeToMinutes(task.startTime);
                  const endMinutes = timeToMinutes(task.endTime);
                  const duration = endMinutes - startMinutes;

                  // Calculate position relative to visible hours
                  const top =
                    ((startMinutes - timeRange.startHour * 60) / 60) * 60;
                  const height = (duration / 60) * 60;

                  return (
                    <button
                      key={task.id}
                      onClick={() => onTaskClick(dateString, task.id)}
                      className={`absolute left-1 right-1 rounded border-l-4 p-1 transition-all cursor-pointer ${
                        CATEGORY_COLORS_DARK[task.category]
                      } hover:opacity-90`}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(height, 20)}px`,
                      }}
                    >
                      <div className="flex flex-col h-full overflow-hidden">
                        <p className="text-xs font-semibold text-white truncate text-left">
                          {task.name}
                        </p>
                        {height > 40 && (
                          <p className="text-[10px] text-white/80">
                            {task.startTime}
                          </p>
                        )}
                        {task.isRepeatable && (
                          <span className="absolute top-0.5 right-0.5 text-[8px]">
                            📋
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Today indicator - vertical line */}
          {weekDates.some(isToday) && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-blue-500 pointer-events-none z-10"
              style={{
                left: `calc(4rem + ${weekDates.findIndex(
                  isToday
                )} * (100% - 4rem) / 7 + (100% - 4rem) / 14)`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
