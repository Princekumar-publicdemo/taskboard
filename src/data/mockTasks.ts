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

// Generate additional tasks — supports 1000+ for perf testing
function generateTasks(count: number): Task[] {
  const titlePrefixes = [
    'Update', 'Add', 'Fix', 'Optimize', 'Create', 'Implement', 'Refactor',
    'Design', 'Test', 'Deploy', 'Configure', 'Migrate', 'Document', 'Review',
  ];
  const titleSuffixes = [
    'dependencies', 'unit tests', 'mobile layout', 'images', 'error tracking',
    'onboarding flow', 'search', 'notifications', 'memory leak', 'database schema',
    'rate limiting', 'admin panel', 'caching', 'logging service', 'accessibility',
    'email templates', 'analytics', 'webhooks', 'timezone bugs', 'export feature',
    'queries', 'pagination', 'user dashboard', 'auth module', 'payment flow',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: String(baseTasks.length + i + 1),
    title: `${titlePrefixes[i % titlePrefixes.length]} ${titleSuffixes[i % titleSuffixes.length]}`,
    description: `Task #${baseTasks.length + i + 1}: auto-generated for performance testing`,
    status: statuses[Math.floor(Math.random() * 3)],
    priority: priorities[Math.floor(Math.random() * 3)],
    assignee: assignees[Math.floor(Math.random() * assignees.length)],
    tags: [tags[Math.floor(Math.random() * tags.length)]],
    createdAt: new Date(2024, 10, 1 + (i % 28)).toISOString(),
  }));
}

// Default: 30 tasks for normal usage. Set to 1000+ for stress testing.
// Change the number below to test with large datasets:
const GENERATED_COUNT = 100;
export const mockTasks: Task[] = [...baseTasks, ...generateTasks(GENERATED_COUNT)];
export { assignees };
