import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

const REGION = 'us-central1';
const COINS_PER_RUPEE = 100;
const COINS_PER_APPROVED_PAPER = 100;
const DAILY_COIN_CAP = 1_000;
const YEARLY_COIN_CAP = 200_000;
const DEFAULT_MONTHLY_BUDGET = 500_000;
const SLA_HOURS = 24;
const CANCEL_WINDOW_MINUTES = 30;
const SLA_BREACH_BONUS = 100;
const ALLOWED_WITHDRAWALS = new Set([1_000, 2_500, 5_000, 10_000]);

type WalletStatus = 'active' | 'review' | 'frozen';
type WithdrawalStatus = 'requested' | 'approved' | 'fulfilled' | 'rejected' | 'cancelled';

interface Wallet {
    available: number;
    onHold: number;
    lifetimeEarned: number;
    lifetimeWithdrawn: number;
    dailyEarnedCoins: number;
    dailyEarnedDate: string;
    yearEarnedCoins: number;
    yearKey: string;
    status: WalletStatus;
}

const db = () => admin.firestore();
const serverTime = () => admin.firestore.FieldValue.serverTimestamp();

const REWARD_SECRETS = [
    'VOUCHER_ENCRYPTION_KEY',
    'REWARD_HASH_SALT',
    'EMAIL_PASS',
];

const callable = functions
    .runWith({ secrets: REWARD_SECRETS })
    .region(REGION);

const scheduled = functions
    .runWith({ secrets: REWARD_SECRETS })
    .region(REGION);

function blankWallet(): Wallet {
    return {
        available: 0,
        onHold: 0,
        lifetimeEarned: 0,
        lifetimeWithdrawn: 0,
        dailyEarnedCoins: 0,
        dailyEarnedDate: '',
        yearEarnedCoins: 0,
        yearKey: '',
        status: 'active',
    };
}

function asWallet(data: admin.firestore.DocumentData | undefined): Wallet {
    const empty = blankWallet();
    return {
        available: Number(data?.available ?? empty.available),
        onHold: Number(data?.onHold ?? empty.onHold),
        lifetimeEarned: Number(data?.lifetimeEarned ?? empty.lifetimeEarned),
        lifetimeWithdrawn: Number(data?.lifetimeWithdrawn ?? empty.lifetimeWithdrawn),
        dailyEarnedCoins: Number(data?.dailyEarnedCoins ?? empty.dailyEarnedCoins),
        dailyEarnedDate: String(data?.dailyEarnedDate ?? empty.dailyEarnedDate),
        yearEarnedCoins: Number(data?.yearEarnedCoins ?? empty.yearEarnedCoins),
        yearKey: String(data?.yearKey ?? empty.yearKey),
        status: (data?.status ?? empty.status) as WalletStatus,
    };
}

function istParts(date = new Date()): { date: string; month: string; year: string } {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date);
    const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
    const year = pick('year');
    const month = pick('month');
    const day = pick('day');
    return { date: `${year}-${month}-${day}`, month: `${year}-${month}`, year };
}

async function assertAdmin(context: functions.https.CallableContext): Promise<string> {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in is required.');
    if (context.auth.token.admin === true) return context.auth.uid;
    const profile = await db().collection('users').doc(context.auth.uid).get();
    if (profile.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Administrator access required.');
    }
    return context.auth.uid;
}

function assertUser(context: functions.https.CallableContext): string {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Sign in is required.');
    return context.auth.uid;
}

function publicError(error: unknown): never {
    if (error instanceof functions.https.HttpsError) throw error;
    functions.logger.error('Coin operation failed', error);
    throw new functions.https.HttpsError('internal', 'The reward operation could not be completed.');
}

function hashSignal(value: string): string {
    const salt = process.env.REWARD_HASH_SALT || functions.config().rewards?.hash_salt || 'study-volte';
    return crypto.createHash('sha256').update(`${salt}:${value}`).digest('hex');
}

function encryptionKey(): Buffer {
    const secret = process.env.VOUCHER_ENCRYPTION_KEY || functions.config().rewards?.encryption_key;
    if (!secret || secret.length < 24) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Voucher encryption is not configured. Set VOUCHER_ENCRYPTION_KEY before fulfilment.'
        );
    }
    return crypto.createHash('sha256').update(secret).digest();
}

function encryptVoucher(value: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}

function decryptVoucher(payload: string): string {
    const [ivRaw, tagRaw, encryptedRaw] = payload.split('.');
    if (!ivRaw || !tagRaw || !encryptedRaw) {
        throw new functions.https.HttpsError('data-loss', 'Voucher data is invalid.');
    }
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivRaw, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'));
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedRaw, 'base64url')),
        decipher.final(),
    ]).toString('utf8');
}

