import { useState } from "react";
import { Habit } from "./types";
import Icon from "@/components/ui/icon";

interface Props {
  habits: Habit[];
  onUpdate: (habit: Habit) => void;
  onAdd: (habit: Habit) => void;
  onDelete: (id: string) => void;
  fabOpen?: boolean;
  onFabClose?: () => void;
}

const HABIT_COLORS = ["#C4B5FD", "#93C5FD", "#86EFAC", "#FDE68A", "#FCA5A5", "#F9A8D4", "#6EE7B7"];
const HABIT_ICONS = ["Brain", "Droplets", "Dumbbell", "BookOpen", "Heart", "Moon", "Coffee", "Leaf", "Music", "Star", "Bike", "Wind"];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function getDayLabel(dateStr: string): string {
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  return days[new Date(dateStr).getDay()];
}

export default function HabitsView({ habits, onUpdate, onAdd, onDelete }: Props) {
  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("Star");
  const [newColor, setNewColor] = useState(HABIT_COLORS[0]);
  const [fabOpen, setFabOpen] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const last7 = getLast7Days();

  function toggleDay(habit: Habit, dateStr: string) {
    const wasCompleted = habit.completedDates.includes(dateStr);
    const dates = wasCompleted
      ? habit.completedDates.filter(d => d !== dateStr)
      : [...habit.completedDates, dateStr];
    if (!wasCompleted && dateStr === today) {
      setFlashId(habit.id);
      setTimeout(() => setFlashId(null), 700);
    }
    onUpdate({ ...habit, completedDates: dates });
  }

  function getStreak(habit: Habit): number {
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const str = checkDate.toISOString().split("T")[0];
      if (habit.completedDates.includes(str)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function saveNewHabit() {
    if (!newName.trim()) return;
    onAdd({
      id: uid(),
      name: newName.trim(),
      icon: newIcon,
      color: newColor,
      completedDates: [],
      targetDays: 7,
    });
    setNewName("");
    setNewIcon("Star");
    setNewColor(HABIT_COLORS[0]);
    setAddingOpen(false);
    setFabOpen(false);
  }

  return (
    <div className="habits-view">
      <div className="habits-header">
        <div className="habits-week-labels">
          {last7.map(d => (
            <span key={d} className={`habits-day-label ${d === today ? "habits-day-label--today" : ""}`}>
              {getDayLabel(d)}
            </span>
          ))}
        </div>
      </div>

      <div className="habits-list">
        {habits.length === 0 && !addingOpen && (
          <div className="task-view-empty">
            <Icon name="Activity" size={44} className="task-view-empty-icon" />
            <p>Нет привычек</p>
            <span>Нажмите «+» чтобы добавить</span>
          </div>
        )}
        {habits.map(habit => {
          const streak = getStreak(habit);
          const doneToday = habit.completedDates.includes(today);
          const isFlashing = flashId === habit.id;
          return (
            <div key={habit.id} className={`habit-card ${doneToday ? "habit-card--done" : ""}`}>
              <div className="habit-card-left">
                <span
                  className={`habit-icon ${doneToday ? "habit-icon--done" : ""} ${isFlashing ? "habit-icon--flash" : ""}`}
                  style={{ background: doneToday ? habit.color : habit.color + "33" }}
                >
                  <Icon name={habit.icon} size={18} style={{ color: doneToday ? "#fff" : habit.color }} />
                </span>
                <div className="habit-info">
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-streak">
                    <Icon name="Flame" size={12} style={{ color: streak > 0 ? "#F97316" : "#D1D5DB" }} />
                    {streak > 0 ? `${streak} дн. подряд` : "нет серии"}
                  </span>
                </div>
              </div>
              <div className="habit-days">
                {last7.map(d => {
                  const done = habit.completedDates.includes(d);
                  const isToday = d === today;
                  return (
                    <button
                      key={d}
                      className={`habit-day-btn ${done ? "habit-day-btn--done" : ""} ${isToday ? "habit-day-btn--today" : ""}`}
                      style={done ? { background: habit.color, borderColor: habit.color } : {}}
                      onClick={() => toggleDay(habit, d)}
                      title={d}
                    />
                  );
                })}
              </div>
              <button className="habit-delete-btn" onClick={() => onDelete(habit.id)}>
                <Icon name="Trash2" size={13} />
              </button>
            </div>
          );
        })}
      </div>

      {addingOpen && (
        <div className="habit-add-form">
          <input
            className="modal-title-input"
            placeholder="Название привычки"
            value={newName}
            autoFocus
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") saveNewHabit(); }}
          />
          <div className="modal-section-label" style={{ marginTop: 4 }}>
            <Icon name="Smile" size={14} /> Иконка
          </div>
          <div className="habit-add-icons">
            {HABIT_ICONS.map(ic => (
              <button
                key={ic}
                className={`habit-icon-select ${newIcon === ic ? "habit-icon-select--active" : ""}`}
                onClick={() => setNewIcon(ic)}
              >
                <Icon name={ic} size={16} />
              </button>
            ))}
          </div>
          <div className="modal-section-label" style={{ marginTop: 4 }}>
            <Icon name="Palette" size={14} /> Цвет
          </div>
          <div className="habit-add-colors">
            {HABIT_COLORS.map(c => (
              <button
                key={c}
                className={`habit-color-dot ${newColor === c ? "habit-color-dot--active" : ""}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="habit-add-actions">
            <button className="modal-btn-cancel" onClick={() => setAddingOpen(false)}>Отмена</button>
            <button className="modal-btn-save" onClick={saveNewHabit} disabled={!newName.trim()}>Добавить</button>
          </div>
        </div>
      )}

      {/* FAB */}
      {fabOpen && <div className="fab-backdrop" onClick={() => setFabOpen(false)} />}
      <div className="fab-container">
        {fabOpen && (
          <button className="fab-option fab-option--habit" onClick={() => { setAddingOpen(true); setFabOpen(false); }}>
            <Icon name="Activity" size={18} />
            <span>Привычка</span>
          </button>
        )}
        <button
          className={`planner-fab ${fabOpen ? "planner-fab--open" : ""}`}
          onClick={() => setFabOpen(o => !o)}
        >
          <Icon name="Plus" size={24} />
        </button>
      </div>
    </div>
  );
}
