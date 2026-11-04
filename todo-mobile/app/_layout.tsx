import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import AuthScreen from '@/AuthScreen';
import MfaScreen from '@/MfaScreen';
import { isSupabaseConfigured, supabase } from '@/supabase';

type MfaStatus = 'checking' | 'enroll' | 'challenge' | 'ready' | 'error';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<MfaStatus>('checking');
  const [mfaFactorId, setMfaFactorId] = useState<string>();
  const [mfaError, setMfaError] = useState('');
  const [mfaRetry, setMfaRetry] = useState(0);

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

  useEffect(() => {
    if (!session || !supabase) {
      setMfaStatus('checking');
      setMfaFactorId(undefined);
      setMfaError('');
      return;
    }

    let isCurrent = true;
    setMfaStatus('checking');
    void Promise.all([
      supabase.auth.mfa.listFactors(),
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
    ]).then(([factorResult, assuranceResult]) => {
      if (!isCurrent) return;
      if (factorResult.error) throw factorResult.error;
      if (assuranceResult.error) throw assuranceResult.error;

      if (assuranceResult.data.currentLevel === 'aal2') {
        setMfaFactorId(undefined);
        setMfaStatus('ready');
        return;
      }

      const verifiedTotp = factorResult.data.totp.find(factor => factor.status === 'verified');
      if (verifiedTotp) {
        setMfaFactorId(verifiedTotp.id);
        setMfaStatus('challenge');
      } else {
        setMfaFactorId(undefined);
        setMfaStatus('enroll');
      }
    }).catch(error => {
      if (!isCurrent) return;
      setMfaError(error instanceof Error ? error.message : 'Could not check your MFA status.');
      setMfaStatus('error');
    });

    return () => { isCurrent = false; };
  }, [session, mfaRetry]);

  if (authLoading) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#1a1a1a' }}><ActivityIndicator color="#3b82f6" /></View>;
  if (!isSupabaseConfigured || !session) return <><AuthScreen /><StatusBar style="light" /></>;
  if (mfaStatus !== 'ready') {
    if (mfaStatus === 'checking') {
      return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#1a1a1a' }}><ActivityIndicator color="#3b82f6" /></View>;
    }
    return (
      <>
        <MfaScreen
          mode={mfaStatus}
          factorId={mfaFactorId}
          error={mfaError}
          onVerified={() => {
            setMfaError('');
            setMfaStatus('checking');
            setMfaRetry(value => value + 1);
          }}
          onRetry={() => {
            setMfaError('');
            setMfaRetry(value => value + 1);
          }}
        />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="create-todo"
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}
