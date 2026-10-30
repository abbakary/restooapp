import React, { useMemo } from 'react';
import { Menu, MoreHorizontal, Sparkles } from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { NAV_ITEMS, canAccess, NavItem } from '../../config/navigation';
import { UserRole } from '../../types/erp';

// Priority tabs displayed in bottom nav per role
const ROLE_NAV_PRIORITIES: Record<UserRole, string[]> = {
  Waiter: ['waiter', 'pos', 'customer-portal', 'checklists'],
  Cashier: ['pos', 'cashier-tracking', 'customer-portal', 'checklists'],
  Chef: ['kds', 'menu', 'inventory', 'central-kitchen', 'checklists'],
  Storekeeper: ['inventory', 'procurement', 'central-kitchen', 'checklists'],
  Finance: ['finance', 'commissions', 'cashier-tracking', 'reports'],
  'Site Mgr': ['dashboard', 'pos', 'commissions', 'finance'],
  'Area Mgr': ['dashboard', 'pos', 'commissions', 'finance'],
  Owner: ['dashboard', 'pos', 'commissions', 'finance'],
};

// Attractive color palettes for each user role
interface RoleTheme {
  accent: string;
  glow: string;
  activePill: string;
  activeText: string;
  dot: string;
  badge: string;
}

const ROLE_THEMES: Record<UserRole, RoleTheme> = {
  Waiter: {
    accent: 'purple',
    glow: 'from-purple-600/30 via-indigo-600/20 to-transparent',
    activePill: 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-400/50 shadow-sm shadow-purple-900/40',
    activeText: 'text-purple-300',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]',
    badge: 'bg-purple-500 text-white',
  },
  Cashier: {
    accent: 'emerald',
    glow: 'from-emerald-600/30 via-teal-600/20 to-transparent',
    activePill: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50 shadow-sm shadow-emerald-900/40',
    activeText: 'text-emerald-300',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    badge: 'bg-emerald-500 text-slate-950 font-black',
  },
  Chef: {
    accent: 'amber',
    glow: 'from-amber-600/30 via-orange-600/20 to-transparent',
    activePill: 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50 shadow-sm shadow-amber-900/40',
    activeText: 'text-amber-300',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    badge: 'bg-amber-400 text-slate-950 font-black',
  },
  Storekeeper: {
    accent: 'sky',
    glow: 'from-sky-600/30 via-cyan-600/20 to-transparent',
    activePill: 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/50 shadow-sm shadow-sky-900/40',
    activeText: 'text-sky-300',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
    badge: 'bg-sky-500 text-white',
  },
  Finance: {
    accent: 'teal',
    glow: 'from-teal-600/30 via-emerald-600/20 to-transparent',
    activePill: 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-400/50 shadow-sm shadow-teal-900/40',
    activeText: 'text-teal-300',
    dot: 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]',
    badge: 'bg-teal-500 text-slate-950 font-black',
  },
  'Site Mgr': {
    accent: 'emerald',
    glow: 'from-emerald-600/30 via-brand-600/20 to-transparent',
    activePill: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50 shadow-sm shadow-emerald-900/40',
    activeText: 'text-emerald-300',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    badge: 'bg-emerald-500 text-slate-950 font-black',
  },
  'Area Mgr': {
    accent: 'indigo',
    glow: 'from-indigo-600/30 via-purple-600/20 to-transparent',
    activePill: 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/50 shadow-sm shadow-indigo-900/40',
    activeText: 'text-indigo-300',
    dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]',
    badge: 'bg-indigo-500 text-white',
  },
  Owner: {
    accent: 'emerald',
    glow: 'from-emerald-600/30 via-amber-600/20 to-transparent',
    activePill: 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50 shadow-sm shadow-emerald-900/40',
    activeText: 'text-emerald-300',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    badge: 'bg-emerald-500 text-slate-950 font-black',
  },
};

