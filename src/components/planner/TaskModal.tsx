import { useState } from "react";
import { Task, SubTask, AppData } from "./types";
import Icon from "@/components/ui/icon";

interface Props {
  task: Task | null;
  data: AppData;
  defaultDate: string;
  defaultCategory: string;
  onSave: (task: Task) => void;
  onClose: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function TaskModal({ task, data, defaultDate, defaultCategory, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [date, setDate] = useState(task?.date ?? defaultDate);
  const [priorityId, setPriorityId] = useState(task?.priorityId ?? "");
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? defaultCategory);
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks ?? []);
  const [newSub, setNewSub] = useState("");

  function addSubtask() {
    if (!newSub.trim()) return;
    setSubtasks(s => [...s, { id: uid(), title: newSub.trim(), completed: false }]);
    setNewSub("");
  }

  function toggleSub(id: string) {
    setSubtasks(s => s.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  }

  function removeSub(id: string) {
    setSubtasks(s => s.filter(st => st.id !== id));
  }

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id: task?.id ?? uid(),
      title: title.trim(),
      completed: task?.completed ?? false,
      date: date || undefined,
      priorityId: priorityId || undefined,
      categoryId: categoryId || undefined,
      subtasks,
      notes,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{task ? "Редактировать задачу" : "Новая задача"}</span>
          <button className="modal-close" onClick={onClose}>
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="modal-body">
          <input
            className="modal-input"
            placeholder="Название задачи"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">
                <Icon name="Calendar" size={14} /> Дата
              </label>
              <input
                type="date"
                className="modal-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">
                <Icon name="Flag" size={14} /> Приоритет
              </label>
              <select
                className="modal-select"
                value={priorityId}
                onChange={e => setPriorityId(e.target.value)}
              >
                <option value="">Не задан</option>
                {data.priorities.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">
              <Icon name="Tag" size={14} /> Направление
            </label>
            <select
              className="modal-select"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Не выбрано</option>
              {data.directionCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label className="modal-label">
              <Icon name="ListChecks" size={14} /> Подзадачи
            </label>
            <div className="subtask-input-row">
              <input
                className="modal-input"
                placeholder="Добавить подзадачу..."
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addSubtask(); }}
              />
              <button className="subtask-add-btn" onClick={addSubtask}>
                <Icon name="Plus" size={16} />
              </button>
            </div>
            {subtasks.map(st => (
              <div key={st.id} className="subtask-edit-row">
                <button onClick={() => toggleSub(st.id)} className={`task-check task-check--sm ${st.completed ? "task-check--done" : ""}`}>
                  {st.completed && <Icon name="Check" size={10} />}
                </button>
                <span className={`subtask-edit-title ${st.completed ? "subtask-title--done" : ""}`}>{st.title}</span>
                <button onClick={() => removeSub(st.id)} className="task-action-btn task-action-btn--danger">
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="modal-field">
            <label className="modal-label">
              <Icon name="StickyNote" size={14} /> Заметки
            </label>
            <textarea
              className="modal-textarea"
              placeholder="Дополнительные заметки..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Отмена</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={!title.trim()}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
