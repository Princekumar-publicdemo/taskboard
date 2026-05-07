Plan: Real-Time Collaborative Task Board
# A modular React 19 + TypeScript + Tailwind CSS app with a Kanban board, drag-and-drop, optimistic updates with rollback, simulated real-time collaboration, virtualized lists for 1000+ tasks, and an undo/redo system (Option A). The app is structured around feature folders, custom hooks, and Context API for state.
Steps
1. Configure Tailwind — Add tailwindcss() plugin in vite.config.ts and install additional deps: @dnd-kit/core, react-window, react-hot-toast, uuid.
2. Define types & mock data — Create src/types/task.ts (interfaces for Task, TaskStatus, Priority, FilterQuery) and src/data/mockTasks.ts (30+ seeded tasks using the starter data schema).
3. Build state layer — Create src/context/TaskContext.tsx with useReducer for all task CRUD, status changes, undo/redo history stack (max 50), and optimistic update queue. Extract hooks: src/hooks/useTasks.ts, src/hooks/useFilters.ts, src/hooks/useUndoRedo.ts.
4. Implement core UI modules — Build feature-folder components:
    * src/components/Board/ — BoardView, Column (Todo/InProgress/Done) with drag-and-drop via @dnd-kit
    * src/components/TaskCard/ — Memoized TaskCard with priority badge, assignee, tags
    * src/components/TaskForm/ — Modal for create/edit with validation
    * src/components/Filters/ — Assignee dropdown, priority filter, search input; compound AND/OR query builder UI (Part 3 Option B)
    * src/components/common/ — Toast, ErrorBoundary, ConfirmDialog
5. Add advanced features —
    * Optimistic updates: Wrap status-change dispatch in a simulated 2s API call; on 10% random failure, rollback via dispatching a revert action and showing an error toast.
    * Real-time simulation: src/hooks/useRealtimeSimulation.ts — setInterval (10–15s random) mutates a random task; toast notification on external change; conflict detection if user is editing the same task.
    * Virtualization: Use react-window FixedSizeList inside each column to render 1000+ tasks efficiently.
    * Undo/Redo: Keyboard listener (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z) in useUndoRedo; history stack in context; UI indicator showing next undo/redo action.
6. Polish & optimize — Wrap TaskCard in React.memo, memoize filtered task lists with useMemo, debounce search input, add error boundaries per column, responsive layout with Tailwind breakpoints, dark mode via Tailwind dark: classes.
# Further Considerations
1. Drag-and-drop library: use @dnd-kit/core 
2. Part 3 Plan includes Option A (Undo/Redo) maintaining a history stack with max 50 actions.
3. Testing: Add vitest + @testing-library/react for critical logic tests (reducer, optimistic rollback, undo/redo) , include 3 tests for critical logic.