function mailTransport() {
    const host = process.env.EMAIL_HOST || functions.config().email?.host;
    const user = process.env.EMAIL_USER || functions.config().email?.user;
    const pass = process.env.EMAIL_PASS || functions.config().email?.pass;
    if (!host || !user || !pass) return null;
    const port = Number(process.env.EMAIL_PORT || functions.config().email?.port || 587);
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function sendMailSafe(to: string, subject: string, html: string): Promise<void> {
    const transport = mailTransport();
    if (!transport || !to) {
        functions.logger.warn('Reward email skipped because SMTP is not configured', { to, subject });
        return;
    }
    try {
        await transport.sendMail({
            from: 'Study Volte Rewards <noreply@study-volte.site>',
            to,
            subject,
            html,
        });
    } catch (error) {
        functions.logger.error('Reward email failed', error);
    }
}

export const approvePaperWithCoins = callable.https.onCall(async (data, context) => {
    const actorUid = await assertAdmin(context);
    const paperId = typeof data?.paperId === 'string' ? data.paperId.trim() : '';
    const note = typeof data?.note === 'string' ? data.note.trim().slice(0, 500) : '';
    if (!paperId) throw new functions.https.HttpsError('invalid-argument', 'paperId is required.');

    try {
        return await db().runTransaction(async (tx) => {
            const paperRef = db().collection('papers').doc(paperId);
            const idempotencyKey = `paper_approved_${paperId}`;
            const idemRef = db().collection('coinIdempotency').doc(idempotencyKey);
            const paperSnap = await tx.get(paperRef);
            const idemSnap = await tx.get(idemRef);
            if (!paperSnap.exists) throw new functions.https.HttpsError('not-found', 'Paper not found.');
            if (idemSnap.exists) {
                const previous = idemSnap.data();
                return {
                    award: Number(previous?.award ?? 0),
                    reason: String(previous?.reason ?? 'already_processed'),
                    alreadyProcessed: true,
                };
            }

            const paper = paperSnap.data() ?? {};
            const userId = String(paper.uploaderId ?? '');
            const walletRef = db().collection('wallets').doc(userId || '_missing');
            const keys = istParts();
            const budgetRef = db().collection('coinBudget').doc(keys.month);
            const walletSnap = await tx.get(walletRef);
            const budgetSnap = await tx.get(budgetRef);
            const userSnap = userId ? await tx.get(db().collection('users').doc(userId)) : null;
            const wallet = asWallet(walletSnap.data());
            const budget = budgetSnap.data() ?? { capCoins: DEFAULT_MONTHLY_BUDGET, spentCoins: 0, closed: false };
            const dailyEarned = wallet.dailyEarnedDate === keys.date ? wallet.dailyEarnedCoins : 0;
            const yearlyEarned = wallet.yearKey === keys.year ? wallet.yearEarnedCoins : 0;
            let award = COINS_PER_APPROVED_PAPER;
            let reason = 'ok';

            if (!userId || !userSnap?.exists || paper.uploaderType === 'guest') {
                award = 0;
                reason = 'guest_or_missing_user';
            } else if (paper.duplicateOf) {
                award = 0;
                reason = 'duplicate';
            } else if (wallet.status !== 'active') {
                award = 0;
                reason = `wallet_${wallet.status}`;
            } else if (dailyEarned >= DAILY_COIN_CAP) {
                award = 0;
                reason = 'daily_cap';
            } else if (yearlyEarned + award > YEARLY_COIN_CAP) {
                award = 0;
                reason = 'yearly_cap';
            } else if (budget.closed === true || Number(budget.spentCoins ?? 0) + award > Number(budget.capCoins ?? DEFAULT_MONTHLY_BUDGET)) {
                award = 0;
                reason = 'budget_exhausted';
            } else {
                award = Math.min(award, DAILY_COIN_CAP - dailyEarned);
            }

            let ledgerId: string | null = null;
            if (award > 0) {
                const ledgerRef = db().collection('coinLedger').doc();
                ledgerId = ledgerRef.id;
                tx.set(ledgerRef, {
                    userId,
                    delta: award,
                    balanceAfter: wallet.available + award,
                    type: 'paper_approved',
                    refType: 'paper',
                    refId: paperId,
                    idempotencyKey,
                    actorUid,
                    note,
                    createdAt: serverTime(),
                });
                tx.set(walletRef, {
                    available: wallet.available + award,
                    onHold: wallet.onHold,
                    lifetimeEarned: wallet.lifetimeEarned + award,
                    lifetimeWithdrawn: wallet.lifetimeWithdrawn,
                    dailyEarnedCoins: dailyEarned + award,
                    dailyEarnedDate: keys.date,
                    yearEarnedCoins: yearlyEarned + award,
                    yearKey: keys.year,
                    status: wallet.status,
                    lastEntryId: ledgerRef.id,
                    updatedAt: serverTime(),
                }, { merge: true });
                tx.set(budgetRef, {
                    capCoins: Number(budget.capCoins ?? DEFAULT_MONTHLY_BUDGET),
                    spentCoins: Number(budget.spentCoins ?? 0) + award,
                    closed: Boolean(budget.closed),
                    updatedAt: serverTime(),
                }, { merge: true });
            }

            tx.set(idemRef, { ledgerId, award, reason, paperId, createdAt: serverTime() });
            tx.update(paperRef, {
                status: 'approved',
                reviewStatus: 'approved',
                coinEligible: award > 0,
                coinAwarded: award,
                coinSkipReason: reason,
                reviewedBy: actorUid,
                reviewedAt: serverTime(),
                updatedAt: serverTime(),
            });
            return { award, reason, alreadyProcessed: false };
        });
    } catch (error) {
        return publicError(error);
    }
});

export const rejectPaperReview = callable.https.onCall(async (data, context) => {
    const actorUid = await assertAdmin(context);
    const paperId = typeof data?.paperId === 'string' ? data.paperId.trim() : '';
    const reason = typeof data?.reason === 'string' ? data.reason.trim().slice(0, 500) : 'Does not meet review requirements';
    if (!paperId) throw new functions.https.HttpsError('invalid-argument', 'paperId is required.');
    await db().collection('papers').doc(paperId).update({
        status: 'rejected',
        reviewStatus: 'rejected',
        coinEligible: false,
        coinAwarded: 0,
        rejectReason: reason,
        reviewedBy: actorUid,
        reviewedAt: serverTime(),
        updatedAt: serverTime(),
    });
    return { success: true };
});

export const revokePaperCoins = callable.https.onCall(async (data, context) => {
    const actorUid = await assertAdmin(context);
    const paperId = typeof data?.paperId === 'string' ? data.paperId.trim() : '';
    const note = typeof data?.note === 'string' ? data.note.trim().slice(0, 500) : 'Paper reward revoked';
    if (!paperId) throw new functions.https.HttpsError('invalid-argument', 'paperId is required.');
    try {
        return await db().runTransaction(async (tx) => {
            const paperRef = db().collection('papers').doc(paperId);
            const idemKey = `paper_revoked_${paperId}`;
            const idemRef = db().collection('coinIdempotency').doc(idemKey);
            const paperSnap = await tx.get(paperRef);
            const idemSnap = await tx.get(idemRef);
            if (!paperSnap.exists) throw new functions.https.HttpsError('not-found', 'Paper not found.');
            if (idemSnap.exists) return { success: true, alreadyProcessed: true, clawedBack: 0 };
            const paper = paperSnap.data() ?? {};
            const userId = String(paper.uploaderId ?? '');
            const amount = Math.max(0, Number(paper.coinAwarded ?? 0));
            const walletRef = db().collection('wallets').doc(userId);
            const wallet = asWallet((await tx.get(walletRef)).data());
            const ledgerRef = db().collection('coinLedger').doc();
            if (amount > 0) {
                tx.set(ledgerRef, {
                    userId,
                    delta: -amount,
                    balanceAfter: wallet.available - amount,
                    type: 'paper_revoked',
                    refType: 'paper',
                    refId: paperId,
                    idempotencyKey: idemKey,
                    actorUid,
                    note,
                    createdAt: serverTime(),
                });
                tx.set(walletRef, {
                    available: wallet.available - amount,
                    lastEntryId: ledgerRef.id,
                    updatedAt: serverTime(),
                }, { merge: true });
            }
            tx.set(idemRef, { ledgerId: amount > 0 ? ledgerRef.id : null, amount, createdAt: serverTime() });
            tx.update(paperRef, {
                status: 'rejected',
                reviewStatus: 'revoked',
                coinEligible: false,
                coinRevoked: amount,
                coinRevokedAt: serverTime(),
                reviewedBy: actorUid,
                updatedAt: serverTime(),
            });
            return { success: true, alreadyProcessed: false, clawedBack: amount };
        });
    } catch (error) {
        return publicError(error);
    }
});

export const requestWithdrawal = callable.https.onCall(async (data, context) => {
    const userId = assertUser(context);
    const coins = Number(data?.coins);
    const brand = data?.brand === 'flipkart' ? 'flipkart' : data?.brand === 'amazon' ? 'amazon' : '';
    if (!ALLOWED_WITHDRAWALS.has(coins)) {
        throw new functions.https.HttpsError('invalid-argument', 'Choose a supported withdrawal amount.');
    }
    if (!brand) throw new functions.https.HttpsError('invalid-argument', 'Choose Amazon or Flipkart.');
    if (brand === 'flipkart' && coins < 10_000) {
        throw new functions.https.HttpsError('failed-precondition', 'Flipkart gift cards start at ₹100.');
    }
    if (data?.acceptedOwnership !== true) {
        throw new functions.https.HttpsError('failed-precondition', 'Confirm that your uploads are your own lawful scans.');
    }

    const authUser = await admin.auth().getUser(userId);
    const userSnap = await db().collection('users').doc(userId).get();
    const user = userSnap.data() ?? {};
    if (!authUser.emailVerified) {
        throw new functions.https.HttpsError('failed-precondition', 'Verify your email before redeeming.');
    }
    if (!authUser.phoneNumber && user.phoneVerified !== true) {
        throw new functions.https.HttpsError('failed-precondition', 'Verify your phone number before redeeming.');
    }
    const accountCreated = new Date(authUser.metadata.creationTime || 0).getTime();
    if (!accountCreated || Date.now() - accountCreated < 7 * 24 * 60 * 60 * 1_000) {
        throw new functions.https.HttpsError('failed-precondition', 'Your account must be at least 7 days old.');
    }
    const approvedPapers = await db().collection('papers')
        .where('uploaderId', '==', userId)
        .where('status', '==', 'approved')
        .get();
    if (approvedPapers.size < 10) {
        throw new functions.https.HttpsError('failed-precondition', 'At least 10 approved papers are required.');
    }

    const month = istParts().month;
    const monthStart = admin.firestore.Timestamp.fromDate(new Date(`${month}-01T00:00:00+05:30`));
    const openSnapshot = await db().collection('withdrawals')
        .where('userId', '==', userId)
        .where('status', 'in', ['requested', 'approved'])
        .get();
    const monthSnapshot = await db().collection('withdrawals')
        .where('userId', '==', userId)
        .where('requestedAt', '>=', monthStart)
        .get();
    const programSnapshot = await db().collection('coinProgram').doc('config').get();
    if (!openSnapshot.empty) {
        throw new functions.https.HttpsError('already-exists', 'You already have a withdrawal in progress.');
    }
    if (monthSnapshot.size >= 2) {
        throw new functions.https.HttpsError('resource-exhausted', 'Maximum two withdrawals per calendar month.');
    }
    const program = programSnapshot.data();
    if (program?.paused === true) {
        throw new functions.https.HttpsError('unavailable', program.pauseMessage || 'Withdrawals are temporarily paused.');
    }

    const withdrawalRef = db().collection('withdrawals').doc();
    const requestedAt = admin.firestore.Timestamp.now();
    const slaDueAt = admin.firestore.Timestamp.fromMillis(requestedAt.toMillis() + SLA_HOURS * 3_600_000);
    const ip = context.rawRequest?.ip || '';
    const device = typeof data?.deviceId === 'string' ? data.deviceId.slice(0, 200) : '';
    const riskFlags: string[] = monthSnapshot.empty ? ['first_withdrawal'] : [];

    try {
        const result = await db().runTransaction(async (tx) => {
            const walletRef = db().collection('wallets').doc(userId);
            const wallet = asWallet((await tx.get(walletRef)).data());
            if (wallet.status !== 'active') {
                throw new functions.https.HttpsError('failed-precondition', `Wallet is ${wallet.status}.`);
            }
            if (wallet.available < coins || wallet.available < 0) {
                throw new functions.https.HttpsError('failed-precondition', 'Insufficient available coins.');
            }
            const ledgerRef = db().collection('coinLedger').doc();
            const idempotencyKey = `withdrawal_hold_${withdrawalRef.id}`;
            tx.set(ledgerRef, {
                userId,
                delta: -coins,
                balanceAfter: wallet.available - coins,
                type: 'withdrawal_hold',
                refType: 'withdrawal',
                refId: withdrawalRef.id,
                idempotencyKey,
                actorUid: userId,
                note: `${brand} ₹${coins / COINS_PER_RUPEE} redemption requested`,
                createdAt: serverTime(),
            });
            tx.set(walletRef, {
                available: wallet.available - coins,
                onHold: wallet.onHold + coins,
                lastEntryId: ledgerRef.id,
                updatedAt: serverTime(),
            }, { merge: true });
            tx.set(db().collection('coinIdempotency').doc(idempotencyKey), {
                ledgerId: ledgerRef.id,
                withdrawalId: withdrawalRef.id,
                createdAt: serverTime(),
            });
            tx.set(withdrawalRef, {
                userId,
                userName: String(user.name ?? authUser.displayName ?? 'Student'),
                email: String(authUser.email ?? user.email ?? ''),
                college: String(user.college ?? ''),
                course: String(user.course ?? ''),
                semester: String(user.semester ?? ''),
                coins,
                amountInr: coins / COINS_PER_RUPEE,
                brand,
                status: 'requested' as WithdrawalStatus,
                requestedAt,
                slaDueAt,
                slaBreached: false,
                riskScore: riskFlags.length ? 10 : 0,
                riskFlags,
                requestIpHash: ip ? hashSignal(ip) : null,
                deviceHash: device ? hashSignal(device) : null,
                approvedPaperCount: approvedPapers.size,
                acceptedOwnership: true,
                cancelUntil: admin.firestore.Timestamp.fromMillis(requestedAt.toMillis() + CANCEL_WINDOW_MINUTES * 60_000),
                createdAt: serverTime(),
                updatedAt: serverTime(),
            });
            return { withdrawalId: withdrawalRef.id, slaDueAt: slaDueAt.toMillis() };
        });

        const adminEmail = process.env.REWARDS_ADMIN_EMAIL || functions.config().rewards?.admin_email;
        await Promise.all([
            sendMailSafe(
                String(authUser.email ?? ''),
                `Your ₹${coins / COINS_PER_RUPEE} gift card request is confirmed`,
                `<p>We received your ${brand} gift-card request.</p><p><strong>Delivery is guaranteed within 24 hours.</strong> We will email the code when it is ready.</p>`
            ),
            sendMailSafe(
                String(adminEmail ?? ''),
                `New withdrawal: ₹${coins / COINS_PER_RUPEE} ${brand}`,
                `<p>${user.name || authUser.email} requested ${coins} coins.</p><p>Due within 24 hours. Withdrawal ID: ${withdrawalRef.id}</p>`
            ),
        ]);
        return result;
    } catch (error) {
        return publicError(error);
    }
});

async function refundWithdrawal(
    withdrawalId: string,
    actorUid: string,
    targetStatus: 'rejected' | 'cancelled',
    reason: string,
    adminAction: boolean
): Promise<{ success: boolean }> {
    try {
        await db().runTransaction(async (tx) => {
            const withdrawalRef = db().collection('withdrawals').doc(withdrawalId);
            const withdrawalSnap = await tx.get(withdrawalRef);
            if (!withdrawalSnap.exists) throw new functions.https.HttpsError('not-found', 'Withdrawal not found.');
            const withdrawal = withdrawalSnap.data() ?? {};
            if (!adminAction && withdrawal.userId !== actorUid) {
                throw new functions.https.HttpsError('permission-denied', 'This withdrawal does not belong to you.');
            }
            if (withdrawal.status !== 'requested') {
                throw new functions.https.HttpsError('failed-precondition', `Withdrawal is already ${withdrawal.status}.`);
            }
            const cancelUntil = withdrawal.cancelUntil as admin.firestore.Timestamp | undefined;
            if (!adminAction && (!cancelUntil || cancelUntil.toMillis() < Date.now())) {
                throw new functions.https.HttpsError('failed-precondition', 'The 30-minute cancellation window has ended.');
            }
            const userId = String(withdrawal.userId);
            const coins = Number(withdrawal.coins);
            const walletRef = db().collection('wallets').doc(userId);
            const wallet = asWallet((await tx.get(walletRef)).data());
            const idemKey = `withdrawal_refund_${withdrawalId}`;
            const idemRef = db().collection('coinIdempotency').doc(idemKey);
            if ((await tx.get(idemRef)).exists) return;
            const ledgerRef = db().collection('coinLedger').doc();
            tx.set(ledgerRef, {
                userId,
                delta: coins,
                balanceAfter: wallet.available + coins,
                type: 'withdrawal_refund',
                refType: 'withdrawal',
                refId: withdrawalId,
                idempotencyKey: idemKey,
                actorUid,
                note: reason,
                createdAt: serverTime(),
            });
            tx.set(walletRef, {
                available: wallet.available + coins,
                onHold: Math.max(0, wallet.onHold - coins),
                lastEntryId: ledgerRef.id,
                updatedAt: serverTime(),
            }, { merge: true });
            tx.set(idemRef, { ledgerId: ledgerRef.id, withdrawalId, createdAt: serverTime() });
            tx.update(withdrawalRef, {
                status: targetStatus as WithdrawalStatus,
                rejectReason: targetStatus === 'rejected' ? reason : null,
                cancelledAt: targetStatus === 'cancelled' ? serverTime() : null,
                decidedAt: serverTime(),
                reviewedBy: adminAction ? actorUid : null,
                updatedAt: serverTime(),
            });
        });
        return { success: true };
    } catch (error) {
        return publicError(error);
    }
}

export const cancelWithdrawal = callable.https.onCall(async (data, context) => {
    const userId = assertUser(context);
    const withdrawalId = typeof data?.withdrawalId === 'string' ? data.withdrawalId.trim() : '';
    if (!withdrawalId) throw new functions.https.HttpsError('invalid-argument', 'withdrawalId is required.');
    return refundWithdrawal(withdrawalId, userId, 'cancelled', 'Cancelled by student within 30 minutes', false);
});

export const approveWithdrawal = callable.https.onCall(async (data, context) => {
    const actorUid = await assertAdmin(context);
    const withdrawalId = typeof data?.withdrawalId === 'string' ? data.withdrawalId.trim() : '';
    if (!withdrawalId) throw new functions.https.HttpsError('invalid-argument', 'withdrawalId is required.');
    const ref = db().collection('withdrawals').doc(withdrawalId);
    await db().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) throw new functions.https.HttpsError('not-found', 'Withdrawal not found.');
        if (snap.data()?.status !== 'requested') {
            throw new functions.https.HttpsError('failed-precondition', `Withdrawal is already ${snap.data()?.status}.`);
        }
        tx.update(ref, {
            status: 'approved' as WithdrawalStatus,
            reviewedBy: actorUid,
            approvedAt: serverTime(),
            updatedAt: serverTime(),
        });
    });
    return { success: true };
});

