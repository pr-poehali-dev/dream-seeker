import { useState } from "react";
import { Task, AppData, TaskList, Habit } from "./types";
import { ActiveView } from "./PlannerApp";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import ListModal from "./ListModal";
import HabitsBar from "./HabitsBar";
import Icon from "@/components/ui/icon";

const HABIT_COLORS = ["#C4B5FD", "#93C5FD", "#86EFAC", "#FDE68A", "#FCA5A5", "#F9A8D4"];
const HABIT_ICONS = ["Brain", "Droplets", "Dumbbell", "BookOpen", "Heart", "Moon", "Coffee", "Star", "Bike", "Wind"];

function uid() { return Math.random().toString(36).slice(2, 10); }

interface Props {
  tasks: Task[];
  data: AppData;
  activeView: ActiveView;
  onAdd: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddList: (list: TaskList) => void;
  onUpdateList: (list: TaskList) => void;
  onDeleteList: (id: string) => void;
  onAddHabit: (habit: Habit) => void;
  onUpdateHabit: (habit: Habit) => void;
}

export default function TaskView({
  tasks, data, activeView,
  onAdd, onUpdate, onDelete,
  onAddList, onUpdateList, onDeleteList,
  onAddHabit, onUpdateHabit,
}: Props) {
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [editList, setEditList] = useState<TaskList | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const isToday = activeView.type === "time" && activeView.id === "today";
  const isTomorrow = activeView.type === "time" && activeView.id === "tomorrow";
  const isInbox = activeView.type === "time" && activeView.id === "inbox";
  const isDirection = activeView.type === "direction";
  const showDate = isInbox || (activeView.type === "time" && activeView.id === "planned");

  const visibleLists = isDirection
    ? data.lists.filter(l => l.categoryId === activeView.id)
    : [];

  const dirFreeTasksInDirection = isDirection ? tasks.filter(t => !t.listId) : [];

  function openEditTask(task: Task) {
    setEditTask(task);
    setTaskModalOpen(true);
  }

  function openNewTaskForList(listId: string) {
    setEditTask({ id: "__new__", title: "", completed: false, subtasks: [], listId } as Task);
    setTaskModalOpen(true);
    setFabOpen(false);
  }

  function handleSaveTask(task: Task) {
    const isNew = !editTask || editTask.id === "__new__" || editTask.id === "";
    if (isNew) onAdd(task);
    else onUpdate(task);
    setTaskModalOpen(false);
    setEditTask(null);
  }

  function handleSaveList(list: TaskList) {
    if (editList) onUpdateList(list);
    else onAddList(list);
    setListModalOpen(false);
    setEditList(null);
  }

  function handleToggleHabit(habit: Habit, date: string) {
    const dates = habit.completedDates.includes(date)
      ? habit.completedDates.filter(d => d !== date)
      : [...habit.completedDates, date];
    onUpdateHabit({ ...habit, completedDates: dates });
  }

  function getDefaultDate() {
    if (isToday) return today;
    if (isTomorrow) return tomorrow;
    return "";
  }

  function getDefaultCategory() {
    if (isDirection) return activeView.id;
    return "";
  }

  const isNewTask = !editTask || editTask.id === "__new__" || editTask.id === "";
  const defaultListId = editTask?.id === "__new__" ? (editTask.listId ?? "") : "";

  return (
    <div className="task-view">
      {(isToday || isTomorrow) && data.habits.length > 0 && (
        <HabitsBar habits={data.habits} onToggle={handleToggleHabit} />
      )}

      {isDirection && (
        <>
          {visibleLists.map(list => {
            const listTasks = tasks.filter(t => t.listId === list.id);
            return (
              <div key={list.id} className="task-list-group">
                <div className="task-list-header">
                  <Icon name="List" size={14} />
                  <span className="task-list-name">{list.name}</span>
                  <span className="task-list-count">{listTasks.length}</span>
                  <div className="task-list-actions">
                    <button className="task-list-edit-btn" onClick={() => { setEditList(list); setListModalOpen(true); }}>
                      <Icon name="Pencil" size={12} />
                    </button>
                    <button className="task-list-edit-btn task-action-btn--danger" onClick={() => onDeleteList(list.id)}>
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
                <div className="task-list">
                  {listTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      data={data}
                      showDate
                      onToggle={() => onUpdate({ ...task, completed: !task.completed })}
                      onUpdate={onUpdate}
                      onEdit={() => openEditTask(task)}
                      onDelete={() => onDelete(task.id)}
                    />
                  ))}
                  {listTasks.length === 0 && (
                    <div className="task-list-empty">Список пуст</div>
                  )}
                </div>
                <button className="task-list-add-btn" onClick={() => openNewTaskForList(list.id)}>
                  <Icon name="Plus" size={13} />
                  Добавить задачу
                </button>
              </div>
            );
          })}

          {dirFreeTasksInDirection.length > 0 && (
            <div className="task-list-group task-list-group--free">
              <div className="task-list-header">
                <Icon name="Inbox" size={14} />
                <span className="task-list-name">Без списка</span>
              </div>
              <div className="task-list">
                {dirFreeTasksInDirection.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    data={data}
                    showDate
                    onToggle={() => onUpdate({ ...task, completed: !task.completed })}
                    onUpdate={onUpdate}
                    onEdit={() => openEditTask(task)}
                    onDelete={() => onDelete(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {visibleLists.length === 0 && dirFreeTasksInDirection.length === 0 && (
            <div className="task-view-empty">
              <Icon name="FolderOpen" size={44} className="task-view-empty-icon" />
              <p>Нет списков и задач</p>
              <span>Нажмите «+» чтобы создать</span>
            </div>
          )}
        </>
      )}

      {!isDirection && (
        <>
          {tasks.length === 0 ? (
            <div className="task-view-empty">
              <Icon name="CheckCircle2" size={44} className="task-view-empty-icon" />
              <p>Нет задач</p>
              <span>Нажмите «+» чтобы добавить</span>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  data={data}
                  showDate={showDate}
                  onToggle={() => onUpdate({ ...task, completed: !task.completed })}
                  onUpdate={onUpdate}
                  onEdit={() => openEditTask(task)}
                  onDelete={() => onDelete(task.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {fabOpen && <div className="fab-backdrop" onClick={() => setFabOpen(false)} />}
      <div className="fab-container">
        {fabOpen && (
          <>
            <button className="fab-option fab-option--task" onClick={() => { setEditTask(null); setTaskModalOpen(true); setFabOpen(false); }}>
              <Icon name="CheckSquare" size={18} />
              <span>Задача</span>
            </button>
            {isDirection && (
              <button className="fab-option fab-option--list" onClick={() => { setEditList(null); setListModalOpen(true); setFabOpen(false); }}>
                <Icon name="List" size={18} />
                <span>Список</span>
              </button>
            )}
            <button className="fab-option fab-option--habit" onClick={() => { setShowHabitModal(true); setFabOpen(false); }}>
              <Icon name="Activity" size={18} />
              <span>Привычка</span>
            </button>
          </>
        )}
        <button
          className={`planner-fab ${fabOpen ? "planner-fab--open" : ""}`}
          onClick={() => setFabOpen(o => !o)}
        >
          <Icon name="Plus" size={24} />
        </button>
      </div>

      {taskModalOpen && (
        <TaskModal
          task={isNewTask ? null : editTask}
          data={data}
          defaultDate={getDefaultDate()}
          defaultCategory={getDefaultCategory()}
          defaultListId={defaultListId}
          onSave={handleSaveTask}
          onClose={() => { setTaskModalOpen(false); setEditTask(null); }}
        />
      )}

      {listModalOpen && (
        <ListModal
          list={editList}
          categories={data.directionCategories}
          defaultCategoryId={isDirection ? activeView.id : undefined}
          onSave={handleSaveList}
          onClose={() => { setListModalOpen(false); setEditList(null); }}
        />
      )}

      {showHabitModal && (
        <QuickHabitModal
          onSave={(h) => { onAddHabit(h); setShowHabitModal(false); }}
          onClose={() => setShowHabitModal(false)}
        />
      )}
    </div>
  );
}

function QuickHabitModal({ onSave, onClose }: { onSave: (h: Habit) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Star");
  const [color, setColor] = useState(HABIT_COLORS[0]);

  function save() {
    if (!name.trim()) return;
    onSave({ id: uid(), name: name.trim(), icon, color, completedDates: [], targetDays: 7 });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-drag-handle" />
        <div className="modal-body">
          <input
            className="modal-title-input"
            placeholder="Название привычки"
            value={name}
            autoFocus
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && save()}
          />
          <div className="modal-section">
            <div className="modal-section-label"><Icon name="Smile" size={14} /> Иконка</div>
            <div className="habit-add-icons">
              {HABIT_ICONS.map(ic => (
                <button key={ic} className={`habit-icon-select ${icon === ic ? "habit-icon-select--active" : ""}`} onClick={() => setIcon(ic)}>
                  <Icon name={ic} size={16} />
                </button>
              ))}
            </div>
          </div>
          <div className="modal-section">
            <div className="modal-section-label"><Icon name="Palette" size={14} /> Цвет</div>
            <div className="habit-add-colors">
              {HABIT_COLORS.map(c => (
                <button key={c} className={`habit-color-dot ${color === c ? "habit-color-dot--active" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Отмена</button>
          <button className="modal-btn-save" onClick={save} disabled={!name.trim()}>Добавить привычку</button>
        </div>
      </div>
    </div>
  );
}
