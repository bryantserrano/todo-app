import { useCallback, useEffect, useState } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { deleteTodo, getLocalTodos, getTodos, importLocalTodos, updateTodo } from './services/api';
import type { Todo } from './types/todo';
import AuthPanel from './components/AuthPanel';
import { isSupabaseConfigured, supabase } from './services/supabase';
import type { Session } from '@supabase/supabase-js';

type TodoFilter = 'all' | 'active' | 'completed';
type Theme = 'light' | 'dark';
type ThemePreference = { theme: Theme; isExplicit: boolean };

const THEME_STORAGE_KEY = 'todo-app-theme';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialThemePreference(): ThemePreference {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return { theme: savedTheme, isExplicit: true };
    }
  } catch {
    // Storage may be unavailable; use the device preference for this session.
  }

  return { theme: getSystemTheme(), isExplicit: false };
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialThemePreference);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingTodoIds, setPendingTodoIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [localTodos, setLocalTodos] = useState<Todo[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const data = await getTodos();
      setTodos(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'We couldn’t load your tasks. Check your connection and try again.');
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
    } catch (error) {
      setActionError(error instanceof Error ? error.message : `Couldn’t update “${todo.title}”. Please try again.`);
    } finally {
      setPendingTodoIds(current => current.filter(id => id !== todo._id));
    }
  };

  const importBrowserTasks = async () => {
    setIsImporting(true);
    setActionError(null);
    try {
      await importLocalTodos();
      setLocalTodos([]);
      await loadTodos();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not import browser tasks. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const removeTodo = async (todo: Todo) => {
    setActionError(null);
    setPendingTodoIds(current => [...current, todo._id]);

    try {
      await deleteTodo(todo._id);
      await loadTodos();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : `Couldn’t delete “${todo.title}”. Please try again.`);
    } finally {
      setPendingTodoIds(current => current.filter(id => id !== todo._id));
    }
  };

  const toggleTheme = () => {
    const theme: Theme = themePreference.theme === 'dark' ? 'light' : 'dark';

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Keep the selected theme for this session if storage is unavailable.
    }

    setThemePreference({ theme, isExplicit: true });
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setLocalTodos(getLocalTodos());
    void loadTodos();
  }, [loadTodos, session]);

  useEffect(() => {
    document.documentElement.dataset.theme = themePreference.theme;
  }, [themePreference.theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = (event: MediaQueryListEvent) => {
      setThemePreference(current => current.isExplicit
        ? current
        : { theme: event.matches ? 'dark' : 'light', isExplicit: false });
    };

    mediaQuery.addEventListener('change', syncSystemTheme);
    return () => mediaQuery.removeEventListener('change', syncSystemTheme);
  }, []);

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
  const currentThemeLabel = themePreference.theme === 'dark' ? 'Dark mode' : 'Light mode';

  if (authLoading) return <main className="auth-backdrop"><p role="status">Loading your account…</p></main>;
  if (!isSupabaseConfigured || !session) return <AuthPanel />;

  return (
    <div className="app-backdrop">
      <div className="ambient-glow" aria-hidden="true" />
      <main className="app-shell">
        <header className="page-heading">
          <div className="heading-topline">
            <p className="eyebrow"><span aria-hidden="true">✳</span> A LITTLE MORE FOCUS</p>
            <button
              type="button"
              className="theme-toggle"
              aria-label={currentThemeLabel}
              aria-pressed={themePreference.theme === 'dark'}
              onClick={toggleTheme}
            >
              <span
                className={`theme-toggle-icon ${themePreference.theme === 'dark' ? 'is-moon' : 'is-sun'}`}
                aria-hidden="true"
              >
                {themePreference.theme === 'dark' ? '☾' : '☀'}
              </span>
              {currentThemeLabel}
            </button>
            <button className="auth-signout" type="button" onClick={() => void supabase?.auth.signOut()}>Sign out</button>
          </div>
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
          {localTodos.length > 0 && (
            <div className="local-import" role="status">
              <p>{localTodos.length} task{localTodos.length === 1 ? '' : 's'} are still saved only in this browser.</p>
              <button type="button" className="retry-button" disabled={isImporting} onClick={() => void importBrowserTasks()}>
                {isImporting ? 'Importing…' : 'Import to your account'}
              </button>
            </div>
          )}
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