export const rejectWithdrawal = callable.https.onCall(async (data, context) => {
    const actorUid = await assertAdmin(context);
    const withdrawalId = typeof data?.withdrawalId === 'string' ? data.withdrawalId.trim() : '';
    const reason = typeof data?.reason === 'string' ? data.reason.trim().slice(0, 500) : '';
    if (!withdrawalId || !reason) {
        throw new functions.https.HttpsError('invalid-argument', 'withdrawalId and reason are required.');
    }
    const result = await refundWithdrawal(withdrawalId, actorUid, 'rejected', reason, true);
    const snapshot = await db().collection('withdrawals').doc(withdrawalId).get();
    await sendMailSafe(
        String(snapshot.data()?.email ?? ''),
        'Your gift-card request was refunded',
        `<p>Your request was rejected: ${reason}</p><p>All held coins have been returned to your available balance.</p>`
    );
    return result;
});

export const fulfilWithdrawal = callable.https.onCall(async (data, context) => {
    const actorUid = await assertAdmin(context);
    const withdrawalId = typeof data?.withdrawalId === 'string' ? data.withdrawalId.trim() : '';
    const code = typeof data?.code === 'string' ? data.code.trim() : '';
    const pin = typeof data?.pin === 'string' ? data.pin.trim() : '';
    const expiresAt = typeof data?.expiresAt === 'string' ? data.expiresAt.trim() : '';
    if (!withdrawalId || code.length < 6 || data?.verified !== true) {
        throw new functions.https.HttpsError('invalid-argument', 'A verified voucher code is required.');
    }
    const codeEncrypted = encryptVoucher(code);
    const pinEncrypted = pin ? encryptVoucher(pin) : null;
    let email = '';
    let brand = '';
    let amountInr = 0;

    try {
        await db().runTransaction(async (tx) => {
            const withdrawalRef = db().collection('withdrawals').doc(withdrawalId);
            const withdrawalSnap = await tx.get(withdrawalRef);
            if (!withdrawalSnap.exists) throw new functions.https.HttpsError('not-found', 'Withdrawal not found.');
            const withdrawal = withdrawalSnap.data() ?? {};
            if (!['requested', 'approved'].includes(String(withdrawal.status))) {
                throw new functions.https.HttpsError('failed-precondition', `Withdrawal is already ${withdrawal.status}.`);
            }
            const userId = String(withdrawal.userId);
            const coins = Number(withdrawal.coins);
            const walletRef = db().collection('wallets').doc(userId);
            const wallet = asWallet((await tx.get(walletRef)).data());
            const idemKey = `withdrawal_settled_${withdrawalId}`;
            const idemRef = db().collection('coinIdempotency').doc(idemKey);
            if ((await tx.get(idemRef)).exists) {
                throw new functions.https.HttpsError('already-exists', 'Withdrawal has already been fulfilled.');
            }
            const voucherRef = db().collection('voucherStock').doc();
            const ledgerRef = db().collection('coinLedger').doc();
            const fulfilledAt = admin.firestore.Timestamp.now();
            const requestedAt = withdrawal.requestedAt as admin.firestore.Timestamp | undefined;
            const fulfilmentMinutes = requestedAt
                ? Math.max(0, Math.round((fulfilledAt.toMillis() - requestedAt.toMillis()) / 60_000))
                : null;
            tx.set(voucherRef, {
                brand: withdrawal.brand,
                denomination: withdrawal.amountInr,
                codeEncrypted,
                pinEncrypted,
                expiresAt: expiresAt || null,
                status: 'issued',
                issuedTo: userId,
                issuedFor: withdrawalId,
                issuedBy: actorUid,
                issuedAt: fulfilledAt,
                createdAt: serverTime(),
            });
            tx.set(ledgerRef, {
                userId,
                delta: 0,
                balanceAfter: wallet.available,
                type: 'withdrawal_settled',
                refType: 'withdrawal',
                refId: withdrawalId,
                idempotencyKey: idemKey,
                actorUid,
                note: `${withdrawal.brand} ₹${withdrawal.amountInr} gift card delivered`,
                createdAt: serverTime(),
            });
            tx.set(walletRef, {
                onHold: Math.max(0, wallet.onHold - coins),
                lifetimeWithdrawn: wallet.lifetimeWithdrawn + coins,
                lastEntryId: ledgerRef.id,
                updatedAt: serverTime(),
            }, { merge: true });
            tx.set(idemRef, { ledgerId: ledgerRef.id, voucherId: voucherRef.id, createdAt: serverTime() });
            tx.update(withdrawalRef, {
                status: 'fulfilled' as WithdrawalStatus,
                voucherRef: voucherRef.id,
                maskedCode: `••••${code.slice(-4)}`,
                fulfilledAt,
                fulfilmentMinutes,
                reviewedBy: actorUid,
                updatedAt: serverTime(),
            });
            email = String(withdrawal.email ?? '');
            brand = String(withdrawal.brand ?? '');
            amountInr = Number(withdrawal.amountInr ?? 0);
        });
        await sendMailSafe(
            email,
            `Your ${brand.toUpperCase()} ₹${amountInr} gift card is ready`,
            `<p>Good news! Your ${brand.toUpperCase()} gift card for ₹${amountInr} is ready to be claimed.</p><p>For security, your voucher code is safely stored in your account.</p><p><strong>Please log in to your Study Volte Dashboard and go to the Rewards page to reveal and copy your code.</strong></p>`
        );
        return { success: true };
    } catch (error) {
        return publicError(error);
    }
});

