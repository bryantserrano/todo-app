import { useCallback, useEffect, useState } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { deleteTodo, getTodos, updateTodo } from './services/api';
import type { Todo } from './types/todo';

type TodoFilter = 'all' | 'active' | 'completed';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingTodoIds, setPendingTodoIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getTodos();
      setTodos(data);
    } catch {
      setLoadError('We couldn’t load your tasks. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleTodo = async (todo: Todo) => {
    setActionError(null);
    setPendingTodoIds(current => [...current, todo._id]);

    try {
      await updateTodo(todo._id, {
        title: todo.title,
        description: todo.description,
        completed: !todo.completed,
      });
      await loadTodos();
    } catch {
      setActionError(`Couldn’t update “${todo.title}”. Please try again.`);
    } finally {
      setPendingTodoIds(current => current.filter(id => id !== todo._id));
    }
  };

  const removeTodo = async (todo: Todo) => {
    setActionError(null);
    setPendingTodoIds(current => [...current, todo._id]);

    try {
      await deleteTodo(todo._id);
      await loadTodos();
    } catch {
      setActionError(`Couldn’t delete “${todo.title}”. Please try again.`);
    } finally {
      setPendingTodoIds(current => current.filter(id => id !== todo._id));
    }
  };

  useEffect(() => {
    void loadTodos();
  }, [loadTodos]);

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  const emptyMessage = todos.length === 0
    ? 'Nothing on your list yet. Add a task above to get started.'
    : filter === 'active'
      ? 'You’re all caught up. Nothing active right now.'
      : filter === 'completed'
        ? 'No completed tasks yet. Keep going!'
        : 'Nothing to show here.';

  return (
    <div className="app-backdrop">
      <div className="ambient-glow" aria-hidden="true" />
      <main className="app-shell">
        <header className="page-heading">
          <p className="eyebrow"><span aria-hidden="true">✳</span> A LITTLE MORE FOCUS</p>
          <h1>One thing at a <span>time.</span></h1>
          <p className="page-intro">A calmer place to gather your tasks and make steady progress.</p>
        </header>

        <section className="task-panel" aria-labelledby="task-heading">
          <div className="panel-heading">
            <div>
              <p className="panel-eyebrow">YOUR LIST</p>
              <h2 id="task-heading">Today</h2>
            </div>
            <span className="task-status">
              <span className="status-dot" aria-hidden="true" />
              {activeCount === 0 ? 'All clear' : `${activeCount} open`}
            </span>
          </div>

          <TodoForm onAdd={loadTodos} />
          {actionError && <p className="action-error" role="alert">{actionError}</p>}

          {loadError && (
            <div role="alert" className="load-error">
              <p>{loadError}</p>
              <button type="button" className="retry-button" onClick={() => void loadTodos()}>
                Try again
              </button>
            </div>
          )}

          {isLoading && todos.length === 0 ? (
            <p className="loading-message" role="status">Gathering your tasks…</p>
          ) : !loadError || todos.length > 0 ? (
            <>
              <div className="task-toolbar">
                <div className="filter-tabs" role="group" aria-label="Filter tasks">
                  {([
                    ['all', 'All', todos.length],
                    ['active', 'Active', activeCount],
                    ['completed', 'Completed', completedCount],
                  ] as const).map(([value, label, count]) => (
                    <button
                      key={value}
                      type="button"
                      className={`filter-button${filter === value ? ' is-selected' : ''}`}
                      aria-pressed={filter === value}
                      onClick={() => setFilter(value)}
                    >
                      {label}<span className="filter-count">{count}</span>
                    </button>
                  ))}
                </div>
                <p className="task-summary" aria-live="polite">
                  {activeCount === 1 ? '1 task left' : `${activeCount} tasks left`}
                </p>
              </div>
              <TodoList
                todos={filteredTodos}
                onToggle={toggleTodo}
                onDelete={removeTodo}
                pendingTodoIds={pendingTodoIds}
                emptyMessage={emptyMessage}
              />
            </>
          ) : null}
        </section>

        <footer className="page-footer">
          <span>Small steps still move you forward.</span>
          <span aria-hidden="true">✦</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
