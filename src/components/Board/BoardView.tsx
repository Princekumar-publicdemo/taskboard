import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useTaskContext } from '../../context/TaskContext';
import { useTasks } from '../../hooks/useTasks';
import type { Task, TaskStatus } from '../../types/task';
import { Column } from './Column';

const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

interface Props {
  onEditTask?: (task: Task) => void;
}

export function BoardView({ onEditTask }: Props) {
  const { moveTaskOptimistic, state } = useTaskContext();
  const { columns } = useTasks();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
    </DndContext>
  );
}
