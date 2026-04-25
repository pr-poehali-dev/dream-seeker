import { Habit } from "./types";
import Icon from "@/components/ui/icon";

interface Props {
  habits: Habit[];
  onToggle: (habit: Habit, date: string) => void;
}

export default function HabitsBar({ habits, onToggle }: Props) {
  const today = new Date().toISOString().split("T")[0];

  if (habits.length === 0) return null;

  return (
    <div className="habits-bar">
      <div className="habits-bar-label">
        <Icon name="Activity" size={13} />
        Привычки на сегодня
      </div>
      <div className="habits-bar-list">
        {habits.map(habit => {
          const done = habit.completedDates.includes(today);
          return (
            <button
              key={habit.id}
              className={`habits-bar-item ${done ? "habits-bar-item--done" : ""}`}
              style={done ? { background: habit.color, borderColor: habit.color } : { borderColor: habit.color + "88" }}
              onClick={() => onToggle(habit, today)}
              title={habit.name}
            >
              <span style={{ display: "flex", alignItems: "center" }}>
                <Icon name={habit.icon} size={14} style={{ color: done ? "#fff" : habit.color }} />
              </span>
              <span className="habits-bar-name" style={{ color: done ? "#fff" : "inherit" }}>
                {habit.name}
              </span>
              {done && <Icon name="Check" size={12} style={{ color: "#fff", marginLeft: 2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
