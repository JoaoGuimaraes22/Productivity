"use client";

import { DayTasks } from "@/app/lib/types";
import { CATEGORY_COLORS } from "@/app/lib/types";
import { useMemo } from "react";

interface StatisticsViewProps {
  tasks: DayTasks;
}

export default function StatisticsView({ tasks }: StatisticsViewProps) {
  const statistics = useMemo(() => {
    const allDates = Object.keys(tasks).sort();
    if (allDates.length === 0) return null;

    let totalTasks = 0;
    let completedTasks = 0;
    const categoryStats: Record<string, { completed: number; total: number }> =
      {};
    const taskStats: Record<
      string,
      {
        name: string;
        completed: number;
        total: number;
        avgQuality: number;
        qualityCount: number;
      }
    > = {};
    const dailyCompletion: { date: string; percentage: number }[] = [];

    allDates.forEach((date) => {
      const dayTasks = tasks[date];
      let dayCompleted = 0;
      const dayTotal = dayTasks.length;

      dayTasks.forEach((task) => {
        totalTasks++;
        if (task.completed) {
          completedTasks++;
          dayCompleted++;

          // Category stats
          if (!categoryStats[task.category]) {
            categoryStats[task.category] = { completed: 0, total: 0 };
          }
          categoryStats[task.category].completed++;

          // Individual task stats
          if (!taskStats[task.id]) {
            taskStats[task.id] = {
              name: task.name,
              completed: 0,
              total: 0,
              avgQuality: 0,
              qualityCount: 0,
            };
          }
          taskStats[task.id].completed++;
          if (task.quality) {
            taskStats[task.id].avgQuality += task.quality;
            taskStats[task.id].qualityCount++;
          }
        }

        // Count totals
        if (!categoryStats[task.category]) {
          categoryStats[task.category] = { completed: 0, total: 0 };
        }
        categoryStats[task.category].total++;

        if (!taskStats[task.id]) {
          taskStats[task.id] = {
            name: task.name,
            completed: 0,
            total: 0,
            avgQuality: 0,
            qualityCount: 0,
          };
        }
        taskStats[task.id].total++;
      });

      dailyCompletion.push({
        date,
        percentage: (dayCompleted / dayTotal) * 100,
      });
    });

    // Calculate average quality for each task
    Object.keys(taskStats).forEach((taskId) => {
      if (taskStats[taskId].qualityCount > 0) {
        taskStats[taskId].avgQuality =
          taskStats[taskId].avgQuality / taskStats[taskId].qualityCount;
      }
    });

    // Current streak
    let currentStreak = 0;
    for (let i = allDates.length - 1; i >= 0; i--) {
      const dayTasks = tasks[allDates[i]];
      const completed = dayTasks.filter((t) => t.completed).length;
      const completionRate = (completed / dayTasks.length) * 100;

      if (completionRate >= 80) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalDays: allDates.length,
      overallCompletion: (completedTasks / totalTasks) * 100,
      categoryStats,
      taskStats,
      dailyCompletion,
      currentStreak,
    };
  }, [tasks]);

  if (!statistics) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 border text-center">
        <p className="text-gray-600">
          No data yet. Start tracking your tasks to see statistics!
        </p>
      </div>
    );
  }

  const {
    totalDays,
    overallCompletion,
    categoryStats,
    taskStats,
    dailyCompletion,
    currentStreak,
  } = statistics;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <p className="text-sm text-gray-600">Total Days</p>
          <p className="text-2xl font-bold text-gray-900">{totalDays}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-blue-600">
            {overallCompletion.toFixed(1)}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <p className="text-sm text-gray-600">Current Streak</p>
          <p className="text-2xl font-bold text-green-600">
            {currentStreak} days
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-purple-600">
            {Object.keys(categoryStats).length}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Category Performance
        </h2>
        <div className="space-y-4">
          {Object.entries(categoryStats).map(([category, stats]) => {
            const percentage = (stats.completed / stats.total) * 100;
            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-medium ${
                      CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
                    }`}
                  >
                    {category}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {stats.completed}/{stats.total} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Task Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Task Performance
        </h2>
        <div className="space-y-3">
          {Object.entries(taskStats)
            .sort(
              (a, b) =>
                b[1].completed / b[1].total - a[1].completed / a[1].total
            )
            .map(([taskId, stats]) => {
              const percentage = (stats.completed / stats.total) * 100;
              return (
                <div
                  key={taskId}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">
                      {stats.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {stats.completed}/{stats.total}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                    {stats.qualityCount > 0 && (
                      <span className="text-sm text-yellow-600 font-medium">
                        ⭐ {stats.avgQuality.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Daily Completion Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Completion Trend
        </h2>
        <div className="space-y-2">
          {dailyCompletion
            .slice(-14)
            .reverse()
            .map((day) => (
              <div key={day.date} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-24">{day.date}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div
                    className={`h-6 rounded-full flex items-center justify-end px-2 ${
                      day.percentage >= 80
                        ? "bg-green-500"
                        : day.percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${day.percentage}%` }}
                  >
                    <span className="text-xs font-semibold text-white">
                      {day.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
