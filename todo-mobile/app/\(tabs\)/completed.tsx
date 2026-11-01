import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { getTodos, deleteTodo } from '@/api';
import type { Todo } from '@/types';

export default function CompletedScreen() {
  const insets = useSafeAreaInsets();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await getTodos();
      setTodos(data.filter(t => t.completed));
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Completed</Text>
      </Animated.View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : todos.length === 0 ? (
        <Animated.View
          entering={FadeIn}
          style={styles.centerContent}
        >
          <Text style={styles.emptyText}>No completed todos</Text>
        </Animated.View>
      ) : (
        <ScrollView style={styles.list}>
          {todos.map((todo) => (
            <Animated.View
              key={todo._id}
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout}
            >
              <View style={styles.todoItem}>
                <View style={styles.todoContent}>
                  <View style={styles.checkboxCompleted}>
                    <Text style={styles.checkboxText}>✓</Text>
                  </View>
                  <View style={styles.todoText}>
                    <Text style={[styles.todoTitle, styles.completedText]}>
                      {todo.title}
                    </Text>
                    {todo.description && (
                      <Text style={[styles.todoDescription, styles.completedDescription]}>
                        {todo.description}
                      </Text>
                    )}
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  onPress={() => handleDelete(todo._id)}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ccc',
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginVertical: 6,
  },
  todoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  todoText: {
    flex: 1,
    gap: 4,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  todoDescription: {
    fontSize: 13,
    color: '#aaa',
  },
  completedDescription: {
    color: '#666',
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  deleteText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '600',
  },
});
