import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export default function AuthPanel() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || isSubmitting) return;
    setIsSubmitting(true);
    setMessage('');

    const result = isSignUp
      ? await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    setIsSubmitting(false);
    if (result.error) {
      setMessage(result.error.message);
    } else if (isSignUp && !result.data.session) {
      setMessage('Check your email to confirm your account, then sign in.');
    }
  };

  return (
    <main className="auth-backdrop">
      <section className="auth-panel" aria-labelledby="auth-heading">
        <p className="panel-eyebrow">YOUR TASKS, WHEREVER YOU ARE</p>
        <h1 id="auth-heading">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-copy">Sign in to access your Todo account.</p>
        {!isSupabaseConfigured ? (
          <p className="form-error" role="alert">
            Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to todo-frontend/.env.local, then restart Vite.
          </p>
        ) : (
          <form className="auth-form" onSubmit={submit}>
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
            <label htmlFor="auth-password">Password</label>
            <input id="auth-password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={event => setPassword(event.target.value)} />
            {message && <p className="auth-message" role="status">{message}</p>}
            <button className="add-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
            <button className="auth-switch" type="button" onClick={() => { setIsSignUp(value => !value); setMessage(''); }}>
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
