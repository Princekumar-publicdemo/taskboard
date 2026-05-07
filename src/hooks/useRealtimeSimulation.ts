import { useEffect, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import type { TaskStatus, Priority } from '../types/task';

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
const priorities: Priority[] = ['low', 'medium', 'high'];

/**
 * Simulates another user making random changes every 10-15 seconds.
 * Dispatches EXTERNAL_UPDATE and fires a custom event for toast notification.
 */
export function useRealtimeSimulation() {
  const { state, dispatch } = useTaskContext();
  const tasksRef = useRef(state.tasks);
  tasksRef.current = state.tasks;

  useEffect(() => {
    function scheduleNext() {
      const delay = 10000 + Math.random() * 5000; // 10-15s
      return setTimeout(() => {
        const tasks = tasksRef.current;
        if (tasks.length === 0) return;
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const newPriority = priorities[Math.floor(Math.random() * priorities.length)];
        const updated = { ...task, status: newStatus, priority: newPriority };
        dispatch({ type: 'EXTERNAL_UPDATE', task: updated });
        window.dispatchEvent(
          new CustomEvent('task-external-update', {
            detail: { task: updated, change: `"${task.title}" updated by another user` },
          })
        );
        timerId = scheduleNext();
      }, delay);
    }
    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, [dispatch]);
}
