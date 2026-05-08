# 📋 Task Board — Release v1.0.0

> Real-time collaborative task management board with drag-and-drop, optimistic updates, and undo/redo.

**Release Date:** May 8, 2026  
**Status:** Stable  
**Live Demo:** [Deployed via GitHub Pages / Vercel — update link here]

---

## 1. Functionality

### Core Features (Part 1)
- **Kanban Board** — 3 columns: To Do, In Progress, Done
- **Drag & Drop** — Drag tasks between columns with visual feedback (DragOverlay)
- **Task CRUD** — Create, edit, and delete tasks via a modal form
- **Task Fields** — Title, description, assignee, priority (Low/Medium/High), tags, status, created date
- **Filtering** — Filter by assignee, priority, and full-text search (debounced)

### Advanced Features (Part 2)
- **Optimistic Updates with Rollback**
  - Status changes apply instantly in the UI
  - Simulated 2-second API delay via `setTimeout`
  - 10% random failure rate triggers automatic rollback
  - "Saving..." loading overlay on pending tasks
  - Dismissible error toast on failure
- **Real-Time Simulation**
  - Another "user" modifies a random task every 10–15 seconds
  - Toast notification shows what changed
  - Conflict-safe: uses `EXTERNAL_UPDATE` action separate from user actions
- **Performance at Scale**
  - Custom virtualization renders only visible tasks (threshold: 30+ per column)
  - Supports 1000+ tasks with smooth scrolling and drag-and-drop
  - `React.memo` on TaskCard, DraggableTask, and Column with custom comparators

### Expert Feature (Part 3 — Option A)
- **Undo/Redo System**
  - Tracks all task mutations (add, edit, delete, move)
  - Keyboard shortcuts: `Ctrl/Cmd+Z` (undo), `Ctrl/Cmd+Shift+Z` (redo)
  - History stack capped at 50 actions
  - Lightweight diff-based history (stores only affected tasks, not full array clones)
  - UI displays next undo/redo action description

### UX Extras
- 🌗 **Dark/Light mode toggle** with system preference detection and localStorage persistence
- 🔔 **Dismissible toast notifications** with close button
- 🛡️ **Error Boundaries** per column to isolate crashes
- 📱 **Responsive layout** — mobile-friendly single-column → 3-column grid

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19 |
| Language | TypeScript | 6 |
| Bundler | Vite | 8 |
| Styling | Tailwind CSS | 4 |
| Drag & Drop | @dnd-kit/core | latest |
| Notifications | react-hot-toast | latest |
| IDs | uuid | latest |
| Testing | Vitest + @testing-library/react | latest |
| Linting | ESLint + React Hooks plugin | 10 |

### Architecture Decisions
- **State Management:** `useReducer` + React Context (no external state library)
- **Folder Structure:** Feature-based (`components/Board/`, `components/TaskCard/`, etc.)
- **Custom Hooks:** `useTasks`, `useUndoRedo`, `useRealtimeSimulation` for separation of concerns
- **No CSS-in-JS runtime:** Tailwind CSS utility classes (zero runtime overhead)

---

## 3. Performance

### Optimizations Implemented

| Technique | Impact |
|-----------|--------|
| **Custom virtualization** | Only ~15 DOM nodes per column regardless of list size |
| **React.memo + custom areEqual** | Column/DraggableTask/TaskCard skip re-render when props unchanged |
| **Stable callbacks (useCallback)** | `moveTaskOptimistic`, `handleEdit` never break child memoization |
| **Ref-based state capture** | `moveTaskOptimistic` uses `useRef` instead of depending on `state.tasks` |
| **Memoized context value** | `useMemo` on provider value prevents cascading re-renders |
| **Diff-based undo history** | Stores only affected task snapshots (~1 object) instead of full array copies (~1000 objects × 50 entries) |
| **Serialized pending key** | Converts `Set<string>` → sorted string for stable memo comparison |
| **Debounced search** | 300ms delay prevents re-filtering on every keystroke |

### Benchmarks (manual testing)
- ✅ 100 tasks: instant rendering, no perceptible lag
- ✅ 1000 tasks: smooth scrolling with virtualization, drag-and-drop responsive
- ✅ Drag between columns: no layout shift, no horizontal scrollbar

To stress-test: change `GENERATED_COUNT` in `src/data/mockTasks.ts` to `1000` or higher.

---

## 4. Tests

### Test Suite
Run with:
```bash
npm test
```

### Critical Tests (3 tests in `src/test/taskboard.test.tsx`)

| # | Test | What it verifies |
|---|------|-----------------|
| 1 | **Task Creation** | Creating a task via the form adds it to the board |
| 2 | **Optimistic Rollback** | On simulated failure (Math.random mocked to < 0.1), task reverts to original column after 2s |
| 3 | **Undo/Redo** | After creating a task, Ctrl+Z removes it; Ctrl+Shift+Z restores it |

### Testing Tools
- **Vitest** — Fast Vite-native test runner
- **@testing-library/react** — User-centric DOM testing
- **@testing-library/jest-dom** — Extended matchers (`toBeInTheDocument`, etc.)
- **jsdom** — Browser environment simulation

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Known Limitations
- Real-time simulation is local only (no WebSocket/server)
- Undo/redo does not persist across page reloads
- Virtualized columns use fixed item height (130px) — variable-height cards may clip

---

## Future Roadmap (v1.1.0)
- [ ] Persist state to localStorage / IndexedDB
- [ ] Add keyboard shortcuts for task navigation
- [ ] Implement compound filter query builder (AND/OR logic)
- [ ] Add task comments and activity log
- [ ] Service worker for offline-first support
- [ ] Animation transitions on task move (performant via `layout` animations)

---

*Built with ❤️ using React 19, TypeScript, and Tailwind CSS.*
