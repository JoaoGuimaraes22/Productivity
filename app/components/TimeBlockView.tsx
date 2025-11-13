"use client";

import { Task } from "@/app/lib/types";
import {
  timeToMinutes,
  minutesToTime,
  formatHour,
  HOURS,
  CATEGORY_COLORS_DARK,
  isTodayString,
} from "@/app/lib/utils";
import { useMemo } from "react";

interface TimeBlockViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onTimeSlotClick: (time: string) => void;
}

const COMPLETED_OVERLAY = "opacity-60";

export default function TimeBlockView({
  selectedDate,
  setSelectedDate,
  tasks,
  onTaskClick,
  onAddTask,
  onTimeSlotClick,
}: TimeBlockViewProps) {
  const isToday = isTodayString(selectedDate);
  const today = new Date().toISOString().split("T")[0];

  // Calculate completion stats
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage = tasks.length > 0
    ? (completedCount / tasks.length) * 100
    : 0;

  // Calculate task positions and heights with overlap detection
  const taskBlocks = useMemo(() => {
    // Sort tasks by start time, then by duration (longer tasks first)
    const sortedTasks = [...tasks].sort((a, b) => {
      const aStart = timeToMinutes(a.startTime);
      const bStart = timeToMinutes(b.startTime);
      if (aStart !== bStart) return aStart - bStart;
      const aDuration = timeToMinutes(a.endTime) - aStart;
      const bDuration = timeToMinutes(b.endTime) - bStart;
      return bDuration - aDuration;
    });

    // Define task block type
    type TaskBlock = {
      task: Task;
      top: number;
      height: number;
      startMinutes: number;
      endMinutes: number;
      column: number;
      totalColumns: number;
    };

    // Calculate basic properties for each task
    const taskData: TaskBlock[] = sortedTasks.map((task) => {
      const startMinutes = timeToMinutes(task.startTime);
      const endMinutes = timeToMinutes(task.endTime);
      const duration = endMinutes - startMinutes;
      const top = (startMinutes / 60) * 60;
      const height = (duration / 60) * 60;

      return {
        task,
        top,
        height,
        startMinutes,
        endMinutes,
        column: 0,
        totalColumns: 1,
      };
    });

    // Assign columns to overlapping tasks
    const columns: TaskBlock[][] = [];

    taskData.forEach((currentTask) => {
      // Find the first column where this task doesn't overlap
      let assignedColumn = 0;
      let placed = false;

      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const column = columns[colIndex];
        const hasOverlap = column.some((existingTask) => {
          // Check if tasks overlap in time
          return (
            currentTask.startMinutes < existingTask.endMinutes &&
            currentTask.endMinutes > existingTask.startMinutes
          );
        });

        if (!hasOverlap) {
          column.push(currentTask);
          currentTask.column = colIndex;
          placed = true;
          break;
        }
      }

      // If no suitable column found, create a new one
      if (!placed) {
        assignedColumn = columns.length;
        columns.push([currentTask]);
        currentTask.column = assignedColumn;
      }
    });

    // Calculate total columns needed for each task's time range
    taskData.forEach((currentTask) => {
      let maxColumns = 1;

      // Find all tasks that overlap with this task
      taskData.forEach((otherTask) => {
        if (
          currentTask.startMinutes < otherTask.endMinutes &&
          currentTask.endMinutes > otherTask.startMinutes
        ) {
          maxColumns = Math.max(maxColumns, otherTask.column + 1);
        }
      });

      currentTask.totalColumns = maxColumns;
    });

    return taskData;
  }, [tasks]);

  // Calculate current time indicator position
  const currentTimePosition = useMemo(() => {
    if (!isToday) return null;

    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes / 60) * 60; // Convert to pixels
  }, [isToday]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Date Selector and Progress */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-20 space-y-4">
        {/* Date Selector */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Select Date
              </label>
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(today)}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors font-medium"
                >
                  Go to Today
                </button>
              )}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onAddTask}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2 self-end"
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

        {/* Selected Date Display */}
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

        {/* Daily Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-300">Daily Progress</h3>
            <span className="text-lg font-bold text-blue-400">
              {completedCount}/{tasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {completionPercentage.toFixed(0)}% complete
          </p>
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
            {taskBlocks.map(({ task, top, height, column, totalColumns }) => {
              // Calculate width and left position based on column
              const widthPercent = 100 / totalColumns;
              const leftPercent = (column / totalColumns) * 100;

              return (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className={`absolute rounded-lg border-l-4 p-2 transition-all cursor-pointer ${
                    CATEGORY_COLORS_DARK[task.category]
                  } ${task.completed ? COMPLETED_OVERLAY : ""}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: "30px",
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    paddingLeft: column === 0 ? "0.5rem" : "0.25rem",
                    paddingRight:
                      column === totalColumns - 1 ? "0.5rem" : "0.25rem",
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
            );
            })}
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
