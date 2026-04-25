import { useState, useEffect } from "react";
import { AppData } from "./types";

const DEFAULT_DATA: AppData = {
  tasks: [
    {
      id: "t1",
      title: "Пробежка утром",
      completed: false,
      date: new Date().toISOString().split("T")[0],
      priorityId: "p1",
      categoryId: "today",
      listId: undefined,
      subtasks: [],
      notes: "",
    },
    {
      id: "t2",
      title: "Прочитать 20 страниц книги",
      completed: true,
      date: new Date().toISOString().split("T")[0],
      priorityId: "p3",
      categoryId: "today",
      listId: undefined,
      subtasks: [],
      notes: "",
    },
    {
      id: "t3",
      title: "Подготовить презентацию",
      completed: false,
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      priorityId: "p2",
      categoryId: "tomorrow",
      listId: undefined,
      subtasks: [
        { id: "s1", title: "Собрать данные", completed: true },
        { id: "s2", title: "Оформить слайды", completed: false },
      ],
      notes: "",
    },
  ],
  lists: [
    { id: "l1", name: "Продукты", categoryId: "dir-personal" },
    { id: "l2", name: "Учебный план", categoryId: "dir-study" },
  ],
  timeCategories: [
    { id: "inbox", name: "Входящие", icon: "Inbox", type: "time" },
    { id: "today", name: "Сегодня", icon: "Sun", type: "time" },
    { id: "tomorrow", name: "Завтра", icon: "Sunset", type: "time" },
    { id: "planned", name: "Запланировано", icon: "CalendarDays", type: "time" },
    { id: "someday", name: "Когда-нибудь", icon: "Sparkles", type: "time" },
    { id: "done", name: "Завершённые", icon: "CheckCircle2", type: "time" },
  ],
  directionCategories: [
    { id: "dir-personal", name: "Личная жизнь", icon: "Heart", type: "direction", color: "#F9A8D4" },
    { id: "dir-sport", name: "Спорт", icon: "Dumbbell", type: "direction", color: "#86EFAC" },
    { id: "dir-study", name: "Учёба", icon: "BookOpen", type: "direction", color: "#93C5FD" },
    { id: "dir-wishlist", name: "Вишлист", icon: "Star", type: "direction", color: "#FDE68A" },
  ],
  priorities: [
    { id: "p1", name: "Срочно", color: "#FCA5A5" },
    { id: "p2", name: "Важно", color: "#FCD34D" },
    { id: "p3", name: "Обычное", color: "#93C5FD" },
    { id: "p4", name: "Низкий", color: "#D1D5DB" },
  ],
  habits: [
    {
      id: "h1",
      name: "Медитация",
      icon: "Brain",
      color: "#C4B5FD",
      completedDates: [],
      targetDays: 7,
    },
    {
      id: "h2",
      name: "Вода 2л",
      icon: "Droplets",
      color: "#93C5FD",
      completedDates: [new Date().toISOString().split("T")[0]],
      targetDays: 7,
    },
    {
      id: "h3",
      name: "Спорт",
      icon: "Dumbbell",
      color: "#86EFAC",
      completedDates: [],
      targetDays: 5,
    },
  ],
};

const STORAGE_KEY = "planner_data_v1";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return { data, setData };
}
