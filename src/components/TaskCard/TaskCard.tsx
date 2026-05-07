import { memo } from 'react';
import type { Task } from '../../types/task';

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

interface Props {
  task: Task;
  isPending?: boolean;
  onEdit?: (task: Task) => void;
}

export const TaskCard = memo(function TaskCard({ task, isPending, onEdit }: Props) {
  return (
    <div
      className={`relative rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab ${isPending ? 'opacity-60 animate-pulse' : ''}`}
      onClick={() => onEdit?.(task)}
    >
      {/* Priority badge */}
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
        {task.priority}
      </span>

      <h4 className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
        {task.title}
      </h4>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {task.description}
      </p>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span className="truncate max-w-[60%]">{task.assignee}</span>
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-lg">
          <span className="text-xs text-gray-500">Saving...</span>
        </div>
      )}
    </div>
  );
});
