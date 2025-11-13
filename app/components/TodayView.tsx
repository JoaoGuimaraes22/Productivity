"use client";

import { Task } from "@/app/lib/types";

interface TodayViewProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  tasks: Task[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  openTaskModal: (task: Task) => void;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

const CATEGORY_COLORS_DARK = {
  routine: "bg-blue-900 text-blue-300 border-blue-700",
  fitness: "bg-red-900 text-red-300 border-red-700",
  rest: "bg-green-900 text-green-300 border-green-700",
  work: "bg-purple-900 text-purple-300 border-purple-700",
  variable: "bg-yellow-900 text-yellow-300 border-yellow-700",
};

export default function TodayView({
  selectedDate,
  setSelectedDate,
  tasks,
  updateTask,
  openTaskModal,
  onAddTask,
  onEditTask,
}: TodayViewProps) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const completionPercentage = (completedCount / tasks.length) * 100;
  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Select Date
          </label>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(today)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors font-medium"
            >
              Go to Today
            </button>
          )}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Daily Progress</h2>
          <span className="text-2xl font-bold text-blue-400">
            {completedCount}/{tasks.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {completionPercentage.toFixed(0)}% complete
        </p>
      </div>

      {/* Add Task Button */}
      <button
        onClick={onAddTask}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
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
          <path d="M12 4v16m8-8H4"></path>
        </svg>
        <span>Add Custom Task</span>
      </button>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-gray-800 rounded-lg shadow-sm border-2 transition-all ${
              task.completed
                ? "border-green-600 bg-gray-750"
                : "border-gray-700"
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
                  className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    task.completed
                      ? "bg-green-600 border-green-600"
                      : "border-gray-600 hover:border-blue-500"
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
                          ? "text-gray-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {task.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        CATEGORY_COLORS_DARK[task.category]
                      }`}
                    >
                      {task.category}
                    </span>
                    {task.isCustom && (
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-900 text-indigo-300 border-indigo-700">
                        custom
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
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
                      <p className="text-gray-300">📝 {task.notes}</p>
                    )}
                    {task.note && !task.completed && (
                      <p className="text-gray-500 italic">{task.note}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Edit Task Button */}
                  <button
                    onClick={() => onEditTask(task)}
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

                  {/* Edit Completion Button (if completed) */}
                  {task.completed && (
                    <button
                      onClick={() => openTaskModal(task)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
