import { getFunctions, httpsCallable } from 'firebase/functions';
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    type Timestamp,
    where,
} from 'firebase/firestore';
import app from './firebase';
import { db } from './firebaseDb';

export const COINS_PER_RUPEE = 100;
export const MIN_WITHDRAWAL_COINS = 1_000;
export const WITHDRAWAL_OPTIONS = [1_000, 2_500, 5_000, 10_000] as const;

export type GiftCardBrand = 'amazon' | 'flipkart';
export type WithdrawalStatus = 'requested' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled' | 'replaced';

export interface Wallet {
    available: number;
    onHold: number;
    lifetimeEarned: number;
    lifetimeWithdrawn: number;
    dailyEarnedCoins: number;
    dailyEarnedDate?: string;
    yearEarnedCoins: number;
    yearKey?: string;
    status: 'active' | 'review' | 'frozen';
    frozenReason?: string;
}

export interface CoinLedgerEntry {
    id: string;
    userId: string;
    delta: number;
    balanceAfter: number;
    type: 'paper_approved' | 'paper_revoked' | 'withdrawal_hold' | 'withdrawal_settled' | 'withdrawal_refund' | 'admin_adjust' | 'fraud_clawback' | 'bonus';
    refType: 'paper' | 'withdrawal' | 'manual';
    refId: string;
    note?: string;
    createdAt?: Timestamp;
}

export interface Withdrawal {
    id: string;
    userId: string;
    userName?: string;
    email?: string;
    college?: string;
    course?: string;
    semester?: string;
    coins: number;
    amountInr: number;
    brand: GiftCardBrand;
    status: WithdrawalStatus;
    requestedAt?: Timestamp;
    slaDueAt?: Timestamp;
    cancelUntil?: Timestamp;
    approvedAt?: Timestamp;
    fulfilledAt?: Timestamp;
    slaBreached?: boolean;
    breachBonusCoins?: number;
    maskedCode?: string;
    rejectReason?: string;
    riskScore?: number;
    riskFlags?: string[];
    approvedPaperCount?: number;
}

export interface VoucherReveal {
    code: string;
    pin?: string;
    expiresAt?: string | null;
}

const functions = getFunctions(app);

function call<TInput, TOutput>(name: string, payload: TInput): Promise<TOutput> {
    return httpsCallable<TInput, TOutput>(functions, name)(payload).then((result) => result.data);
}

export function subscribeWallet(userId: string, callback: (wallet: Wallet) => void): () => void {
    return onSnapshot(doc(db, 'wallets', userId), (snapshot) => {
        const data = snapshot.data();
        callback({
            available: Number(data?.available ?? 0),
            onHold: Number(data?.onHold ?? 0),
            lifetimeEarned: Number(data?.lifetimeEarned ?? 0),
            lifetimeWithdrawn: Number(data?.lifetimeWithdrawn ?? 0),
            dailyEarnedCoins: Number(data?.dailyEarnedCoins ?? 0),
            dailyEarnedDate: data?.dailyEarnedDate,
            yearEarnedCoins: Number(data?.yearEarnedCoins ?? 0),
            yearKey: data?.yearKey,
            status: data?.status ?? 'active',
            frozenReason: data?.frozenReason,
        });
    });
}

export function subscribeLedger(userId: string, callback: (entries: CoinLedgerEntry[]) => void): () => void {
    const ledgerQuery = query(
        collection(db, 'coinLedger'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(ledgerQuery, (snapshot) => {
        callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as CoinLedgerEntry)));
    });
}

export function subscribeWithdrawals(userId: string, callback: (items: Withdrawal[]) => void): () => void {
    const withdrawalsQuery = query(
        collection(db, 'withdrawals'),
        where('userId', '==', userId),
        orderBy('requestedAt', 'desc')
    );
    return onSnapshot(withdrawalsQuery, (snapshot) => {
        callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Withdrawal)));
    });
}

export function subscribeAdminWithdrawals(callback: (items: Withdrawal[]) => void): () => void {
    const withdrawalsQuery = query(collection(db, 'withdrawals'), orderBy('slaDueAt', 'asc'));
    return onSnapshot(withdrawalsQuery, (snapshot) => {
        callback(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() } as Withdrawal)));
    });
}

export const approvePaperWithCoins = (paperId: string) =>
    call<{ paperId: string }, { award: number; reason: string; alreadyProcessed: boolean }>('approvePaperWithCoins', { paperId });

export const rejectPaperReview = (paperId: string, reason = 'Does not meet review requirements') =>
    call<{ paperId: string; reason: string }, { success: boolean }>('rejectPaperReview', { paperId, reason });

export const requestWithdrawal = (coins: number, brand: GiftCardBrand, acceptedOwnership: boolean, deviceId: string) =>
    call<{ coins: number; brand: GiftCardBrand; acceptedOwnership: boolean; deviceId: string }, { withdrawalId: string; slaDueAt: number }>(
        'requestWithdrawal',
        { coins, brand, acceptedOwnership, deviceId }
    );

export const cancelWithdrawal = (withdrawalId: string) =>
    call<{ withdrawalId: string }, { success: boolean }>('cancelWithdrawal', { withdrawalId });

export const approveWithdrawal = (withdrawalId: string) =>
    call<{ withdrawalId: string }, { success: boolean }>('approveWithdrawal', { withdrawalId });

export const rejectWithdrawal = (withdrawalId: string, reason: string) =>
    call<{ withdrawalId: string; reason: string }, { success: boolean }>('rejectWithdrawal', { withdrawalId, reason });

export const fulfilWithdrawal = (
    withdrawalId: string,
    code: string,
    pin: string,
    expiresAt: string,
    verified: boolean
) => call<{ withdrawalId: string; code: string; pin: string; expiresAt: string; verified: boolean }, { success: boolean }>(
    'fulfilWithdrawal',
    { withdrawalId, code, pin, expiresAt, verified }
);

export const revealVoucher = (withdrawalId: string) =>
    call<{ withdrawalId: string }, VoucherReveal>('revealVoucher', { withdrawalId });

export const reportVoucherIssue = (
    withdrawalId: string,
    issueType: 'already_redeemed' | 'invalid_code' | 'region_error' | 'expired',
    note: string
) => call<{ withdrawalId: string; issueType: string; note: string }, { success: boolean; issueId: string }>(
    'reportVoucherIssue',
    { withdrawalId, issueType, note }
);
