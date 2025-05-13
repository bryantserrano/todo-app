import { useEffect, useState } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { getTodos } from './services/api';
import type { Todo } from './types/todo';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const loadTodos = async () => {
    const data = await getTodos();
    setTodos(data);
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-600">Todo App</h1>
      <TodoForm onAdd={loadTodos} />
      <TodoList todos={todos} refresh={loadTodos} />
    </div>
  );
}

export default App;