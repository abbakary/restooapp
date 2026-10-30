import React, { useEffect, useMemo, useState } from 'react';
import {
  Menu, Search, Bell, Building2, ChevronDown, Check, Lock, Wifi, WifiOff, ChevronRight,
  ChefHat, Boxes, Truck, ShieldAlert, Users, LogOut, Repeat,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';
import { NAV_GROUPS, canAccess, getNavItem, landingTabForRole } from '../../config/navigation';
import { Avatar } from '../common/Avatar';
import { useOutsideClose } from '../common/useOutsideClose';
import { useToast } from '../common/Toast';
import { PwaInstallButton } from '../common/PwaInstallPrompt';

interface ErpHeaderProps {
  isTerminal: boolean;
  onOpenQuickModal?: (type: string) => void;
}

const ALL_ROLES: UserRole[] = ['Owner', 'Area Mgr', 'Site Mgr', 'Cashier', 'Waiter', 'Chef', 'Storekeeper', 'Finance'];

const useNow = (everyMs = 30000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(t);
  }, [everyMs]);
  return now;
};

type Menu_ = null | 'site' | 'alerts' | 'user';

export const ErpHeader: React.FC<ErpHeaderProps> = ({ isTerminal }) => {
  const {
    currentSite, setCurrentSite, sites, currentRole, setCurrentRole, currentUser, logout,
    activeTab, setActiveTab, setSidebarDrawerOpen, sidebarCollapsed, setSidebarCollapsed,
    setCommandPaletteOpen, isOffline, toggleOffline, dayStatus,
    orders, inventory, purchaseOrders, employees,
  } = useErp();
  const toast = useToast();
  const now = useNow();
  const [open, setOpen] = useState<Menu_>(null);
  const wrapRef = useOutsideClose<HTMLDivElement>(open !== null, () => setOpen(null));

  const page = getNavItem(activeTab);
  const group = NAV_GROUPS.find(g => g.id === page?.group);

  /* ── Alerts, derived live from shared state ── */
  const alerts = useMemo(() => {
    const list: { id: string; tab: string; tone: string; icon: React.ReactNode; title: string; sub: string }[] = [];
    const siteOrders = orders.filter(o => o.siteId === currentSite.id);
    const ready = siteOrders.filter(o => o.status === 'ready');
    if (ready.length) list.push({
      id: 'ready', tab: 'waiter', tone: 'bg-amber-100 text-amber-700', icon: <ChefHat className="w-5 h-5" />,
      title: `${ready.length} order${ready.length > 1 ? 's' : ''} ready at the pass`,
      sub: ready.map(o => o.tableNumber ? `Table ${o.tableNumber}` : o.orderNumber).slice(0, 3).join(' · '),
    });
    const low = inventory.filter(i => i.status === 'Critical' || i.status === 'Low Stock');
    if (low.length) list.push({
      id: 'low', tab: 'inventory', tone: 'bg-rose-100 text-rose-700', icon: <Boxes className="w-5 h-5" />,
      title: `${low.length} item${low.length > 1 ? 's' : ''} below par level`,
      sub: low.slice(0, 2).map(i => i.name).join(', ') + (low.length > 2 ? '…' : ''),
    });
    const po = purchaseOrders.filter(p => p.status === 'Submitted');
    if (po.length) list.push({
      id: 'po', tab: 'procurement', tone: 'bg-sky-100 text-sky-700', icon: <Truck className="w-5 h-5" />,
      title: `${po.length} purchase order${po.length > 1 ? 's' : ''} awaiting approval`,
      sub: po.slice(0, 2).map(p => p.poNumber).join(', '),
    });
    const certs = employees.filter(e => e.siteId === currentSite.id && e.certStatus && e.certStatus !== 'Valid');
    if (certs.length) list.push({
      id: 'certs', tab: 'staff', tone: 'bg-violet-100 text-violet-700', icon: <ShieldAlert className="w-5 h-5" />,
      title: `${certs.length} health certificate${certs.length > 1 ? 's' : ''} need attention`,
      sub: certs.slice(0, 2).map(e => e.name).join(', '),
    });
    return list.filter(a => canAccess(getNavItem(a.tab), currentRole));
  }, [orders, inventory, purchaseOrders, employees, currentSite.id, currentRole]);

  const onMenuButton = () => {
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    if (desktop && !isTerminal) setSidebarCollapsed(!sidebarCollapsed);
    else setSidebarDrawerOpen(true);
  };

  const switchRole = (r: UserRole) => {
    setCurrentRole(r);
    setOpen(null);
    if (!canAccess(getNavItem(activeTab), r)) {
      setActiveTab(landingTabForRole(r));
      toast.info(`Viewing as ${r}`, 'Moved you to a screen this role can use.');
    } else {
      toast.info(`Viewing as ${r}`);
    }
  };

  const dayTone = dayStatus === 'OPEN'
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : dayStatus === 'CLOSING' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200';
  const dayDot = dayStatus === 'OPEN' ? 'bg-emerald-500' : dayStatus === 'CLOSING' ? 'bg-amber-500' : 'bg-slate-400';

  return (
    <header className="shrink-0 z-30 h-14 sm:h-16 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-5 flex items-center gap-2 sm:gap-3">
      {/* Left: menu + brand + breadcrumb */}
      <button
        onClick={onMenuButton}
        aria-label="Toggle navigation"
        className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
      >
        <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
      </button>

      <div className="hidden sm:flex lg:hidden w-8 h-8 rounded-lg bg-brand-800 text-white font-display font-extrabold flex items-center justify-center shrink-0">R</div>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 leading-tight pr-1">
        <div className="hidden sm:flex items-center gap-1 text-2xs sm:text-xs text-slate-500 font-medium">
          <span>RestoERP</span>
          {group && <><ChevronRight className="w-3 h-3" /><span>{group.label}</span></>}
        </div>
        <h1 className="text-sm sm:text-base lg:text-lg font-black whitespace-nowrap text-slate-900 tracking-tight truncate">
          {page?.label || 'RestoERP'}
        </h1>
      </nav>

      {/* Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="hidden md:flex items-center gap-3 h-10 w-48 2xl:w-64 shrink-0 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-xs sm:text-sm text-slate-500 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left truncate">Search…</span>
        <kbd className="text-2xs font-semibold bg-white border border-slate-200 rounded px-1 py-0.5 text-slate-500">Ctrl K</kbd>
      </button>
      <button
        onClick={() => setCommandPaletteOpen(true)}
        aria-label="Search"
        className="md:hidden w-9 h-9 shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95"
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Right cluster */}
      <div ref={wrapRef} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Clock + day state */}
        <div className="hidden 2xl:flex flex-col items-end leading-tight pr-1">
          <span className="text-base font-bold text-slate-900 tabular">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-xs text-slate-500">{now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
        <span className={`hidden 2xl:inline-flex items-center gap-2 h-8 px-2.5 rounded-full border text-xs font-bold ${dayTone}`} title="Trading day status">
          <span className={`w-2 h-2 rounded-full ${dayDot} ${dayStatus === 'OPEN' ? 'animate-pulse' : ''}`} />
          Day {dayStatus.toLowerCase()}
        </span>

        {/* Online / offline */}
        <button
          onClick={() => { toggleOffline(); toast[isOffline ? 'success' : 'warning'](isOffline ? 'Back online' : 'Offline mode', isOffline ? 'Syncing queued orders…' : 'Orders are queued and will sync when you reconnect.'); }}
          className={`hidden sm:inline-flex items-center gap-2 h-8 px-2.5 rounded-full border text-xs font-bold transition-colors ${isOffline ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
          aria-pressed={isOffline}
          title={isOffline ? 'Offline – click to reconnect' : 'Connected – click to simulate offline'}
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
          <span className="hidden 2xl:inline">{isOffline ? 'Offline' : 'Synced'}</span>
        </button>

        {/* PWA Install Button */}
        <PwaInstallButton label="Install App" variant="header" />

        {/* Alerts */}
        <div className="relative">
          <button
            onClick={() => setOpen(open === 'alerts' ? null : 'alerts')}
            aria-label={`Notifications (${alerts.length})`}
            aria-expanded={open === 'alerts'}
            className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4.5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-4.5 text-center ring-2 ring-white">
                {alerts.length}
              </span>
            )}
          </button>
          {open === 'alerts' && (
            <div className="absolute right-0 mt-2 w-[22rem] max-w-[92vw] rounded-2xl bg-white border border-slate-200 shadow-[var(--shadow-pop)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">Needs attention</span>
                <span className="text-xs font-semibold text-slate-500">{alerts.length} open</span>
              </div>
              {alerts.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3"><Check className="w-6 h-6" /></div>
                  <p className="text-sm font-bold text-slate-900">All clear</p>
                  <p className="text-xs text-slate-500 mt-0.5">Nothing needs your attention right now.</p>
                </div>
              ) : (
                <ul className="max-h-96 overflow-y-auto scrollbar-thin p-2">
                  {alerts.map(a => (
                    <li key={a.id}>
                      <button
                        onClick={() => { setActiveTab(a.tab); setOpen(null); }}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 text-left transition-colors"
                      >
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.tone}`}>{a.icon}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-900 leading-snug">{a.title}</span>
                          <span className="block text-xs text-slate-500 truncate">{a.sub}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Branch */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setOpen(open === 'site' ? null : 'site')}
            aria-expanded={open === 'site'}
            className="flex items-center gap-2.5 h-11 pl-3 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors max-w-[15rem]"
          >
            <Building2 className="w-5 h-5 text-brand-500 shrink-0" />
            <span className="min-w-0 text-left leading-tight hidden 2xl:block">
              <span className="block text-[11px] text-slate-500 font-semibold uppercase tracking-wide">Branch</span>
              <span className="block text-sm font-bold text-slate-900 truncate">{currentSite.name.replace(/\s*\(.*\)/, '')}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
          {open === 'site' && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-[var(--shadow-pop)] p-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="px-3 pt-2 pb-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-slate-400">Operating branch</div>
              {sites.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setCurrentSite(s); setOpen(null); toast.success(`Now operating ${s.name}`); }}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left transition-colors ${currentSite.id === s.id ? 'bg-brand-50' : 'hover:bg-slate-50'}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${currentSite.id === s.id ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Building2 className="w-5 h-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900 truncate">{s.name}</span>
                    <span className="block text-xs text-slate-500">{s.city} · {s.type}</span>
                  </span>
                  {currentSite.id === s.id && <Check className="w-5 h-5 text-brand-500 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setOpen(open === 'user' ? null : 'user')}
            aria-expanded={open === 'user'}
            aria-label="Account menu"
            className="flex items-center gap-2.5 h-11 pl-1.5 pr-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <Avatar name={currentUser?.name || currentRole} src={currentUser?.avatarUrl} size={34} rounded="rounded-lg" />
            <span className="hidden md:block min-w-0 text-left leading-tight">
              <span className="block text-sm font-bold text-slate-900 truncate max-w-[8rem]">{currentUser?.name?.split(' ')[0] || 'Staff'}</span>
              <span className="block text-xs text-brand-700 font-semibold">{currentRole}</span>
            </span>
            <ChevronDown className="hidden md:block w-4 h-4 text-slate-400 shrink-0" />
          </button>
          {open === 'user' && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-[var(--shadow-pop)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
              <div className="flex items-center gap-3 p-4 bg-slate-50 border-b border-slate-100">
                <Avatar name={currentUser?.name || currentRole} src={currentUser?.avatarUrl} size={48} />
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 truncate">{currentUser?.name || 'Signed-in staff'}</div>
                  <div className="text-xs text-slate-500 truncate">{currentUser?.email}</div>
                  <div className="text-xs font-semibold text-brand-700 mt-0.5">{currentRole} · {currentSite.city}</div>
                </div>
              </div>
              <div className="p-2">
                <div className="px-3 pt-2 pb-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-slate-400 flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5" /> View as (demo persona)
                </div>
                <div className="grid grid-cols-2 gap-1.5 px-1 pb-2">
                  {ALL_ROLES.map(r => (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold text-left flex items-center justify-between transition-colors ${currentRole === r ? 'bg-brand-800 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                    >
                      {r}
                      {currentRole === r && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setOpen(null); setActiveTab('staff'); }}
                  disabled={!canAccess(getNavItem('staff'), currentRole)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Users className="w-5 h-5 text-slate-500" /> Staff & rostering
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-sm font-bold text-rose-700"
                >
                  <Lock className="w-5 h-5" /> Lock terminal
                  <LogOut className="w-4 h-4 ml-auto opacity-60" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
