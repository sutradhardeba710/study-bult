import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMeta } from '../context/MetaContext';
import GoogleProfileCompletion from '../components/GoogleProfileCompletion';
import {
  AuthDivider,
  AuthInput,
  AuthLoadingScreen,
  AuthPageShell,
  AuthSectionLabel,
  AuthSelect,
  AuthSubmitButton,
  AuthTrustLine,
  GoogleButton,
  PasswordToggle,
  type AuthSelectOption,
} from '../components/AuthExperience';
import type { UserProfile } from '../context/AuthContext';
import { initRecaptcha, trackSignupConversion } from '../services/google';
import SEOHead from '../components/SEOHead';

const GOOGLE_RECAPTCHA_SITE_KEY = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY || '';
type RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'college' | 'semester' | 'course';
type RegisterForm = Record<RegisterField, string>;
type SubmitState = 'idle' | 'loading' | 'success';

const wait = (milliseconds: number) => new Promise(resolve => window.setTimeout(resolve, milliseconds));
const toOptions = (items: { name: string }[]): AuthSelectOption[] => items.map(item => ({ value: item.name, label: item.name }));

const Register = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    fullName: '', email: '', password: '', confirmPassword: '', college: '', semester: '', course: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<RegisterField, boolean>>>({});
  const [authError, setAuthError] = useState('');
  const [capsLock, setCapsLock] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [googleUserProfile, setGoogleUserProfile] = useState<UserProfile | null>(null);
  const isGoogleSigningIn = useRef(false);
  const isEmailSigningIn = useRef(false);

  const { currentUser, loading: authLoading, register, loginWithGoogle, checkGoogleRedirect } = useAuth();
  const { colleges, semesters, courses, loading: metaLoading } = useMeta();
  const navigate = useNavigate();
  const isLoading = submitState === 'loading';

  const collegeOptions = useMemo(() => toOptions(colleges), [colleges]);
  const semesterOptions = useMemo(() => toOptions(semesters), [semesters]);
  const courseOptions = useMemo(() => toOptions(courses), [courses]);

  const passwordRules = useMemo(() => ({
    length: formData.password.length >= 8,
    mixedCase: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password),
  }), [formData.password]);
  const passwordScore = Object.values(passwordRules).filter(Boolean).length;
  const strengthMeta = [
    { label: 'Add a password', color: '#e1e6f1' },
    { label: 'Weak', color: '#e4483c' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Good', color: '#84cc16' },
    { label: 'Strong', color: '#14b88a' },
  ][passwordScore];

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
        if (result.isNewUser) trackSignupConversion();
        if (!result.isProfileComplete) {
          setGoogleUserProfile(result.profile);
          setShowProfileCompletion(true);
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
        setAuthError('Google sign-up could not be completed. Please try again.');
      }
    };
    handleRedirectResult();
  }, [checkGoogleRedirect, navigate]);

  useEffect(() => {
    if (!authError) return;
    const timer = window.setTimeout(() => setAuthError(''), 6000);
    return () => window.clearTimeout(timer);
  }, [authError]);

  const validateField = (name: RegisterField, value = formData[name], data = formData) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Enter your full name.';
        if (value.trim().length < 2) return 'Your name must contain at least 2 characters.';
        break;
      case 'email':
        if (!value.trim()) return 'Enter your email address.';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Enter a valid email address.';
        break;
      case 'password':
        if (!value) return 'Create a password.';
        if (value.length < 8) return 'Use at least 8 characters for your password.';
        break;
      case 'confirmPassword':
        if (!value) return 'Confirm your password.';
        if (value !== data.password) return 'Passwords do not match.';
        break;
      case 'college':
        if (!value) return 'Select your college.';
        break;
      case 'semester':
        if (!value) return data.college ? 'Select your semester.' : 'Select your college first.';
        break;
      case 'course':
        if (!value) return data.college ? 'Select your course.' : 'Select your college first.';
        break;
    }
    return '';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as RegisterField;
    const value = event.target.value;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (errors[name]) setErrors(previous => ({ ...previous, [name]: validateField(name, value, nextData) }));
    if (name === 'password' && touched.confirmPassword) {
      setErrors(previous => ({ ...previous, confirmPassword: validateField('confirmPassword', nextData.confirmPassword, nextData) }));
    }
    if (authError) setAuthError('');
  };

  const handleBlur = (name: RegisterField) => {
    setTouched(previous => ({ ...previous, [name]: true }));
    setErrors(previous => ({ ...previous, [name]: validateField(name) }));
  };

  const handleSelectChange = (name: 'college' | 'semester' | 'course') => (value: string) => {
    const nextData = name === 'college'
      ? { ...formData, college: value, semester: '', course: '' }
      : { ...formData, [name]: value };
    setFormData(nextData);
    setTouched(previous => name === 'college'
      ? { ...previous, college: true, semester: false, course: false }
      : { ...previous, [name]: true });
    setErrors(previous => ({
      ...previous,
      [name]: '',
      ...(name === 'college' ? { semester: '', course: '' } : {}),
    }));
    if (authError) setAuthError('');
  };

  const validateForm = () => {
    const fields: RegisterField[] = ['fullName', 'email', 'password', 'confirmPassword', 'college', 'semester', 'course'];
    const nextErrors = fields.reduce<Partial<Record<RegisterField, string>>>((result, field) => {
      result[field] = validateField(field);
      return result;
    }, {});
    setTouched(fields.reduce<Partial<Record<RegisterField, boolean>>>((result, field) => ({ ...result, [field]: true }), {}));
    setErrors(nextErrors);
    const firstInvalid = fields.find(field => nextErrors[field]);
    if (firstInvalid) document.getElementById(`register-${firstInvalid}`)?.focus();
    return !firstInvalid;
  };

  const getRegisterErrorMessage = (error: { code?: string; message?: string }) => {
    const code = error.code || error.message?.match(/(auth\/[a-z-]+)/)?.[1];
    switch (code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists. Sign in instead.';
      case 'auth/invalid-email': return 'Enter a valid email address.';
      case 'auth/weak-password': return 'Choose a stronger password and try again.';
      case 'auth/network-request-failed': return 'Check your internet connection and try again.';
      case 'auth/popup-closed-by-user': return 'The Google sign-up window was closed before completion.';
      case 'auth/popup-blocked': return 'Your browser blocked the Google sign-up window. Allow popups and retry.';
      default:
        if (error.message?.includes('Firebase is not properly configured')) return 'Registration is temporarily unavailable. Please contact support.';
        return 'We could not create your account. Please try again.';
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitState('loading');
    setAuthError('');
    isEmailSigningIn.current = true;
    try {
      await register(formData.email.trim(), formData.password, {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        college: formData.college,
        semester: formData.semester,
        course: formData.course,
        role: 'student',
      });
      trackSignupConversion();
      setSubmitState('success');
      await wait(420);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      isEmailSigningIn.current = false;
      setSubmitState('idle');
      setAuthError(getRegisterErrorMessage(error as { code?: string; message?: string }));
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError('');
    isGoogleSigningIn.current = true;
    try {
      const result = await loginWithGoogle();
      if (result.isNewUser) trackSignupConversion();
      if (!result.isProfileComplete) {
        setGoogleUserProfile(result.profile);
        setShowProfileCompletion(true);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      setAuthError(getRegisterErrorMessage(error as { code?: string; message?: string }));
    } finally {
      setIsGoogleLoading(false);
      isGoogleSigningIn.current = false;
    }
  };

  if (authLoading) return <AuthLoadingScreen label="Preparing secure registration…" />;
  if (currentUser && !showProfileCompletion) return null;

  const strengthHint = (
    <div className="auth-strength" aria-live="polite">
      <div className="auth-strength-head"><span>Password strength</span><strong style={{ color: strengthMeta.color }}>{strengthMeta.label}</strong></div>
      <div className="auth-strength-bars" aria-hidden="true">
        {[0, 1, 2, 3].map(index => <span key={index} className="auth-strength-bar" style={{ background: index < passwordScore ? strengthMeta.color : undefined }} />)}
      </div>
      <div className="auth-rule-chips">
        {[
          ['8+ chars', passwordRules.length],
          ['Mixed case', passwordRules.mixedCase],
          ['Number', passwordRules.number],
          ['Symbol', passwordRules.symbol],
        ].map(([label, passes]) => <span key={String(label)} className="auth-rule-chip" data-pass={passes ? 'true' : 'false'}>{passes && <Check className="h-3 w-3" aria-hidden="true" />}{label}</span>)}
      </div>
    </div>
  );

  const passwordsMatch = !!formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <AuthPageShell mode="register">
      <SEOHead title="Create Account | Study Volte" description="Create a free Study Volte account to upload question papers, earn contributor rewards, and save papers for later." noindex />
      {showProfileCompletion && googleUserProfile && (
        <GoogleProfileCompletion
          user={googleUserProfile}
          onComplete={() => { setShowProfileCompletion(false); setGoogleUserProfile(null); navigate('/dashboard', { replace: true }); }}
          onCancel={() => { setShowProfileCompletion(false); setGoogleUserProfile(null); }}
        />
      )}

      <section className="auth-card mx-auto max-w-[460px]" aria-labelledby="register-title">
        <header className="mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-600">Student account</p>
              <h1 id="register-title" className="mt-2 text-[1.7rem] font-black tracking-[-0.035em] text-[#0b1020] sm:text-[1.9rem]">Create your free account</h1>
            </div>
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 sm:inline">About 30 sec</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#66728f]">Upload papers, save resources, and contribute to the library.</p>
        </header>

        {authError && <div className="auth-error-banner" role="alert"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{authError}</span></div>}

        <GoogleButton label="Continue with Google" loading={isGoogleLoading} disabled={isLoading} onClick={handleGoogleSignIn} />
        <AuthDivider>or create with email</AuthDivider>

        <form onSubmit={handleSubmit} noValidate>
          <AuthSectionLabel>Your details</AuthSectionLabel>
          <AuthInput
            id="register-fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            label="Full name"
            icon={User}
            placeholder="Your full name"
            value={formData.fullName}
            onChange={handleInputChange}
            onBlur={() => handleBlur('fullName')}
            error={errors.fullName}
            valid={!!touched.fullName && !errors.fullName && !!formData.fullName}
            delay={55}
            required
          />
          <AuthInput
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            label="Email address"
            icon={Mail}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            valid={!!touched.email && !errors.email && !!formData.email}
            delay={110}
            required
          />

          <AuthSectionLabel>Security</AuthSectionLabel>
          <AuthInput
            id="register-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            label="Password"
            icon={Lock}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={() => handleBlur('password')}
            onKeyDown={event => setCapsLock(event.getModifierState('CapsLock'))}
            onKeyUp={event => setCapsLock(event.getModifierState('CapsLock'))}
            error={errors.password}
            valid={!!touched.password && !errors.password && passwordScore === 4}
            hint={<>{capsLock && <span className="auth-caps-warning mb-2"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />Caps Lock is on</span>}{strengthHint}</>}
            trailing={<PasswordToggle shown={showPassword} onClick={() => setShowPassword(value => !value)} />}
            delay={165}
            required
          />
          <AuthInput
            id="register-confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            label="Confirm password"
            icon={Lock}
            placeholder="Repeat your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            valid={!!touched.confirmPassword && passwordsMatch}
            hint={touched.confirmPassword && passwordsMatch ? <span className="auth-match-message" data-match="true"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Passwords match</span> : undefined}
            trailing={<PasswordToggle shown={showConfirmPassword} onClick={() => setShowConfirmPassword(value => !value)} label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} />}
            delay={220}
            required
          />

          <AuthSectionLabel>Academic info</AuthSectionLabel>
          <AuthSelect
            id="register-college"
            label="College"
            icon={Building2}
            options={collegeOptions}
            value={formData.college}
            onChange={handleSelectChange('college')}
            onBlur={() => handleBlur('college')}
            placeholder={metaLoading ? 'Loading colleges…' : 'Search or select your college'}
            error={errors.college}
            valid={!!formData.college && !errors.college}
            disabled={metaLoading}
            disabledHint={metaLoading ? 'Loading available colleges…' : undefined}
            searchable
            delay={275}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <AuthSelect
              id="register-semester"
              label="Semester"
              icon={GraduationCap}
              options={semesterOptions}
              value={formData.semester}
              onChange={handleSelectChange('semester')}
              onBlur={() => handleBlur('semester')}
              placeholder="Select semester"
              error={errors.semester}
              valid={!!formData.semester && !errors.semester}
              disabled={metaLoading || !formData.college}
              disabledHint={!formData.college ? 'Select college first' : undefined}
              delay={330}
            />
            <AuthSelect
              id="register-course"
              label="Course"
              icon={BookOpen}
              options={courseOptions}
              value={formData.course}
              onChange={handleSelectChange('course')}
              onBlur={() => handleBlur('course')}
              placeholder="Select course"
              error={errors.course}
              valid={!!formData.course && !errors.course}
              disabled={metaLoading || !formData.college}
              disabledHint={!formData.college ? 'Select college first' : undefined}
              delay={385}
            />
          </div>

          <p className="mb-4 mt-1 text-xs leading-5 text-[#66728f]">By creating an account, you agree to our <Link to="/terms" className="auth-text-link">Terms</Link> and <Link to="/privacy" className="auth-text-link">Privacy Policy</Link>.</p>
          <AuthSubmitButton state={submitState} idleLabel="Create free account" loadingLabel="Creating account…" />
          <AuthTrustLine />
        </form>

        <p className="mt-5 text-center text-sm text-[#66728f]">Already have an account? <Link to="/login" className="auth-text-link">Sign in</Link></p>
      </section>
    </AuthPageShell>
  );
};

export default Register;