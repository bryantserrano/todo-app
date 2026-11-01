import axios from 'axios';
import type { Todo, TodoInput } from '../types/todo';

const API_BASE = 'http://localhost:8000/tasks'; // adjust if needed

export const getTodos = async (): Promise<Todo[]> => {
    const res = await axios.get<Todo[]>(API_BASE);
    return res.data;
};

export const addTodo = async (todo: TodoInput): Promise<{ id: string }> => {
    const res = await axios.post<{ id: string }>(API_BASE, todo);
    return res.data;
};

export const updateTodo = async (id: string, todo: TodoInput): Promise<void> => {
  await axios.put(`${API_BASE}/${id}`, todo);
};

export const deleteTodo = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};
