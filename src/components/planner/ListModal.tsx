import { useState } from "react";
import { TaskList, DirectionCategory } from "./types";
import Icon from "@/components/ui/icon";

interface Props {
  list?: TaskList | null;
  categories: DirectionCategory[];
  defaultCategoryId?: string;
  onSave: (list: TaskList) => void;
  onClose: () => void;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ListModal({ list, categories, defaultCategoryId, onSave, onClose }: Props) {
  const [name, setName] = useState(list?.name ?? "");
  const [categoryId, setCategoryId] = useState(list?.categoryId ?? defaultCategoryId ?? "");

  function handleSave() {
    if (!name.trim() || !categoryId) return;
    onSave({ id: list?.id ?? uid(), name: name.trim(), categoryId });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-drag-handle" />
        <div className="modal-body">
          <input
            className="modal-title-input"
            placeholder="Название списка"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            onKeyDown={e => e.key === "Enter" && handleSave()}
          />

          <div className="modal-section">
            <div className="modal-section-label">
              <Icon name="Tag" size={14} /> Направление
            </div>
            <div className="modal-chips-row">
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`modal-chip ${categoryId === c.id ? "modal-chip--active" : ""}`}
                  style={categoryId === c.id
                    ? { background: c.color, color: "#1a1a1a", borderColor: c.color }
                    : { borderColor: c.color + "88" }
                  }
                  onClick={() => setCategoryId(c.id)}
                >
                  <span className="chip-dot" style={{ background: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Отмена</button>
          <button
            className="modal-btn-save"
            onClick={handleSave}
            disabled={!name.trim() || !categoryId}
          >
            {list ? "Сохранить" : "Создать список"}
          </button>
        </div>
      </div>
    </div>
  );
}
