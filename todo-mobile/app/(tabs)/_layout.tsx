import { NativeTabs } from 'expo-router/native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor="#1a1a1a"
      tintColor="#3b82f6"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Todos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.circle.fill" md="check_circle" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="completed">
        <NativeTabs.Trigger.Label>Completed</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="checkmark.circle" md="task_alt" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
