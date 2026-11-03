import { useState } from 'react';
import { addTodo } from '../services/api';

interface Props {
  onAdd: () => Promise<void>;
}

export default function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addTodo({ title: trimmedTitle, completed: false });
      setTitle('');
      await onAdd();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'We couldn’t add that task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <label className="visually-hidden" htmlFor="new-todo">New task</label>
      <input
        id="new-todo"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="todo-input"
        maxLength={200}
        autoComplete="off"
        placeholder="What needs to be done?"
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'todo-input-hint todo-form-error' : 'todo-input-hint'}
      />
      <button type="submit" className="add-button" disabled={!title.trim() || isSubmitting}>
        <span aria-hidden="true">+</span>
        {isSubmitting ? 'Adding…' : 'Add task'}
      </button>
      <p id="todo-input-hint" className="form-hint">Enter a task title to enable Add.</p>
      {error && <p id="todo-form-error" className="form-error" role="alert">{error}</p>}
    </form>
  );
}
