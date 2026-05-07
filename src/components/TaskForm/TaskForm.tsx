import { useState } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import type { Task, Priority, TaskStatus } from '../../types/task';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onClose: () => void;
  editingTask?: Task | null;
}

export function TaskForm({ onClose, editingTask }: Props) {
  const { dispatch } = useTaskContext();
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [assignee, setAssignee] = useState(editingTask?.assignee ?? '');
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(editingTask?.status ?? 'todo');
  const [tags, setTags] = useState(editingTask?.tags.join(', ') ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !assignee.trim()) return;

    const task: Task = {
      id: editingTask?.id ?? uuidv4(),
      title: title.trim(),
      description: description.trim(),
      assignee: assignee.trim(),
      priority,
      status,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: editingTask?.createdAt ?? new Date().toISOString(),
    };

    dispatch({ type: editingTask ? 'UPDATE_TASK' : 'ADD_TASK', task });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editingTask ? 'Edit Task' : 'New Task'}
        </h2>

        <input
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Assignee *"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          required
        />

        <div className="flex gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <input
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            {editingTask ? 'Save' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
