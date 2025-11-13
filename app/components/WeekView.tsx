"use client";

import {
  BaseWeekTemplate,
  SpecificDayTasks,
  getDayOfWeek,
  mergeTasks,
} from "@/app/lib/types";
import {
  formatDate,
  getMondayOfWeek,
  isToday,
  DAY_KEYS,
  DAY_LABELS_SHORT,
} from "@/app/lib/utils";
import { useState } from "react";

interface WeekViewProps {
  baseWeek: BaseWeekTemplate;
  specificTasks: SpecificDayTasks;
  onEditDay: (date: string, dayOfWeek: string) => void;
}

const CATEGORY_COLORS_DARK = {
  routine: "bg-blue-900 text-blue-300 border-blue-700",
  fitness: "bg-red-900 text-red-300 border-red-700",
  rest: "bg-green-900 text-green-300 border-green-700",
  work: "bg-purple-900 text-purple-300 border-purple-700",
  variable: "bg-yellow-900 text-yellow-300 border-yellow-700",
};

export default function WeekView({
  baseWeek,
  specificTasks,
  onEditDay,
}: WeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getMondayOfWeek(new Date())
  );

  // Generate dates for the current week
  const weekDates = DAY_KEYS.map((_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return date;
  });

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

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
        <div className="flex items-center justify-between">
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
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDates.map((date, index) => {
          const dateString = formatDate(date);
          const dayOfWeek = getDayOfWeek(dateString);
          const tasks = mergeTasks(dateString, baseWeek, specificTasks);
          const repeatableCount = tasks.filter((t) => t.isRepeatable).length;
          const specificCount = tasks.filter((t) => !t.isRepeatable).length;

          return (
            <div
              key={dateString}
              className={`bg-gray-800 rounded-lg shadow-sm border-2 transition-all ${
                isToday(date) ? "border-blue-500" : "border-gray-700"
              }`}
            >
              <div className="p-3 border-b border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white">
                    {DAY_LABELS_SHORT[index]}
                  </h3>
                  {isToday(date) && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center space-x-2 mt-2 text-xs">
                  <span className="text-gray-400">
                    📋 {repeatableCount} • ⭐ {specificCount}
                  </span>
                </div>
              </div>

              <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No tasks
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-2 rounded border ${
                        CATEGORY_COLORS_DARK[task.category]
                      } ${task.isRepeatable ? "" : "ring-2 ring-yellow-500"}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-xs font-medium leading-tight">
                          {task.name}
                        </h4>
                        {!task.isRepeatable && (
                          <span className="text-[10px] text-yellow-400">★</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {task.startTime} - {task.endTime}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-gray-700">
                <button
                  onClick={() => onEditDay(dateString, dayOfWeek)}
                  className="w-full py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  Edit Day
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-700 border border-gray-600 rounded"></div>
            <span className="text-sm text-gray-300">📋 Repeatable Task</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-700 border-2 border-yellow-500 rounded ring-1 ring-yellow-500"></div>
            <span className="text-sm text-gray-300">⭐ Specific Task</span>
          </div>
        </div>
      </div>
    </div>
  );
}