export const MobileBottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentRole,
    setSidebarDrawerOpen,
    orders,
    inventory,
    purchaseOrders,
    productionOrders,
  } = useErp();

  // Badges calculation
  const badges: Record<string, number | undefined> = {
    pos: orders.filter(o => o.status === 'in_kitchen' || o.status === 'ready').length || undefined,
    waiter: orders.filter(o => o.status === 'ready' || o.items.some(i => i.status === 'ready')).length || undefined,
    'cashier-tracking': orders.filter(o => o.status === 'ready' || o.status === 'served').length || undefined,
    kds: orders.filter(o => o.status === 'in_kitchen' || o.status === 'ready').length || undefined,
    inventory: inventory.filter(i => i.status === 'Critical' || i.status === 'Low Stock').length || undefined,
    procurement: purchaseOrders.filter(p => p.status === 'Submitted').length || undefined,
    'central-kitchen': productionOrders.filter(p => p.status === 'Planned' || p.status === 'In Production').length || undefined,
  };

  const theme = ROLE_THEMES[currentRole] || ROLE_THEMES.Owner;

  // Derive allowed items for this role
  const allowedItems = useMemo(() => {
    return NAV_ITEMS.filter(n => canAccess(n, currentRole));
  }, [currentRole]);

  // Derive the 4-5 items to show in bottom nav
  const { navTabs, hasMore } = useMemo(() => {
    const priorityIds = ROLE_NAV_PRIORITIES[currentRole] || [];
    const prioritized: NavItem[] = [];

    // Add matching priority items
    for (const id of priorityIds) {
      const match = allowedItems.find(item => item.id === id);
      if (match && !prioritized.some(p => p.id === match.id)) {
        prioritized.push(match);
      }
    }

    // Add remaining allowed items up to 4 if fewer than 4 were prioritized
    for (const item of allowedItems) {
      if (prioritized.length >= 4) break;
      if (!prioritized.some(p => p.id === item.id)) {
        prioritized.push(item);
      }
    }

    const moreExists = allowedItems.length > prioritized.length;
    return { navTabs: prioritized, hasMore: moreExists };
  }, [allowedItems, currentRole]);

  // Is active tab in the overflow "more" set?
  const isMoreActive = useMemo(() => {
    return hasMore && !navTabs.some(t => t.id === activeTab);
  }, [hasMore, navTabs, activeTab]);

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.45)] px-1.5 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
    >
      {/* Ambient background glow according to role */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${theme.glow} pointer-events-none`}
      />

      <div className="max-w-md mx-auto flex items-center justify-around gap-1 relative">
        {navTabs.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = badges[item.id];

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive ? theme.activePill : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                {badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full text-[9px] font-black leading-[17px] text-center ring-2 ring-slate-950 ${
                      item.id === 'waiter' ? 'bg-amber-400 text-slate-950 animate-bounce' : theme.badge
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-extrabold tracking-tight mt-1 truncate max-w-[68px] ${
                  isActive ? theme.activeText : 'text-slate-400'
                }`}
              >
                {item.short || item.label}
              </span>

              {/* Luminous indicator dot for active item */}
              {isActive && (
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${theme.dot}`} />
              )}
            </button>
          );
        })}

        {/* 5th Button: More / Drawer trigger when role has extra modules */}
        {hasMore && (
          <button
            onClick={() => setSidebarDrawerOpen(true)}
            className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-90 ${
              isMoreActive ? theme.activePill : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="More navigation modules"
          >
            <div className="relative">
              <Menu className={`w-5 h-5 transition-transform duration-150 ${isMoreActive ? 'scale-110' : ''}`} />
            </div>

            <span
              className={`text-[10px] font-extrabold tracking-tight mt-1 truncate max-w-[68px] ${
                isMoreActive ? theme.activeText : 'text-slate-400'
              }`}
            >
              More
            </span>

            {isMoreActive && (
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${theme.dot}`} />
            )}
          </button>
        )}
      </div>
    </nav>
  );
};
