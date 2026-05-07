import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Task, TaskStatus, FilterState, HistoryEntry } from '../types/task';
import { mockTasks } from '../data/mockTasks';

// --- State ---
interface TaskState {
  tasks: Task[];
  filters: FilterState;
  history: HistoryEntry[];
  future: HistoryEntry[];
  pendingUpdates: Set<string>; // task IDs currently being "saved"
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

function pushHistory(state: TaskState, description: string, actionType: string): TaskState {
  const entry: HistoryEntry = {
    type: actionType,
    previousState: state.tasks,
    description,
  };
  const history = [...state.history, entry].slice(-MAX_HISTORY);
  return { ...state, history, future: [] };
}

function taskReducer(state: TaskState, action: Action): TaskState {
  switch (action.type) {
    case 'ADD_TASK': {
      const newState = pushHistory(state, `Add "${action.task.title}"`, 'ADD_TASK');
      return { ...newState, tasks: [...newState.tasks, action.task] };
    }
    case 'UPDATE_TASK': {
      const newState = pushHistory(state, `Update "${action.task.title}"`, 'UPDATE_TASK');
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
      const newState = pushHistory(state, `Move "${task?.title}" to ${action.status}`, 'MOVE_TASK');
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
      const entry = state.history[state.history.length - 1];
      const future: HistoryEntry[] = [
        ...state.future,
        { type: entry.type, previousState: state.tasks, description: entry.description },
      ];
      return {
        ...state,
        tasks: entry.previousState,
        history: state.history.slice(0, -1),
        future,
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const entry = state.future[state.future.length - 1];
      const history: HistoryEntry[] = [
        ...state.history,
        { type: entry.type, previousState: state.tasks, description: entry.description },
      ];
      return {
        ...state,
        tasks: entry.previousState,
        history,
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

  // Optimistic update with simulated API call (2s delay, 10% failure)
  const moveTaskOptimistic = useCallback(
    (id: string, status: TaskStatus) => {
      const previousTasks = state.tasks;
      dispatch({ type: 'OPTIMISTIC_MOVE', id, status });
      dispatch({ type: 'MARK_PENDING', id });

      setTimeout(() => {
        const failed = Math.random() < 0.1;
        dispatch({ type: 'CLEAR_PENDING', id });
        if (failed) {
          dispatch({ type: 'ROLLBACK', previousTasks });
          // Toast will be triggered by the component
          window.dispatchEvent(new CustomEvent('task-error', { detail: { id } }));
        }
      }, 2000);
    },
    [state.tasks]
  );

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const canUndo = state.history.length > 0;
  const canRedo = state.future.length > 0;
  const nextUndoDescription = canUndo ? state.history[state.history.length - 1].description : '';
  const nextRedoDescription = canRedo ? state.future[state.future.length - 1].description : '';

  return (
    <TaskContext.Provider
      value={{ state, dispatch, moveTaskOptimistic, undo, redo, canUndo, canRedo, nextUndoDescription, nextRedoDescription }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider');
  return ctx;
}
