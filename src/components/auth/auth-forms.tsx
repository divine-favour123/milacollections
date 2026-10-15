'use client';

import { Eye, EyeOff, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/form';
import { createClient } from '@/lib/supabase/client';

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'That email and password do not match. Try again or reset your password.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first. Check your inbox for our message.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password') && m.includes('characters')) return 'Your password needs at least 8 characters.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (m.includes('same password') || m.includes('different from the old')) return 'Choose a password you have not used before.';
  if (m.includes('fetch') || m.includes('network')) return 'Check your internet connection and try again.';
  return message;
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
      {message}
    </p>
  );
}

export function PasswordInput({ id, value, onChange, autoComplete, placeholder }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        minLength={8}
        className="pr-12"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-sm text-slate hover:bg-frost hover:text-ink"
      >
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.9a5.04 5.04 0 0 1-2.19 3.31v2.75h3.55c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.75c-.98.66-2.24 1.06-3.73 1.06-2.87 0-5.3-1.94-6.17-4.55H2.16v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.83 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.16a11 11 0 0 0 0 9.88l3.67-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.16 7.06l3.67 2.84C6.7 7.32 9.13 5.38 12 5.38Z" />
    </svg>
  );
}

export function GoogleButton({ next, label = 'Continue with Google' }: { next: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        const { error } = await createClient().auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) {
          setBusy(false);
          toast.error('Google sign-in is not available right now. Use your email instead.');
        }
      }}
    >
      {!busy ? <GoogleMark /> : null}
      {label}
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-4 text-sm text-slate">
      <span className="h-px flex-1 bg-line" /> or use your email <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !data.user) {
      setLoading(false);
      setError(friendly(err?.message ?? 'Could not sign you in.'));
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <div>
      <GoogleButton next={next} />
      <OrDivider />
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" htmlFor="password">
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </Field>
        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-gold-deep hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </div>
  );
}

/** Separate from the customer login above: no Google button, no sign-up link, and it checks for the admin role before letting anyone in. */
export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err || !data.user) {
      setLoading(false);
      setError(friendly(err?.message ?? 'Could not sign you in.'));
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setLoading(false);
      setError('This account does not have admin access.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError message={error} />
      <Field label="Email" htmlFor="admin-email">
        <Input id="admin-email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="admin-password">
        <PasswordInput id="admin-password" value={password} onChange={setPassword} autoComplete="current-password" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Sign in
      </Button>
    </form>
  );
}

export function SignupForm({ next }: { next: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Your password needs at least 8 characters.');
    setLoading(true);
    const { data, error: err } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setLoading(false);
    if (err) return setError(friendly(err.message));
    if (data.session) {
      router.replace(next);
      router.refresh();
    } else {
      setSentTo(email.trim());
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-3xl bg-frost p-8 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gold-soft text-gold-deep">
          <MailCheck className="size-7" aria-hidden />
        </span>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="mt-2 text-slate">
          We sent a confirmation link to <span className="font-semibold text-ink">{sentTo}</span>. Open it to finish creating your account.
        </p>
        <p className="mt-4 text-sm text-slate">Can&rsquo;t see it? Look in your spam folder.</p>
      </div>
    );
  }

  return (
    <div>
      <GoogleButton next={next} label="Sign up with Google" />
      <OrDivider />
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Full name" htmlFor="name">
          <Input id="name" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 8 characters.">
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Create account
        </Button>
        <p className="text-center text-[0.8125rem] text-slate">
          By creating an account you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (err) return setError(friendly(err.message));
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-3xl bg-frost p-8 text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-gold-soft text-gold-deep">
          <MailCheck className="size-7" aria-hidden />
        </span>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="mt-2 text-slate">
          If there is an account for <span className="font-semibold text-ink">{email}</span>, we&rsquo;ve sent a link to choose a new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError message={error} />
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Send reset link
      </Button>
    </form>
  );
}

export function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Your password needs at least 8 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    setLoading(true);
    const { error: err } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (err) return setError(friendly(err.message));
    toast.success('Password updated');
    router.replace('/account');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormError message={error} />
      <Field label="New password" htmlFor="password" hint="At least 8 characters.">
        <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm">
        <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={loading}>
        Update password
      </Button>
    </form>
  );
}
