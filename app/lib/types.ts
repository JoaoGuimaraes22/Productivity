export interface Task {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  category: "routine" | "fitness" | "rest" | "work" | "variable";
  color: string;
  note?: string;
  completed: boolean;
  quality: number | null;
  actualDuration: number | null;
  notes: string;
  completedAt: string | null;
  isCustom?: boolean;
  isRepeatable?: boolean; // New: marks if task comes from base week template
}

export interface DayTasks {
  [date: string]: Task[];
}

// New: Base week template (repeatable tasks for each day)
export interface BaseWeekTemplate {
  monday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
  tuesday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
  wednesday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
  thursday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
  friday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
  saturday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
  sunday: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
}

// New: Specific day tasks (one-off tasks for specific dates)
export interface SpecificDayTasks {
  [date: string]: Omit<
    Task,
    "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
  >[];
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const TASK_TEMPLATE: Omit<
  Task,
  "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
>[] = [
  {
    id: "wakeup",
    name: "Wake Up + Eggs",
    startTime: "07:00",
    endTime: "07:15",
    category: "routine",
    color: "blue",
  },
  {
    id: "run",
    name: "Run",
    startTime: "07:15",
    endTime: "08:15",
    category: "fitness",
    color: "red",
  },
  {
    id: "chill1",
    name: "Chill",
    startTime: "08:15",
    endTime: "09:15",
    category: "rest",
    color: "green",
  },
  {
    id: "gotime1",
    name: "Go Time (Morning)",
    startTime: "09:15",
    endTime: "11:15",
    category: "work",
    color: "purple",
  },
  {
    id: "barra",
    name: "Chill + Barra + Coffee",
    startTime: "11:15",
    endTime: "12:15",
    category: "rest",
    color: "green",
  },
  {
    id: "gotime2",
    name: "Go Time (Midday)",
    startTime: "12:15",
    endTime: "13:15",
    category: "work",
    color: "purple",
  },
  {
    id: "almoco",
    name: "Chill + Almoço",
    startTime: "13:15",
    endTime: "14:15",
    category: "rest",
    color: "green",
  },
  {
    id: "gotime3",
    name: "Go Time (Afternoon)",
    startTime: "14:15",
    endTime: "17:15",
    category: "work",
    color: "purple",
  },
  {
    id: "lanche",
    name: "Chill + Lanche",
    startTime: "17:15",
    endTime: "18:15",
    category: "rest",
    color: "green",
  },
  {
    id: "evening",
    name: "Evening Activity",
    startTime: "18:15",
    endTime: "21:00",
    category: "variable",
    color: "yellow",
    note: "Gym, Training, or other activities",
  },
];

export const CATEGORY_COLORS = {
  routine: "bg-blue-100 text-blue-800 border-blue-300",
  fitness: "bg-red-100 text-red-800 border-red-300",
  rest: "bg-green-100 text-green-800 border-green-300",
  work: "bg-purple-100 text-purple-800 border-purple-300",
  variable: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

// Helper to get day of week from date string (YYYY-MM-DD)
export const getDayOfWeek = (dateString: string): DayOfWeek => {
  const date = new Date(dateString + "T12:00:00"); // Add time to avoid timezone issues
  const days: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[date.getDay()];
};

// Helper to merge base week tasks with specific day tasks for a given date
export const mergeTasks = (
  date: string,
  baseWeek: BaseWeekTemplate,
  specificTasks: SpecificDayTasks
): Omit<
  Task,
  "completed" | "quality" | "actualDuration" | "notes" | "completedAt"
>[] => {
  const dayOfWeek = getDayOfWeek(date);
  const baseTasks = baseWeek[dayOfWeek] || [];
  const specificDayTasks = specificTasks[date] || [];

  // Mark base tasks as repeatable
  const markedBaseTasks = baseTasks.map((task) => ({
    ...task,
    isRepeatable: true,
  }));

  // Combine and sort by start time
  return [...markedBaseTasks, ...specificDayTasks].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
};
