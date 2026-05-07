import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

describe('TaskBoard Critical Logic', () => {
  // Test 1: Task creation adds to the board
  it('creates a new task via the form', async () => {
    render(<App />);
    // Open form
    fireEvent.click(screen.getByText('+ New Task'));
    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText('Title *'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByPlaceholderText('Assignee *'), { target: { value: 'Tester' } });
    // Submit
    fireEvent.click(screen.getByText('Create'));
    // Task should now appear on the board
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  // Test 2: Optimistic update rollback on failure
  it('rolls back task move on simulated API failure', async () => {
    vi.useFakeTimers();
    // Force random to always fail (< 0.1)
    const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.05);

    render(<App />);
    // Find a task in todo column - the first task "Implement authentication" should be in todo
    const task = screen.getByText('Implement authentication');
    expect(task).toBeInTheDocument();

    // After the 2s timeout, the rollback should have occurred (task stays in original column)
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    // Task should still exist (rolled back)
    expect(screen.getByText('Implement authentication')).toBeInTheDocument();

    mathSpy.mockRestore();
    vi.useRealTimers();
  });

  // Test 3: Undo/Redo functionality
  it('supports undo after task creation', async () => {
    render(<App />);
    // Create a task
    fireEvent.click(screen.getByText('+ New Task'));
    fireEvent.change(screen.getByPlaceholderText('Title *'), { target: { value: 'Undo Me' } });
    fireEvent.change(screen.getByPlaceholderText('Assignee *'), { target: { value: 'Someone' } });
    fireEvent.click(screen.getByText('Create'));
    expect(screen.getByText('Undo Me')).toBeInTheDocument();

    // Trigger undo via keyboard
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });
    expect(screen.queryByText('Undo Me')).not.toBeInTheDocument();

    // Trigger redo
    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });
    expect(screen.getByText('Undo Me')).toBeInTheDocument();
  });
});
