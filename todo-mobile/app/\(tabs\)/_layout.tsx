import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <NativeTabs
      options={[
        {
          name: 'index',
          title: 'Todos',
          icon: 'checkmark.circle.fill',
        },
        {
          name: 'completed',
          title: 'Completed',
          icon: 'checkmark.circle',
        },
      ]}
      tabBarOptions={{
        backgroundColor: '#1a1a1a',
        activeTintColor: '#3b82f6',
        inactiveTintColor: '#666',
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
