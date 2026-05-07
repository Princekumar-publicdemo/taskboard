import { useUndoRedo } from '../../hooks/useUndoRedo';

export function UndoRedoBar() {
  const { undo, redo, canUndo, canRedo, nextUndoDescription, nextRedoDescription } = useUndoRedo();

  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600"
        title={canUndo ? `Undo: ${nextUndoDescription}` : 'Nothing to undo'}
      >
        ↩ Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-30 hover:bg-gray-300 dark:hover:bg-gray-600"
        title={canRedo ? `Redo: ${nextRedoDescription}` : 'Nothing to redo'}
      >
        ↪ Redo
      </button>
      {(canUndo || canRedo) && (
        <span className="text-gray-400 dark:text-gray-500 ml-1">
          {canUndo && <>Undo: {nextUndoDescription}</>}
          {canUndo && canRedo && ' | '}
          {canRedo && <>Redo: {nextRedoDescription}</>}
        </span>
      )}
    </div>
  );
}
