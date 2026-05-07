import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../../types/task';
import { TaskCard } from '../TaskCard/TaskCard';

interface Props {
  task: Task;
  isPending: boolean;
  onEdit?: (task: Task) => void;
}

export function DraggableTask({ task, isPending, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <TaskCard task={task} isPending={isPending} onEdit={onEdit} />
    </div>
  );
}
