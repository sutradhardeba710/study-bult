import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowRight,
    Check,
    Clock3,
    Coins,
    Copy,
    Eye,
    Gift,
    History,
    LockKeyhole,
    ShieldCheck,
    Upload,
    WalletCards,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getUserPapers } from '../../services/papers';
import {
    COINS_PER_RUPEE,
    MIN_WITHDRAWAL_COINS,
    WITHDRAWAL_OPTIONS,
    cancelWithdrawal,
    reportVoucherIssue,
    requestWithdrawal,
    revealVoucher,
    subscribeLedger,
    subscribeWallet,
    subscribeWithdrawals,
    type CoinLedgerEntry,
    type GiftCardBrand,
    type VoucherReveal,
    type Wallet,
    type Withdrawal,
} from '../../services/coins';

const EMPTY_WALLET: Wallet = {
    available: 0,
    onHold: 0,
    lifetimeEarned: 0,
    lifetimeWithdrawn: 0,
    dailyEarnedCoins: 0,
    yearEarnedCoins: 0,
    status: 'active',
};

function toDate(value: { toDate?: () => Date } | undefined): Date | null {
    if (!value) return null;
    return typeof value.toDate === 'function' ? value.toDate() : null;
}

function money(coins: number): string {
    return `₹${(coins / COINS_PER_RUPEE).toFixed(coins % COINS_PER_RUPEE === 0 ? 0 : 2)}`;
}

function dateTime(value: { toDate?: () => Date } | undefined): string {
    const date = toDate(value);
    return date ? date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

function getDeviceId(): string {
    if (typeof window === 'undefined') return '';
    const key = 'study-volte-device-id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const value = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, value);
    return value;
}

function useClock(): number {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1_000);
        return () => window.clearInterval(timer);
    }, []);
    return now;
}

function durationLabel(milliseconds: number): string {
    if (milliseconds <= 0) return 'Promise time passed';
    const minutes = Math.ceil(milliseconds / 60_000);
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return hours > 0 ? `${hours}h ${remaining}m` : `${remaining}m`;
}

function statusMeta(status: Withdrawal['status']) {
    const values = {
        requested: { label: 'In review', className: 'bg-amber-100 text-amber-800' },
        approved: { label: 'Being prepared', className: 'bg-blue-100 text-blue-800' },
        fulfilled: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-800' },
        replaced: { label: 'Replaced', className: 'bg-violet-100 text-violet-800' },
        rejected: { label: 'Refunded', className: 'bg-rose-100 text-rose-800' },
        cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-700' },
    };
    return values[status];
}

