"use client";

import { useState, useEffect } from "react";
import { Task, DayTasks, TASK_TEMPLATE } from "@/app/lib/types";
import TodayView from "@/app/components/TodayView";
import StatisticsView from "@/app/components/StatisticsView";
import HistoryView from "@/app/components/HistoryView";
import TaskModal from "@/app/components/TaskModal";

export default function Home() {
  const [currentView, setCurrentView] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState<DayTasks>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Load tasks from API on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to API whenever they change
  useEffect(() => {
    if (!loading) {
      saveTasks();
    }
  }, [tasks, loading]);

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async () => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tasks),
      });
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const getTodaysTasks = (): Task[] => {
    if (!tasks[selectedDate]) {
      return TASK_TEMPLATE.map((t) => ({
        ...t,
        completed: false,
        quality: null,
        actualDuration: null,
        notes: "",
        completedAt: null,
      }));
    }
    return tasks[selectedDate];
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) => ({
      ...prev,
      [selectedDate]: getTodaysTasks().map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      ),
    }));
  };

  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const saveTaskDetails = (
    taskId: string,
    details: { quality: number; actualDuration: number | null; notes: string }
  ) => {
    updateTask(taskId, {
      ...details,
      completed: true,
      completedAt: new Date().toISOString(),
    });
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Task Tracker</h1>
          <p className="text-sm text-gray-600">
            Track your daily routine with detailed insights
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView("today")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                currentView === "today"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setCurrentView("statistics")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                currentView === "statistics"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                currentView === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentView === "today" && (
          <TodayView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            tasks={getTodaysTasks()}
            updateTask={updateTask}
            openTaskModal={openTaskModal}
          />
        )}

        {currentView === "statistics" && <StatisticsView tasks={tasks} />}

        {currentView === "history" && (
          <HistoryView
            tasks={tasks}
            setSelectedDate={setSelectedDate}
            setCurrentView={setCurrentView}
          />
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={saveTaskDetails}
        />
      )}
    </div>
  );
}
