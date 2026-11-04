import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { isSupabaseConfigured, supabase } from './supabase';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!supabase || loading) return;
    setLoading(true);
    setMessage('');
    const result = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (result.error) setMessage(result.error.message);
    else if (isSignUp && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>YOUR TASKS, WHEREVER YOU ARE</Text>
        <Text style={styles.title}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>
        <Text style={styles.subtitle}>Sign in to access your Todo account.</Text>
        {!isSupabaseConfigured ? (
          <Text style={styles.message}>Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to todo-mobile/.env.local, then restart Expo.</Text>
        ) : (
          <>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete={isSignUp ? 'new-password' : 'password'} />
            {message ? <Text accessibilityRole="alert" style={styles.message}>{message}</Text> : null}
            <Pressable style={[styles.button, loading && styles.disabled]} onPress={() => void submit()} disabled={loading || !email.trim() || password.length < 6}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isSignUp ? 'Create account' : 'Sign in'}</Text>}
            </Pressable>
            <Pressable onPress={() => { setIsSignUp(value => !value); setMessage(''); }}>
              <Text style={styles.switch}>{isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}</Text>
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#171d1b' },
  card: { padding: 24, borderRadius: 20, backgroundColor: '#222a25' },
  eyebrow: { color: '#9bbba5', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#e8eee9', fontSize: 28, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#a0ada5', marginTop: 8, marginBottom: 20 },
  label: { color: '#a0ada5', fontSize: 13, fontWeight: '600', marginBottom: 7, marginTop: 12 },
  input: { minHeight: 48, borderWidth: 1, borderColor: '#38443c', borderRadius: 10, paddingHorizontal: 12, color: '#e8eee9', backgroundColor: '#202824' },
  message: { color: '#f09b92', fontSize: 13, lineHeight: 19, marginTop: 12 },
  button: { minHeight: 48, borderRadius: 11, marginTop: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6' },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700' },
  switch: { color: '#9bbba5', textAlign: 'center', marginTop: 18, fontWeight: '600' },
});
