import { useState, useCallback } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import type { Priority } from '../../types/task';
import { assignees } from '../../data/mockTasks';

export function Filters() {
  const { state, dispatch } = useTaskContext();
  const { filters } = state;
  const [searchLocal, setSearchLocal] = useState(filters.search);

  // Debounced search
  const debounceRef = useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => dispatch({ type: 'SET_FILTERS', filters: { search: value } }), 300);
    };
  }, [dispatch])();

  function handleSearch(value: string) {
    setSearchLocal(value);
    debounceRef(value);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchLocal}
        onChange={(e) => handleSearch(e.target.value)}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
      />
      <select
        value={filters.assignee}
        onChange={(e) => dispatch({ type: 'SET_FILTERS', filters: { assignee: e.target.value } })}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm"
      >
        <option value="">All Assignees</option>
        {assignees.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(e) => dispatch({ type: 'SET_FILTERS', filters: { priority: e.target.value as Priority | '' } })}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-1.5 text-sm"
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
