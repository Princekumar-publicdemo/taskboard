export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  tags: string[];
  createdAt: string;
}

export interface FilterState {
  search: string;
  assignee: string;
  priority: Priority | '';
}

export interface HistoryEntry {
  type: string;
  previousState: Task[];
  description: string;
}
