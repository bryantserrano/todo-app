export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export type TodoInput = Omit<Todo, '_id'>;
