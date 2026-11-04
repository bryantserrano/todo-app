import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from './supabase';

type Props = {
  mode: 'enroll' | 'challenge' | 'error';
  factorId?: string;
  error?: string;
  onVerified: () => void;
  onRetry: () => void;
};

export default function MfaScreen({ mode, factorId: existingFactorId, error: initialError, onVerified, onRetry }: Props) {
  const [factorId, setFactorId] = useState(existingFactorId ?? '');
  const [setupUri, setSetupUri] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFactorId(existingFactorId ?? '');
    setError(initialError ?? '');
  }, [existingFactorId, initialError]);

  useEffect(() => {
    const client = supabase;
    if (mode !== 'enroll' || !client) return;
    let isCurrent = true;

    const startEnrollment = async () => {
      setLoadingSetup(true);
      setError('');
      try {
        const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
        if (factorsError) throw factorsError;

        // Clear only abandoned, unverified setup attempts before creating a fresh one.
        for (const factor of factors.all.filter(item => item.factor_type === 'totp' && item.status === 'unverified')) {
          const { error: unenrollError } = await client.auth.mfa.unenroll({ factorId: factor.id });
          if (unenrollError) throw unenrollError;
        }

        const { data, error: enrollError } = await client.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'Todo mobile authenticator',
        });
        if (enrollError) throw enrollError;
        if (!isCurrent) return;
        setFactorId(data.id);
        setSetupUri(data.totp.uri);
        setManualSecret(data.totp.secret);
      } catch (setupError) {
        if (isCurrent) setError(setupError instanceof Error ? setupError.message : 'Could not start authenticator setup.');
      } finally {
        if (isCurrent) setLoadingSetup(false);
      }
    };

    void startEnrollment();
    return () => { isCurrent = false; };
  }, [mode]);

  const verifyCode = async () => {
    if (!supabase || !factorId || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ''),
      });
      if (verifyError) throw verifyError;
      onVerified();
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'That code could not be verified. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEnrollment = mode === 'enroll';
  const canVerify = code.replace(/\s/g, '').length === 6 && Boolean(factorId);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>ACCOUNT SECURITY</Text>
          <Text style={styles.title}>
            {mode === 'error' ? 'Could not check MFA' : isEnrollment ? 'Set up an authenticator' : 'Verify it’s you'}
          </Text>

          {mode === 'error' ? (
            <Text style={styles.description}>{initialError || 'We could not check your MFA status.'}</Text>
          ) : isEnrollment ? (
            <>
              <Text style={styles.description}>
                Scan this code with an authenticator app, or enter the setup key below. You’ll need a six-digit code from the app to finish.
              </Text>
              {loadingSetup ? (
                <ActivityIndicator color="#3b82f6" style={styles.loader} />
              ) : setupUri ? (
                <>
                  <View style={styles.qrFrame}>
                    <QRCode value={setupUri} size={210} />
                  </View>
                  <Text style={styles.label}>Setup key</Text>
                  <Text selectable style={styles.secret}>{manualSecret}</Text>
                </>
              ) : null}
            </>
          ) : (
            <Text style={styles.description}>Open your authenticator app and enter its current six-digit code.</Text>
          )}

          {mode !== 'error' && (mode === 'challenge' || Boolean(setupUri)) && (
            <>
              <Text style={styles.label}>Authenticator code</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={value => setCode(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                accessibilityLabel="Six-digit authenticator code"
                maxLength={6}
              />
              <Pressable
                style={[styles.button, (!canVerify || submitting) && styles.buttonDisabled]}
                onPress={() => void verifyCode()}
                disabled={!canVerify || submitting}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.buttonText}>{isEnrollment ? 'Enable MFA' : 'Verify and continue'}</Text>
                )}
              </Pressable>
            </>
          )}

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {mode === 'error' ? (
            <Pressable style={styles.button} onPress={onRetry}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => void supabase?.auth.signOut()}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#171d1b' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { padding: 24, borderRadius: 20, backgroundColor: '#222a25' },
  eyebrow: { color: '#9bbba5', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { color: '#e8eee9', fontSize: 26, fontWeight: '700', marginTop: 12 },
  description: { color: '#a0ada5', marginTop: 10, lineHeight: 21 },
  loader: { marginVertical: 28 },
  qrFrame: { alignSelf: 'center', marginVertical: 20, padding: 12, borderRadius: 12, backgroundColor: '#fff' },
  label: { color: '#a0ada5', fontSize: 13, fontWeight: '600', marginTop: 16, marginBottom: 7 },
  secret: { color: '#e8eee9', backgroundColor: '#202824', padding: 12, borderRadius: 10, overflow: 'hidden' },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#38443c', borderRadius: 10, paddingHorizontal: 14, color: '#e8eee9', backgroundColor: '#202824', fontSize: 22, letterSpacing: 7 },
  button: { minHeight: 48, borderRadius: 11, marginTop: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#3b82f6' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700' },
  error: { color: '#f09b92', fontSize: 13, lineHeight: 19, marginTop: 12 },
  signOut: { color: '#9bbba5', textAlign: 'center', marginTop: 20, fontWeight: '600' },
});
