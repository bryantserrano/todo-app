import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import AuthScreen from '@/AuthScreen';
import { isSupabaseConfigured, supabase } from '@/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      void SplashScreen.hideAsync();
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
      void SplashScreen.hideAsync();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      void SplashScreen.hideAsync();
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#1a1a1a' }}><ActivityIndicator color="#3b82f6" /></View>;
  if (!isSupabaseConfigured || !session) return <><AuthScreen /><StatusBar barStyle="light-content" /></>;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-todo"
          options={{
            presentation: 'modal',
            animationEnabled: true,
            gestureEnabled: true,
          }}
        />
      </Stack>
      <StatusBar barStyle="light-content" />
    </GestureHandlerRootView>
  );
}
