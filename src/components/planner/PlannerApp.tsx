import { useState } from "react";
import { useAppData } from "./store";
import { AppData, Task, Habit } from "./types";
import Sidebar from "./Sidebar";
import TaskView from "./TaskView";
import HabitsView from "./HabitsView";
import Icon from "@/components/ui/icon";

export type ActiveView = { type: "time"; id: string } | { type: "direction"; id: string } | { type: "habits" };

export default function PlannerApp() {
  const { data, setData } = useAppData();
  const [activeView, setActiveView] = useState<ActiveView>({ type: "time", id: "today" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function getFilteredTasks(): Task[] {
    if (activeView.type === "habits") return [];
    if (activeView.type === "time") {
      const id = activeView.id;
      if (id === "inbox") return data.tasks.filter(t => !t.date && !t.completed && t.categoryId === "inbox");
      if (id === "today") return data.tasks.filter(t => t.date === today && !t.completed);
      if (id === "tomorrow") {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
        return data.tasks.filter(t => t.date === tomorrow && !t.completed);
      }
      if (id === "planned") return data.tasks.filter(t => t.date && t.date > today && !t.completed);
      if (id === "someday") return data.tasks.filter(t => !t.date && !t.completed && t.categoryId !== "inbox");
      if (id === "done") return data.tasks.filter(t => t.completed);
    }
    if (activeView.type === "direction") {
      return data.tasks.filter(t => t.categoryId === activeView.id && !t.completed);
    }
    return [];
  }

  function getActiveLabel(): string {
    if (activeView.type === "habits") return "Трекер привычек";
    if (activeView.type === "time") {
      return data.timeCategories.find(c => c.id === activeView.id)?.name ?? "";
    }
    return data.directionCategories.find(c => c.id === activeView.id)?.name ?? "";
  }

  function getActiveIcon(): string {
    if (activeView.type === "habits") return "Activity";
    if (activeView.type === "time") {
      return data.timeCategories.find(c => c.id === activeView.id)?.icon ?? "Circle";
    }
    return data.directionCategories.find(c => c.id === activeView.id)?.icon ?? "Circle";
  }

  function addTask(task: Task) {
    setData(d => ({ ...d, tasks: [task, ...d.tasks] }));
  }

  function updateTask(task: Task) {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === task.id ? task : t) }));
  }

  function deleteTask(id: string) {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }

  function updateHabit(habit: Habit) {
    setData(d => ({ ...d, habits: d.habits.map(h => h.id === habit.id ? habit : h) }));
  }

  function addHabit(habit: Habit) {
    setData(d => ({ ...d, habits: [...d.habits, habit] }));
  }

  function deleteHabit(id: string) {
    setData(d => ({ ...d, habits: d.habits.filter(h => h.id !== id) }));
  }

  function updateData(patch: Partial<AppData>) {
    setData(d => ({ ...d, ...patch }));
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="planner-root">
      {/* Mobile header */}
      <header className="planner-header">
        <button className="planner-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Icon name="Menu" size={22} />
        </button>
        <div className="planner-header-title">
          <Icon name={getActiveIcon()} size={18} className="text-muted-foreground" />
          <span>{getActiveLabel()}</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="planner-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        data={data}
        activeView={activeView}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(view) => { setActiveView(view); setSidebarOpen(false); }}
        onUpdateData={updateData}
      />

      {/* Main content */}
      <main className="planner-main">
        {activeView.type === "habits" ? (
          <HabitsView
            habits={data.habits}
            onUpdate={updateHabit}
            onAdd={addHabit}
            onDelete={deleteHabit}
          />
        ) : (
          <TaskView
            tasks={filteredTasks}
            data={data}
            activeView={activeView}
            onAdd={addTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
          />
        )}
      </main>
    </div>
  );
}