export const revealVoucher = callable.https.onCall(async (data, context) => {
    const userId = assertUser(context);
    const withdrawalId = typeof data?.withdrawalId === 'string' ? data.withdrawalId.trim() : '';
    if (!withdrawalId) throw new functions.https.HttpsError('invalid-argument', 'withdrawalId is required.');
    const withdrawalSnap = await db().collection('withdrawals').doc(withdrawalId).get();
    if (!withdrawalSnap.exists) throw new functions.https.HttpsError('not-found', 'Withdrawal not found.');
    const withdrawal = withdrawalSnap.data() ?? {};
    let adminAccess = false;
    if (withdrawal.userId !== userId) {
        const profile = await db().collection('users').doc(userId).get();
        adminAccess = context.auth?.token.admin === true || profile.data()?.role === 'admin';
        if (!adminAccess) throw new functions.https.HttpsError('permission-denied', 'Voucher access denied.');
    }
    if (!['fulfilled', 'replaced'].includes(String(withdrawal.status))) {
        throw new functions.https.HttpsError('failed-precondition', 'Voucher is not ready.');
    }
    const voucherSnap = await db().collection('voucherStock').doc(String(withdrawal.voucherRef)).get();
    if (!voucherSnap.exists) throw new functions.https.HttpsError('not-found', 'Voucher not found.');
    const voucher = voucherSnap.data() ?? {};
    await db().collection('voucherAccessLog').add({
        withdrawalId,
        voucherId: voucherSnap.id,
        accessedBy: userId,
        adminAccess,
        ipHash: context.rawRequest?.ip ? hashSignal(context.rawRequest.ip) : null,
        createdAt: serverTime(),
    });
    return {
        code: decryptVoucher(String(voucher.codeEncrypted)),
        pin: voucher.pinEncrypted ? decryptVoucher(String(voucher.pinEncrypted)) : '',
        expiresAt: voucher.expiresAt ?? null,
    };
});

