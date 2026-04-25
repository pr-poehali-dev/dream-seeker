import { useState } from "react";
import { Task, AppData } from "./types";
import { ActiveView } from "./PlannerApp";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import Icon from "@/components/ui/icon";

interface Props {
  tasks: Task[];
  data: AppData;
  activeView: ActiveView;
  onAdd: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskView({ tasks, data, activeView, onAdd, onUpdate, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  function openNew() {
    setEditTask(null);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditTask(task);
    setModalOpen(true);
  }

  function handleSave(task: Task) {
    if (editTask) {
      onUpdate(task);
    } else {
      onAdd(task);
    }
    setModalOpen(false);
  }

  function getDefaultDate(): string {
    if (activeView.type === "time") {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      if (activeView.id === "today") return today;
      if (activeView.id === "tomorrow") return tomorrow;
    }
    return "";
  }

  function getDefaultCategory(): string {
    if (activeView.type === "direction") return activeView.id;
    if (activeView.type === "time" && activeView.id === "inbox") return "inbox";
    return "";
  }

  const isEmpty = tasks.length === 0;

  return (
    <div className="task-view">
      {isEmpty ? (
        <div className="task-view-empty">
          <Icon name="CheckCircle2" size={40} className="task-view-empty-icon" />
          <p>Нет задач</p>
          <span>Добавьте первую задачу</span>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              data={data}
              onToggle={() => onUpdate({ ...task, completed: !task.completed })}
              onEdit={() => openEdit(task)}
              onDelete={() => onDelete(task.id)}
            />
          ))}
        </div>
      )}

      <button className="planner-fab" onClick={openNew}>
        <Icon name="Plus" size={24} />
      </button>

      {modalOpen && (
        <TaskModal
          task={editTask}
          data={data}
          defaultDate={getDefaultDate()}
          defaultCategory={getDefaultCategory()}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
