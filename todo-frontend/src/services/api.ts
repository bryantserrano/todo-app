import axios from 'axios';
import type { Todo } from '../types/todo';

const API_BASE = 'http://localhost:8000/tasks'; // adjust if needed

export const getTodos = async (): Promise<Todo[]> => {
    const res = await axios.get<Todo[]>(API_BASE);
    return res.data;
};

export const addTodo = async (todo: Omit<Todo, '_id'>): Promise<Todo> => {
    const res = await axios.post<Todo>(API_BASE, todo);
    return res.data;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/${id}`);
};