import { useDroppable } from '@dnd-kit/core';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from '../../types/task';
import { DraggableTask } from './DraggableTask';

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

const statusColors: Record<TaskStatus, string> = {
  todo: 'border-t-blue-500',
  'in-progress': 'border-t-yellow-500',
  done: 'border-t-green-500',
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  pendingIds: Set<string>;
  onEditTask?: (task: Task) => void;
}

/**
 * Simple windowing: only render tasks visible in viewport + buffer.
 * For 1000+ tasks this prevents DOM bloat while keeping drag-and-drop working.
 */
export function Column({ status, tasks, pendingIds, onEditTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 30 });

  const ITEM_HEIGHT = 130;
  const BUFFER = 5;

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const viewHeight = el.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
    const end = Math.min(tasks.length, Math.ceil((scrollTop + viewHeight) / ITEM_HEIGHT) + BUFFER);
    setVisibleRange({ start, end });
  }, [tasks.length]);

  useEffect(() => { handleScroll(); }, [tasks.length, handleScroll]);

  const useVirtual = tasks.length > 30;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border-t-4 ${statusColors[status]} bg-gray-50 dark:bg-gray-900 min-h-[300px] ${isOver ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div className="p-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {statusLabels[status]}
        </h3>
        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={useVirtual ? handleScroll : undefined}
        className="flex-1 overflow-y-auto px-2 pb-2 max-h-[500px]"
      >
        {useVirtual ? (
          <div style={{ height: tasks.length * ITEM_HEIGHT, position: 'relative' }}>
            {tasks.slice(visibleRange.start, visibleRange.end).map((task, i) => (
              <div
                key={task.id}
                style={{ position: 'absolute', top: (visibleRange.start + i) * ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT, padding: '4px 0' }}
              >
                <DraggableTask task={task} isPending={pendingIds.has(task.id)} onEdit={onEditTask} />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <DraggableTask key={task.id} task={task} isPending={pendingIds.has(task.id)} onEdit={onEditTask} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
