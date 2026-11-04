import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { getTodos, deleteTodo, updateTodo } from '@/api';
import type { Todo } from '@/types';
import { supabase } from '@/supabase';

export default function TodoListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);

  const loadTodos = useCallback(async (forceRefresh = false) => {
    const showRefresh = hasLoaded.current || forceRefresh;
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getTodos();
      setTodos(data.filter(t => !t.completed));
    } catch (error) {
      console.error('Failed to load todos:', error);
    } finally {
      hasLoaded.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void loadTodos();
  }, [loadTodos]));

  const handleToggle = async (todo: Todo) => {
    try {
      await updateTodo(todo._id, { ...todo, completed: true });
      setTodos(current => current.filter(t => t._id !== todo._id));
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(current => current.filter(t => t._id !== id));
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Todo</Text>
        <Pressable onPress={() => void supabase?.auth.signOut()} accessibilityRole="button">
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={() => router.push('/create-todo')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </Animated.View>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={todos.length === 0 ? styles.emptyListContent : undefined}
          refreshControl={(
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadTodos(true)}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
              progressBackgroundColor="#2a2a2a"
            />
          )}
        >
          {todos.length === 0 ? (
            <Animated.View entering={FadeIn} style={styles.centerContent}>
              <Text style={styles.emptyText}>No todos yet</Text>
              <Text style={styles.emptySubtext}>Tap + to create one</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </Animated.View>
          ) : todos.map((todo) => (
            <Animated.View
              key={todo._id}
              entering={FadeIn}
              exiting={FadeOut}
              layout={Layout}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.todoItem,
                  pressed && styles.todoItemPressed,
                ]}
                onPress={() => handleToggle(todo)}
              >
                <View style={styles.todoContent}>
                  <View style={styles.checkbox}>
                    <Text style={styles.checkboxText}>✓</Text>
                  </View>
                  <View style={styles.todoText}>
                    <Text style={styles.todoTitle}>{todo.title}</Text>
                    {todo.description && (
                      <Text style={styles.todoDescription}>
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
              </Pressable>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  signOut: {
    color: '#9bbba5',
    fontSize: 13,
    fontWeight: '600',
    padding: 10,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonPressed: {
    backgroundColor: '#2563eb',
    opacity: 0.8,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyListContent: {
    flexGrow: 1,
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
  todoItemPressed: {
    backgroundColor: '#333',
    opacity: 0.7,
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
    backgroundColor: 'transparent',
  },
  checkboxText: {
    color: '#3b82f6',
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
  todoDescription: {
    fontSize: 13,
    color: '#aaa',
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
