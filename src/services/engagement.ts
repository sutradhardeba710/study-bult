import { doc, getDoc, updateDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseDb';

// ─── Types ───────────────────────────────────────────────────────────────────
export type TaskId = 'daily_login' | 'upload_paper' | 'like_paper' | 'visit_browse' | 'explore_reward';

export interface DailyTaskDef {
    id: TaskId;
    label: string;
    description: string;
    xp: number;
    icon: string;
}

export const DAILY_TASKS: DailyTaskDef[] = [
    { id: 'daily_login', label: 'Daily Check-In', description: 'Claim your daily login reward', xp: 5, icon: '🗓️' },
    { id: 'upload_paper', label: 'Upload a Paper', description: 'Share a study paper with community', xp: 8, icon: '📤' },
    { id: 'like_paper', label: 'Like a Paper', description: 'Engage with someone\'s paper', xp: 3, icon: '❤️' },
    { id: 'visit_browse', label: 'Browse Papers', description: 'Visit the Browse page today', xp: 2, icon: '🔍' },
    { id: 'explore_reward', label: 'Check Your Progress', description: 'Visit the Rewards page', xp: 2, icon: '🏆' },
];
// Max daily XP from tasks = 20 XP/day
// To reach Legend (2500 XP) via daily tasks alone = 125 days — progression requires real contributions

// ─── Streak Milestone definitions ────────────────────────────────────────────
export const STREAK_MILESTONES = [
    { days: 7, bonus: 50, icon: '🔥', label: '7-Day Streak', desc: 'Logged in 7 days in a row!' },
    { days: 30, bonus: 200, icon: '🦄', label: '30-Day Streak', desc: 'Unstoppable! 30 days straight!' },
] as const;

// ─── Get today's claimed tasks ────────────────────────────────────────────────
export async function getTodayClaimedTasks(uid: string): Promise<TaskId[]> {
    const ref = doc(db, 'users', uid, 'dailyTasks', todayISO());
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    return (snap.data().claimed as TaskId[]) ?? [];
}

// ─── Claim a single daily task ────────────────────────────────────────────────
export async function claimDailyTask(uid: string, taskId: TaskId): Promise<{ success: boolean; xpGained: number }> {
    const today = todayISO();
    const taskRef = doc(db, 'users', uid, 'dailyTasks', today);
    const userRef = doc(db, 'users', uid);

    const snap = await getDoc(taskRef);
    const data = snap.exists() ? snap.data() : {};
    const claimed: TaskId[] = (data.claimed as TaskId[]) ?? [];
    const done: TaskId[] = (data.done as TaskId[]) ?? [];

    // Already claimed
    if (claimed.includes(taskId)) return { success: false, xpGained: 0 };

    // Task not completed yet — block claim (except daily_login which is auto-done on page visit)
    if (taskId !== 'daily_login' && !done.includes(taskId)) {
        return { success: false, xpGained: 0 };
    }

    const task = DAILY_TASKS.find(t => t.id === taskId);
    if (!task) return { success: false, xpGained: 0 };

    // Use merge:true so we preserve the `done` array
    await Promise.all([
        setDoc(taskRef, {
            claimed: [...claimed, taskId],
            date: today,
            updatedAt: serverTimestamp(),
        }, { merge: true }),
        updateDoc(userRef, {
            xp: increment(task.xp),
            updatedAt: serverTimestamp(),
        }),
    ]);

    if (taskId === 'daily_login') {
        await _updateStreak(uid, userRef);
    }

    return { success: true, xpGained: task.xp };
}

// ─── Auto-mark a task as complete (no XP — records action only) ──────────────
export async function markTaskDone(uid: string, taskId: TaskId): Promise<void> {
    const today = todayISO();
    const taskRef = doc(db, 'users', uid, 'dailyTasks', today);
    try {
        const snap = await getDoc(taskRef);
        const existing = snap.exists() ? snap.data() : {};
        const done: TaskId[] = (existing.done as TaskId[]) ?? [];
        if (!done.includes(taskId)) {
            await setDoc(taskRef, {
                ...existing,
                done: [...done, taskId],
                date: today,
                updatedAt: serverTimestamp(),
            }, { merge: true });
        }
    } catch (err) {
        console.warn('[engagement] markTaskDone failed:', err);
    }
}

// ─── Get full daily task state { claimed, done } ─────────────────────────────
export async function getDailyTaskState(uid: string): Promise<{ claimed: TaskId[]; done: TaskId[] }> {
    const ref = doc(db, 'users', uid, 'dailyTasks', todayISO());
    const snap = await getDoc(ref);
    if (!snap.exists()) return { claimed: [], done: [] };
    const data = snap.data();
    return {
        claimed: (data.claimed as TaskId[]) ?? [],
        done: (data.done as TaskId[]) ?? [],
    };
}

// ─── Get unclaimed streak milestones ─────────────────────────────────────────
export async function getUnclaimedStreakMilestones(
    uid: string
): Promise<typeof STREAK_MILESTONES[number][]> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return [];
    const data = snap.data();
    const earned: number[] = (data.streakMilestonesEarned as number[]) ?? [];
    const claimed: number[] = (data.streakMilestonesClaimed as number[]) ?? [];
    return [...STREAK_MILESTONES].filter(m => earned.includes(m.days) && !claimed.includes(m.days));
}

