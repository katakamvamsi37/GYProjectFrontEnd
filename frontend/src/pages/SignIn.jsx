import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, BookOpen, Users, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../api/client';
import { ErrorNotice, Loading } from '../components/Feedback';
import Logo, { festivalImage } from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function SignIn() {
  const { user, loading, sessionError, retry, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  if (loading) return <Loading label="Opening your workspace…" />;
  if (sessionError) return <ErrorNotice message={sessionError} onRetry={retry} />;
  if (user) return <Navigate to="/home" replace />;
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      const from = location.state?.from;
      navigate(
        typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/home',
        { replace: true },
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Logo variant="header" />
        {festivalImage && (
          <img className="festival-support" src={festivalImage} alt="" aria-hidden="true" />
        )}
        <div className="auth-story-content">
          <div className="auth-artwork">
            <Logo variant="login" label={false} />
          </div>
          <span className="eyebrow">ROOTED IN DEVOTION. UNITED BY COMMUNITY.</span>
          <h1>
            A celebration of faith.
            <br />
            <em>
              A community
              <br className="hidden lg:block" /> of possibilities.
            </em>
          </h1>
          <p>
            From the first contribution to the final celebration. A shared home for everything we
            build together.
          </p>
          <div className="auth-benefits">
            <span>
              <BookOpen size={17} />
              Every contribution, accounted for
            </span>
            <span>
              <Users size={17} />
              Your committee, connected
            </span>
            <span>
              <ShieldCheck size={17} />
              Shared responsibility. Complete clarity.
            </span>
          </div>
        </div>
        <p className="auth-footer">
          గణపతి బప్పా మోరియా<span>GANESH YOUTH · 2026</span>
        </p>
      </section>
      <section className="auth-form-panel">
        <div className="auth-theme">
          <ThemeSwitcher />
        </div>
        <form className="auth-form" onSubmit={submit} aria-busy={busy}>
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p>Good to have you here. Let’s make this year’s celebration something special.</p>
          <label>
            Email, mobile number or username
            <input
              autoComplete="username"
              required
              autoCapitalize="none"
              spellCheck={false}
              disabled={busy}
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              placeholder="you@example.com or mobile number"
            />
          </label>
          <label htmlFor="signin-password">Password</label>
          <div className="password-field -mt-3">
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={busy}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="icon-button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {error && <ErrorNotice message={error} />}
          <button className="button primary large" disabled={busy}>
            {busy ? <span className="spinner" /> : null}
            {busy ? 'Signing in…' : 'Sign in'}
            {!busy && <ArrowRight size={17} />}
          </button>
          <div className="access-note">
            <LockKeyhole size={18} />
            <p>
              <strong>Need access or a password reset?</strong>
              <br />
              Contact your Ganesh Youth administrator.
            </p>
          </div>
          <div className="auth-form-footer">A little devotion. A lot of togetherness.</div>
        </form>
      </section>
    </main>
  );
}
