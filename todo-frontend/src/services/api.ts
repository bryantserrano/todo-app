import type { Todo, TodoInput } from '../types/todo';
import axios from 'axios';
import { supabase, usesLocalApi } from './supabase';

type TaskRow = {
  id: number | string;
  title: string;
  description: string | null;
  completed: boolean;
};

const LOCAL_STORAGE_KEY = 'todo-app-tasks';
const localApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
});

type ApiTodo = {
  _id: string;
  title: string;
  description?: string | null;
  completed: boolean;
};

function readLocalTodos(): Todo[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((todo): todo is Todo =>
      typeof todo === 'object'
      && todo !== null
      && typeof todo._id === 'string'
      && typeof todo.title === 'string'
      && typeof todo.completed === 'boolean'
      && (todo.description === undefined || typeof todo.description === 'string'),
    );
  } catch {
    return [];
  }
}

function client() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function toTodo(row: TaskRow): Todo {
  return {
    _id: String(row.id),
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed,
  };
}

export async function getTodos(): Promise<Todo[]> {
  if (usesLocalApi) {
    const { data } = await localApi.get<ApiTodo[]>('/tasks');
    return data.map(todo => ({ ...todo, description: todo.description ?? undefined }));
  }

  const { data, error } = await client()
    .from('tasks')
    .select('id, title, description, completed')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as TaskRow[]).map(toTodo);
}

export async function addTodo(todo: TodoInput): Promise<{ id: string }> {
  if (usesLocalApi) {
    const { data } = await localApi.post<{ id: string }>('/tasks', todo);
    return data;
  }

  const db = client();
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You must be signed in to add a task.');

  const { data, error } = await db
    .from('tasks')
    .insert({
      user_id: user.id,
      title: todo.title,
      description: todo.description ?? null,
      completed: todo.completed,
    })
    .select('id')
    .single();

  if (error) throw error;
  return { id: String(data.id) };
}

export async function updateTodo(id: string, todo: TodoInput): Promise<void> {
  if (usesLocalApi) {
    await localApi.put(`/tasks/${encodeURIComponent(id)}`, todo);
    return;
  }

  const { data, error } = await client()
    .from('tasks')
    .update({
      title: todo.title,
      description: todo.description ?? null,
      completed: todo.completed,
    })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Task not found or access denied.');
}

export async function deleteTodo(id: string): Promise<void> {
  if (usesLocalApi) {
    await localApi.delete(`/tasks/${encodeURIComponent(id)}`);
    return;
  }

  const { data, error } = await client()
    .from('tasks')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Task not found or access denied.');
}

export function getLocalTodos(): Todo[] {
  if (usesLocalApi) return [];
  return readLocalTodos();
}

export async function importLocalTodos(): Promise<number> {
  if (usesLocalApi) return 0;
  const todos = readLocalTodos();
  if (todos.length === 0) return 0;

  const db = client();
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You must be signed in to import tasks.');

  const { error } = await db.from('tasks').insert(todos.map(todo => ({
    user_id: user.id,
    title: todo.title,
    description: todo.description ?? null,
    completed: todo.completed,
  })));

  if (error) throw error;
  window.localStorage.removeItem(LOCAL_STORAGE_KEY);
  return todos.length;
}
