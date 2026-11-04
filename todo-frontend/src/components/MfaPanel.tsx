import { useState, type FormEvent } from 'react';
import { supabase } from '../services/supabase';

type Props = {
  mode: 'enroll' | 'challenge' | 'error';
  factorId?: string;
  error?: string;
  onVerified: () => void;
  onRetry: () => void;
};

export default function MfaPanel({ mode, factorId: existingFactorId, error: initialError, onVerified, onRetry }: Props) {
  const [factorId, setFactorId] = useState(existingFactorId ?? '');
  const [qrCode, setQrCode] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(initialError ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEnrollment = async () => {
    if (!supabase || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Todo authenticator',
      });
      if (enrollError) throw enrollError;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setManualSecret(data.totp.secret);
    } catch (enrollError) {
      setError(enrollError instanceof Error ? enrollError.message : 'Could not start authenticator setup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !factorId || isSubmitting) return;
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-backdrop">
      <section className="auth-panel mfa-panel" aria-labelledby="mfa-heading">
        <p className="panel-eyebrow">ACCOUNT SECURITY</p>
        <h1 id="mfa-heading">
          {mode === 'challenge' ? 'Verify it’s you' : mode === 'error' ? 'Could not check MFA' : 'Set up an authenticator'}
        </h1>
        {mode === 'challenge' ? (
          <p className="auth-copy">Open your authenticator app and enter the current six digit code.</p>
        ) : mode === 'error' ? (
          <p className="auth-copy">{initialError || 'We could not check your MFA status.'}</p>
        ) : (
          <>
            <p className="auth-copy">Use an authenticator app such as Google Authenticator, Microsoft Authenticator, or 1Password. MFA is required to continue.</p>
            {!qrCode ? (
              <button className="add-button mfa-primary" type="button" disabled={isSubmitting} onClick={() => void startEnrollment()}>
                {isSubmitting ? 'Preparing setup…' : 'Set up authenticator'}
              </button>
            ) : (
              <div className="mfa-setup">
                <img className="mfa-qr" src={qrCode} alt="Authenticator setup QR code" />
                <p className="auth-copy">Scan this QR code, or enter this setup key manually:</p>
                <code className="mfa-secret">{manualSecret}</code>
                <p className="auth-copy">Enter the code shown in your authenticator app to finish setup.</p>
              </div>
            )}
          </>
        )}

        {mode !== 'error' && (mode === 'challenge' || qrCode) && (
          <form className="auth-form" onSubmit={verifyCode}>
            <label htmlFor="mfa-code">Authenticator code</label>
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,8}"
              maxLength={8}
              required
              value={code}
              onChange={event => setCode(event.target.value)}
              aria-describedby={error ? 'mfa-error' : undefined}
            />
            {error && <p id="mfa-error" className="form-error" role="alert">{error}</p>}
            <button className="add-button mfa-primary" type="submit" disabled={isSubmitting || code.replace(/\s/g, '').length < 6}>
              {isSubmitting ? 'Verifying…' : mode === 'challenge' ? 'Verify and continue' : 'Enable MFA'}
            </button>
          </form>
        )}
        {mode === 'error' && (
          <button className="add-button mfa-primary" type="button" onClick={onRetry}>Try again</button>
        )}
        {mode !== 'error' && error && !qrCode && mode === 'enroll' && <p className="form-error" role="alert">{error}</p>}
        <button className="auth-switch" type="button" onClick={() => void supabase?.auth.signOut()}>Sign out</button>
      </section>
    </main>
  );
}
