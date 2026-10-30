import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description?: string;
  placeholder?: string;
  confirmLabel?: string;
  minLength?: number;
  tone?: 'danger' | 'primary';
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/** Accessible replacement for window.prompt() – used for void/authorisation reasons. */
export const ReasonDialog: React.FC<ReasonDialogProps> = ({
  open, title, description, placeholder = 'Type a reason…', confirmLabel = 'Confirm',
  minLength = 4, tone = 'danger', onConfirm, onCancel,
}) => {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) { setValue(''); setTimeout(() => ref.current?.focus(), 30); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const valid = value.trim().length >= minLength;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-[var(--shadow-pop)] animate-in zoom-in-95 fade-in duration-150">
        <div className="flex items-start justify-between gap-4 p-6 pb-3">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
            {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
          </div>
          <button onClick={onCancel} aria-label="Close" className="p-1.5 -m-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-2">
          <textarea
            ref={ref}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && valid) onConfirm(value.trim()); }}
            rows={3}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-400/15 outline-none resize-none"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            {valid ? 'Press Ctrl/⌘ + Enter to confirm.' : `At least ${minLength} characters required.`}
          </p>
        </div>
        <div className="flex justify-end gap-2.5 p-6 pt-4">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button
            disabled={!valid}
            onClick={() => onConfirm(value.trim())}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
