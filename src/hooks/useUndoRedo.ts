import { useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';

/** Listen for Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z */
export function useUndoRedo() {
  const { undo, redo, canUndo, canRedo, nextUndoDescription, nextRedoDescription } = useTaskContext();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  return { undo, redo, canUndo, canRedo, nextUndoDescription, nextRedoDescription };
}
