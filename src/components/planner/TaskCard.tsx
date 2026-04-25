import { useState } from "react";
import { Task, AppData } from "./types";
import Icon from "@/components/ui/icon";

interface Props {
  task: Task;
  data: AppData;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, data, onToggle, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  const priority = data.priorities.find(p => p.id === task.priorityId);
  const direction = data.directionCategories.find(c => c.id === task.categoryId);
  const completedSubtasks = task.subtasks.filter(s => s.completed).length;

  function formatDate(dateStr?: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  }

  return (
    <div className={`task-card ${task.completed ? "task-card--done" : ""}`}>
      <div className="task-card-main">
        <button
          className={`task-check ${task.completed ? "task-check--done" : ""}`}
          onClick={onToggle}
        >
          {task.completed && <Icon name="Check" size={12} />}
        </button>

        <div className="task-card-body" onClick={() => setExpanded(e => !e)}>
          <div className="task-card-title-row">
            <span className={`task-card-title ${task.completed ? "task-card-title--done" : ""}`}>
              {task.title}
            </span>
            {priority && (
              <span className="task-priority-dot" style={{ background: priority.color }} title={priority.name} />
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
              <span className="task-meta-chip" style={{ background: direction.color + "33" }}>
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
            <div key={sub.id} className="subtask-row">
              <span className={`subtask-dot ${sub.completed ? "subtask-dot--done" : ""}`} />
              <span className={`subtask-title ${sub.completed ? "subtask-title--done" : ""}`}>
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
