import type { Todo, TodoInput } from '../types/todo';

const STORAGE_KEY = 'todo-app-tasks';

function readTodos(): Todo[] {
  const storedTodos = window.localStorage.getItem(STORAGE_KEY);
  if (!storedTodos) return [];

  const parsed: unknown = JSON.parse(storedTodos);
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((todo): todo is Todo =>
    typeof todo === 'object'
    && todo !== null
    && typeof todo._id === 'string'
    && typeof todo.title === 'string'
    && typeof todo.completed === 'boolean'
    && (todo.description === undefined || typeof todo.description === 'string'),
  );
}

function writeTodos(todos: Todo[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export async function getTodos(): Promise<Todo[]> {
  return readTodos();
}

export async function addTodo(todo: TodoInput): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  writeTodos([{ ...todo, _id: id }, ...readTodos()]);
  return { id };
}

export async function updateTodo(id: string, todo: TodoInput): Promise<void> {
  writeTodos(readTodos().map(current => current._id === id ? { ...todo, _id: id } : current));
}

export async function deleteTodo(id: string): Promise<void> {
  writeTodos(readTodos().filter(todo => todo._id !== id));
}
