import { useEffect, useRef, useState } from 'react';
import { Check, CircleCheck, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountModal from '../components/AccountModal';
import { API } from '../data/catalog';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const verificationRequests = new Map();

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}

function PasswordField({ label, value, onChange, autoComplete, show, onToggle, required = true }) {
  return (
    <label className="account-field">
      {label}
      <span className="password-input-row">
        <button className="password-visibility" type="button" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} title={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <input type={show ? 'text' : 'password'} required={required} minLength={autoComplete === 'current-password' ? undefined : 8} autoComplete={autoComplete} value={value} onChange={onChange} />
      </span>
    </label>
  );
}

export default function Account() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const googleButton = useRef(null);
  const [mode, setMode] = useState(searchParams.has('reset') ? 'reset' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [modal, setModal] = useState(() => {
    if (searchParams.has('verified')) return {
      eyebrow: 'EMAIL CONFIRMED',
      title: 'You’re all set',
      description: 'Your email is verified. You can now sign in to your account.',
      icon: CircleCheck,
    };
    if (searchParams.has('passwordReset')) return {
      eyebrow: 'PASSWORD UPDATED',
      title: 'You’re all set',
      description: 'Password updated. You can now sign in.',
      icon: CircleCheck,
    };
    return null;
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resetToken = searchParams.get('reset') || '';
  const verificationToken = searchParams.get('verify') || '';

  useEffect(() => {
    if (!verificationToken) return undefined;
    let active = true;
    let request = verificationRequests.get(verificationToken);
    if (!request) {
      request = fetch(`${API}/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`).then(readResponse);
      verificationRequests.set(verificationToken, request);
    }
    request
      .then((data) => {
        if (!active) return;
        setModal({
          eyebrow: 'EMAIL CONFIRMED',
          title: 'You’re all set',
          description: 'Your email is verified. You can now sign in to your account.',
          icon: CircleCheck,
        });
        navigate('/account?verified=1', { replace: true });
      })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [verificationToken, navigate]);

  useEffect(() => {
    if (!googleClientId || !googleButton.current || !['login', 'register'].includes(mode)) return undefined;
    let active = true;
    const renderButton = () => {
      if (!active || !window.google?.accounts?.id || !googleButton.current) return;
      googleButton.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setIsSubmitting(true);
          setMessage('');
          try {
            const response = await fetch(`${API}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential }),
            });
            const data = await readResponse(response);
            localStorage.setItem('des-token', data.token);
            localStorage.setItem('des-role', data.role);
            window.dispatchEvent(new Event('des-auth-changed'));
            navigate(data.role === 'admin' ? '/admin' : '/', { replace: true });
          } catch (error) {
            setMessage(error.message);
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButton.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        width: Math.max(240, Math.floor(googleButton.current.clientWidth)),
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      let script = document.querySelector('script[data-google-identity]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderButton);
      return () => {
        active = false;
        script.removeEventListener('load', renderButton);
      };
    }

    return () => { active = false; };
  }, [mode, navigate]);

  const updateForm = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (['register', 'reset'].includes(mode) && form.password !== form.confirmPassword) {
      setMessage('Your passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      let endpoint;
      let payload;
      if (mode === 'forgot') {
        endpoint = 'forgot-password';
        payload = { email: form.email };
      } else if (mode === 'reset') {
        endpoint = 'reset-password';
        payload = { token: resetToken, password: form.password };
      } else {
        endpoint = mode === 'login' ? 'login' : 'register';
        payload = mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };
      }

      const response = await fetch(`${API}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await readResponse(response);

      if (mode === 'login') {
        localStorage.setItem('des-token', data.token);
        localStorage.setItem('des-role', data.role);
        window.dispatchEvent(new Event('des-auth-changed'));
        navigate(data.role === 'admin' ? '/admin' : '/', { replace: true });
        return;
      }
      if (mode === 'register') {
        setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
        setMode('login');
        setMessage('');
        setModal({
          eyebrow: 'ONE LAST STEP',
          title: 'Check your inbox',
          description: <>We sent a verification link to <strong>{form.email}</strong>. Open the email and click the link to confirm your account.</>,
          hint: <><Check size={16} /> If it’s not there, check your spam or junk folder.</>,
        });
        return;
      } else if (mode === 'reset') {
        setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
        setMode('login');
        navigate('/account?passwordReset=1', { replace: true });
        setModal({
          eyebrow: 'PASSWORD UPDATED',
          title: 'You’re all set',
          description: data.message,
          icon: CircleCheck,
        });
        return;
      } else if (mode === 'forgot') {
        setModal({
          eyebrow: 'PASSWORD RESET',
          title: 'Check your inbox',
          description: data.message,
          hint: <>If an account exists for <strong>{form.email}</strong>, you’ll receive a reset link. Check your spam or junk folder too.</>,
        });
        return;
      }
      setMessage(data.message);
    } catch (error) {
      if (mode === 'login' && /confirm your email/i.test(error.message)) {
        setModal({
          eyebrow: 'ONE LAST STEP',
          title: 'Check your inbox',
          description: <>Your account still needs email verification. Open the confirmation link sent to <strong>{form.email}</strong>, then sign in again.</>,
          hint: <><Check size={16} /> If it’s not there, check your spam or junk folder.</>,
        });
      } else {
        setMessage(error.message || 'Account service unavailable. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Welcome back';

  return (
    <main className="page account-page">
      <p className="kicker">DES-COLLECTION ACCOUNT</p>
      <h1>{title}</h1>

      {['login', 'register'].includes(mode) && (
        <div className="account-switch" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>SIGN IN</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setMessage(''); }}>SIGN UP</button>
        </div>
      )}

      <form className="account-form" onSubmit={submit}>
        {mode === 'register' && <label className="account-field">Name<input type="text" autoComplete="name" required value={form.name} onChange={updateForm('name')} /></label>}
        {mode !== 'reset' && <label className="account-field">Email<input type="email" autoComplete="email" required value={form.email} onChange={updateForm('email')} /></label>}
        {['login', 'register', 'reset'].includes(mode) && (
          <PasswordField
            label="Password"
            value={form.password}
            onChange={updateForm('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            show={showPassword}
            onToggle={() => setShowPassword((shown) => !shown)}
          />
        )}
        {mode === 'register' && (
          <PasswordField
            label="Confirm password"
            value={form.confirmPassword}
            onChange={updateForm('confirmPassword')}
            autoComplete="new-password"
            show={showConfirmation}
            onToggle={() => setShowConfirmation((shown) => !shown)}
          />
        )}
        {mode === 'reset' && (
          <PasswordField
            label="Confirm new password"
            value={form.confirmPassword}
            onChange={updateForm('confirmPassword')}
            autoComplete="new-password"
            show={showConfirmation}
            onToggle={() => setShowConfirmation((shown) => !shown)}
          />
        )}
        <button className="shop-now account-submit" disabled={isSubmitting || (mode === 'reset' && !resetToken)}>
          {isSubmitting ? <><LoaderCircle className="button-spinner" size={17} /> PLEASE WAIT…</> : mode === 'login' ? 'SIGN IN' : mode === 'register' ? 'CREATE ACCOUNT' : mode === 'forgot' ? 'SEND RESET LINK' : 'UPDATE PASSWORD'}
        </button>
      </form>

      {mode === 'login' && <button className="account-text-action" type="button" onClick={() => { setMode('forgot'); setMessage(''); }}>Forgot password?</button>}
      {mode === 'forgot' && <button className="account-text-action" type="button" onClick={() => { setMode('login'); setMessage(''); }}>Back to sign in</button>}
      {mode === 'reset' && !resetToken && <p className="account-feedback is-error">This password reset link is missing or invalid. Request a new one.</p>}
      {message && <p className={`account-feedback${/invalid|expired|could not|failed|match/i.test(message) ? ' is-error' : ''}`} role="status">{message}</p>}

      <AccountModal {...(modal || {})} open={Boolean(modal)} onClose={() => setModal(null)} />

      {mode === 'forgot' && <p className="account-hint">Enter your account email. If an account exists, we’ll send a password reset link.</p>}
      {['login', 'register'].includes(mode) && <div className="google-account-option"><span>or continue with</span>{googleClientId ? <div className="google-button-wrap"><div ref={googleButton} />{isSubmitting && <div className="google-button-loading"><LoaderCircle className="button-spinner" size={17} /> CONNECTING...</div>}</div> : <p className="account-hint">Google sign-in is not configured for this deployment. Add VITE_GOOGLE_CLIENT_ID to the client environment and redeploy.</p>}</div>}
      <small className="account-note">Admin access is assigned only to email addresses on the server’s ADMIN_EMAILS allowlist.</small>
    </main>
  );
}
