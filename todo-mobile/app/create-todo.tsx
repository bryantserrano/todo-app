import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { createTodo } from '@/api';
import * as Haptics from 'expo-haptics';

export default function CreateTodoModal() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a todo title');
      return;
    }

    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      await createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        completed: false,
      });

      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      );
      
      router.back();
    } catch (error) {
      console.error('Failed to create todo:', error);
      Alert.alert('Error', 'Failed to create todo. Please try again.');
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>New Todo</Text>
        <Pressable
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.content}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.delay(100)} style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What needs to be done?"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            editable={!loading}
            autoFocus
            maxLength={100}
          />
          <Text style={styles.inputHint}>{title.length}/100</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(150)} style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.descriptionInput, styles.textInput]}
            placeholder="Add more details..."
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.inputHint}>{description.length}/500</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200)} style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.createButtonPressed,
              loading && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Todo'}
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  saveButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    fontSize: 16,
    padding: 12,
  },
  titleInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    padding: 12,
    paddingVertical: 14,
  },
  descriptionInput: {
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    textAlign: 'right',
  },
  footer: {
    marginVertical: 24,
    marginBottom: 40,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonPressed: {
    backgroundColor: '#2563eb',
    opacity: 0.8,
  },
  createButtonDisabled: {
    backgroundColor: '#1e40af',
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
