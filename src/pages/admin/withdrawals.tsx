import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  PanelLeft,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  approveWithdrawal,
  fulfilWithdrawal,
  rejectWithdrawal,
  subscribeAdminWithdrawals,
  type Withdrawal,
} from '../../services/coins';

type QueueFilter = 'open' | 'breached' | 'fulfilled' | 'all';

function timestampMs(value?: { toMillis?: () => number }): number {
  return value?.toMillis?.() ?? 0;
}

function formatTimeLeft(dueAt?: { toMillis?: () => number }): { label: string; breached: boolean; hours: number } {
  const difference = timestampMs(dueAt) - Date.now();
  const breached = difference <= 0;
  const absolute = Math.abs(difference);
  const hours = absolute / 3_600_000;
  const wholeHours = Math.floor(hours);
  const minutes = Math.max(0, Math.floor((absolute % 3_600_000) / 60_000));
  return {
    label: breached ? `Overdue by ${wholeHours}h ${minutes}m` : `${wholeHours}h ${minutes}m remaining`,
    breached,
    hours,
  };
}

function statusStyle(status: Withdrawal['status']): string {
  if (status === 'fulfilled') return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (status === 'rejected' || status === 'cancelled') return 'bg-slate-100 text-slate-600 ring-slate-200';
  if (status === 'approved') return 'bg-blue-50 text-blue-700 ring-blue-200';
  return 'bg-amber-50 text-amber-800 ring-amber-200';
}

