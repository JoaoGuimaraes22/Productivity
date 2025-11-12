"use client";

import { DayTasks } from "@/app/lib/types";
import { useState, useMemo } from "react";

interface CalendarViewProps {
  tasks: DayTasks;
  setSelectedDate: (date: string) => void;
  setCurrentView: (view: string) => void;
}

// Helper function to format date as YYYY-MM-DD
const formatDateString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export default function CalendarView({
  tasks,
  setSelectedDate,
  setCurrentView,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Get days from previous month to fill the grid
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const daysFromPrevMonth = startingDayOfWeek;

    // Calculate total cells needed
    const totalCells = Math.ceil((daysInMonth + daysFromPrevMonth) / 7) * 7;
    const daysFromNextMonth = totalCells - (daysInMonth + daysFromPrevMonth);

    const days = [];

    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      days.push({
        date,
        dateString: formatDateString(date),
        isCurrentMonth: false,
        day,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        dateString: formatDateString(date),
        isCurrentMonth: true,
        day,
      });
    }

    // Next month days
    for (let day = 1; day <= daysFromNextMonth; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        dateString: formatDateString(date),
        isCurrentMonth: false,
        day,
      });
    }

    return days;
  }, [currentMonth]);

  const getCompletionStats = (dateString: string) => {
    const dayTasks = tasks[dateString];
    if (!dayTasks || dayTasks.length === 0) {
      return null;
    }

    const completed = dayTasks.filter((t) => t.completed).length;
    const total = dayTasks.length;
    const percentage = (completed / total) * 100;

    return { completed, total, percentage };
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage > 0) return "bg-red-500";
    return "bg-gray-600";
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (dateString: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return; // Don't allow clicking on prev/next month days

    const today = new Date().toISOString().split("T")[0];
    if (dateString > today) return; // Don't allow future dates

    setSelectedDate(dateString);
    setCurrentView("today");
  };

  const monthYearString = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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
            <h2 className="text-xl font-bold text-white">{monthYearString}</h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
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

        {/* Day of week headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((dayData, index) => {
            const stats = getCompletionStats(dayData.dateString);
            const isToday = dayData.dateString === today;
            const isFuture = dayData.dateString > today;
            const hasData = stats !== null;

            return (
              <button
                key={index}
                onClick={() =>
                  handleDayClick(dayData.dateString, dayData.isCurrentMonth)
                }
                disabled={!dayData.isCurrentMonth || isFuture}
                className={`
                  aspect-square p-2 rounded-lg border-2 transition-all
                  ${
                    !dayData.isCurrentMonth
                      ? "bg-gray-900 border-gray-800 text-gray-600 cursor-default"
                      : isFuture
                      ? "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"
                      : isToday
                      ? "bg-blue-900 border-blue-500 hover:bg-blue-800"
                      : hasData
                      ? "bg-gray-800 border-gray-600 hover:border-blue-500 hover:bg-gray-750"
                      : "bg-gray-800 border-gray-700 hover:border-gray-500"
                  }
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span
                    className={`text-sm font-semibold mb-1 ${
                      !dayData.isCurrentMonth
                        ? "text-gray-600"
                        : isToday
                        ? "text-blue-300"
                        : isFuture
                        ? "text-gray-500"
                        : "text-white"
                    }`}
                  >
                    {dayData.day}
                  </span>

                  {/* Completion indicator */}
                  {stats && dayData.isCurrentMonth && !isFuture && (
                    <div className="flex flex-col items-center space-y-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getCompletionColor(
                          stats.percentage
                        )}`}
                      />
                      <span className="text-xs text-gray-400">
                        {stats.completed}/{stats.total}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-300">80%+ Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-300">50-79% Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-300">1-49% Complete</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-600"></div>
            <span className="text-sm text-gray-300">No Tasks</span>
          </div>
        </div>
      </div>

      {/* Month Summary */}
      {Object.keys(tasks).some((date) =>
        date.startsWith(
          `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
          ).padStart(2, "0")}`
        )
      ) && (
        <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Month Summary
          </h3>
          {(() => {
            const monthDates = Object.keys(tasks).filter((date) =>
              date.startsWith(
                `${currentMonth.getFullYear()}-${String(
                  currentMonth.getMonth() + 1
                ).padStart(2, "0")}`
              )
            );

            let totalTasks = 0;
            let completedTasks = 0;

            monthDates.forEach((date) => {
              const dayTasks = tasks[date];
              totalTasks += dayTasks.length;
              completedTasks += dayTasks.filter((t) => t.completed).length;
            });

            const monthPercentage =
              totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Days Tracked</span>
                  <span className="text-white font-semibold">
                    {monthDates.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total Tasks</span>
                  <span className="text-white font-semibold">{totalTasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Completed</span>
                  <span className="text-white font-semibold">
                    {completedTasks}
                  </span>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">Completion Rate</span>
                    <span className="text-blue-400 font-bold">
                      {monthPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${monthPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
