import { useState } from 'react';
import { addTodo } from '../services/api';

interface Props {
  onAdd: () => void;
}

export default function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTodo({ title, completed: false });
    setTitle('');
    onAdd();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="flex-grow border rounded px-3 py-2"
        placeholder="What needs to be done?"
      />
      <button 
        type="submit" 
        className="bg-blue-600 text-white px-4 rounded"
        disabled={!title.trim()}
        title={!title.trim() ? "Please enter a todo before adding." : ""}
      >
        Add
      </button>
    </form>
  );
}