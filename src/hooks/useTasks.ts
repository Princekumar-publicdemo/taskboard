import { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import type { Task, TaskStatus } from '../types/task';

/** Returns filtered tasks grouped by status */
export function useTasks() {
  const { state } = useTaskContext();
  const { tasks, filters } = state;

  const filtered = useMemo(() => {
    let result = tasks;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    if (filters.assignee) {
      result = result.filter((t) => t.assignee === filters.assignee);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    return result;
  }, [tasks, filters]);

  const columns: Record<TaskStatus, Task[]> = useMemo(
    () => ({
      todo: filtered.filter((t) => t.status === 'todo'),
      'in-progress': filtered.filter((t) => t.status === 'in-progress'),
      done: filtered.filter((t) => t.status === 'done'),
    }),
    [filtered]
  );

  return { filtered, columns, total: tasks.length };
}
