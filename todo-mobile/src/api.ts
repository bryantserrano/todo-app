import { supabase } from './supabase';
import type { Todo } from './types';

type TaskRow = {
  id: string | number;
  title: string;
  description: string | null;
  completed: boolean;
};

function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check the mobile app environment variables.');
  }
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
  const { data, error } = await getSupabase()
    .from('tasks')
    .select('id, title, description, completed')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as TaskRow[]).map(toTodo);
}

export async function createTodo(todo: Omit<Todo, '_id'>): Promise<Todo> {
  const db = getSupabase();
  const { data: { user }, error: userError } = await db.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('You must be signed in to create a todo.');

  const { data, error } = await db
    .from('tasks')
    .insert({
      user_id: user.id,
      title: todo.title,
      description: todo.description ?? null,
      completed: todo.completed,
    })
    .select('id, title, description, completed')
    .single();

  if (error) throw error;
  return toTodo(data as TaskRow);
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  const taskUpdates: {
    title?: string;
    description?: string | null;
    completed?: boolean;
  } = {};

  if (updates.title !== undefined) taskUpdates.title = updates.title;
  if (updates.description !== undefined) taskUpdates.description = updates.description ?? null;
  if (updates.completed !== undefined) taskUpdates.completed = updates.completed;

  const { data, error } = await getSupabase()
    .from('tasks')
    .update(taskUpdates)
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Todo not found or access denied.');
}

export async function deleteTodo(id: string): Promise<void> {
  const { data, error } = await getSupabase()
    .from('tasks')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Todo not found or access denied.');
}
