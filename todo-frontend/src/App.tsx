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
      <div className="justify-center w-full mb-4">
        <h1 className="text-2xl font-bold text-center">Todo App</h1>
      </div>
      <TodoForm onAdd={loadTodos} />
      <TodoList todos={todos} refresh={loadTodos} />
    </div>
  );
}

export default App;