// ─── Get all milestone states for full UI (locked / claimable / claimed) ──────
export async function getStreakMilestoneStates(
    uid: string
): Promise<{ earned: number[]; claimed: number[] }> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { earned: [], claimed: [] };
    const data = snap.data();
    return {
        earned: (data.streakMilestonesEarned as number[]) ?? [],
        claimed: (data.streakMilestonesClaimed as number[]) ?? [],
    };
}

// ─── Claim a streak milestone bonus ──────────────────────────────────────────
export async function claimStreakMilestone(
    uid: string,
    days: number
): Promise<{ success: boolean; xpGained: number }> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { success: false, xpGained: 0 };
    const data = snap.data();
    const earned: number[] = (data.streakMilestonesEarned as number[]) ?? [];
    const claimed: number[] = (data.streakMilestonesClaimed as number[]) ?? [];

    if (!earned.includes(days) || claimed.includes(days)) return { success: false, xpGained: 0 };

    const milestone = STREAK_MILESTONES.find(m => m.days === days);
    if (!milestone) return { success: false, xpGained: 0 };

    await updateDoc(userRef, {
        xp: increment(milestone.bonus),
        streakMilestonesClaimed: [...claimed, days],
        updatedAt: serverTimestamp(),
    });
    return { success: true, xpGained: milestone.bonus };
}

// ─── Legacy: updateStreakAndXP ────────────────────────────────────────────────
export async function updateStreakAndXP(uid: string): Promise<{ streak: number; xp: number }> {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { streak: 0, xp: 0 };
    const data = snap.data();
    return { streak: data.streak ?? 0, xp: data.xp ?? 0 };
}

// ─── Award XP for any action ──────────────────────────────────────────────────
export async function awardXP(uid: string, amount: number): Promise<void> {
    if (!uid || amount <= 0) return;
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { xp: increment(amount), updatedAt: serverTimestamp() });
    } catch (err) {
        console.warn('[engagement] awardXP failed:', err);
    }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
async function _updateStreak(_uid: string, userRef: ReturnType<typeof doc>): Promise<void> {
    const snap = await getDoc(userRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const today = todayISO();
    const lastActive: string | undefined = data.lastActiveDate;
    if (lastActive === today) return;
    const isYesterday = lastActive === yesterdayISO();
    const currentStreak: number = data.streak ?? 0;
    const newStreak = isYesterday ? currentStreak + 1 : 1;

    // Record newly earned milestones — do NOT award XP here (user must claim on Rewards page)
    const alreadyEarned: number[] = (data.streakMilestonesEarned as number[]) ?? [];
    const newlyEarned = STREAK_MILESTONES
        .filter(m => newStreak >= m.days && !alreadyEarned.includes(m.days))
        .map(m => m.days);

    const updates: Record<string, any> = {
        streak: newStreak,
        lastActiveDate: today,
        updatedAt: serverTimestamp(),
    };
    if (newlyEarned.length > 0) {
        updates.streakMilestonesEarned = [...alreadyEarned, ...newlyEarned];
    }

    await updateDoc(userRef, updates);
}

export function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function yesterdayISO(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
}
