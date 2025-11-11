"use client";

import { Task } from "@/app/lib/types";
import { useState } from "react";

interface TaskEditorModalProps {
  task?: Task; // If provided, we're editing. If not, we're creating new
  onClose: () => void;
  onSave: (
    task: Omit<
      Task,
      "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
    >
  ) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskEditorModal({
  task,
  onClose,
  onSave,
  onDelete,
}: TaskEditorModalProps) {
  const [name, setName] = useState(task?.name || "");
  const [startTime, setStartTime] = useState(task?.startTime || "09:00");
  const [endTime, setEndTime] = useState(task?.endTime || "10:00");
  const [category, setCategory] = useState<Task["category"]>(
    task?.category || "work"
  );
  const [note, setNote] = useState(task?.note || "");

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a task name");
      return;
    }

    const newTask = {
      id: task?.id || `custom-${crypto.randomUUID()}`,
      name: name.trim(),
      startTime,
      endTime,
      category,
      color: getCategoryColor(category),
      note: note.trim() || undefined,
      isCustom: true,
    };

    onSave(newTask);
  };

  const getCategoryColor = (cat: Task["category"]) => {
    const colorMap = {
      routine: "blue",
      fitness: "red",
      rest: "green",
      work: "purple",
      variable: "yellow",
    };
    return colorMap[cat];
  };

  const handleDelete = () => {
    if (
      task &&
      onDelete &&
      confirm("Are you sure you want to delete this task?")
    ) {
      onDelete(task.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {task ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Meeting"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Task["category"])
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="routine">Routine</option>
                <option value="fitness">Fitness</option>
                <option value="rest">Rest</option>
                <option value="work">Work</option>
                <option value="variable">Variable</option>
              </select>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Note (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Additional details..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {task && task.isCustom && onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {task ? "Update" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
