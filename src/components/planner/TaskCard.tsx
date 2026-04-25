import { useState } from "react";
import { Task, AppData } from "./types";
import Icon from "@/components/ui/icon";

interface Props {
  task: Task;
  data: AppData;
  onToggle: () => void;
  onUpdate: (task: Task) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, data, onToggle, onUpdate, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [checkAnim, setCheckAnim] = useState(false);

  const priority = data.priorities.find(p => p.id === task.priorityId);
  const direction = data.directionCategories.find(c => c.id === task.categoryId);
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  function formatDate(dateStr?: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return "Сегодня";
    if (d.toDateString() === tomorrow.toDateString()) return "Завтра";
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }

  function handleToggle() {
    if (!task.completed) {
      setCheckAnim(true);
      setTimeout(() => setCheckAnim(false), 600);
    }
    onToggle();
  }

  function toggleSubtask(subId: string) {
    const updated = {
      ...task,
      subtasks: task.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s),
    };
    onUpdate(updated);
  }

  return (
    <div className={`task-card ${task.completed ? "task-card--done" : ""}`}>
      <div className="task-card-main">
        <button
          className={`task-check ${task.completed ? "task-check--done" : ""} ${checkAnim ? "task-check--flash" : ""}`}
          onClick={handleToggle}
        >
          {task.completed && <Icon name="Check" size={12} />}
        </button>

        <div className="task-card-body" onClick={() => task.subtasks.length > 0 && setExpanded(e => !e)}>
          <div className="task-card-title-row">
            <span className={`task-card-title ${task.completed ? "task-card-title--done" : ""}`}>
              {task.title}
            </span>
            {priority && (
              <span className="task-priority-badge" style={{ background: priority.color + "33", color: priority.color }}>
                {priority.name}
              </span>
            )}
          </div>

          <div className="task-card-meta">
            {task.date && (
              <span className="task-meta-chip">
                <Icon name="Calendar" size={11} />
                {formatDate(task.date)}
              </span>
            )}
            {direction && (
              <span className="task-meta-chip" style={{ background: direction.color + "33", color: "inherit" }}>
                <span className="task-meta-dot" style={{ background: direction.color }} />
                {direction.name}
              </span>
            )}
            {task.subtasks.length > 0 && (
              <span className="task-meta-chip">
                <Icon name="ListChecks" size={11} />
                {completedSubtasks}/{task.subtasks.length}
              </span>
            )}
          </div>
        </div>

        <div className="task-card-actions">
          <button className="task-action-btn" onClick={onEdit}>
            <Icon name="Pencil" size={14} />
          </button>
          <button className="task-action-btn task-action-btn--danger" onClick={onDelete}>
            <Icon name="Trash2" size={14} />
          </button>
        </div>
      </div>

      {expanded && task.subtasks.length > 0 && (
        <div className="task-subtasks">
          {task.subtasks.map(sub => (
            <button
              key={sub.id}
              className="subtask-row subtask-row--clickable"
              onClick={() => toggleSubtask(sub.id)}
            >
              <span className={`subtask-check ${sub.completed ? "subtask-check--done" : ""}`}>
                {sub.completed && <Icon name="Check" size={9} />}
              </span>
              <span className={`subtask-title ${sub.completed ? "subtask-title--done" : ""}`}>
                {sub.title}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
