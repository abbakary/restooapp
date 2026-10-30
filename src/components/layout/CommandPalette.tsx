import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, CornerDownLeft, ShoppingBag, Package, AlertTriangle, Clock, Lock, Building2,
  WifiOff, Wifi, RotateCcw, ArrowRight,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { NAV_ITEMS, canAccess } from '../../config/navigation';
import { useToast } from '../common/Toast';

interface Command {
  id: string;
  group: 'Go to' | 'Quick actions' | 'Branch' | 'System';
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string;
  disabled?: boolean;
  run: () => void;
}

interface Props { onOpenQuickModal: (type: string) => void; }

export const CommandPalette: React.FC<Props> = ({ onOpenQuickModal }) => {
  const {
    commandPaletteOpen: open, setCommandPaletteOpen: setOpen, currentRole, setActiveTab,
    sites, currentSite, setCurrentSite, logout, isOffline, toggleOffline, resetToDemo,
  } = useErp();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global shortcut: Ctrl/⌘ + K, and "/" when not typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 20); }
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const close = () => setOpen(false);
    const nav: Command[] = NAV_ITEMS
      .filter(n => canAccess(n, currentRole))
      .map(n => ({
        id: `nav-${n.id}`,
        group: 'Go to',
        label: n.label,
        hint: n.description,
        icon: n.icon,
        keywords: `${n.short} ${n.keywords?.join(' ') || ''}`,
        run: () => { setActiveTab(n.id); close(); },
      }));
    const actions: Command[] = [
      { id: 'a-order', group: 'Quick actions', label: 'Take a new order', icon: ShoppingBag, keywords: 'pos create sale', run: () => { close(); onOpenQuickModal('new_order'); } },
      { id: 'a-grn', group: 'Quick actions', label: 'Receive purchase order', icon: Package, keywords: 'grn goods stock delivery', run: () => { close(); onOpenQuickModal('receive_goods'); } },
      { id: 'a-waste', group: 'Quick actions', label: 'Log waste', icon: AlertTriangle, keywords: 'spoilage wastage', run: () => { close(); onOpenQuickModal('log_waste'); } },
      { id: 'a-close', group: 'Quick actions', label: 'Day-end close', icon: Clock, keywords: 'z report end of day', run: () => { close(); onOpenQuickModal('day_close'); } },
    ];
    const branches: Command[] = sites.map(s => ({
      id: `site-${s.id}`,
      group: 'Branch',
      label: `Switch to ${s.name}`,
      hint: s.id === currentSite.id ? 'Current branch' : s.city,
      icon: Building2,
      keywords: `${s.city} ${s.type} branch site`,
      disabled: s.id === currentSite.id,
      run: () => { setCurrentSite(s); toast.success(`Switched to ${s.name}`); close(); },
    }));
    const system: Command[] = [
      { id: 's-offline', group: 'System', label: isOffline ? 'Go back online' : 'Simulate offline mode', icon: isOffline ? Wifi : WifiOff, keywords: 'network connection sync', run: () => { toggleOffline(); close(); } },
      { id: 's-reset', group: 'System', label: 'Reset demo data', hint: 'Restores the original sample data', icon: RotateCcw, keywords: 'restore clear', run: () => { resetToDemo(); toast.info('Demo data restored'); close(); } },
      { id: 's-lock', group: 'System', label: 'Lock terminal', hint: 'Return to PIN screen', icon: Lock, keywords: 'sign out logout switch user', run: () => { close(); logout(); } },
    ];
    return [...nav, ...actions, ...branches, ...system];
  }, [currentRole, sites, currentSite.id, isOffline, onOpenQuickModal, setActiveTab, setCurrentSite, setOpen, logout, toggleOffline, resetToDemo, toast]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.filter(c => c.group !== 'Branch' && c.group !== 'System' || c.id === 's-lock');
    const terms = q.split(/\s+/);
    return commands.filter(c => {
      const hay = `${c.label} ${c.hint || ''} ${c.keywords || ''} ${c.group}`.toLowerCase();
      return terms.every(t => hay.includes(t));
    });
  }, [commands, query]);

  useEffect(() => { setCursor(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) return null;

  const runAt = (i: number) => {
    const c = results[i];
    if (c && !c.disabled) c.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(results.length - 1, c + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); runAt(cursor); }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
  };

  let lastGroup = '';

  return (
    <div className="fixed inset-0 z-[95] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-[var(--shadow-pop)] overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-150" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 px-5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search modules, actions, branches…"
            aria-label="Search commands"
            className="flex-1 h-16 bg-transparent text-base text-slate-900 placeholder:text-slate-400 outline-none"
          />
          <kbd className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md px-2 py-1">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto scrollbar-thin p-2.5">
          {results.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              No matches for “{query}”. Try “stock”, “kitchen” or “close”.
            </div>
          )}
          {results.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            const Icon = c.icon;
            const active = i === cursor;
            return (
              <React.Fragment key={c.id}>
                {header && <div className="px-3 pt-3 pb-1.5 text-2xs font-bold uppercase tracking-[0.14em] text-slate-400">{header}</div>}
                <button
                  data-idx={i}
                  onMouseMove={() => setCursor(i)}
                  onClick={() => runAt(i)}
                  disabled={c.disabled}
                  className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition-colors
                    ${c.disabled ? 'opacity-45 cursor-not-allowed' : ''} ${active && !c.disabled ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${active && !c.disabled ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 truncate">{c.label}</span>
                    {c.hint && <span className="block text-xs text-slate-500 truncate">{c.hint}</span>}
                  </span>
                  {active && !c.disabled && (c.group === 'Go to' ? <ArrowRight className="w-4 h-4 text-brand-700" /> : <CornerDownLeft className="w-4 h-4 text-brand-700" />)}
                  {c.disabled && c.group === 'Go to' && <Lock className="w-4 h-4 text-slate-400" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-5 px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><kbd className="font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5">↑</kbd><kbd className="font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5">↓</kbd> navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5">↵</kbd> select</span>
          <span className="ml-auto hidden sm:block">Tip: press <kbd className="font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5">Ctrl</kbd> + <kbd className="font-semibold bg-white border border-slate-200 rounded px-1.5 py-0.5">K</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
};
