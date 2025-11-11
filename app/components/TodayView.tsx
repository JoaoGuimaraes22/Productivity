"use client";

import { Task } from "@/app/lib/types";
import { CATEGORY_COLORS } from "@/app/lib/types";

interface TodayViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  openTaskModal: (task: Task) => void;
}

export default function TodayView({
  selectedDate,
  setSelectedDate,
  tasks,
  updateTask,
  openTaskModal,
}: TodayViewProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage = (completedCount / tasks.length) * 100;

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Daily Progress
          </h2>
          <span className="text-2xl font-bold text-blue-600">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completionPercentage.toFixed(0)}% complete
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
              task.completed
                ? "border-green-400 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  onClick={() => {
                    if (!task.completed) {
                      openTaskModal(task);
                    } else {
                      updateTask(task.id, {
                        completed: false,
                        quality: null,
                        actualDuration: null,
                        notes: "",
                        completedAt: null,
                      });
                    }
                  }}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 hover:border-blue-500"
                  }`}
                >
                  {task.completed && (
                    <svg
                      className="w-4 h-4 text-white"
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
                </button>

                {/* Task Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3
                      className={`font-semibold ${
                        task.completed
                          ? "text-gray-600 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {task.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        CATEGORY_COLORS[task.category]
                      }`}
                    >
                      {task.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      ⏰ {task.startTime} - {task.endTime}
                    </p>
                    {task.completed && task.quality && (
                      <p>⭐ Quality: {task.quality}/5</p>
                    )}
                    {task.completed && task.actualDuration && (
                      <p>📊 Duration: {task.actualDuration} min</p>
                    )}
                    {task.completed && task.notes && (
                      <p className="text-gray-700">📝 {task.notes}</p>
                    )}
                    {task.note && !task.completed && (
                      <p className="text-gray-500 italic">{task.note}</p>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                {task.completed && (
                  <button
                    onClick={() => openTaskModal(task)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
