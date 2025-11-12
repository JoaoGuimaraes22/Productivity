"use client";

import { BaseWeekTemplate, DayOfWeek, Task } from "@/app/lib/types";
import { useState, useMemo } from "react";

interface BaseWeekEditorProps {
  baseWeek: BaseWeekTemplate;
  onUpdateBaseWeek: (baseWeek: BaseWeekTemplate) => void;
  onAddTask: (dayOfWeek: DayOfWeek) => void;
  onEditTask: (
    dayOfWeek: DayOfWeek,
    task: Omit<
      Task,
      "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
    >
  ) => void;
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

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function BaseWeekEditor({
  baseWeek,
  onUpdateBaseWeek,
  onAddTask,
  onEditTask,
}: BaseWeekEditorProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const days: { key: DayOfWeek; label: string; short: string }[] = [
    { key: "monday", label: "Monday", short: "Mon" },
    { key: "tuesday", label: "Tuesday", short: "Tue" },
    { key: "wednesday", label: "Wednesday", short: "Wed" },
    { key: "thursday", label: "Thursday", short: "Thu" },
    { key: "friday", label: "Friday", short: "Fri" },
    { key: "saturday", label: "Saturday", short: "Sat" },
    { key: "sunday", label: "Sunday", short: "Sun" },
  ];

  const handleDeleteTask = (dayOfWeek: DayOfWeek, taskId: string) => {
    if (!confirm("Delete this task from the base week template?")) return;

    const updatedTasks = baseWeek[dayOfWeek].filter(
      (task) => task.id !== taskId
    );
    onUpdateBaseWeek({
      ...baseWeek,
      [dayOfWeek]: updatedTasks,
    });
  };

  const handleCopyDay = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
    if (!confirm(`Copy all tasks from ${fromDay} to ${toDay}?`)) return;

    const tasksToCopy = baseWeek[fromDay].map((task) => ({
      ...task,
      id: `${task.id}-${toDay}-${Date.now()}`,
    }));

    onUpdateBaseWeek({
      ...baseWeek,
      [toDay]: [...baseWeek[toDay], ...tasksToCopy].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    });
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Get earliest and latest task times across all days
  const timeRange = useMemo(() => {
    let earliest = 24 * 60;
    let latest = 0;

    Object.values(baseWeek).forEach(
      (
        dayTasks: Omit<
          Task,
          "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
        >[]
      ) => {
        dayTasks.forEach(
          (
            task: Omit<
              Task,
              | "completed"
              | "quality"
              | "actualDuration"
              | "notes"
              | "completedAt"
            >
          ) => {
            const start = timeToMinutes(task.startTime);
            const end = timeToMinutes(task.endTime);
            earliest = Math.min(earliest, start);
            latest = Math.max(latest, end);
          }
        );
      }
    );

    const startHour = Math.max(0, Math.floor(earliest / 60) - 1);
    const endHour = Math.min(24, Math.ceil(latest / 60) + 1);

    return { startHour, endHour };
  }, [baseWeek]);

  const visibleHours = useMemo(() => {
    return HOURS.slice(timeRange.startHour, timeRange.endHour);
  }, [timeRange]);

  return (
    <div className="flex flex-col h-full">
      {/* Info Banner */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
        <h3 className="text-blue-300 font-semibold mb-1">
          📋 Base Week Template
        </h3>
        <p className="text-sm text-blue-200">
          Set up your repeatable weekly schedule. These tasks will automatically
          appear for each day of the week.
        </p>
      </div>

      {/* Header with Quick Actions */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-white">Base Week Template</h2>
          <div className="flex items-center space-x-2">
            {selectedDay && (
              <>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleCopyDay(e.target.value as DayOfWeek, selectedDay);
                      e.target.value = "";
                    }
                  }}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Copy from...
                  </option>
                  {days
                    .filter((d) => d.key !== selectedDay)
                    .map((day) => (
                      <option key={day.key} value={day.key}>
                        {day.label}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => onAddTask(selectedDay)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Task
                </button>
              </>
            )}
          </div>
        </div>

        {/* Day selector buttons */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {days.map((day) => (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedDay === day.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {day.label}
              <span className="ml-2 text-xs opacity-75">
                ({baseWeek[day.key].length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Grid - Week View Style */}
      <div className="flex-1 overflow-auto bg-gray-900">
        {!selectedDay ? (
          // Show all days when no day selected
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
                  <div className="w-16 flex-shrink-0 pr-2 pt-1">
                    <span className="text-xs text-gray-400 font-medium">
                      {formatHour(hour)}
                    </span>
                  </div>

                  {days.map((day) => (
                    <button
                      key={`${day.key}-${hour}`}
                      onClick={() => setSelectedDay(day.key)}
                      className="flex-1 border-l border-gray-800 hover:bg-gray-800/50 transition-colors"
                      style={{ height: "60px" }}
                    />
                  ))}
                </div>

                <div
                  className="absolute left-16 right-0 border-t border-gray-800"
                  style={{ top: "30px" }}
                />
              </div>
            ))}

            {/* Task blocks for each day */}
            {days.map((day, dayIndex) => {
              const dayTasks = baseWeek[day.key];

              return (
                <div
                  key={day.key}
                  className="absolute top-0 bottom-0"
                  style={{
                    left: `calc(4rem + ${dayIndex} * (100% - 4rem) / 7)`,
                    width: `calc((100% - 4rem) / 7)`,
                  }}
                >
                  {dayTasks.map((task) => {
                    const startMinutes = timeToMinutes(task.startTime);
                    const endMinutes = timeToMinutes(task.endTime);
                    const duration = endMinutes - startMinutes;

                    const top =
                      ((startMinutes - timeRange.startHour * 60) / 60) * 60;
                    const height = (duration / 60) * 60;

                    return (
                      <button
                        key={task.id}
                        onClick={() => {
                          setSelectedDay(day.key);
                          onEditTask(day.key, task);
                        }}
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
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* Day headers at top */}
            <div className="absolute top-0 left-16 right-0 h-8 bg-gray-800/90 border-b border-gray-700 flex backdrop-blur-sm">
              {days.map((day, dayIndex) => (
                <div
                  key={day.key}
                  className="flex-1 text-center py-1 border-l border-gray-700 first:border-l-0"
                >
                  <span className="text-xs text-gray-300 font-medium">
                    {day.short}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Show single day in detail when selected
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
                  <div className="w-20 flex-shrink-0 pr-2 pt-1">
                    <span className="text-xs text-gray-400 font-medium">
                      {formatHour(hour)}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddTask(selectedDay)}
                    className="flex-1 hover:bg-gray-800/50 transition-colors"
                    style={{ height: "60px" }}
                  />
                </div>

                <div
                  className="absolute left-20 right-0 border-t border-gray-800"
                  style={{ top: "30px" }}
                />
              </div>
            ))}

            {/* Task blocks */}
            <div className="absolute left-20 right-0 top-0 bottom-0">
              {baseWeek[selectedDay].map((task) => {
                const startMinutes = timeToMinutes(task.startTime);
                const endMinutes = timeToMinutes(task.endTime);
                const duration = endMinutes - startMinutes;

                const top =
                  ((startMinutes - timeRange.startHour * 60) / 60) * 60;
                const height = (duration / 60) * 60;

                return (
                  <div
                    key={task.id}
                    className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 transition-all ${
                      CATEGORY_COLORS_DARK[task.category]
                    }`}
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, 30)}px`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 h-full">
                      <button
                        onClick={() => onEditTask(selectedDay, task)}
                        className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
                      >
                        <h3 className="text-sm font-semibold text-white truncate">
                          {task.name}
                        </h3>
                        <p className="text-xs text-white/90 mt-1">
                          {task.startTime} - {task.endTime}
                        </p>
                        {height > 60 && task.note && (
                          <p className="text-xs text-white/70 mt-1 line-clamp-2">
                            {task.note}
                          </p>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(selectedDay, task.id);
                        }}
                        className="text-white/50 hover:text-red-400 transition-colors flex-shrink-0 p-1"
                        aria-label="Delete task"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer with quick actions */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            {selectedDay ? (
              <>
                <span>
                  {days.find((d) => d.key === selectedDay)?.label}:{" "}
                  {baseWeek[selectedDay].length} tasks
                </span>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  ← Back to week view
                </button>
              </>
            ) : (
              <>
                <span>Click any day to edit in detail</span>
                <span>•</span>
                <span>Click tasks to edit</span>
              </>
            )}
          </div>

          {selectedDay && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (
                    !confirm(
                      `Clear all tasks for ${
                        days.find((d) => d.key === selectedDay)?.label
                      }?`
                    )
                  )
                    return;
                  onUpdateBaseWeek({
                    ...baseWeek,
                    [selectedDay]: [],
                  });
                }}
                className="px-3 py-1.5 text-sm bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                Clear Day
              </button>
              <button
                onClick={() => {
                  if (
                    !confirm(
                      "Apply this day's tasks to all weekdays (Mon-Fri)?"
                    )
                  )
                    return;
                  const tasksToCopy = baseWeek[selectedDay];
                  const weekdays: DayOfWeek[] = [
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                  ];
                  const updated = { ...baseWeek };

                  weekdays.forEach((day) => {
                    updated[day] = tasksToCopy.map((task) => ({
                      ...task,
                      id: `${task.id}-${day}-${Date.now()}`,
                    }));
                  });

                  onUpdateBaseWeek(updated);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600/20 border border-blue-600 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
              >
                Apply to Weekdays
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
