"use client";

import { DayTasks } from "@/app/lib/types";

interface HistoryViewProps {
  tasks: DayTasks;
  setSelectedDate: (date: string) => void;
  setCurrentView: (view: string) => void;
}

export default function HistoryView({
  tasks,
  setSelectedDate,
  setCurrentView,
}: HistoryViewProps) {
  const dates = Object.keys(tasks).sort().reverse();

  if (dates.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-700 text-center">
        <p className="text-gray-400">
          No history yet. Start tracking your tasks!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map((date) => {
        const dayTasks = tasks[date];
        const completed = dayTasks.filter((t) => t.completed).length;
        const total = dayTasks.length;
        const percentage = (completed / total) * 100;

        return (
          <div
            key={date}
            className="bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-700 hover:border-blue-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">{date}</h3>
                <p className="text-sm text-gray-400">
                  {completed} of {total} tasks completed
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(date);
                  setCurrentView("today");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View
              </button>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  percentage >= 80
                    ? "bg-green-600"
                    : percentage >= 50
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