const AdminWithdrawals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<QueueFilter>('open');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Withdrawal | null>(null);
  const [busyAction, setBusyAction] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [verified, setVerified] = useState(false);
  const [, setClock] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeAdminWithdrawals((withdrawals) => {
      setItems(withdrawals);
      setSelected((current) => current
        ? withdrawals.find((entry) => entry.id === current.id) ?? current
        : null);
      setLoading(false);
    });
    const interval = window.setInterval(() => setClock((value) => value + 1), 30_000);
    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, []);

  const openItems = items.filter((item) => item.status === 'requested' || item.status === 'approved');
  const stats = {
    totalOpen: openItems.length,
    breached: openItems.filter((item) => formatTimeLeft(item.slaDueAt).breached).length,
    dueFourHours: openItems.filter((item) => {
      const time = formatTimeLeft(item.slaDueAt);
      return !time.breached && time.hours <= 4;
    }).length,
    fulfilled: items.filter((item) => item.status === 'fulfilled').length,
  };

  const displayed = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !query || [
        item.userName,
        item.email,
        item.id,
        item.brand,
      ].some((value) => value?.toLowerCase().includes(query));

      if (!matchesSearch) return false;
      if (filter === 'all') return true;
      if (filter === 'fulfilled') return item.status === 'fulfilled';
      if (filter === 'breached') {
        return (item.status === 'requested' || item.status === 'approved') && formatTimeLeft(item.slaDueAt).breached;
      }
      return item.status === 'requested' || item.status === 'approved';
    });
  }, [filter, items, search]);

  const runAction = async (name: string, action: () => Promise<unknown>, success: string) => {
    setBusyAction(name);
    try {
      await action();
      toast.success(success);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Action failed');
    } finally {
      setBusyAction('');
    }
  };

  const handleApprove = (item: Withdrawal) => runAction(
    `approve-${item.id}`,
    () => approveWithdrawal(item.id),
    'Withdrawal approved'
  );

  const handleReject = () => {
    if (!selected || rejectReason.trim().length < 8) {
      toast.error('Add a clear rejection reason (at least 8 characters).');
      return;
    }
    void runAction(
      `reject-${selected.id}`,
      () => rejectWithdrawal(selected.id, rejectReason.trim()),
      'Withdrawal rejected and coins refunded'
    ).then(() => setRejectReason(''));
  };

  const handleFulfil = () => {
    if (!selected || !verified || code.trim().length < 6) {
      toast.error('Enter the gift-card code and complete the verification check.');
      return;
    }
    void runAction(
      `fulfil-${selected.id}`,
      () => fulfilWithdrawal(selected.id, code.trim(), pin.trim(), expiresAt, verified),
      'Gift card delivered and withdrawal fulfilled'
    ).then(() => {
      setCode('');
      setPin('');
      setExpiresAt('');
      setVerified(false);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <button
        className="fixed left-4 top-4 z-30 rounded-xl border border-slate-200 bg-white p-2.5 shadow-lg md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open admin menu"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      <div className="flex min-h-screen">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1 p-4 pt-20 md:p-8">
          <div className="mx-auto max-w-7xl">
            <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Manual fulfilment · 24-hour promise
                </div>
                <h1 className="text-3xl font-black tracking-tight">Gift-card fulfilment</h1>
                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                  Review each withdrawal, purchase the exact voucher, verify it, and deliver it before the SLA expires.
                </p>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student, email, or request"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </header>

            <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Open queue', value: stats.totalOpen, icon: Clock3, tone: 'text-blue-700 bg-blue-50 border-blue-100' },
                { label: 'SLA breached', value: stats.breached, icon: AlertTriangle, tone: 'text-red-700 bg-red-50 border-red-100' },
                { label: 'Due in 4 hours', value: stats.dueFourHours, icon: RefreshCw, tone: 'text-amber-800 bg-amber-50 border-amber-100' },
                { label: 'Fulfilled', value: stats.fulfilled, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
              ].map((stat) => (
                <article key={stat.label} className={`rounded-2xl border p-4 ${stat.tone}`}>
                  <stat.icon className="mb-4 h-5 w-5" />
                  <p className="text-3xl font-black">{loading ? '—' : stat.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider opacity-70">{stat.label}</p>
                </article>
              ))}
            </section>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {(['open', 'breached', 'fulfilled', 'all'] as QueueFilter[]).map((value) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
                    filter === value ? 'bg-slate-950 text-white shadow' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden grid-cols-[1.4fr_.7fr_.7fr_.8fr] gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 sm:grid">
                  <span>Student</span><span>Reward</span><span>Status</span><span>SLA</span>
                </div>
                {loading ? (
                  <div className="p-12 text-center text-sm text-slate-500">Loading secure queue…</div>
                ) : displayed.length === 0 ? (
                  <div className="p-12 text-center">
                    <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-500" />
                    <p className="font-bold">Nothing needs attention here.</p>
                    <p className="mt-1 text-sm text-slate-500">The selected queue is clear.</p>
                  </div>
                ) : displayed.map((item) => {
                  const time = formatTimeLeft(item.slaDueAt);
                  const isSelected = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelected(item)}
                      className={`grid w-full gap-3 border-b border-slate-100 px-5 py-4 text-left transition last:border-0 sm:grid-cols-[1.4fr_.7fr_.7fr_.8fr] sm:items-center ${
                        isSelected ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-extrabold">{item.userName || 'Student'}</span>
                        <span className="block truncate text-xs text-slate-500">{item.email || item.id}</span>
                      </span>
                      <span>
                        <span className="block text-sm font-black">₹{item.amountInr}</span>
                        <span className="text-[11px] font-bold uppercase text-slate-400">{item.brand}</span>
                      </span>
                      <span className={`w-max rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ring-1 ${statusStyle(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`text-xs font-bold ${time.breached && (item.status === 'requested' || item.status === 'approved') ? 'text-red-600' : 'text-slate-500'}`}>
                        {item.status === 'requested' || item.status === 'approved' ? time.label : 'Closed'}
                      </span>
                    </button>
                  );
                })}
              </section>

              <aside className="h-max rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-6">
                {!selected ? (
                  <div className="py-16 text-center">
                    <CreditCard className="mx-auto mb-3 h-9 w-9 text-slate-300" />
                    <p className="font-bold text-slate-700">Select a withdrawal</p>
                    <p className="mt-1 text-sm text-slate-400">The fulfilment checklist will appear here.</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Request details</p>
                        <h2 className="mt-1 text-xl font-black">{selected.userName || 'Student'}</h2>
                        <p className="text-sm text-slate-500">{selected.email}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ring-1 ${statusStyle(selected.status)}`}>
                        {selected.status}
                      </span>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Amount</p>
                        <p className="mt-1 text-xl font-black">₹{selected.amountInr}</p>
                        <p className="text-xs text-slate-500">{selected.coins.toLocaleString('en-IN')} coins</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gift card</p>
                        <p className="mt-1 text-lg font-black capitalize">{selected.brand}</p>
                        <p className="text-xs text-slate-500">India denomination</p>
                      </div>
                    </div>

                    {(selected.status === 'requested' || selected.status === 'approved') && (
                      <div className={`mb-5 rounded-xl border p-3 ${
                        formatTimeLeft(selected.slaDueAt).breached ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'
                      }`}>
                        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                          <Clock3 className="h-4 w-4" /> Delivery deadline
                        </p>
                        <p className="mt-1 text-lg font-black">{formatTimeLeft(selected.slaDueAt).label}</p>
                        {selected.slaBreached && <p className="mt-1 text-xs">The 100-coin apology credit has been issued automatically.</p>}
                      </div>
                    )}

                    {selected.status === 'requested' && (
                      <button
                        onClick={() => void handleApprove(selected)}
                        disabled={busyAction === `approve-${selected.id}`}
                        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {busyAction === `approve-${selected.id}` ? 'Approving…' : 'Approve after fraud check'}
                      </button>
                    )}

                    {selected.status === 'approved' && (
                      <div className="mb-5 space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <div>
                          <p className="font-black">Secure delivery checklist</p>
                          <p className="text-xs text-slate-500">Paste only after checking the brand, value, and unused status.</p>
                        </div>
                        <label className="block text-xs font-bold text-slate-600">
                          Gift-card code
                          <input
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                            autoComplete="off"
                            className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-xs font-bold text-slate-600">
                            PIN (optional)
                            <input
                              value={pin}
                              onChange={(event) => setPin(event.target.value)}
                              autoComplete="off"
                              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-400"
                            />
                          </label>
                          <label className="text-xs font-bold text-slate-600">
                            Expiry (optional)
                            <input
                              type="date"
                              value={expiresAt}
                              onChange={(event) => setExpiresAt(event.target.value)}
                              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                            />
                          </label>
                        </div>
                        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                          <input
                            type="checkbox"
                            checked={verified}
                            onChange={(event) => setVerified(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
                          />
                          <span className="text-xs leading-relaxed text-slate-600">
                            I verified this unused code matches <strong>{selected.brand}</strong> and exactly <strong>₹{selected.amountInr}</strong>.
                          </span>
                        </label>
                        <button
                          onClick={handleFulfil}
                          disabled={!verified || code.trim().length < 6 || busyAction === `fulfil-${selected.id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {busyAction === `fulfil-${selected.id}` ? 'Encrypting & delivering…' : 'Fulfil and notify student'}
                        </button>
                      </div>
                    )}

                    {(selected.status === 'requested' || selected.status === 'approved') && (
                      <div className="border-t border-slate-100 pt-4">
                        <label className="text-xs font-bold text-slate-600">
                          Rejection reason
                          <textarea
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            rows={2}
                            placeholder="Explain the policy or verification issue"
                            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50"
                          />
                        </label>
                        <button
                          onClick={handleReject}
                          disabled={rejectReason.trim().length < 8 || busyAction === `reject-${selected.id}`}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:opacity-40"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject and refund coins
                        </button>
                      </div>
                    )}

                    {selected.riskFlags && selected.riskFlags.length > 0 && (
                      <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-black uppercase tracking-wider text-red-700">Risk flags · score {selected.riskScore ?? 0}</p>
                        <ul className="mt-2 space-y-1 text-xs text-red-700">
                          {selected.riskFlags.map((flag) => <li key={flag}>• {flag}</li>)}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <Coins className="h-3.5 w-3.5" />
                      Request {selected.id}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminWithdrawals;
