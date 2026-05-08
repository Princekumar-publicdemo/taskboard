import { createContext, useContext, useReducer, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { Task, TaskStatus, FilterState, HistoryEntry } from '../types/task';
import { mockTasks } from '../data/mockTasks';

// --- State ---
interface TaskState {
  tasks: Task[];
  filters: FilterState;
  history: HistoryEntry[];
  future: HistoryEntry[];
  pendingUpdates: Set<string>;
}

const initialState: TaskState = {
  tasks: mockTasks,
  filters: { search: '', assignee: '', priority: '' },
  history: [],
  future: [],
  pendingUpdates: new Set(),
};

// --- Actions ---
type Action =
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'UPDATE_TASK'; task: Task }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'MOVE_TASK'; id: string; status: TaskStatus }
  | { type: 'SET_TASKS'; tasks: Task[] }
  | { type: 'SET_FILTERS'; filters: Partial<FilterState> }
  | { type: 'OPTIMISTIC_MOVE'; id: string; status: TaskStatus }
  | { type: 'ROLLBACK'; previousTasks: Task[] }
  | { type: 'MARK_PENDING'; id: string }
  | { type: 'CLEAR_PENDING'; id: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'EXTERNAL_UPDATE'; task: Task };

const MAX_HISTORY = 50;

/**
 * PERF: History entries now store lightweight diffs (affected task IDs + snapshots
 * of only those tasks) instead of cloning the entire tasks array.
 * For 1000 tasks × 50 history entries this reduces memory from ~50k objects to ~50 objects.
 */
interface HistoryDiff {
  type: string;
  description: string;
  /** Snapshot of only the tasks that were changed (or the full array for bulk ops like ROLLBACK) */
  snapshot: Task[];
  /** If true, snapshot is the full previous task list (used for add/delete which change array length) */
  isFull: boolean;
}

function pushHistory(state: TaskState, description: string, actionType: string, affectedIds?: string[]): TaskState {
  const isFull = !affectedIds; // add/delete need full snapshot
  const snapshot = isFull
    ? state.tasks
    : state.tasks.filter((t) => affectedIds!.includes(t.id));
  const entry: HistoryDiff = { type: actionType, description, snapshot, isFull };
  const history = [...state.history, entry as unknown as HistoryEntry].slice(-MAX_HISTORY);
  return { ...state, history, future: [] };
}

function applyUndo(state: TaskState, entry: HistoryDiff): Task[] {
  if (entry.isFull) return entry.snapshot;
  // Patch: replace only the affected tasks with their previous versions
  const snapshotMap = new Map(entry.snapshot.map((t) => [t.id, t]));
  return state.tasks.map((t) => snapshotMap.get(t.id) ?? t);
}

function taskReducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newState = pushHistory(state, `Add "${action.task.title}"`, 'ADD_TASK');
      return { ...newState, tasks: [...newState.tasks, action.task] };
    }
    case 'UPDATE_TASK': {
      const newState = pushHistory(state, `Update "${action.task.title}"`, 'UPDATE_TASK', [action.task.id]);
      return {
        ...newState,
        tasks: newState.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      };
    }
    case 'DELETE_TASK': {
      const task = state.tasks.find((t) => t.id === action.id);
      const newState = pushHistory(state, `Delete "${task?.title}"`, 'DELETE_TASK');
      return { ...newState, tasks: newState.tasks.filter((t) => t.id !== action.id) };
    }
    case 'MOVE_TASK':
    case 'OPTIMISTIC_MOVE': {
      const task = state.tasks.find((t) => t.id === action.id);
      const newState = pushHistory(state, `Move "${task?.title}" to ${action.status}`, 'MOVE_TASK', [action.id]);
      return {
        ...newState,
        tasks: newState.tasks.map((t) =>
          t.id === action.id ? { ...t, status: action.status } : t
        ),
      };
    }
    case 'ROLLBACK':
      return { ...state, tasks: action.previousTasks };
    case 'SET_TASKS':
      return { ...state, tasks: action.tasks };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'MARK_PENDING': {
      const pending = new Set(state.pendingUpdates);
      pending.add(action.id);
      return { ...state, pendingUpdates: pending };
    }
    case 'CLEAR_PENDING': {
      const pending = new Set(state.pendingUpdates);
      pending.delete(action.id);
      return { ...state, pendingUpdates: pending };
    }
    case 'UNDO': {
      if (state.history.length === 0) return state;
      const entry = state.history[state.history.length - 1] as unknown as HistoryDiff;
      // Save current state into future for redo
      const futureEntry: HistoryDiff = {
        type: entry.type,
        description: entry.description,
        snapshot: entry.isFull ? state.tasks : state.tasks.filter((t) => entry.snapshot.some((s) => s.id === t.id)),
        isFull: entry.isFull,
      };
      return {
        ...state,
        tasks: applyUndo(state, entry),
        history: state.history.slice(0, -1),
        future: [...state.future, futureEntry as unknown as HistoryEntry],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const entry = state.future[state.future.length - 1] as unknown as HistoryDiff;
      const historyEntry: HistoryDiff = {
        type: entry.type,
        description: entry.description,
        snapshot: entry.isFull ? state.tasks : state.tasks.filter((t) => entry.snapshot.some((s) => s.id === t.id)),
        isFull: entry.isFull,
      };
      return {
        ...state,
        tasks: applyUndo(state, entry),
        history: [...state.history, historyEntry as unknown as HistoryEntry],
        future: state.future.slice(0, -1),
      };
    }
    case 'EXTERNAL_UPDATE':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      };
    default:
      return state;
  }
}

// --- Context ---
interface TaskContextValue {
  state: TaskState;
  dispatch: React.Dispatch<Action>;
  moveTaskOptimistic: (id: string, status: TaskStatus) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  nextUndoDescription: string;
  nextRedoDescription: string;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // PERF: Use a ref to capture current tasks for the optimistic rollback snapshot.
  // This avoids recreating moveTaskOptimistic on every state change.
  const tasksRef = useRef(state.tasks);
  tasksRef.current = state.tasks;

  const moveTaskOptimistic = useCallback(
    (id: string, status: TaskStatus) => {
      const previousTasks = tasksRef.current;
      dispatch({ type: 'OPTIMISTIC_MOVE', id, status });
      dispatch({ type: 'MARK_PENDING', id });

      setTimeout(() => {
        const failed = Math.random() < 0.1;
        dispatch({ type: 'CLEAR_PENDING', id });
        if (failed) {
          dispatch({ type: 'ROLLBACK', previousTasks });
          window.dispatchEvent(new CustomEvent('task-error', { detail: { id } }));
        }
      }, 2000);
    },
    [] // stable — uses ref instead of state.tasks
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  // PERF: Memoize the entire context value to prevent unnecessary consumer re-renders.
  // Only recomputes when state actually changes (which it will on dispatch, but NOT
  // due to parent re-renders).
  const contextValue = useMemo<TaskContextValue>(() => {
    const canUndo = state.history.length > 0;
    const canRedo = state.future.length > 0;
    return {
      state,
      dispatch,
      moveTaskOptimistic,
      undo,
      redo,
      canUndo,
      canRedo,
      nextUndoDescription: canUndo ? (state.history[state.history.length - 1] as unknown as HistoryDiff).description : '',
      nextRedoDescription: canRedo ? (state.future[state.future.length - 1] as unknown as HistoryDiff).description : '',
    };
  }, [state, moveTaskOptimistic, undo, redo]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}
