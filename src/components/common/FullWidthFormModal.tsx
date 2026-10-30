import React from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types/erp';

export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  requiredRole?: UserRole[];
  icon?: React.ReactNode;
  loading?: boolean;
}

interface FullWidthFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  roleBadge?: UserRole;
  actionButtons: ActionButtonConfig[];
  currentRole: UserRole;
  children: React.ReactNode;
  maxWidthClass?: string; // defaults to max-w-5xl
}

export const FullWidthFormModal: React.FC<FullWidthFormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  roleBadge,
  actionButtons,
  currentRole,
  children,
  maxWidthClass = 'max-w-5xl'
}) => {
  if (!isOpen) return null;

  const getVariantStyles = (variant?: ActionButtonConfig['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm';
      case 'secondary':
      default:
        return 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-xl shadow-2xl border border-slate-200 w-full ${maxWidthClass} overflow-hidden flex flex-col max-h-[92vh]`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
                {roleBadge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Role: {roleBadge}
                  </span>
                )}
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Grid cols 12 */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-12 gap-5 w-full">
            {children}
          </div>
        </div>

        {/* Footer with Role-Aware Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active session: <strong>{currentRole}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {actionButtons.map((btn, idx) => {
              const isAllowed = !btn.requiredRole || btn.requiredRole.includes(currentRole);
              const disabled = btn.disabled || !isAllowed;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled}
                  onClick={btn.onClick}
                  title={!isAllowed ? `Requires role: ${btn.requiredRole?.join(', ')}` : undefined}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${getVariantStyles(btn.variant)}`}
                >
                  {btn.icon}
                  {btn.label}
                  {!isAllowed && <AlertCircle className="w-3.5 h-3.5 ml-1 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
