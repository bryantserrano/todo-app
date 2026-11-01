import type { Todo } from '../types/todo';

interface Props {
  todos: Todo[];
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  pendingTodoIds: string[];
  emptyMessage: string;
}

export default function TodoList({ todos, onToggle, onDelete, pendingTodoIds, emptyMessage }: Props) {
  return (
    <ul className="todo-list" aria-label="Tasks">
      {todos.length === 0 && (
        <li className="empty-state">
          <span className="empty-state-icon" aria-hidden="true">✦</span>
          <p>{emptyMessage}</p>
        </li>
      )}
      {todos.map(todo => (
        <li
          key={todo._id}
          className={`todo-item${todo.completed ? ' is-completed' : ''}`}
          aria-busy={pendingTodoIds.includes(todo._id)}
        >
          <button
            type="button"
            className="completion-button"
            aria-label={`${todo.completed ? 'Mark' : 'Complete'} ${todo.title}${todo.completed ? ' as active' : ''}`}
            aria-pressed={todo.completed}
            disabled={pendingTodoIds.includes(todo._id)}
            onClick={() => onToggle(todo)}
          >
            <span aria-hidden="true">{todo.completed ? '✓' : ''}</span>
          </button>
          <span className="todo-title">{todo.title}</span>
          <button
            type="button"
            className="delete-button"
            aria-label={`Delete ${todo.title}`}
            disabled={pendingTodoIds.includes(todo._id)}
            onClick={() => onDelete(todo)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
