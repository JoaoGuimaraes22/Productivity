"use client";

import { BaseWeekTemplate, DayOfWeek, Task } from "@/app/lib/types";
import { useState } from "react";

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
  routine: "bg-blue-900 text-blue-300 border-blue-700",
  fitness: "bg-red-900 text-red-300 border-red-700",
  rest: "bg-green-900 text-green-300 border-green-700",
  work: "bg-purple-900 text-purple-300 border-purple-700",
  variable: "bg-yellow-900 text-yellow-300 border-yellow-700",
};

export default function BaseWeekEditor({
  baseWeek,
  onUpdateBaseWeek,
  onAddTask,
  onEditTask,
}: BaseWeekEditorProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("monday");

  const days: { key: DayOfWeek; label: string }[] = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const currentDayTasks = baseWeek[selectedDay] || [];

  const handleDeleteTask = (taskId: string) => {
    if (!confirm("Delete this task from the base week template?")) return;

    const updatedTasks = currentDayTasks.filter((task) => task.id !== taskId);
    onUpdateBaseWeek({
      ...baseWeek,
      [selectedDay]: updatedTasks,
    });
  };

  const handleCopyDay = (fromDay: DayOfWeek, toDay: DayOfWeek) => {
    if (!confirm(`Copy all tasks from ${fromDay} to ${toDay}?`)) return;

    const tasksToCopy = baseWeek[fromDay].map((task) => ({
      ...task,
      id: `${task.id}-${toDay}-${Date.now()}`, // Generate new ID
    }));

    onUpdateBaseWeek({
      ...baseWeek,
      [toDay]: [...baseWeek[toDay], ...tasksToCopy].sort((a, b) =>
        a.startTime.localeCompare(b.startTime)
      ),
    });
  };

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
        <h3 className="text-blue-300 font-semibold mb-1">
          📋 Base Week Template
        </h3>
        <p className="text-sm text-blue-200">
          Set up your repeatable weekly schedule. These tasks will automatically
          appear for each day of the week.
        </p>
      </div>

      {/* Day Selector */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-2">
        <div className="flex flex-wrap gap-2">
          {days.map((day) => (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-lg font-medium transition-colors ${
                selectedDay === day.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day Tasks */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {days.find((d) => d.key === selectedDay)?.label} Tasks
            </h3>
            <p className="text-sm text-gray-400">
              {currentDayTasks.length} repeatable tasks
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Copy from dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleCopyDay(e.target.value as DayOfWeek, selectedDay);
                    e.target.value = "";
                  }
                }}
                className="px-3 py-2 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors appearance-none pr-8"
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
            </div>
            <button
              onClick={() => onAddTask(selectedDay)}
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

        {/* Task List */}
        <div className="space-y-3">
          {currentDayTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-3">
                No repeatable tasks for this day yet.
              </p>
              <button
                onClick={() => onAddTask(selectedDay)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Add First Task
              </button>
            </div>
          ) : (
            currentDayTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-750 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white">
                          {task.name}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            CATEGORY_COLORS_DARK[task.category]
                          }`}
                        >
                          {task.category}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-900 text-blue-300 border-blue-700">
                          repeatable
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          ⏰ {task.startTime} - {task.endTime}
                        </p>
                        {task.note && (
                          <p className="text-gray-500 italic">{task.note}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onEditTask(selectedDay, task)}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit task"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete task"
                      >
                        <svg
                          className="w-5 h-5"
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (
                !confirm(
                  "Clear all tasks for " +
                    days.find((d) => d.key === selectedDay)?.label +
                    "?"
                )
              )
                return;
              onUpdateBaseWeek({
                ...baseWeek,
                [selectedDay]: [],
              });
            }}
            className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            Clear This Day
          </button>
          <button
            onClick={() => {
              if (!confirm("Apply this day's tasks to all weekdays (Mon-Fri)?"))
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
            className="px-4 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            Apply to All Weekdays
          </button>
        </div>
      </div>
    </div>
  );
}
