import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Landmark,
  Loader2,
  LockKeyhole,
  MailCheck,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

type AuthMode = 'login' | 'register';

const brandCopy = {
  login: {
    eyebrow: 'Your academic library',
    title: 'Your next paper is already here.',
    description: 'Sign in to pick up where you left off and keep your study resources together.',
  },
  register: {
    eyebrow: 'Built for Tripura students',
    title: 'A clearer path from search to study.',
    description: 'Create one free account to upload papers, save resources, and contribute to the student library.',
  },
};

export const AuthPageShell = ({ mode, children }: { mode: AuthMode; children: ReactNode }) => {
  const copy = brandCopy[mode];

  return (
    <div className="auth-shell">
      <aside className="auth-brand-panel" aria-label="About Study Volte">
        <div className="auth-brand-orb auth-brand-orb-one" aria-hidden="true" />
        <div className="auth-brand-orb auth-brand-orb-two" aria-hidden="true" />

        <Link to="/" className="auth-brand-logo relative z-10 inline-flex items-center gap-3" aria-label="Study Volte home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg shadow-black/10 backdrop-blur">
            <img src="/logo-optimized.webp?v=8" alt="" className="h-8 w-auto" width={128} height={32} />
          </span>
          <span className="text-xl font-black tracking-tight text-white">Study Volte</span>
        </Link>

        <div className="auth-paper-stack" aria-hidden="true">
          <div className="auth-paper-card auth-paper-card-one">
            <span className="auth-paper-icon"><FileText className="h-4 w-4" /></span>
            <div><strong>Political Science</strong><span>Semester 2 · 2024</span></div>
            <BadgeCheck className="ml-auto h-4 w-4 text-emerald-300" />
          </div>
          <div className="auth-paper-card auth-paper-card-two">
            <span className="auth-paper-icon"><BookOpenCheck className="h-4 w-4" /></span>
            <div><strong>Education</strong><span>Semester 1 · Complete</span></div>
            <BadgeCheck className="ml-auto h-4 w-4 text-emerald-300" />
          </div>
          <div className="auth-paper-card auth-paper-card-three">
            <span className="auth-paper-icon"><GraduationCap className="h-4 w-4" /></span>
            <div><strong>English Literature</strong><span>BBMC · Clear scan</span></div>
            <BadgeCheck className="ml-auto h-4 w-4 text-emerald-300" />
          </div>
        </div>

        <div className="auth-brand-copy relative z-10 max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-200">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-[12ch] text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white xl:text-5xl">{copy.title}</h1>
          <p className="mt-5 max-w-[52ch] text-base leading-7 text-[#b9c6e3]">{copy.description}</p>

          <div className="mt-8 grid gap-3 text-sm font-semibold text-white sm:grid-cols-3 min-[1025px]:grid-cols-1 xl:grid-cols-3">
            <span className="auth-proof-chip"><FileText className="h-4 w-4 text-blue-300" />Previous-year papers</span>
            <span className="auth-proof-chip"><Landmark className="h-4 w-4 text-violet-300" />MBBU + BBMC</span>
            <span className="auth-proof-chip"><ShieldCheck className="h-4 w-4 text-emerald-300" />Free, no paywall</span>
          </div>
        </div>

        <div className="auth-brand-note relative z-10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200"><Search className="h-5 w-5" /></span>
          <div>
            <strong className="block text-sm text-white">Search with useful context</strong>
            <span className="mt-1 block text-xs leading-5 text-[#9facc8]">University, course, semester, and subject stay visible before you download.</span>
          </div>
          <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-blue-300" />
        </div>
      </aside>

      <main className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-mobile-brand min-[1025px]:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="Study Volte home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 ring-1 ring-primary-100"><img src="/logo-optimized.webp?v=8" alt="" className="h-7 w-auto" width={112} height={28} /></span>
              <span className="text-lg font-black tracking-tight text-[#0b1020]">Study <span className="text-primary-600">Volte</span></span>
            </Link>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />MBBU + BBMC papers · Free forever</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export const AuthLoadingScreen = ({ label = 'Preparing your account…' }: { label?: string }) => (
  <div className="auth-form-side min-h-dvh">
    <div className="text-center" role="status" aria-live="polite">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100"><Loader2 className="h-6 w-6 animate-spin" /></span>
      <p className="mt-4 text-sm font-semibold text-[#4a5570]">{label}</p>
    </div>
  </div>
);

export const GoogleButton = ({ label, loading, disabled, onClick }: { label: string; loading?: boolean; disabled?: boolean; onClick: () => void }) => (
  <button type="button" className="auth-google-button" onClick={onClick} disabled={disabled || loading} data-loading={loading ? 'true' : 'false'}>
    {loading ? (
      <Loader2 className="h-5 w-5 animate-spin text-primary-600" aria-hidden="true" />
    ) : (
      <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    )}
    <span>{loading ? 'Connecting securely…' : label}</span>
  </button>
);

export const AuthDivider = ({ children = 'or use email' }: { children?: ReactNode }) => <div className="auth-divider"><span>{children}</span></div>;

export const AuthSectionLabel = ({ children }: { children: ReactNode }) => (
  <div className="auth-section-label"><span>{children}</span><span className="h-px flex-1 bg-[#e6eaf5]" aria-hidden="true" /></div>
);

type AuthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> & {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  valid?: boolean;
  hint?: ReactNode;
  trailing?: ReactNode;
  delay?: number;
};

export const AuthInput = ({ id, label, icon: Icon, error, valid, hint, trailing, delay = 0, ...inputProps }: AuthInputProps) => {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : '', hint ? hintId : '', inputProps['aria-describedby'] || ''].filter(Boolean).join(' ') || undefined;
  const fieldState = error ? 'error' : valid ? 'valid' : undefined;
  const style = { '--auth-delay': `${delay}ms` } as CSSProperties;

  return (
    <div className="auth-field auth-field-enter" style={style}>
      <label htmlFor={id} className="auth-field-label">{label}</label>
      <div className="auth-input-wrap" data-state={fieldState}>
        <span className="auth-lead-icon"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
        <input {...inputProps} id={id} aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} className="auth-input" />
        {valid && !trailing && <span className="auth-valid-icon" aria-hidden="true"><CheckCircle2 className="h-[18px] w-[18px]" /></span>}
        {trailing}
      </div>
      {error && <p id={errorId} className="auth-field-error" role="alert"><span aria-hidden="true">!</span>{error}</p>}
      {!error && hint && <div id={hintId} className="auth-field-hint">{hint}</div>}
    </div>
  );
};