function RedemptionModal({
    wallet,
    onClose,
}: {
    wallet: Wallet;
    onClose: () => void;
}) {
    const [brand, setBrand] = useState<GiftCardBrand>('amazon');
    const [coins, setCoins] = useState<number>(WITHDRAWAL_OPTIONS.find((option) => option <= wallet.available) ?? 1_000);
    const [accepted, setAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const validOptions = WITHDRAWAL_OPTIONS.filter((option) => option <= wallet.available && (brand === 'amazon' || option >= 10_000));

    useEffect(() => {
        if (!validOptions.includes(coins as typeof WITHDRAWAL_OPTIONS[number])) {
            setCoins(validOptions[0] ?? (brand === 'flipkart' ? 10_000 : 1_000));
        }
    }, [brand, coins, validOptions]);

    const submit = async () => {
        if (!accepted || wallet.available < coins) return;
        setSubmitting(true);
        try {
            await requestWithdrawal(coins, brand, accepted, getDeviceId());
            toast.success('Redemption requested — delivery within 24 hours');
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message.replace(/^Firebase:\s*/i, '') : 'Could not request redemption.';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close redemption" />
            <section role="dialog" aria-modal="true" aria-labelledby="redeem-title" className="relative max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
                <header className="flex items-start gap-3 border-b border-amber-100 bg-[#fffaf0] px-5 py-5 sm:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-amber-950">
                        <Gift className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Manual fulfilment</p>
                        <h2 id="redeem-title" className="mt-1 text-xl font-black text-slate-950">Redeem your coins</h2>
                        <p className="mt-1 text-sm text-slate-600">Your code is checked and delivered by our team within 24 hours.</p>
                    </div>
                    <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-white" aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="space-y-6 p-5 sm:p-6">
                    <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">1. Choose gift card</p>
                        <div className="grid grid-cols-2 gap-3">
                            {(['amazon', 'flipkart'] as GiftCardBrand[]).map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setBrand(value)}
                                    className={`rounded-2xl border-2 p-4 text-left transition ${brand === value ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                                >
                                    <span className="text-base font-black capitalize text-slate-900">{value}</span>
                                    <span className="mt-1 block text-xs text-slate-500">{value === 'flipkart' ? '₹100 minimum' : '₹10 minimum'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">2. Choose amount</p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {WITHDRAWAL_OPTIONS.map((option) => {
                                const disabled = option > wallet.available || (brand === 'flipkart' && option < 10_000);
                                return (
                                    <button
                                        key={option}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => setCoins(option)}
                                        className={`rounded-xl border px-3 py-3 text-center transition disabled:cursor-not-allowed disabled:opacity-35 ${coins === option && !disabled ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-200' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <span className="block text-sm font-black">₹{option / 100}</span>
                                        <span className="text-[10px] font-semibold">{option.toLocaleString('en-IN')} coins</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4 text-white">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Gift card</span>
                            <strong className="capitalize">{brand} · ₹{coins / 100}</strong>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-400">Coins held now</span>
                            <strong>{coins.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
                            <span className="text-slate-400">Balance after</span>
                            <strong>{Math.max(0, wallet.available - coins).toLocaleString('en-IN')} coins</strong>
                        </div>
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-400/15 px-3 py-2 text-xs font-bold text-amber-200">
                            <Clock3 className="h-4 w-4" /> Delivered within 24 hours
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
                        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 accent-amber-500" />
                        <span className="text-sm leading-6 text-slate-600">I confirm my uploads are my own lawful scans and do not violate copyright.</span>
                    </label>

                    <button
                        type="button"
                        onClick={submit}
                        disabled={!accepted || wallet.available < coins || !validOptions.length || submitting}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 px-5 font-black text-amber-950 shadow-lg shadow-amber-200 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                        {submitting ? 'Securing your request…' : 'Confirm redemption'} <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>
        </div>
    );
}

function PhoneVerificationModal({
    onClose
}: {
    onClose: () => void;
}) {
    const { currentUser, updateUserProfile } = useAuth();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [submitting, setSubmitting] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);

    useEffect(() => {
        const setupRecaptcha = async () => {
            try {
                if (!(window as any).recaptchaVerifier) {
                    const { RecaptchaVerifier } = await import('firebase/auth');
                    const { initFirebaseAuth } = await import('../../services/firebase');
                    const auth = await initFirebaseAuth();
                    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        size: 'invisible'
                    });
                }
            } catch (err) {
                console.error("Recaptcha error:", err);
            }
        };
        setupRecaptcha();
    }, []);

    const sendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error('Please enter a valid phone number (at least 10 digits).');
            return;
        }
        setSubmitting(true);
        try {
            const { linkWithPhoneNumber } = await import('firebase/auth');
            const appVerifier = (window as any).recaptchaVerifier;
            if (!appVerifier) throw new Error('Recaptcha not loaded.');
            if (!currentUser) throw new Error('You must be logged in.');

            let formattedPhone = phone;
            if (!formattedPhone.startsWith('+')) {
                // assume India if no country code provided
                formattedPhone = '+91' + formattedPhone.replace(/\D/g, '');
            }

            const result = await linkWithPhoneNumber(currentUser, formattedPhone, appVerifier);
            setConfirmationResult(result);
            setStep('otp');
            toast.success('OTP sent to your phone!');
        } catch (error: any) {
            console.error('OTP Error:', error);
            if (error.code === 'auth/credential-already-in-use') {
                toast.error('This phone number is already linked to another account.');
            } else if (error.code === 'auth/provider-already-linked') {
                 toast.success('Phone number is already verified.');
                 await updateUserProfile({ phoneNumber: phone, phoneVerified: true });
                 onClose();
            } else {
                toast.error(error.message || 'Could not send OTP.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast.error('Please enter the 6-digit OTP.');
            return;
        }
        setSubmitting(true);
        try {
            await confirmationResult.confirm(otp);
            let formattedPhone = phone;
            if (!formattedPhone.startsWith('+')) {
                formattedPhone = '+91' + formattedPhone.replace(/\D/g, '');
            }
            await updateUserProfile({ phoneNumber: formattedPhone, phoneVerified: true });
            toast.success('Phone number verified successfully!');
            onClose();
        } catch (error: any) {
            console.error('Verify Error:', error);
            toast.error(error.message || 'Invalid OTP. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close phone verification" />
            <section role="dialog" aria-modal="true" aria-labelledby="phone-verify-title" className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
                <header className="flex items-start gap-3 border-b border-indigo-100 bg-indigo-50/50 px-5 py-5 sm:px-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-inner">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 id="phone-verify-title" className="mt-1 text-xl font-black text-slate-950">Phone Verification</h2>
                        <p className="mt-1 text-sm text-slate-600">Secure your account for redemptions.</p>
                    </div>
                    <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-white" aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                </header>

                <div className="p-5 sm:p-6">
                    <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 leading-6">
                        <strong>OTP Verification:</strong> Verify your phone number instantly using a one-time password (OTP) to enable redemptions.
                    </div>
                    
                    {step === 'phone' ? (
                        <form onSubmit={sendOtp} className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">Mobile / WhatsApp Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 9876543210 or +919876543210"
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                                <p className="mt-2 text-xs text-slate-500">We'll send a 6-digit verification code to this number.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || phone.length < 10}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? 'Sending OTP...' : 'Send Verification Code'} <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verifyOtp} className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-bold text-slate-700 mb-2">Enter 6-digit OTP</label>
                                <input
                                    type="text"
                                    id="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center tracking-widest text-xl text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || otp.length < 6}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? 'Verifying...' : 'Verify Phone Number'} <Check className="h-4 w-4" />
                            </button>
                        </form>
                    )}
                </div>
                
                {/* Invisible reCAPTCHA container */}
                <div id="recaptcha-container"></div>
            </section>
        </div>
    );
}

function WithdrawalCard({ item }: { item: Withdrawal }) {
    const now = useClock();
    const [revealed, setRevealed] = useState<VoucherReveal | null>(null);
    const [working, setWorking] = useState(false);
    const meta = statusMeta(item.status);
    const due = toDate(item.slaDueAt)?.getTime() ?? now;
    const requested = toDate(item.requestedAt)?.getTime() ?? now;
    const total = Math.max(1, due - requested);
    const remaining = due - now;
    const elapsedPercent = Math.min(100, Math.max(0, ((now - requested) / total) * 100));
    const cancelUntil = toDate(item.cancelUntil)?.getTime() ?? 0;
    const canCancel = item.status === 'requested' && cancelUntil > now;
    const isOpen = item.status === 'requested' || item.status === 'approved';

    const cancel = async () => {
        if (!confirm('Cancel this request and return all held coins?')) return;
        setWorking(true);
        try {
            await cancelWithdrawal(item.id);
            toast.success('Request cancelled and coins refunded');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not cancel request');
        } finally {
            setWorking(false);
        }
    };

    const reveal = async () => {
        setWorking(true);
        try {
            const voucher = await revealVoucher(item.id);
            setRevealed(voucher);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not reveal code');
        } finally {
            setWorking(false);
        }
    };

    const copy = async () => {
        if (!revealed?.code) return;
        await navigator.clipboard.writeText(revealed.pin ? `${revealed.code} PIN: ${revealed.pin}` : revealed.code);
        toast.success('Voucher copied');
    };

    const report = async () => {
        if (!confirm('Report this code as invalid? Our team will review one replacement request.')) return;
        setWorking(true);
        try {
            await reportVoucherIssue(item.id, 'invalid_code', 'Reported from Earnings page');
            toast.success('Issue reported to the rewards team');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not report this code');
        } finally {
            setWorking(false);
        }
    };

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">{item.brand} gift card</p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">₹{item.amountInr} · {item.coins.toLocaleString('en-IN')} coins</h3>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${meta.className}`}>{meta.label}</span>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
                {isOpen && (
                    <>
                        {item.slaBreached ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                                    <div>
                                        <p className="font-black text-rose-900">Taking longer than promised</p>
                                        <p className="mt-1 text-sm leading-6 text-rose-700">We missed 24 hours—sorry. Your code is still coming, and 100 bonus coins were added automatically.</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-slate-950 p-4 text-white">
                                <div className="flex items-center justify-between gap-3 text-sm">
                                    <span className="flex items-center gap-2 font-bold"><Clock3 className="h-4 w-4 text-amber-400" /> Arriving within</span>
                                    <strong className={remaining < 4 * 3_600_000 ? 'text-orange-300' : 'text-amber-300'}>{durationLabel(remaining)}</strong>
                                </div>
                                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                                    <div className={`h-full rounded-full transition-all ${remaining < 4 * 3_600_000 ? 'bg-orange-400' : 'bg-gradient-to-r from-amber-300 to-amber-500'}`} style={{ width: `${elapsedPercent}%` }} />
                                </div>
                                <p className="mt-3 text-xs leading-5 text-slate-400">Requested {dateTime(item.requestedAt)} · due {dateTime(item.slaDueAt)}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-[24px_1fr] gap-x-3 gap-y-1 text-sm">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-3.5 w-3.5" /></span>
                            <div className="pb-3"><strong className="text-slate-900">Request secured</strong><p className="mt-0.5 text-xs text-slate-500">Coins moved safely to on-hold balance.</p></div>
                            <span className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-amber-100 text-amber-700"><Clock3 className="h-3.5 w-3.5" /></span>
                            <div><strong className="text-slate-900">Code being prepared</strong><p className="mt-0.5 text-xs text-slate-500">Our team verifies every code before delivery.</p></div>
                        </div>
                    </>
                )}

                {(item.status === 'fulfilled' || item.status === 'replaced') && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Your voucher</p>
                        {revealed ? (
                            <div className="mt-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <code className="rounded-xl bg-white px-3 py-2 font-black tracking-wider text-slate-950 shadow-sm">{revealed.code}</code>
                                    <button type="button" onClick={copy} className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white" aria-label="Copy voucher"><Copy className="h-4 w-4" /></button>
                                </div>
                                {revealed.pin && <p className="mt-2 text-sm font-bold text-slate-700">PIN: {revealed.pin}</p>}
                                {revealed.expiresAt && <p className="mt-1 text-xs text-slate-500">Expires: {revealed.expiresAt}</p>}
                                
                                <div className="mt-4 rounded-xl bg-white/60 p-3 text-sm text-slate-700">
                                    <p className="font-bold text-slate-900 mb-1">How to claim:</p>
                                    {item.brand === 'amazon' ? (
                                        <ul className="list-disc pl-4 space-y-1 text-xs">
                                            <li>Go to the <strong>Amazon app</strong> or <strong>Amazon.in</strong></li>
                                            <li>Navigate to <strong>Amazon Pay</strong> &rarr; <strong>Add Gift Card</strong></li>
                                            <li>Paste the code above and click Add to your balance.</li>
                                        </ul>
                                    ) : (
                                        <ul className="list-disc pl-4 space-y-1 text-xs">
                                            <li>Go to the <strong>Flipkart app</strong> or <strong>Flipkart.com</strong></li>
                                            <li>Go to <strong>My Account</strong> &rarr; <strong>Saved Cards & Wallet</strong></li>
                                            <li>Click <strong>Add Flipkart Gift Card</strong> and paste the Code and PIN.</li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={reveal} disabled={working} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-50">
                                <Eye className="h-4 w-4" /> Reveal code
                            </button>
                        )}
                        <button type="button" onClick={report} disabled={working} className="mt-4 block text-xs font-bold text-emerald-800 underline underline-offset-4">Code not working?</button>
                    </div>
                )}

                {item.status === 'rejected' && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"><strong>Reason:</strong> {item.rejectReason || 'The request did not meet eligibility requirements.'} Coins were refunded.</p>}
                {canCancel && <button type="button" disabled={working} onClick={cancel} className="text-sm font-bold text-slate-500 underline underline-offset-4 hover:text-rose-600">Cancel request · {durationLabel(cancelUntil - now)} left</button>}
            </div>
        </article>
    );
}

const LEDGER_LABELS: Record<CoinLedgerEntry['type'], string> = {
    paper_approved: 'Approved paper',
    paper_revoked: 'Paper reward reversed',
    withdrawal_hold: 'Gift card requested',
    withdrawal_settled: 'Gift card delivered',
    withdrawal_refund: 'Coins refunded',
    admin_adjust: 'Admin adjustment',
    fraud_clawback: 'Account adjustment',
    bonus: 'Bonus coins',
};

export default function Earnings() {
    const { userProfile, currentUser, updateUserProfile } = useAuth();
    const [wallet, setWallet] = useState<Wallet>(EMPTY_WALLET);
    const [ledger, setLedger] = useState<CoinLedgerEntry[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [approvedPapers, setApprovedPapers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);
    const [emailVerifying, setEmailVerifying] = useState(false);
    const [verifyingPhoneModalOpen, setVerifyingPhoneModalOpen] = useState(false);

    useEffect(() => {
        if (!userProfile?.uid) return;
        const unsubscribeWallet = subscribeWallet(userProfile.uid, (value) => { setWallet(value); setLoading(false); });
        const unsubscribeLedger = subscribeLedger(userProfile.uid, setLedger);
        const unsubscribeWithdrawals = subscribeWithdrawals(userProfile.uid, setWithdrawals);
        getUserPapers(userProfile.uid).then((papers) => setApprovedPapers(papers.filter((paper) => paper.status === 'approved').length)).catch(() => undefined);
        return () => {
            unsubscribeWallet();
            unsubscribeLedger();
            unsubscribeWithdrawals();
        };
    }, [userProfile?.uid]);

    const progress = Math.min(100, (wallet.available / MIN_WITHDRAWAL_COINS) * 100);
    const papersToMinimum = Math.max(0, Math.ceil((MIN_WITHDRAWAL_COINS - wallet.available) / 100));
    const accountCreated = currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).getTime() : Date.now();
    const handleVerifyEmail = async () => {
        if (!currentUser) return;
        setEmailVerifying(true);
        try {
            const { sendEmailVerification } = await import('firebase/auth');
            await sendEmailVerification(currentUser);
            toast.success('Verification email sent! Check your inbox.');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send verification email.');
        } finally {
            setEmailVerifying(false);
        }
    };

    const handleVerifyPhone = () => {
        setVerifyingPhoneModalOpen(true);
    };

    const eligibility = [
        { label: '1,000 available coins', met: wallet.available >= 1_000 },
        { label: 'Verified email', met: Boolean(currentUser?.emailVerified), action: { label: 'Verify', onClick: handleVerifyEmail, loading: emailVerifying } },
        { label: 'Verified phone', met: Boolean(currentUser?.phoneNumber || (userProfile as unknown as { phoneNumber?: string })?.phoneNumber), action: { label: 'Verify', onClick: handleVerifyPhone, loading: false } },
        { label: 'Account at least 7 days old', met: Date.now() - accountCreated >= 7 * 24 * 60 * 60 * 1_000 },
        { label: '10 approved papers', met: approvedPapers >= 10 },
        { label: 'Wallet active', met: wallet.status === 'active' },
    ];
    const eligible = eligibility.every((item) => item.met);
    const openWithdrawal = useMemo(() => withdrawals.find((item) => item.status === 'requested' || item.status === 'approved'), [withdrawals]);

    return (
        <div className="mx-auto max-w-5xl space-y-6 pb-12 lg:space-y-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-700"><Coins className="h-4 w-4" /> Real reward wallet</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Earnings &amp; withdrawals</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Upload genuine question papers, pass review, and earn coins for manual gift-card redemption.</p>
                </div>
                <Link to="/dashboard/upload" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800">
                    <Upload className="h-4 w-4" /> Upload &amp; earn
                </Link>
            </header>

            <section className="relative overflow-hidden rounded-[28px] bg-[#081126] p-6 text-white shadow-2xl shadow-slate-900/15 sm:p-8">
                <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
                <div className="relative grid gap-7 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Available balance</p>
                        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
                            <span className="text-4xl font-black tabular-nums sm:text-6xl">{loading ? '—' : wallet.available.toLocaleString('en-IN')}</span>
                            <span className="pb-1 text-lg font-bold text-amber-300">coins</span>
                            <span className="pb-1 text-base font-semibold text-slate-400">≈ {money(wallet.available)}</span>
                        </div>
                        <div className="mt-6 max-w-xl">
                            <div className="flex justify-between text-xs font-bold">
                                <span>{Math.round(progress)}% to ₹10 minimum</span>
                                <span className="text-amber-300">1,000 coins</span>
                            </div>
                            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 shadow-[0_0_14px_rgba(245,185,61,.55)]" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="mt-3 text-sm text-slate-400">{wallet.available >= 1_000 ? 'You reached the minimum redemption balance.' : `${Math.max(0, 1_000 - wallet.available)} coins to go — about ${papersToMinimum} more approved paper${papersToMinimum === 1 ? '' : 's'}.`}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs text-slate-400">On hold</p><p className="mt-1 text-xl font-black">{wallet.onHold.toLocaleString('en-IN')}</p></div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs text-slate-400">Lifetime</p><p className="mt-1 text-xl font-black">{wallet.lifetimeEarned.toLocaleString('en-IN')}</p></div>
                        <button
                            type="button"
                            onClick={() => setRedeeming(true)}
                            disabled={!eligible || Boolean(openWithdrawal)}
                            className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 px-5 font-black text-amber-950 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            <WalletCards className="h-5 w-5" /> {openWithdrawal ? 'Withdrawal in progress' : 'Redeem gift card'}
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">⚡</div>
                        <div><h2 className="font-black text-blue-950">XP is for progress</h2><p className="mt-1 text-sm leading-6 text-blue-800">XP has no cash value. Daily tasks, streaks, likes, downloads, levels, and the leaderboard stay separate.</p><Link to="/dashboard/rewards" className="mt-2 inline-flex items-center gap-1 text-sm font-black text-blue-700">View XP rewards <ArrowRight className="h-3.5 w-3.5" /></Link></div>
                    </div>
                </div>
                <div className="rounded-3xl border border-amber-200 bg-[#fff8e8] p-5">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-amber-950"><Coins className="h-5 w-5" /></div>
                        <div><h2 className="font-black text-[#4a3406]">Coins are real rewards</h2><p className="mt-1 text-sm leading-6 text-amber-900">Only approved registered-user uploads earn coins. The fixed launch rate is 100 coins = ₹1 and one standard approval earns 100 coins.</p></div>
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <div><h2 className="font-black text-slate-950">Redemption eligibility</h2><p className="text-sm text-slate-500">All safeguards must be complete before coins can leave your wallet.</p></div>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {eligibility.map((item) => (
                        <div key={item.label} className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold ${item.met ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                            {item.met ? <Check className="h-4 w-4 shrink-0" /> : <LockKeyhole className="h-4 w-4 shrink-0" />}
                            <span className="flex-1">{item.label}</span>
                            {!item.met && item.action && (
                                <button 
                                    type="button" 
                                    onClick={item.action.onClick} 
                                    disabled={item.action.loading}
                                    className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                                >
                                    {item.action.loading ? 'Sending...' : item.action.label}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {withdrawals.length > 0 && (
                <section>
                    <div className="mb-4 flex items-center gap-2"><Gift className="h-5 w-5 text-amber-600" /><h2 className="text-xl font-black text-slate-950">Gift-card requests</h2></div>
                    <div className="space-y-4">{withdrawals.map((item) => <WithdrawalCard key={item.id} item={item} />)}</div>
                </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2"><History className="h-5 w-5 text-slate-600" /><h2 className="text-xl font-black text-slate-950">Coin ledger</h2></div>
                <p className="mt-1 text-sm text-slate-500">Every credit, hold, reversal, refund, and bonus is permanently recorded.</p>
                <div className="mt-5 divide-y divide-slate-100">
                    {ledger.length === 0 ? (
                        <div className="py-10 text-center text-sm text-slate-400">Your first approved paper will create your wallet and ledger.</div>
                    ) : ledger.slice(0, 30).map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3 py-3.5">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${entry.delta > 0 ? 'bg-amber-100 text-amber-700' : entry.delta < 0 ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}><Coins className="h-4 w-4" /></span>
                            <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{LEDGER_LABELS[entry.type]}</p><p className="mt-0.5 truncate text-xs text-slate-400">{entry.note || dateTime(entry.createdAt)}</p></div>
                            <div className="text-right"><p className={`font-black tabular-nums ${entry.delta > 0 ? 'text-amber-700' : entry.delta < 0 ? 'text-slate-700' : 'text-emerald-700'}`}>{entry.delta > 0 ? '+' : ''}{entry.delta}</p><p className="text-[10px] text-slate-400">balance {entry.balanceAfter}</p></div>
                        </div>
                    ))}
                </div>
            </section>

            {wallet.status !== 'active' && (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p className="text-sm"><strong>Wallet {wallet.status}.</strong> {wallet.frozenReason || 'Contact support for a manual review.'}</p>
                </div>
            )}

            {redeeming && <RedemptionModal wallet={wallet} onClose={() => setRedeeming(false)} />}
            {verifyingPhoneModalOpen && <PhoneVerificationModal onClose={() => setVerifyingPhoneModalOpen(false)} />}
        </div>
    );
}
