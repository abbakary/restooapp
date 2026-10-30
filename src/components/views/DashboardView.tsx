import React, { useMemo } from 'react';
import {
  TrendingUp, Users, DollarSign, AlertTriangle, Clock, Flame, Package, ShoppingBag,
  ChevronRight, ArrowUpRight, Building2, CheckCircle2, UtensilsCrossed, Bike, Store, Wine,
  ClipboardCheck, Inbox,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Avatar } from '../common/Avatar';

interface DashboardViewProps {
  onOpenQuickModal: (type: string) => void;
}

const fmt = (n: number) => Math.round(n).toLocaleString();
const compact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : `${Math.round(n)}`;

/** createdAt is stored as a locale time string ("12:20 PM" or "12:20"). */
const parseHour = (t?: string): number | null => {
  const m = t?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h;
};

const hourLabel = (h: number) => (h === 0 ? '12a' : h < 12 ? `${h}a` : h === 12 ? '12p' : `${h - 12}p`);

const servicePhase = (h: number) => {
  if (h < 10) return { name: 'Prep & opening', tip: 'Complete opening checks and confirm deliveries.' };
  if (h < 15) return { name: 'Lunch service', tip: 'Log the HACCP temperature check before 2:00 PM.' };
  if (h < 18) return { name: 'Afternoon reset', tip: 'Restock stations and review waste before dinner.' };
  if (h < 23) return { name: 'Dinner service', tip: 'Watch the pass — peak covers expected now.' };
  return { name: 'Closing', tip: 'Run closing checklists, then the Z-report.' };
};

const CHANNELS = [
  { key: 'Dine-in', icon: UtensilsCrossed, bar: 'bg-brand-400', soft: 'bg-brand-50 text-brand-700' },
  { key: 'Takeaway', icon: Store, bar: 'bg-amber-400', soft: 'bg-amber-50 text-amber-700' },
  { key: 'Delivery', icon: Bike, bar: 'bg-sky-400', soft: 'bg-sky-50 text-sky-700' },
  { key: 'Bar Tab', icon: Wine, bar: 'bg-violet-400', soft: 'bg-violet-50 text-violet-700' },
] as const;

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`surface ${className}`}>{children}</section>
);

const CardHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
    <div className="min-w-0">
      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h2>
      {sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenQuickModal }) => {
  const {
    currentSite, setCurrentSite, sites, orders, inventory, purchaseOrders, dayStatus, employees,
    setActiveTab, currentRole, currentUser, checklists,
  } = useErp();

  const now = new Date();
  const phase = servicePhase(now.getHours());
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const d = useMemo(() => {
    const siteOrders = orders.filter(o => o.siteId === currentSite.id);
    const live = siteOrders.filter(o => o.status !== 'voided');
    const paid = siteOrders.filter(o => o.status === 'paid');
    const active = siteOrders.filter(o => o.status === 'in_kitchen' || o.status === 'ready');
    const open = live.filter(o => o.status !== 'paid');

    const settled = paid.reduce((s, o) => s + o.subtotal - o.discount, 0);
    const onOpenChecks = open.reduce((s, o) => s + o.total, 0);
    const booked = live.reduce((s, o) => s + o.total, 0);
    const target = currentSite.dailySalesTarget || 0;
    const targetPct = target > 0 ? Math.min(100, Math.round((settled / target) * 100)) : 0;
    const bookedPct = target > 0 ? Math.min(100, Math.round((booked / target) * 100)) : 0;

    const covers = live.reduce((s, o) => s + o.guestCount, 0);
    const avgCheck = covers > 0 ? booked / covers : 0;

    // Sales by hour (all non-void orders, bucketed by the hour they were fired)
    const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8am → 11pm
    const byHour = hours.map(h => ({
      h,
      total: live.filter(o => parseHour(o.createdAt) === h).reduce((s, o) => s + o.total, 0),
      count: live.filter(o => parseHour(o.createdAt) === h).length,
    }));
    const peak = byHour.reduce((a, b) => (b.total > a.total ? b : a), byHour[0]);

    // Channel mix
    const mix = CHANNELS.map(c => {
      const list = live.filter(o => o.type === c.key);
      return { ...c, count: list.length, total: list.reduce((s, o) => s + o.total, 0) };
    });

    // Labour: only meaningful once there is revenue to divide by
    const siteStaff = employees.filter(e => e.siteId === currentSite.id);
    const clocked = siteStaff.filter(e => e.clockedIn);
    const burn = clocked.reduce((s, e) => s + e.hourlyRate, 0);
    // Planned labour: a full 8h shift of everyone clocked in, as a share of the daily sales TARGET (stable all day)
    const labourPct = target > 0 && burn > 0 ? ((burn * 8) / target) * 100 : null;

    return { siteOrders, live, paid, active, settled, onOpenChecks, booked, target, targetPct, bookedPct, covers, avgCheck, byHour, peak, mix, siteStaff, clocked, burn, labourPct,
      cooking: active.filter(o => o.status === 'in_kitchen').length, ready: active.filter(o => o.status === 'ready').length };
  }, [orders, currentSite, employees]);

  const criticalInventory = inventory.filter(i => i.status === 'Critical' || i.status === 'Low Stock');
  const pendingApprovals = purchaseOrders.filter(p => p.status === 'Submitted');
  const openChecklist = checklists.filter(c => !c.completed).length;
  const inboxCount = pendingApprovals.length + criticalInventory.length + (openChecklist > 0 ? 1 : 0);

  const isHq = currentRole === 'Owner' || currentRole === 'Area Mgr';
  const branchRows = useMemo(() => {
    if (!isHq) return [];
    return sites.filter(s => s.dailySalesTarget > 0).map(s => {
      const so = orders.filter(o => o.siteId === s.id && o.status !== 'voided');
      const booked = so.reduce((x, o) => x + o.total, 0);
      return {
        site: s, booked,
        pct: Math.min(100, Math.round((booked / s.dailySalesTarget) * 100)),
        active: so.filter(o => o.status === 'in_kitchen' || o.status === 'ready').length,
        covers: so.reduce((x, o) => x + o.guestCount, 0),
      };
    }).sort((a, b) => b.booked - a.booked);
  }, [isHq, sites, orders]);

  const maxHour = Math.max(1, ...d.byHour.map(b => b.total));
  const totalMix = Math.max(1, d.mix.reduce((s, m) => s + m.total, 0));

  const kpis = [
    {
      label: 'Net sales (settled)', icon: DollarSign, tone: 'bg-brand-50 text-brand-700',
      value: `TZS ${fmt(d.settled)}`,
      foot: (
        <>
          <div className="flex justify-between text-sm text-slate-500 mb-1.5">
            <span>Target {compact(d.target)}</span>
            <span className="font-bold text-brand-700 tabular">{d.targetPct}%</span>
          </div>
          <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={d.targetPct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to daily target">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand-200 transition-all duration-700" style={{ width: `${d.bookedPct}%` }} />
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${d.targetPct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {d.onOpenChecks > 0 ? <>+ <b className="text-slate-700">TZS {fmt(d.onOpenChecks)}</b> on open checks</> : 'No open checks'}
          </p>
        </>
      ),
    },
    {
      label: 'Guest covers', icon: Users, tone: 'bg-sky-50 text-sky-700',
      value: <>{d.covers} <span className="text-base font-semibold text-slate-500">guests</span></>,
      foot: (
        <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
          <span className="text-slate-500">Avg spend / guest</span>
          <span className="font-bold text-slate-900 tabular">TZS {fmt(d.avgCheck)}</span>
        </div>
      ),
    },
    {
      label: 'Kitchen load', icon: Flame, tone: 'bg-amber-50 text-amber-700',
      value: <>{d.active.length} <span className="text-base font-semibold text-slate-500">live tickets</span></>,
      foot: (
        <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
          <span className="text-slate-500">{d.cooking} cooking</span>
          <span className={`font-bold ${d.ready > 0 ? 'text-amber-700' : 'text-slate-500'}`}>{d.ready} ready at pass</span>
        </div>
      ),
    },
    {
      label: 'Labour vs target', icon: TrendingUp, tone: 'bg-violet-50 text-violet-700',
      value: d.labourPct === null ? '—' : `${d.labourPct.toFixed(1)}%`,
      foot: (
        <div className="flex items-center justify-between text-sm pt-3 border-t border-slate-100">
          <span className="text-slate-500">{d.labourPct === null ? 'No target set' : d.labourPct <= 28 ? 'Within limit' : 'Above limit'}</span>
          <span className="font-bold text-slate-900 tabular">≤ 28% · {d.clocked.length} on shift</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white p-6 sm:p-8 shadow-lg">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-brand-400/15 blur-2xl pointer-events-none" />
        <div className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm text-brand-100/90 font-medium">
              <span>{now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span className="opacity-50">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dayStatus === 'OPEN' ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
                Day {dayStatus.toLowerCase()}
              </span>
              <span className="opacity-50">•</span>
              <span>{phase.name}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
              {greeting}, {currentUser?.name?.split(' ')[0] || currentRole}
            </h1>
            <p className="mt-2 text-base text-brand-100/90 flex flex-wrap items-center gap-x-2 gap-y-1">
              <Building2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold text-white">{currentSite.name}</span>
              <span className="opacity-60">· {currentSite.city}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => onOpenQuickModal('new_order')} className="inline-flex items-center gap-2.5 h-12 px-5 rounded-xl bg-white text-brand-800 font-bold text-sm hover:bg-brand-50 shadow-md transition-colors">
              <ShoppingBag className="w-5 h-5" /> Take order
            </button>
            <button onClick={() => onOpenQuickModal('receive_goods')} className="inline-flex items-center gap-2.5 h-12 px-5 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-white/20 font-semibold text-sm transition-colors">
              <Package className="w-5 h-5" /> Receive PO
            </button>
            <button onClick={() => onOpenQuickModal('log_waste')} className="inline-flex items-center gap-2.5 h-12 px-5 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-white/20 font-semibold text-sm transition-colors">
              <AlertTriangle className="w-5 h-5 text-amber-300" /> Log waste
            </button>
            <button onClick={() => onOpenQuickModal('day_close')} className="inline-flex items-center gap-2.5 h-12 px-5 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 ring-1 ring-white/10 font-semibold text-sm transition-colors">
              <Clock className="w-5 h-5 text-brand-300" /> Day-end close
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-4">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-5 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{k.label}</span>
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.tone}`}><Icon className="w-5 h-5" /></span>
              </div>
              <div className="mt-3 mb-4 text-3xl font-extrabold text-slate-900 tracking-tight tabular leading-none">{k.value}</div>
              <div className="mt-auto">{k.foot}</div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <Card className="2xl:col-span-2">
          <CardHeader
            title="Sales by hour"
            sub={d.peak.total > 0 ? `Peak at ${hourLabel(d.peak.h)} · TZS ${fmt(d.peak.total)} from ${d.peak.count} order${d.peak.count > 1 ? 's' : ''}` : 'Orders will appear here as they are fired'}
            action={<span className="text-sm font-bold text-slate-900 tabular shrink-0">TZS {fmt(d.booked)}</span>}
          />
          <div className="px-6 pb-6">
            {d.booked === 0 ? (
              <div className="h-52 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-500">
                <TrendingUp className="w-8 h-8 mb-2 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No sales yet today</p>
                <p className="text-sm">Take the first order to start the chart.</p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 sm:gap-2 h-52" role="img" aria-label="Bar chart of sales by hour">
                {d.byHour.map(b => (
                  <div key={b.h} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group relative">
                    <div className="absolute -top-1 -translate-y-full z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap rounded-lg bg-slate-900 text-white text-xs font-semibold px-2.5 py-1.5 shadow-lg">
                      {hourLabel(b.h)} · TZS {fmt(b.total)}
                    </div>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${b.h === d.peak.h && b.total > 0 ? 'bg-brand-500' : b.total > 0 ? 'bg-brand-300 group-hover:bg-brand-400' : 'bg-slate-100'}`}
                      style={{ height: `${b.total > 0 ? Math.max(6, (b.total / maxHour) * 100) : 3}%` }}
                    />
                    <span className="text-xs text-slate-500 tabular">{hourLabel(b.h)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Order channels" sub="Share of today’s sales" />
          <div className="px-6 pb-6 space-y-4">
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
              {d.mix.filter(m => m.total > 0).map(m => (
                <div key={m.key} className={`${m.bar} transition-all duration-500`} style={{ width: `${(m.total / totalMix) * 100}%` }} title={m.key} />
              ))}
            </div>
            <ul className="space-y-3">
              {d.mix.map(m => {
                const Icon = m.icon;
                return (
                  <li key={m.key} className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.soft}`}><Icon className="w-5 h-5" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900">{m.key}</div>
                      <div className="text-xs text-slate-500">{m.count} order{m.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 tabular">TZS {fmt(m.total)}</div>
                      <div className="text-xs text-slate-500 tabular">{m.total > 0 ? Math.round((m.total / totalMix) * 100) : 0}%</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>

      {/* HQ: branch leaderboard */}
      {isHq && branchRows.length > 1 && (
        <Card>
          <CardHeader title="Branch performance" sub="Booked sales vs. daily target across the group" />
          <div className="px-6 pb-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {branchRows.map((r, i) => {
              const current = r.site.id === currentSite.id;
              return (
                <button
                  key={r.site.id}
                  onClick={() => setCurrentSite(r.site)}
                  className={`text-left rounded-2xl border p-4 transition-all hover:shadow-md ${current ? 'border-brand-300 bg-brand-50/60 ring-1 ring-brand-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  aria-label={`Switch to ${r.site.name}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                        <span className="text-sm font-bold text-slate-900 truncate">{r.site.name.replace(/\s*\(.*\)/, '')}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 ml-8">{r.site.city} · {r.active} live · {r.covers} covers</div>
                    </div>
                    {current && <span className="text-2xs font-bold uppercase tracking-wide text-brand-700 bg-brand-100 rounded-full px-2 py-1 shrink-0">Viewing</span>}
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-xl font-extrabold text-slate-900 tabular">TZS {compact(r.booked)}</span>
                    <span className="text-sm font-bold text-brand-700 tabular">{r.pct}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${r.pct}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5">of TZS {compact(r.site.dailySalesTarget)} target</div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Live tickets + inbox */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <Card className="2xl:col-span-2 overflow-hidden">
          <CardHeader
            title="Live service tickets"
            sub="Currently cooking or waiting at the pass"
            action={
              <button onClick={() => setActiveTab('pos')} className="text-sm font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 shrink-0">
                Open floor <ChevronRight className="w-4 h-4" />
              </button>
            }
          />
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {d.active.length === 0 ? (
              <div className="py-14 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3"><CheckCircle2 className="w-7 h-7" /></div>
                <p className="text-base font-bold text-slate-800">Kitchen is clear</p>
                <p className="text-sm text-slate-500">No active tickets right now.</p>
              </div>
            ) : d.active.map(order => (
              <div key={order.id} className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-extrabold text-slate-900">{order.tableNumber ? `Table ${order.tableNumber}` : order.type}</span>
                    <span className="text-sm text-slate-500">{order.orderNumber}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {order.status === 'ready' ? 'Ready to pass' : 'In kitchen'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{order.items.map(it => `${it.quantity}× ${it.name}`).join(' · ')}</p>
                  <p className="text-xs text-slate-500 mt-1">{order.serverName} · {order.guestCount} guest{order.guestCount !== 1 ? 's' : ''} · fired {order.createdAt}</p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className="text-base font-extrabold text-slate-900 tabular">TZS {fmt(order.total)}</span>
                  <button onClick={() => setActiveTab('kds')} className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors">
                    View on KDS <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Task inbox"
              action={<span className={`text-xs font-bold rounded-full px-2.5 py-1 ${inboxCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{inboxCount > 0 ? `${inboxCount} pending` : 'All clear'}</span>}
            />
            <div className="px-5 pb-5 space-y-3">
              {inboxCount === 0 && (
                <div className="py-6 text-center text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">Nothing waiting on you.</p>
                </div>
              )}
              {pendingApprovals.map(po => (
                <div key={po.id} className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-sm font-bold text-amber-900">PO approval required</div>
                  <div className="text-sm text-amber-800 mt-0.5">{po.poNumber} · {po.supplierName}</div>
                  <div className="text-sm font-bold text-amber-900 mt-0.5 tabular">TZS {fmt(po.totalAmount)}</div>
                  <button onClick={() => setActiveTab('procurement')} className="mt-3 h-10 px-4 text-sm font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-colors">Review & approve</button>
                </div>
              ))}
              {criticalInventory.slice(0, 2).map(inv => (
                <div key={inv.id} className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-rose-900">Below reorder point</span>
                    <span className="text-sm font-extrabold text-rose-700 tabular">{inv.currentStock} {inv.unit}</span>
                  </div>
                  <div className="text-sm text-rose-800 mt-0.5">{inv.name} — reorder at {inv.reorderPoint} {inv.unit}.</div>
                  <button onClick={() => setActiveTab('inventory')} className="mt-3 h-10 px-4 text-sm font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-xl transition-colors">View stock</button>
                </div>
              ))}
              {criticalInventory.length > 2 && (
                <button onClick={() => setActiveTab('inventory')} className="text-sm font-bold text-rose-700 hover:underline">+{criticalInventory.length - 2} more items low</button>
              )}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900"><ClipboardCheck className="w-4 h-4 text-slate-500" /> {phase.name}</div>
                <div className="text-sm text-slate-600 mt-1">{phase.tip}{openChecklist > 0 && <> <b className="text-slate-800">{openChecklist} checklist task{openChecklist > 1 ? 's' : ''}</b> still open.</>}</div>
                <button onClick={() => setActiveTab('checklists')} className="mt-3 h-10 px-4 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors">Open checklists</button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="On shift" sub={`${d.clocked.length} of ${d.siteStaff.length} clocked in at this branch`} />
            <ul className="px-5 pb-5 space-y-1">
              {[...d.siteStaff].sort((a, b) => Number(b.clockedIn) - Number(a.clockedIn)).slice(0, 6).map(emp => (
                <li key={emp.id} className="flex items-center gap-3 py-2">
                  <Avatar name={emp.name} src={emp.avatarUrl} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 truncate">{emp.name}</div>
                    <div className="text-xs text-slate-500">{emp.role}</div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full tabular ${emp.clockedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {emp.clockedIn ? `Since ${emp.clockInTime}` : 'Off duty'}
                  </span>
                </li>
              ))}
              {d.siteStaff.length === 0 && <li className="text-sm text-slate-500 py-4 text-center">No staff assigned to this branch.</li>}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};