export type AuthSelectOption = { value: string; label: string };

type AuthSelectProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  options: AuthSelectOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  error?: string;
  valid?: boolean;
  disabled?: boolean;
  disabledHint?: string;
  searchable?: boolean;
  delay?: number;
};

export const AuthSelect = ({
  id,
  label,
  icon: Icon,
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  valid,
  disabled,
  disabledHint,
  searchable,
  delay = 0,
}: AuthSelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(option => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;
    return options.filter(option => option.label.toLowerCase().includes(normalized));
  }, [options, query]);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const listboxId = `${id}-listbox`;
  const style = { '--auth-delay': `${delay}ms` } as CSSProperties;

  useEffect(() => {
    if (activeIndex >= filteredOptions.length) setActiveIndex(Math.max(filteredOptions.length - 1, 0));
  }, [activeIndex, filteredOptions.length]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const openMenu = () => {
    if (disabled) return;
    const selectedIndex = options.findIndex(option => option.value === value);
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const choose = (option: AuthSelectOption) => {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(index => Math.max(0, Math.min(filteredOptions.length - 1, index + direction)));
      return;
    }
    if (event.key === 'Home' && open) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === 'End' && open) {
      event.preventDefault();
      setActiveIndex(Math.max(filteredOptions.length - 1, 0));
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !searchable) {
      const foundIndex = options.findIndex(option => option.label.toLowerCase().startsWith(event.key.toLowerCase()));
      if (foundIndex >= 0) {
        event.preventDefault();
        setActiveIndex(foundIndex);
        setOpen(true);
      }
    }
  };

  return (
    <div
      ref={rootRef}
      className="auth-field auth-field-enter"
      style={style}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
          setQuery('');
          onBlur?.();
        }
      }}
    >
      <label id={`${id}-label`} className="auth-field-label">{label}</label>
      <div className="relative">
        <button
          id={id}
          type="button"
          role="combobox"
          aria-labelledby={`${id}-label`}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : disabledHint ? hintId : undefined}
          aria-activedescendant={open && filteredOptions[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
          disabled={disabled}
          onClick={() => open ? setOpen(false) : openMenu()}
          onKeyDown={handleTriggerKeyDown}
          className="auth-select-trigger"
          data-state={error ? 'error' : valid ? 'valid' : undefined}
          data-placeholder={selected ? 'false' : 'true'}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="auth-lead-icon !flex-none"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
            <span className="truncate">{selected?.label || placeholder}</span>
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#8a93ad] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        {open && (
          <div className="auth-select-menu" data-open="true">
            {searchable && (
              <div className="auth-select-search">
                <Search className="h-4 w-4 text-[#8a93ad]" aria-hidden="true" />
                <input autoFocus role="combobox" aria-expanded="true" aria-controls={listboxId} aria-activedescendant={filteredOptions[activeIndex] ? `${id}-option-${activeIndex}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActiveIndex(0); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const direction = event.key === 'ArrowDown' ? 1 : -1; setActiveIndex(index => Math.max(0, Math.min(filteredOptions.length - 1, index + direction))); } else if (event.key === 'Home') { event.preventDefault(); setActiveIndex(0); } else if (event.key === 'End') { event.preventDefault(); setActiveIndex(Math.max(filteredOptions.length - 1, 0)); } else if (event.key === 'Enter') { event.preventDefault(); const option = filteredOptions[activeIndex]; if (option) choose(option); } }} placeholder={`Search ${label.toLowerCase()}…`} aria-label={`Search ${label.toLowerCase()}`} />
              </div>
            )}
            <div id={listboxId} role="listbox" aria-labelledby={`${id}-label`} className="max-h-64 overflow-y-auto p-1.5">
              {filteredOptions.length ? filteredOptions.map((option, index) => (
                <button
                  id={`${id}-option-${index}`}
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  tabIndex={-1}
                  data-active={activeIndex === index ? 'true' : 'false'}
                  className="auth-select-option"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => choose(option)}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />}
                </button>
              )) : <p className="px-3 py-6 text-center text-sm text-[#8a93ad]">No matching options</p>}
            </div>
          </div>
        )}
      </div>
      {error && <p id={errorId} className="auth-field-error" role="alert"><span aria-hidden="true">!</span>{error}</p>}
      {!error && disabledHint && <p id={hintId} className="auth-field-hint">{disabledHint}</p>}
    </div>
  );
};

export const PasswordToggle = ({ shown, onClick, label }: { shown: boolean; onClick: () => void; label?: string }) => (
  <button type="button" className="auth-password-toggle" onClick={onClick} aria-label={label || (shown ? 'Hide password' : 'Show password')} aria-pressed={shown}>
    {shown ? <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" /> : <Eye className="h-[18px] w-[18px]" aria-hidden="true" />}
  </button>
);

export const AuthSubmitButton = ({ state, idleLabel, loadingLabel }: { state: 'idle' | 'loading' | 'success'; idleLabel: string; loadingLabel: string }) => (
  <button type="submit" className="auth-submit-button" disabled={state !== 'idle'} data-loading={state === 'loading' ? 'true' : 'false'} data-success={state === 'success' ? 'true' : 'false'} aria-live="polite">
    {state === 'loading' && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
    {state === 'success' && <CheckCircle2 className="h-5 w-5 auth-success-check" aria-hidden="true" />}
    <span>{state === 'loading' ? loadingLabel : state === 'success' ? 'Success' : idleLabel}</span>
  </button>
);

export const AuthTrustLine = () => (
  <div className="auth-trust-line" aria-label="Account trust information">
    <span><LockKeyhole className="h-3.5 w-3.5 text-emerald-600" />Encrypted</span>
    <span><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />Free forever</span>
    <span><MailCheck className="h-3.5 w-3.5 text-emerald-600" />No spam</span>
  </div>
);