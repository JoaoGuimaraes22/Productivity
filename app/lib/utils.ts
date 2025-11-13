// Time utility functions

/**
 * Convert HH:MM time string to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to HH:MM time string
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Format hour number (0-23) to readable time (e.g., "12 AM", "1 PM")
 */
export const formatHour = (hour: number): string => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

// Date utility functions

/**
 * Format Date object as YYYY-MM-DD string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Get Monday of the week for a given date
 */
export const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return formatDate(date) === formatDate(today);
};

/**
 * Check if a date string (YYYY-MM-DD) is today
 */
export const isTodayString = (dateString: string): boolean => {
  const today = new Date();
  return dateString === formatDate(today);
};

// Constants

/**
 * Array of hours from 0-23
 */
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/**
 * Dark theme category colors for tasks
 */
export const CATEGORY_COLORS_DARK = {
  routine: "bg-blue-600 border-blue-500 hover:bg-blue-700",
  fitness: "bg-red-600 border-red-500 hover:bg-red-700",
  rest: "bg-green-600 border-green-500 hover:bg-green-700",
  work: "bg-purple-600 border-purple-500 hover:bg-purple-700",
  variable: "bg-yellow-600 border-yellow-500 hover:bg-yellow-700",
} as const;

/**
 * Simple category colors without hover states
 */
export const CATEGORY_COLORS_SIMPLE = {
  routine: "bg-blue-600 border-blue-500",
  fitness: "bg-red-600 border-red-500",
  rest: "bg-green-600 border-green-500",
  work: "bg-purple-600 border-purple-500",
  variable: "bg-yellow-600 border-yellow-500",
} as const;

/**
 * Day of week configurations
 */
export const DAYS_CONFIG = [
  { key: "monday" as const, label: "Monday", short: "Mon" },
  { key: "tuesday" as const, label: "Tuesday", short: "Tue" },
  { key: "wednesday" as const, label: "Wednesday", short: "Wed" },
  { key: "thursday" as const, label: "Thursday", short: "Thu" },
  { key: "friday" as const, label: "Friday", short: "Fri" },
  { key: "saturday" as const, label: "Saturday", short: "Sat" },
  { key: "sunday" as const, label: "Sunday", short: "Sun" },
] as const;

/**
 * Short day labels only
 */
export const DAY_LABELS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Day keys only
 */
export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Week navigation utilities

/**
 * Hook for week navigation state and functions
 */
export const useWeekNavigation = (initialDate?: Date) => {
  const [currentWeekStart, setCurrentWeekStart] = React.useState(
    getMondayOfWeek(initialDate || new Date())
  );

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

  const weekDates = DAY_KEYS.map((_, index) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + index);
    return date;
  });

  return {
    currentWeekStart,
    setCurrentWeekStart,
    previousWeek,
    nextWeek,
    goToThisWeek,
    isCurrentWeek,
    weekDates,
  };
};

// Time range calculation utilities

interface TaskWithTime {
  startTime: string;
  endTime: string;
}

/**
 * Calculate the time range (start and end hours) for displaying tasks
 * @param tasks Array of tasks with startTime and endTime
 * @param padding Number of hours to pad before/after (default: 1)
 */
export const calculateTimeRange = (
  tasks: TaskWithTime[],
  padding = 1
): { startHour: number; endHour: number } => {
  if (tasks.length === 0) {
    return { startHour: 0, endHour: 24 };
  }

  let earliest = 24 * 60; // Start with end of day
  let latest = 0;

  tasks.forEach((task) => {
    const start = timeToMinutes(task.startTime);
    const end = timeToMinutes(task.endTime);
    earliest = Math.min(earliest, start);
    latest = Math.max(latest, end);
  });

  // Add padding
  const startHour = Math.max(0, Math.floor(earliest / 60) - padding);
  const endHour = Math.min(24, Math.ceil(latest / 60) + padding);

  return { startHour, endHour };
};

/**
 * Get visible hours array based on time range
 */
export const getVisibleHours = (timeRange: {
  startHour: number;
  endHour: number;
}): number[] => {
  return HOURS.slice(timeRange.startHour, timeRange.endHour);
};

// React import for hooks
import React from "react";
