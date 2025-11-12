"use client";

import { useState, useEffect } from "react";
import {
  Task,
  DayTasks,
  TASK_TEMPLATE,
  BaseWeekTemplate,
  SpecificDayTasks,
  DayOfWeek,
  mergeTasks,
  getDayOfWeek,
} from "@/app/lib/types";
import TodayView from "@/app/components/TodayView";
import StatisticsView from "@/app/components/StatisticsView";
import HistoryView from "@/app/components/HistoryView";
import CalendarView from "@/app/components/CalendarView";
import WeekView from "@/app/components/WeekView";
import BaseWeekEditor from "@/app/components/BaseWeekEditor";
import TimeBlockView from "@/app/components/TimeBlockView";
import WeekTimeBlockView from "@/app/components/WeekTimeBlockView";
import TaskModal from "@/app/components/TaskModal";
import TaskEditorModal from "@/app/components/TaskEditorModal";

export default function Home() {
  const [currentView, setCurrentView] = useState("timeblock");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [tasks, setTasks] = useState<DayTasks>({});
  const [baseWeek, setBaseWeek] = useState<BaseWeekTemplate>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });
  const [specificTasks, setSpecificTasks] = useState<SpecificDayTasks>({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingDayOfWeek, setEditingDayOfWeek] = useState<DayOfWeek | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Load data from API on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save tasks to API whenever they change
  useEffect(() => {
    if (!loading) {
      saveTasks();
    }
  }, [tasks, loading]);

  // Save planner data whenever it changes
  useEffect(() => {
    if (!loading) {
      savePlannerData();
    }
  }, [baseWeek, specificTasks, loading]);

  const loadData = async () => {
    try {
      const [tasksRes, plannerRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/planner"),
      ]);

      const tasksData = await tasksRes.json();
      const plannerData = await plannerRes.json();

      setTasks(tasksData);
      setBaseWeek(plannerData.baseWeek);
      setSpecificTasks(plannerData.specificTasks);
    } catch (error) {
      console.error("Error loading data:", error);
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

  const savePlannerData = async () => {
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ baseWeek, specificTasks }),
      });
    } catch (error) {
      console.error("Error saving planner data:", error);
    }
  };

  const getTodaysTasks = (): Task[] => {
    if (!tasks[selectedDate]) {
      // Use planner data if available, otherwise fall back to template
      const plannedTasks = mergeTasks(selectedDate, baseWeek, specificTasks);

      if (plannedTasks.length > 0) {
        return plannedTasks.map((t) => ({
          ...t,
          completed: false,
          quality: null,
          actualDuration: null,
          notes: "",
          completedAt: null,
        }));
      }

      // Fallback to template
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

  const handleAddTask = (dayOfWeek?: DayOfWeek) => {
    setEditingTask(null);
    setEditingDayOfWeek(dayOfWeek || null);
    setShowTaskEditor(true);
  };

  const handleEditTask = (task: Task, dayOfWeek?: DayOfWeek) => {
    setEditingTask(task);
    setEditingDayOfWeek(dayOfWeek || null);
    setShowTaskEditor(true);
  };

  const handleSaveTask = (
    taskData: Omit<
      Task,
      "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
    >
  ) => {
    // If editing base week task
    if (editingDayOfWeek) {
      if (editingTask) {
        // Update existing base week task
        setBaseWeek((prev) => ({
          ...prev,
          [editingDayOfWeek]: prev[editingDayOfWeek].map((task) =>
            task.id === editingTask.id ? taskData : task
          ),
        }));
      } else {
        // Add new base week task
        setBaseWeek((prev) => ({
          ...prev,
          [editingDayOfWeek]: [...prev[editingDayOfWeek], taskData].sort(
            (a, b) => a.startTime.localeCompare(b.startTime)
          ),
        }));
      }
    } else {
      // Regular day task
      const dayTasks = getTodaysTasks();

      if (editingTask) {
        setTasks((prev) => ({
          ...prev,
          [selectedDate]: dayTasks.map((task) =>
            task.id === editingTask.id
              ? {
                  ...task,
                  ...taskData,
                }
              : task
          ),
        }));
      } else {
        const newTask: Task = {
          ...taskData,
          completed: false,
          quality: null,
          actualDuration: null,
          notes: "",
          completedAt: null,
        };

        setTasks((prev) => ({
          ...prev,
          [selectedDate]: [...dayTasks, newTask].sort((a, b) =>
            a.startTime.localeCompare(b.startTime)
          ),
        }));
      }
    }

    setShowTaskEditor(false);
    setEditingTask(null);
    setEditingDayOfWeek(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (editingDayOfWeek) {
      // Delete from base week
      setBaseWeek((prev) => ({
        ...prev,
        [editingDayOfWeek]: prev[editingDayOfWeek].filter(
          (task) => task.id !== taskId
        ),
      }));
    } else {
      // Delete from regular day
      setTasks((prev) => ({
        ...prev,
        [selectedDate]: getTodaysTasks().filter((task) => task.id !== taskId),
      }));
    }

    setShowTaskEditor(false);
    setEditingTask(null);
    setEditingDayOfWeek(null);
  };

  const handleEditDay = (date: string, dayOfWeek: string) => {
    setSelectedDate(date);
    setCurrentView("timeblock");
  };

  const handleTimeSlotClick = (time: string) => {
    // Open task editor with pre-filled time
    setEditingTask(null);
    setEditingDayOfWeek(null);
    setShowTaskEditor(true);
    // TODO: Pass time to task editor to pre-fill start time
  };

  const handleTaskClickFromTimeBlock = (task: Task) => {
    if (task.completed) {
      // If completed, open details modal
      openTaskModal(task);
    } else {
      // If not completed, mark as complete
      openTaskModal(task);
    }
  };

  const handleWeekTimeSlotClick = (date: string, time: string) => {
    setSelectedDate(date);
    handleTimeSlotClick(time);
  };

  const handleWeekTaskClick = (date: string, taskId: string) => {
    setSelectedDate(date);
    const dayTasks = tasks[date] || getTodaysTasks();
    const task = dayTasks.find((t) => t.id === taskId);
    if (task) {
      handleTaskClickFromTimeBlock(task);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Task Tracker</h1>
          <p className="text-sm text-gray-400">
            Track your daily routine with detailed insights
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setCurrentView("timeblock")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "timeblock"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setCurrentView("weektimeblock")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "weektimeblock"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView("today")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "today"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setCurrentView("baseweek")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "baseweek"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Base Week
            </button>
            <button
              onClick={() => setCurrentView("calendar")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "calendar"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setCurrentView("statistics")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "statistics"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`py-3 px-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentView === "history"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              History
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 h-[calc(100vh-200px)]">
        {currentView === "timeblock" && (
          <TimeBlockView
            selectedDate={selectedDate}
            tasks={getTodaysTasks()}
            onTaskClick={handleTaskClickFromTimeBlock}
            onAddTask={() => handleAddTask()}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {currentView === "weektimeblock" && (
          <WeekTimeBlockView
            baseWeek={baseWeek}
            specificTasks={specificTasks}
            onTaskClick={handleWeekTaskClick}
            onTimeSlotClick={handleWeekTimeSlotClick}
          />
        )}

        {currentView === "today" && (
          <TodayView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            tasks={getTodaysTasks()}
            updateTask={updateTask}
            openTaskModal={openTaskModal}
            onAddTask={() => handleAddTask()}
            onEditTask={(task) => handleEditTask(task)}
          />
        )}

        {currentView === "week" && (
          <WeekView
            baseWeek={baseWeek}
            specificTasks={specificTasks}
            onEditDay={handleEditDay}
          />
        )}

        {currentView === "baseweek" && (
          <BaseWeekEditor
            baseWeek={baseWeek}
            onUpdateBaseWeek={setBaseWeek}
            onAddTask={(day) => handleAddTask(day)}
            onEditTask={(day, task) => {
              // Convert template task to full Task by adding completion fields
              const fullTask: Task = {
                ...task,
                completed: false,
                quality: null,
                actualDuration: null,
                notes: "",
                completedAt: null,
              };
              handleEditTask(fullTask, day);
            }}
          />
        )}

        {currentView === "calendar" && (
          <CalendarView
            tasks={tasks}
            setSelectedDate={setSelectedDate}
            setCurrentView={setCurrentView}
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

      {/* Task Detail Modal (for completion) */}
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

      {/* Task Editor Modal (for add/edit) */}
      {showTaskEditor && (
        <TaskEditorModal
          task={editingTask || undefined}
          onClose={() => {
            setShowTaskEditor(false);
            setEditingTask(null);
            setEditingDayOfWeek(null);
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
}
