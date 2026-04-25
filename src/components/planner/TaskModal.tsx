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

const DATE_PRESETS = [
  { label: "Сегодня", icon: "Sun", getValue: () => new Date().toISOString().split("T")[0] },
  { label: "Завтра", icon: "Sunset", getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; } },
  { label: "Неделя", icon: "CalendarDays", getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0]; } },
  { label: "Когда-нибудь", icon: "Sparkles", getValue: () => "" },
];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "Когда-нибудь";
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Сегодня";
  if (d.toDateString() === tomorrow.toDateString()) return "Завтра";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default function TaskModal({ task, data, defaultDate, defaultCategory, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [date, setDate] = useState(task?.date ?? defaultDate);
  const [priorityId, setPriorityId] = useState(task?.priorityId ?? "");
  const [categoryId, setCategoryId] = useState(task?.categoryId ?? defaultCategory);
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [subtasks, setSubtasks] = useState<SubTask[]>(task?.subtasks ?? []);
  const [newSub, setNewSub] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

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

  const selectedPriority = data.priorities.find(p => p.id === priorityId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="modal-drag-handle" />

        <div className="modal-body">
          <input
            className="modal-title-input"
            placeholder="Что нужно сделать?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />

          {/* Date row */}
          <div className="modal-section">
            <div className="modal-section-label">
              <Icon name="Calendar" size={14} />
              Дата выполнения
            </div>
            <div className="modal-chips-row">
              {DATE_PRESETS.map(preset => {
                const val = preset.getValue();
                const isActive = date === val || (preset.label === "Когда-нибудь" && !date);
                return (
                  <button
                    key={preset.label}
                    className={`modal-chip ${isActive ? "modal-chip--active" : ""}`}
                    onClick={() => { setDate(val); setShowCalendar(false); }}
                  >
                    <Icon name={preset.icon} size={13} />
                    {preset.label}
                  </button>
                );
              })}
              <button
                className={`modal-chip ${showCalendar ? "modal-chip--active" : ""}`}
                onClick={() => setShowCalendar(v => !v)}
              >
                <Icon name="CalendarSearch" size={13} />
                Выбрать
              </button>
            </div>
            {showCalendar && (
              <div className="modal-calendar-wrap">
                <input
                  type="date"
                  className="modal-date-native"
                  value={date}
                  onChange={e => { setDate(e.target.value); setShowCalendar(false); }}
                />
              </div>
            )}
            {date && (
              <div className="modal-date-display">
                <Icon name="CalendarCheck" size={13} />
                {formatDateDisplay(date)}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="modal-section">
            <div className="modal-section-label">
              <Icon name="Flag" size={14} />
              Приоритет
            </div>
            <div className="modal-chips-row">
              <button
                className={`modal-chip ${!priorityId ? "modal-chip--active" : ""}`}
                onClick={() => setPriorityId("")}
              >
                Нет
              </button>
              {data.priorities.map(p => (
                <button
                  key={p.id}
                  className={`modal-chip modal-chip--priority ${priorityId === p.id ? "modal-chip--priority-active" : ""}`}
                  style={priorityId === p.id
                    ? { background: p.color, color: "#1a1a1a", borderColor: p.color }
                    : { borderColor: p.color + "88" }
                  }
                  onClick={() => setPriorityId(p.id)}
                >
                  <span className="chip-dot" style={{ background: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div className="modal-section">
            <div className="modal-section-label">
              <Icon name="Tag" size={14} />
              Направление
            </div>
            <div className="modal-chips-row">
              <button
                className={`modal-chip ${!categoryId ? "modal-chip--active" : ""}`}
                onClick={() => setCategoryId("")}
              >
                Нет
              </button>
              {data.directionCategories.map(c => (
                <button
                  key={c.id}
                  className={`modal-chip ${categoryId === c.id ? "modal-chip--active" : ""}`}
                  style={categoryId === c.id ? { background: c.color, color: "#1a1a1a", borderColor: c.color } : { borderColor: c.color + "88" }}
                  onClick={() => setCategoryId(c.id)}
                >
                  <span className="chip-dot" style={{ background: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div className="modal-section">
            <div className="modal-section-label">
              <Icon name="ListChecks" size={14} />
              Подзадачи
            </div>
            {subtasks.map(st => (
              <div key={st.id} className="subtask-edit-row">
                <button
                  onClick={() => toggleSub(st.id)}
                  className={`subtask-check ${st.completed ? "subtask-check--done" : ""}`}
                >
                  {st.completed && <Icon name="Check" size={9} />}
                </button>
                <span className={`subtask-edit-title ${st.completed ? "subtask-title--done" : ""}`}>{st.title}</span>
                <button onClick={() => removeSub(st.id)} className="task-action-btn task-action-btn--danger">
                  <Icon name="X" size={12} />
                </button>
              </div>
            ))}
            <div className="subtask-input-row">
              <input
                className="modal-input-sm"
                placeholder="+ Добавить подзадачу"
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addSubtask(); }}
              />
              {newSub && (
                <button className="subtask-add-btn" onClick={addSubtask}>
                  <Icon name="Plus" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="modal-section">
            <div className="modal-section-label">
              <Icon name="StickyNote" size={14} />
              Заметки
            </div>
            <textarea
              className="modal-textarea"
              placeholder="Дополнительные заметки..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Отмена</button>
          <button className="modal-btn-save" onClick={handleSave} disabled={!title.trim()}>
            {task ? "Сохранить" : "Создать задачу"}
          </button>
        </div>
      </div>
    </div>
  );
}
