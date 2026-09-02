import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, AlertTriangle, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleProfileCompletion from '../components/GoogleProfileCompletion';
import {
  AuthDivider,
  AuthInput,
  AuthLoadingScreen,
  AuthPageShell,
  AuthSubmitButton,
  AuthTrustLine,
  GoogleButton,
  PasswordToggle,
} from '../components/AuthExperience';
import { initRecaptcha } from '../services/google';
import SEOHead from '../components/SEOHead';
import type { UserProfile } from '../context/AuthContext';

const GOOGLE_RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY || '';
type LoginField = 'email' | 'password';
type SubmitState = 'idle' | 'loading' | 'success';

const wait = (milliseconds: number) => new Promise(resolve => window.setTimeout(resolve, milliseconds));

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<LoginField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [authError, setAuthError] = useState('');
  const [capsLock, setCapsLock] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [googleUserProfile, setGoogleUserProfile] = useState<UserProfile | null>(null);
  const isGoogleSigningIn = useRef(false);
  const isEmailSigningIn = useRef(false);

  const { currentUser, loading: authLoading, login, loginWithGoogle, checkGoogleRedirect } = useAuth();
  const navigate = useNavigate();
  const isLoading = submitState === 'loading';

  useEffect(() => {
    if (GOOGLE_RECAPTCHA_SITE_KEY) initRecaptcha(GOOGLE_RECAPTCHA_SITE_KEY).catch(console.warn);
  }, []);

  useEffect(() => {
    if (currentUser && !showProfileCompletion && !isGoogleSigningIn.current && !isEmailSigningIn.current) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, showProfileCompletion, navigate]);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await checkGoogleRedirect();
        if (!result) return;
        if (!result.isProfileComplete) {
          setGoogleUserProfile(result.profile);
          setShowProfileCompletion(true);
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        setAuthError('Google sign-in could not be completed. Please try again.');
      }
    };
    handleRedirectResult();
  }, [checkGoogleRedirect, navigate]);

  useEffect(() => {
    if (!authError) return;
    const timer = window.setTimeout(() => setAuthError(''), 6000);
    return () => window.clearTimeout(timer);
  }, [authError]);

  const validateField = (name: LoginField, value = formData[name]) => {
    if (name === 'email') {
      if (!value.trim()) return 'Enter your email address.';
      if (!/^\S+@\S+\.\S+$/.test(value)) return 'Enter a valid email address.';
    }
    if (name === 'password') {
      if (!value) return 'Enter your password.';
      if (value.length < 6) return 'Password must contain at least 6 characters.';
    }
    return '';
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as LoginField;
    const value = event.target.value;
    setFormData(previous => ({ ...previous, [name]: value }));
    if (errors[name]) setErrors(previous => ({ ...previous, [name]: validateField(name, value) }));
    if (authError) setAuthError('');
  };

  const handleBlur = (name: LoginField) => {
    setTouched(previous => ({ ...previous, [name]: true }));
    setErrors(previous => ({ ...previous, [name]: validateField(name) }));
  };

  const validateForm = () => {
    const nextErrors: Partial<Record<LoginField, string>> = {
      email: validateField('email'),
      password: validateField('password'),
    };
    setTouched({ email: true, password: true });
    setErrors(nextErrors);
    const firstInvalid = (['email', 'password'] as LoginField[]).find(field => nextErrors[field]);
    if (firstInvalid) document.getElementById(`login-${firstInvalid}`)?.focus();
    return !firstInvalid;
  };

  const getErrorMessage = (error: { code?: string; message?: string }) => {
    let code = error.code;
    if (!code && error.message) code = error.message.match(/\((auth\/[^)]+)\)/)?.[1];
    switch (code) {
      case 'auth/user-not-found': return 'No account exists with this email address.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential': return 'The email or password is incorrect.';
      case 'auth/invalid-email': return 'Enter a valid email address.';
      case 'auth/too-many-requests': return 'Too many failed attempts. Reset your password or try again later.';
      case 'auth/user-disabled': return 'This account has been disabled.';
      case 'auth/network-request-failed': return 'Check your internet connection and try again.';
      case 'auth/popup-closed-by-user': return 'The Google sign-in window was closed before completion.';
      case 'auth/unauthorized-domain': return 'This domain is not authorized for Google sign-in.';
      case 'auth/cancelled-popup-request': return 'Another Google sign-in request is already open.';
      case 'auth/popup-blocked': return 'Your browser blocked the Google sign-in window. Allow popups and retry.';
      default:
        if (error.message?.includes('Firebase is not properly configured')) return 'Authentication is temporarily unavailable. Please contact support.';
        return 'We could not sign you in. Please try again.';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitState('loading');
    setAuthError('');
    isEmailSigningIn.current = true;
    try {
      await login(formData.email.trim(), formData.password);
      setSubmitState('success');
      await wait(420);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      isEmailSigningIn.current = false;
      setSubmitState('idle');
      setAuthError(getErrorMessage(error as { code?: string; message?: string }));
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    isGoogleSigningIn.current = true;
    try {
      const result = await loginWithGoogle();
      if (!result.isProfileComplete) {
        setGoogleUserProfile(result.profile);
        setShowProfileCompletion(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setAuthError(getErrorMessage(error as { code?: string; message?: string }));
    } finally {
      setIsGoogleLoading(false);
      isGoogleSigningIn.current = false;
    }
  };

  if (authLoading) return <AuthLoadingScreen label="Preparing secure sign-in…" />;
  if (currentUser && !showProfileCompletion) return null;

  return (
    <AuthPageShell mode="login">
      <SEOHead title="Log In | Study Volte" description="Log in to your Study Volte account to upload papers, save favourites, and track your contributions." noindex />
      {showProfileCompletion && googleUserProfile && (
        <GoogleProfileCompletion
          user={googleUserProfile}
          onComplete={() => { setShowProfileCompletion(false); setGoogleUserProfile(null); navigate('/dashboard', { replace: true }); }}
          onCancel={() => { setShowProfileCompletion(false); setGoogleUserProfile(null); }}
        />
      )}

      <section className="auth-card mx-auto max-w-[420px]" aria-labelledby="login-title">
        <header className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-600">Student access</p>
          <h1 id="login-title" className="mt-2 text-[1.8rem] font-black tracking-[-0.035em] text-[#0b1020] sm:text-[2rem]">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-[#66728f]">Sign in to continue to your papers and dashboard.</p>
        </header>

        {authError && <div className="auth-error-banner" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{authError}</span></div>}

        <GoogleButton label="Continue with Google" loading={isGoogleLoading} disabled={isLoading} onClick={handleGoogleSignIn} />
        <AuthDivider />

        <form onSubmit={handleSubmit} noValidate>
          <AuthInput
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            label="Email address"
            icon={Mail}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            valid={!!touched.email && !errors.email && !!formData.email}
            delay={55}
            required
          />

          <AuthInput
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            label="Password"
            icon={Lock}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            onKeyDown={event => setCapsLock(event.getModifierState('CapsLock'))}
            onKeyUp={event => setCapsLock(event.getModifierState('CapsLock'))}
            error={errors.password}
            valid={!!touched.password && !errors.password && !!formData.password}
            hint={capsLock ? <span className="auth-caps-warning"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />Caps Lock is on</span> : undefined}
            trailing={<PasswordToggle shown={showPassword} onClick={() => setShowPassword(value => !value)} />}
            delay={110}
            required
          />

          <div className="mb-5 flex items-center justify-between gap-3 text-sm">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[#4a5570]">
              <input className="auth-checkbox" type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} />
              <span>Remember me</span>
            </label>
            <Link to="/reset-password" className="auth-text-link text-right">Forgot password?</Link>
          </div>

          <AuthSubmitButton state={submitState} idleLabel="Sign in" loadingLabel="Signing in…" />
          <AuthTrustLine />
        </form>

        <p className="mt-6 text-center text-sm text-[#66728f]">New to Study Volte? <Link to="/register" className="auth-text-link">Create a free account</Link></p>
      </section>
    </AuthPageShell>
  );
};

export default Login;