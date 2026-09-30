import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ onClose }) {
  const [mode, setMode]       = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    if (mode === 'signup') {
      const { data, error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (err) {
        setError(err.message);
      } else if (data?.user && !data?.session) {
        setSuccess('Account created! Please check your email to confirm your account, then sign in.');
      } else {
        setSuccess('Account created and signed in successfully!');
        setTimeout(() => onClose?.(), 1000);
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        if (err.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. Please check your inbox/spam for the link, or confirm it in your Supabase Dashboard.');
        } else {
          setError(err.message);
        }
      } else {
        onClose?.();
      }
    }
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setLoading(true);
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess('Confirmation email resent! Check your inbox and spam folder.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-accent/20 bg-[#0c1220] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.8)]">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent text-xl mb-3">
            ✦
          </div>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-alabaster">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-1 font-mono text-[11px] text-alabaster-muted">
            {mode === 'signin' ? 'Access your appointments' : 'Book and manage appointments'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-alabaster placeholder-alabaster-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-alabaster placeholder-alabaster-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-alabaster placeholder-alabaster-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
            />
          </div>

          {error && (
            <div className="space-y-2">
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 font-mono text-[11px] text-red-400">
                {error}
              </p>
              {error.toLowerCase().includes('email not confirmed') && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="w-full text-center font-mono text-[10px] text-accent underline hover:text-accent/80 transition-colors"
                >
                  Resend confirmation email to {email}
                </button>
              )}
            </div>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 font-mono text-[11px] text-emerald-400">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(56,139,253,0.3)] transition-all hover:bg-accent/90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
            className="font-mono text-[11px] text-alabaster-muted hover:text-accent transition-colors"
          >
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-alabaster-muted hover:text-alabaster hover:border-white/20 transition-all text-lg"
        >
          ×
        </button>
      </div>
    </div>
  );
}
