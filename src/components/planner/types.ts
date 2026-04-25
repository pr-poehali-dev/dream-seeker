export type Priority = {
  id: string;
  name: string;
  color: string;
};

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  date?: string; // ISO date string
  priorityId?: string;
  categoryId?: string;
  listId?: string;
  subtasks: SubTask[];
  notes?: string;
};

export type TaskList = {
  id: string;
  name: string;
  categoryId: string;
};

export type TimeCategory = {
  id: string;
  name: string;
  icon: string;
  type: "time";
};

export type DirectionCategory = {
  id: string;
  name: string;
  icon: string;
  type: "direction";
  color: string;
};

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  completedDates: string[]; // ISO date strings
  targetDays: number; // streak goal
};

export type AppData = {
  tasks: Task[];
  lists: TaskList[];
  timeCategories: TimeCategory[];
  directionCategories: DirectionCategory[];
  priorities: Priority[];
  habits: Habit[];
};
