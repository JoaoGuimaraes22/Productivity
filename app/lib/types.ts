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
  isCustom?: boolean; // New: marks if task was custom added
}

export interface DayTasks {
  [date: string]: Task[];
}

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
