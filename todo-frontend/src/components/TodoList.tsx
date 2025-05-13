import type { Todo } from '../types/todo';
import { deleteTodo } from '../services/api';

interface Props {
  todos: Todo[];
  refresh: () => void;
}

export default function TodoList({ todos, refresh }: Props) {
  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li key={todo._id} className="flex items-center justify-between bg-white px-4 py-2 rounded shadow">
          {/* <div
            onClick={async () => {
              if (todo._id) {
                await toggleTodo(todo._id);
                refresh();
              }
            }}
            className={`cursor-pointer ${todo.completed ? 'line-through text-gray-400' : ''}`}
          >
            {todo.title}
          </div> */}
          <button
            onClick={async () => {
              if (todo._id) {
                await deleteTodo(todo._id);
                refresh();
              }
            }}
            className="text-red-600"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}