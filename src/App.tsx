import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { TaskProvider } from './context/TaskContext';
import { ThemeProvider } from './context/ThemeContext';
import { BoardView } from './components/Board/BoardView';
import { Filters } from './components/Filters/Filters';
import { TaskForm } from './components/TaskForm/TaskForm';
import { UndoRedoBar } from './components/common/UndoRedoBar';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useRealtimeSimulation } from './hooks/useRealtimeSimulation';
import { ThemeToggle } from './components/common/ThemeToggle';
import type { Task } from './types/task';

function AppContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useRealtimeSimulation();

  useEffect(() => {
    const onError = () => toast.error(
      (t) => (
        <div className="flex items-center gap-2">
          <span>Failed to save! Change has been rolled back.</span>
          <button onClick={() => toast.dismiss(t.id)} className="ml-auto shrink-0 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      ),
    );
    const onExternal = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      toast(
        (t) => (
          <div className="flex items-center gap-2">
            <span>{detail.change}</span>
            <button onClick={() => toast.dismiss(t.id)} className="ml-auto shrink-0 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        ),
        { icon: '\u{1F464}', duration: 5000 },
      );
    };
    window.addEventListener('task-error', onError);
    window.addEventListener('task-external-update', onExternal);
    return () => {
      window.removeEventListener('task-error', onError);
      window.removeEventListener('task-external-update', onExternal);
    };
  }, []);

  function handleEdit(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingTask(null);
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 md:p-6">
      <Toaster position="top-right" />
      <header className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Task Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Real-time collaborative task management</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UndoRedoBar />
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow"
          >
            + New Task
          </button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto mb-4">
        <Filters />
      </div>
      <div className="max-w-7xl mx-auto">
        <ErrorBoundary>
          <BoardView onEditTask={handleEdit} />
        </ErrorBoundary>
      </div>
      {showForm && <TaskForm onClose={handleClose} editingTask={editingTask} />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ThemeProvider>
  );
}
