import React from 'react';
import { ChevronsLeft, ChevronsRight, Lock, X } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Avatar } from '../common/Avatar';
import { NAV_GROUPS, NAV_ITEMS, canAccess, NavItem } from '../../config/navigation';

interface ErpSidebarProps {
  isDrawer?: boolean;
  onClose?: () => void;
  /** Icon-only rail (desktop). Ignored in drawer mode. */
  collapsed?: boolean;
  /** Rail is forced (full-screen terminals): the footer button opens the full drawer instead of toggling. */
  lockedRail?: boolean;
  onOpenDrawer?: () => void;
}

const BADGE_TONES: Record<string, string> = {
  pos: 'bg-brand-400 text-white',
  waiter: 'bg-amber-400 text-slate-950',
  'cashier-tracking': 'bg-brand-400 text-white',
  kds: 'bg-amber-500 text-slate-950',
  inventory: 'bg-rose-500 text-white',
  procurement: 'bg-sky-500 text-white',
  'central-kitchen': 'bg-violet-500 text-white',
};

export const ErpSidebar: React.FC<ErpSidebarProps> = ({ isDrawer, onClose, collapsed, lockedRail, onOpenDrawer }) => {
  const {
    activeTab, setActiveTab, orders, inventory, purchaseOrders, productionOrders,
    currentRole, currentUser, currentSite, setSidebarCollapsed,
  } = useErp();

  const rail = !!collapsed && !isDrawer;

  const badges: Record<string, number | undefined> = {
    pos: orders.filter(o => o.status === 'in_kitchen' || o.status === 'ready').length || undefined,
    waiter: orders.filter(o => o.status === 'ready' || o.items.some(i => i.status === 'ready')).length || undefined,
    'cashier-tracking': orders.filter(o => o.status === 'ready' || o.status === 'served').length || undefined,
    kds: orders.filter(o => o.status === 'in_kitchen' || o.status === 'ready').length || undefined,
    inventory: inventory.filter(i => i.status === 'Critical' || i.status === 'Low Stock').length || undefined,
    procurement: purchaseOrders.filter(p => p.status === 'Submitted').length || undefined,
    'central-kitchen': productionOrders.filter(p => p.status === 'Planned' || p.status === 'In Production').length || undefined,
  };

  const go = (item: NavItem) => {
    setActiveTab(item.id);
    onClose?.();
  };

  return (
    <aside
      aria-label="Main navigation"
      className={`${rail ? 'w-[84px]' : 'w-[19.5rem] max-w-[88vw]'} h-full shrink-0 flex flex-col text-white
        bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 border-r border-black/10
        transition-[width] duration-200 ease-out ${isDrawer ? 'shadow-2xl' : ''}`}
    >
      {/* Brand */}
      <div className={`shrink-0 h-[72px] flex items-center ${rail ? 'justify-center' : 'justify-between px-5'} border-b border-white/10`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-400 text-white font-display font-extrabold text-lg flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
            R
          </div>
          {!rail && (
            <div className="min-w-0">
              <div className="font-display font-extrabold text-lg leading-tight tracking-tight">RestoERP</div>
              <div className="text-xs text-brand-200/80 truncate leading-tight">{currentSite.name}</div>
            </div>
          )}
        </div>
        {isDrawer && onClose && (
          <button onClick={onClose} aria-label="Close navigation" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin py-3 px-3">
        {NAV_GROUPS.map(group => {
          // Strictly show only modules authorized for the current user role
          const items = NAV_ITEMS.filter(n => n.group === group.id && canAccess(n, currentRole));
          // If no modules in this group are accessible to this role, do not render the group
          if (items.length === 0) return null;

          return (
            <div key={group.id} className="mb-3">
              {rail ? (
                <div className="mx-3 my-2 h-px bg-white/10" />
              ) : (
                <div className="px-3 pt-2 pb-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-brand-200/60">
                  {group.label}
                </div>
              )}
              <ul className="space-y-1">
                {items.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  const badge = badges[item.id];
                  return (
                    <li key={item.id} className="relative group/nav">
                      <button
                        onClick={() => go(item)}
                        aria-current={active ? 'page' : undefined}
                        aria-label={rail ? item.label : undefined}
                        title={rail ? item.label : item.description}
                        className={`w-full flex items-center gap-3 rounded-xl transition-all
                          ${rail ? 'justify-center h-12' : 'px-3 py-2.5'}
                          ${active
                            ? 'bg-brand-400 text-white shadow-lg shadow-black/20 ring-1 ring-white/20'
                            : 'text-brand-50/90 hover:bg-white/10 hover:text-white'}`}
                      >
                        <span className="relative shrink-0">
                          <Icon className="w-[22px] h-[22px]" />
                          {rail && badge !== undefined && (
                            <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[11px] leading-[18px] font-bold text-center ring-2 ring-brand-800">
                              {badge}
                            </span>
                          )}
                        </span>

                        {!rail && (
                          <>
                            <span className="flex-1 min-w-0 text-left">
                              <span className="block line-clamp-2 text-sm font-semibold leading-tight">{item.label}</span>
                              {active && <span className="block truncate text-xs text-white/80 leading-tight mt-0.5">{item.description}</span>}
                            </span>
                            {badge !== undefined && (
                              <span className={`shrink-0 min-w-[24px] h-6 px-1.5 rounded-full text-xs font-bold leading-6 text-center tabular
                                ${active ? 'bg-white text-brand-800' : BADGE_TONES[item.id] || 'bg-white/15 text-white'}`}>
                                {badge}
                              </span>
                            )}
                          </>
                        )}
                      </button>

                      {/* Rail tooltip */}
                      {rail && (
                        <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 text-white text-sm font-semibold px-3 py-1.5 shadow-xl opacity-0 group-hover/nav:opacity-100 transition-opacity">
                          {item.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Footer: user + collapse */}
      <div className="shrink-0 border-t border-white/10 bg-black/15 p-3">
        <div className={`flex items-center ${rail ? 'justify-center' : 'gap-3 px-1'}`}>
          <div className="relative shrink-0">
            <Avatar name={currentUser?.name || currentRole} src={currentUser?.avatarUrl} size={40} className="ring-2 ring-white/20" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-brand-800" title="Clocked in" />
          </div>
          {!rail && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate leading-tight">{currentUser?.name || 'Signed-in staff'}</div>
              <div className="text-xs text-brand-200/80 truncate leading-tight">{currentRole} · {currentSite.city}</div>
            </div>
          )}
        </div>
        {!isDrawer && (
          <button
            onClick={() => (lockedRail ? onOpenDrawer?.() : setSidebarCollapsed(!collapsed))}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={lockedRail ? 'Open full menu' : undefined}
            className={`mt-3 w-full flex items-center ${rail ? 'justify-center' : 'gap-2 px-3'} h-10 rounded-xl text-sm font-semibold text-brand-100/80 hover:bg-white/10 hover:text-white transition-colors`}
          >
            {collapsed ? <ChevronsRight className="w-5 h-5" /> : <><ChevronsLeft className="w-5 h-5" /><span>Collapse</span></>}
          </button>
        )}
      </div>
    </aside>
  );
};