export const reportVoucherIssue = callable.https.onCall(async (data, context) => {
    const userId = assertUser(context);
    const withdrawalId = typeof data?.withdrawalId === 'string' ? data.withdrawalId.trim() : '';
    const allowedIssues = ['already_redeemed', 'invalid_code', 'region_error', 'expired'];
    const issueType = allowedIssues.includes(data?.issueType) ? data.issueType : 'invalid_code';
    if (!withdrawalId) throw new functions.https.HttpsError('invalid-argument', 'withdrawalId is required.');
    const withdrawal = await db().collection('withdrawals').doc(withdrawalId).get();
    if (!withdrawal.exists || withdrawal.data()?.userId !== userId || withdrawal.data()?.status !== 'fulfilled') {
        throw new functions.https.HttpsError('failed-precondition', 'This voucher cannot be reported.');
    }
    const fulfilledAt = withdrawal.data()?.fulfilledAt as admin.firestore.Timestamp | undefined;
    if (!fulfilledAt || Date.now() - fulfilledAt.toMillis() > 7 * 24 * 60 * 60 * 1_000) {
        throw new functions.https.HttpsError('failed-precondition', 'The 7-day replacement window has ended.');
    }
    const existing = await db().collection('voucherIssues').where('withdrawalId', '==', withdrawalId).limit(1).get();
    if (!existing.empty) throw new functions.https.HttpsError('already-exists', 'An issue has already been submitted.');
    const issue = await db().collection('voucherIssues').add({
        withdrawalId,
        userId,
        issueType,
        note: typeof data?.note === 'string' ? data.note.trim().slice(0, 500) : '',
        status: 'open',
        createdAt: serverTime(),
    });
    return { success: true, issueId: issue.id };
});

