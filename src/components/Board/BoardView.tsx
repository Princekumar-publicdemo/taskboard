import { useState } from 'react';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTaskContext } from '../../context/TaskContext';
import { useTasks } from '../../hooks/useTasks';
import type { Task, TaskStatus } from '../../types/task';
import { Column } from './Column';
import { TaskCard } from '../TaskCard/TaskCard';

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

interface Props {
  onEditTask?: (task: Task) => void;
}

export function BoardView({ onEditTask }: Props) {
  const { moveTaskOptimistic, state } = useTaskContext();
  const { columns } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = state.tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      moveTaskOptimistic(taskId, newStatus);
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={columns[status]}
            pendingIds={state.pendingUpdates}
            onEditTask={onEditTask}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="w-64 rotate-2 shadow-lg">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
