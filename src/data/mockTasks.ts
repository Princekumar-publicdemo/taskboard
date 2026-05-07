import type { Task } from '../types/task';

const assignees = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Williams', 'Charlie Brown'];
const tags = ['backend', 'frontend', 'design', 'security', 'urgent', 'bug', 'feature', 'devops'];
const priorities = ['low', 'medium', 'high'] as const;
const statuses = ['todo', 'in-progress', 'done'] as const;

const baseTasks: Task[] = [
  {
    id: '1',
    title: 'Implement authentication',
    description: 'Add JWT-based auth',
    status: 'todo',
    priority: 'high',
    assignee: 'John Doe',
    tags: ['backend', 'security'],
    createdAt: '2024-11-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Design new landing page',
    description: 'Create mockups for homepage redesign',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Jane Smith',
    tags: ['design', 'frontend'],
    createdAt: '2024-11-19T14:30:00Z',
  },
  {
    id: '3',
    title: 'Fix payment gateway bug',
    description: 'Users unable to complete checkout',
    status: 'todo',
    priority: 'high',
    assignee: 'John Doe',
    tags: ['backend', 'urgent'],
    createdAt: '2024-11-21T09:15:00Z',
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all REST endpoints',
    status: 'done',
    priority: 'medium',
    assignee: 'Alice Johnson',
    tags: ['backend'],
    createdAt: '2024-11-18T08:00:00Z',
  },
  {
    id: '5',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for deployment',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Bob Williams',
    tags: ['devops'],
    createdAt: '2024-11-17T11:00:00Z',
  },
  {
    id: '6',
    title: 'Refactor user service',
    description: 'Break monolith into microservices',
    status: 'todo',
    priority: 'low',
    assignee: 'Charlie Brown',
    tags: ['backend'],
    createdAt: '2024-11-16T09:00:00Z',
  },
  {
    id: '7',
    title: 'Add dark mode support',
    description: 'Implement theme toggle with system preference detection',
    status: 'todo',
    priority: 'low',
    assignee: 'Jane Smith',
    tags: ['frontend', 'feature'],
    createdAt: '2024-11-15T13:00:00Z',
  },
  {
    id: '8',
    title: 'Performance audit',
    description: 'Run Lighthouse and fix critical issues',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'Alice Johnson',
    tags: ['frontend'],
    createdAt: '2024-11-14T10:30:00Z',
  },
];

// Generate additional tasks to reach 30+
function generateTasks(count: number): Task[] {
  const titles = [
    'Update dependencies', 'Add unit tests', 'Fix mobile layout', 'Optimize images',
    'Add error tracking', 'Create onboarding flow', 'Implement search', 'Add notifications',
    'Fix memory leak', 'Update database schema', 'Add rate limiting', 'Create admin panel',
    'Implement caching', 'Add logging service', 'Fix accessibility issues', 'Create email templates',
    'Add analytics', 'Implement webhooks', 'Fix timezone bugs', 'Add export feature',
    'Optimize queries', 'Add pagination', 'Create user dashboard',
  ];

  return titles.slice(0, count).map((title, i) => ({
    id: String(baseTasks.length + i + 1),
    title,
    description: `Description for: ${title}`,
    status: statuses[Math.floor(Math.random() * 3)],
    priority: priorities[Math.floor(Math.random() * 3)],
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    tags: [tags[Math.floor(Math.random() * tags.length)]],
    createdAt: new Date(2024, 10, 10 + i).toISOString(),
  }));
}

export const mockTasks: Task[] = [...baseTasks, ...generateTasks(22)];
export { assignees };
