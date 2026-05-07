import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../../types/task';
import { TaskCard } from '../TaskCard/TaskCard';

interface Props {
  task: Task;
  isPending: boolean;
  onEdit?: (task: Task) => void;
}

export function DraggableTask({ task, isPending, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-30' : ''}
    >
      <TaskCard task={task} isPending={isPending} onEdit={onEdit} />
    </div>
  );
}
