import { useState } from "react";
import { AppData, TimeCategory, DirectionCategory } from "./types";
import { ActiveView } from "./PlannerApp";
import Icon from "@/components/ui/icon";

interface Props {
  data: AppData;
  activeView: ActiveView;
  open: boolean;
  onClose: () => void;
  onSelect: (view: ActiveView) => void;
  onUpdateData: (patch: Partial<AppData>) => void;
}

export default function Sidebar({ data, activeView, open, onClose, onSelect, onUpdateData }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  function isActive(view: ActiveView): boolean {
    if (view.type === "habits" && activeView.type === "habits") return true;
    if (view.type !== "habits" && activeView.type !== "habits") {
      return view.type === activeView.type && view.id === activeView.id;
    }
    return false;
  }

  function startEdit(id: string, currentName: string) {
    setEditingId(id);
    setEditingValue(currentName);
  }

  function commitEditTime(id: string) {
    if (!editingValue.trim()) { setEditingId(null); return; }
    onUpdateData({
      timeCategories: data.timeCategories.map(c =>
        c.id === id ? { ...c, name: editingValue.trim() } : c
      ),
    });
    setEditingId(null);
  }

  function commitEditDirection(id: string) {
    if (!editingValue.trim()) { setEditingId(null); return; }
    onUpdateData({
      directionCategories: data.directionCategories.map(c =>
        c.id === id ? { ...c, name: editingValue.trim() } : c
      ),
    });
    setEditingId(null);
  }

  const taskCountFor = (id: string, type: "time" | "direction"): number => {
    const today = new Date().toISOString().split("T")[0];
    if (type === "time") {
      if (id === "inbox") return data.tasks.filter(t => !t.date && !t.completed && t.categoryId === "inbox").length;
      if (id === "today") return data.tasks.filter(t => t.date === today && !t.completed).length;
      if (id === "tomorrow") {
        const tom = new Date(Date.now() + 86400000).toISOString().split("T")[0];
        return data.tasks.filter(t => t.date === tom && !t.completed).length;
      }
      if (id === "planned") return data.tasks.filter(t => t.date && t.date > today && !t.completed).length;
      if (id === "someday") return data.tasks.filter(t => !t.date && !t.completed && t.categoryId !== "inbox").length;
      if (id === "done") return data.tasks.filter(t => t.completed).length;
    }
    if (type === "direction") {
      return data.tasks.filter(t => t.categoryId === id && !t.completed).length;
    }
    return 0;
  };

  return (
    <aside className={`planner-sidebar ${open ? "planner-sidebar--open" : ""}`}>
      <div className="planner-sidebar-inner">
        <div className="planner-sidebar-logo">
          <Icon name="CheckSquare" size={22} className="text-primary" />
          <span className="planner-app-name">Мой планер</span>
          <button className="planner-sidebar-close" onClick={onClose}>
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Time categories */}
        <div className="planner-sidebar-section">
          <div className="planner-sidebar-section-label">По времени</div>
          {data.timeCategories.map((cat: TimeCategory) => (
            <div
              key={cat.id}
              className={`planner-nav-item ${isActive({ type: "time", id: cat.id }) ? "planner-nav-item--active" : ""}`}
              onClick={() => {
                if (editingId !== cat.id) onSelect({ type: "time", id: cat.id });
              }}
            >
              <Icon name={cat.icon} size={16} />
              {editingId === cat.id ? (
                <input
                  className="planner-inline-edit"
                  value={editingValue}
                  autoFocus
                  onChange={e => setEditingValue(e.target.value)}
                  onBlur={() => commitEditTime(cat.id)}
                  onKeyDown={e => { if (e.key === "Enter") commitEditTime(cat.id); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className="planner-nav-label"
                  onDoubleClick={e => { e.stopPropagation(); startEdit(cat.id, cat.name); }}
                >
                  {cat.name}
                </span>
              )}
              <span className="planner-nav-count">{taskCountFor(cat.id, "time") || ""}</span>
            </div>
          ))}
        </div>

        {/* Direction categories */}
        <div className="planner-sidebar-section">
          <div className="planner-sidebar-section-label">По направлениям</div>
          {data.directionCategories.map((cat: DirectionCategory) => (
            <div
              key={cat.id}
              className={`planner-nav-item ${isActive({ type: "direction", id: cat.id }) ? "planner-nav-item--active" : ""}`}
              onClick={() => {
                if (editingId !== cat.id) onSelect({ type: "direction", id: cat.id });
              }}
            >
              <span
                className="planner-nav-dot"
                style={{ background: cat.color }}
              />
              {editingId === cat.id ? (
                <input
                  className="planner-inline-edit"
                  value={editingValue}
                  autoFocus
                  onChange={e => setEditingValue(e.target.value)}
                  onBlur={() => commitEditDirection(cat.id)}
                  onKeyDown={e => { if (e.key === "Enter") commitEditDirection(cat.id); if (e.key === "Escape") setEditingId(null); }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className="planner-nav-label"
                  onDoubleClick={e => { e.stopPropagation(); startEdit(cat.id, cat.name); }}
                >
                  {cat.name}
                </span>
              )}
              <span className="planner-nav-count">{taskCountFor(cat.id, "direction") || ""}</span>
            </div>
          ))}
        </div>

        {/* Habits */}
        <div className="planner-sidebar-section">
          <div
            className={`planner-nav-item ${activeView.type === "habits" ? "planner-nav-item--active" : ""}`}
            onClick={() => onSelect({ type: "habits" })}
          >
            <Icon name="Activity" size={16} />
            <span className="planner-nav-label">Трекер привычек</span>
            <span className="planner-nav-count">{data.habits.length || ""}</span>
          </div>
        </div>

        <div className="planner-sidebar-hint">Двойной клик по названию — переименовать</div>
      </div>
    </aside>
  );
}
