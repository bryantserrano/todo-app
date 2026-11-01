import axios from 'axios';
import type { Todo } from './types';

const API_BASE = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    throw error;
  }
};

export const createTodo = async (todo: Omit<Todo, '_id'>): Promise<Todo> => {
  try {
    const response = await api.post('/tasks', todo);
    return { ...todo, _id: response.data.id };
  } catch (error) {
    console.error('Failed to create todo:', error);
    throw error;
  }
};

export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<void> => {
  try {
    await api.put(`/tasks/${id}`, updates);
  } catch (error) {
    console.error('Failed to update todo:', error);
    throw error;
  }
};

export const deleteTodo = async (id: string): Promise<void> => {
  try {
    await api.delete(`/tasks/${id}`);
  } catch (error) {
    console.error('Failed to delete todo:', error);
    throw error;
  }
};