async function applyBreachBonus(withdrawalId: string): Promise<void> {
    await db().runTransaction(async (tx) => {
        const withdrawalRef = db().collection('withdrawals').doc(withdrawalId);
        const withdrawalSnap = await tx.get(withdrawalRef);
        if (!withdrawalSnap.exists || withdrawalSnap.data()?.slaBreached === true) return;
        const userId = String(withdrawalSnap.data()?.userId);
        const idemKey = `sla_breach_${withdrawalId}`;
        const idemRef = db().collection('coinIdempotency').doc(idemKey);
        if ((await tx.get(idemRef)).exists) return;
        const walletRef = db().collection('wallets').doc(userId);
        const wallet = asWallet((await tx.get(walletRef)).data());
        const ledgerRef = db().collection('coinLedger').doc();
        tx.set(ledgerRef, {
            userId,
            delta: SLA_BREACH_BONUS,
            balanceAfter: wallet.available + SLA_BREACH_BONUS,
            type: 'bonus',
            refType: 'withdrawal',
            refId: withdrawalId,
            idempotencyKey: idemKey,
            actorUid: 'system',
            note: '24-hour fulfilment promise missed',
            createdAt: serverTime(),
        });
        tx.set(walletRef, {
            available: wallet.available + SLA_BREACH_BONUS,
            lifetimeEarned: wallet.lifetimeEarned + SLA_BREACH_BONUS,
            lastEntryId: ledgerRef.id,
            updatedAt: serverTime(),
        }, { merge: true });
        tx.set(idemRef, { ledgerId: ledgerRef.id, createdAt: serverTime() });
        tx.update(withdrawalRef, {
            slaBreached: true,
            breachBonusCoins: SLA_BREACH_BONUS,
            updatedAt: serverTime(),
        });
    });
}

