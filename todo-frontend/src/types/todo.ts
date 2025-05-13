export interface Todo {
    _id?: string;      // optional, since new todos won't have one yet
    title: string;
    completed: boolean;
  }