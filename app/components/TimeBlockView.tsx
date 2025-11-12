"use client";

import { Task } from "@/app/lib/types";
import { useMemo } from "react";

interface TimeBlockViewProps {
  selectedDate: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onTimeSlotClick: (time: string) => void;
}

const CATEGORY_COLORS_DARK = {
  routine: "bg-blue-600 border-blue-500 hover:bg-blue-700",
  fitness: "bg-red-600 border-red-500 hover:bg-red-700",
  rest: "bg-green-600 border-green-500 hover:bg-green-700",
  work: "bg-purple-600 border-purple-500 hover:bg-purple-700",
  variable: "bg-yellow-600 border-yellow-500 hover:bg-yellow-700",
};

const COMPLETED_OVERLAY = "opacity-60";

// Convert HH:MM to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert minutes to HH:MM
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

// Generate hours from 0-23
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimeBlockView({
  selectedDate,
  tasks,
  onTaskClick,
  onAddTask,
  onTimeSlotClick,
}: TimeBlockViewProps) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  // Calculate task positions and heights
  const taskBlocks = useMemo(() => {
    return tasks.map((task) => {
      const startMinutes = timeToMinutes(task.startTime);
      const endMinutes = timeToMinutes(task.endTime);
      const duration = endMinutes - startMinutes;

      // Calculate position (top) and height in pixels
      // Each hour is 60px tall
      const top = (startMinutes / 60) * 60;
      const height = (duration / 60) * 60;

      return {
        task,
        top,
        height,
        startMinutes,
        endMinutes,
      };
    });
  }, [tasks]);

  // Calculate current time indicator position
  const currentTimePosition = useMemo(() => {
    if (!isToday) return null;

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes / 60) * 60; // Convert to pixels
  }, [isToday]);

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </h2>
            {isToday && (
              <span className="text-sm text-blue-400 font-medium">Today</span>
            )}
          </div>
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
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
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto bg-gray-900">
        <div className="relative" style={{ height: `${24 * 60}px` }}>
          {/* Hour lines and labels */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-gray-700"
              style={{ top: `${hour * 60}px` }}
            >
              <div className="flex">
                {/* Time label */}
                <div className="w-20 flex-shrink-0 pr-2 pt-1">
                  <span className="text-xs text-gray-400 font-medium">
                    {formatHour(hour)}
                  </span>
                </div>

                {/* Clickable time slot */}
                <button
                  onClick={() => onTimeSlotClick(minutesToTime(hour * 60))}
                  className="flex-1 hover:bg-gray-800/50 transition-colors"
                  style={{ height: "60px" }}
                  aria-label={`Add task at ${formatHour(hour)}`}
                />
              </div>

              {/* Half-hour line */}
              <div
                className="absolute left-20 right-0 border-t border-gray-800"
                style={{ top: "30px" }}
              />
            </div>
          ))}

          {/* Task blocks */}
          <div className="absolute left-20 right-0 top-0 bottom-0">
            {taskBlocks.map(({ task, top, height }) => (
              <button
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={`absolute left-1 right-1 rounded-lg border-l-4 p-2 transition-all cursor-pointer ${
                  CATEGORY_COLORS_DARK[task.category]
                } ${task.completed ? COMPLETED_OVERLAY : ""}`}
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  minHeight: "30px",
                }}
              >
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white text-left truncate">
                      {task.name}
                    </h3>
                    {task.completed && (
                      <svg
                        className="w-4 h-4 text-white flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-white/90 mt-1">
                    {task.startTime} - {task.endTime}
                  </p>
                  {height > 60 && task.note && (
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">
                      {task.note}
                    </p>
                  )}
                  {height > 80 && task.completed && (
                    <div className="text-xs text-white/80 mt-auto">
                      {task.quality && <span>⭐ {task.quality}/5</span>}
                    </div>
                  )}
                  {task.isRepeatable && (
                    <span className="absolute top-1 right-1 text-[10px] bg-white/20 px-1 rounded">
                      📋
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Current time indicator */}
          {currentTimePosition !== null && (
            <>
              {/* Red line */}
              <div
                className="absolute left-16 right-0 h-0.5 bg-red-500 z-10 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                {/* Red circle at the start */}
                <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/4" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-800 border-t border-gray-700 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-400">
              {tasks.filter((t) => t.completed).length} completed
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>📋 Repeatable</span>
            <span>•</span>
            <span>Click to edit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