export const slaWatch = scheduled.pubsub
    .schedule('every 30 minutes')
    .timeZone('Asia/Kolkata')
    .onRun(async () => {
        const now = admin.firestore.Timestamp.now();
        const open = await db().collection('withdrawals').where('status', 'in', ['requested', 'approved']).get();
        const adminEmail = String(process.env.REWARDS_ADMIN_EMAIL || functions.config().rewards?.admin_email || '');
        for (const docSnap of open.docs) {
            const withdrawal = docSnap.data();
            const due = withdrawal.slaDueAt as admin.firestore.Timestamp | undefined;
            if (!due) continue;
            const hoursLeft = (due.toMillis() - now.toMillis()) / 3_600_000;
            if (hoursLeft <= 0 && withdrawal.slaBreached !== true) {
                await applyBreachBonus(docSnap.id);
                await sendMailSafe(adminEmail, `🔴 SLA BREACHED: ${docSnap.id}`, `<p>Withdrawal ${docSnap.id} has passed its 24-hour deadline.</p>`);
            } else if (hoursLeft <= 4 && withdrawal.warned4h !== true) {
                await docSnap.ref.update({ warned4h: true, updatedAt: serverTime() });
                await sendMailSafe(adminEmail, `🟠 ${Math.max(0, Math.ceil(hoursLeft))} hours left: ${docSnap.id}`, '<p>A withdrawal is approaching its delivery deadline.</p>');
            } else if (hoursLeft <= 12 && withdrawal.warned12h !== true) {
                await docSnap.ref.update({ warned12h: true, updatedAt: serverTime() });
                await sendMailSafe(adminEmail, `🟡 ${Math.ceil(hoursLeft)} hours left: ${docSnap.id}`, '<p>A withdrawal is due within 12 hours.</p>');
            }
        }
        return null;
    });
