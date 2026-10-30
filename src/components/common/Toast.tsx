import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface ToastItem { id: number; kind: ToastKind; title: string; description?: string; }

interface ToastApi {
  show: (kind: ToastKind, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const STYLES: Record<ToastKind, { ring: string; icon: React.ReactNode }> = {
  success: { ring: 'border-emerald-200 bg-white', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> },
  error: { ring: 'border-rose-200 bg-white', icon: <XCircle className="w-5 h-5 text-rose-600" /> },
  warning: { ring: 'border-amber-200 bg-white', icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> },
  info: { ring: 'border-sky-200 bg-white', icon: <Info className="w-5 h-5 text-sky-600" /> },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setItems(prev => prev.filter(t => t.id !== id)), []);

  const show = useCallback((kind: ToastKind, title: string, description?: string) => {
    const id = ++counter.current;
    setItems(prev => [...prev.slice(-3), { id, kind, title, description }]);
    window.setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 4500);
  }, [dismiss]);

  const api = useMemo<ToastApi>(() => ({
    show,
    success: (t, d) => show('success', t, d),
    error: (t, d) => show('error', t, d),
    info: (t, d) => show('info', t, d),
    warning: (t, d) => show('warning', t, d),
  }), [show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[100] bottom-4 right-4 left-4 sm:left-auto sm:w-[26rem] flex flex-col gap-2.5 pointer-events-none"
      >
        {items.map(t => (
          <div
            key={t.id}
            role="status"
            className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border shadow-[var(--shadow-pop)] px-4 py-3.5 ${STYLES[t.kind].ring}`}
          >
            <span className="mt-0.5 shrink-0">{STYLES[t.kind].icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 leading-snug">{t.title}</p>
              {t.description && <p className="text-sm text-slate-600 mt-0.5 leading-snug">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 p-1 -m-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
