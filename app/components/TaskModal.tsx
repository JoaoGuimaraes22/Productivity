"use client";

import { Task } from "@/app/lib/types";
import { useState } from "react";

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onSave: (
    taskId: string,
    details: { quality: number; actualDuration: number | null; notes: string }
  ) => void;
}

export default function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [quality, setQuality] = useState(task.quality || 3);
  const [actualDuration, setActualDuration] = useState(
    task.actualDuration?.toString() || ""
  );
  const [notes, setNotes] = useState(task.notes || "");

  const handleSave = () => {
    onSave(task.id, {
      quality: parseInt(quality.toString()),
      actualDuration: actualDuration ? parseInt(actualDuration) : null,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
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

          <div className="space-y-6">
            {/* Task Name */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {task.name}
              </h3>
              <p className="text-sm text-gray-600">
                {task.startTime} - {task.endTime}
              </p>
            </div>

            {/* Quality Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How did it go? (Quality Rating)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setQuality(rating)}
                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all ${
                      quality >= rating
                        ? "bg-yellow-400 border-yellow-500 scale-110"
                        : "bg-gray-100 border-gray-300 hover:border-yellow-400"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                1 = Poor, 5 = Excellent
              </p>
            </div>

            {/* Actual Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Duration (minutes)
              </label>
              <input
                type="number"
                value={actualDuration}
                onChange={(e) => setActualDuration(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel? Any observations?"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
