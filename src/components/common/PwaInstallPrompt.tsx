import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';

interface PwaInstallButtonProps {
  label?: string;
  variant?: 'primary' | 'secondary' | 'compact' | 'pill' | 'header' | 'icon';
  className?: string;
  subtext?: string;
  iconOnlyOnMobile?: boolean;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({
  label = 'Install App',
  variant = 'primary',
  className = '',
  subtext,
  iconOnlyOnMobile = false,
}) => {
  const { isInstalled, isInstallable, isIOS, install } = usePwaInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);

  // If already running in standalone PWA mode, don't clutter the UI
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowGeneralModal(true);
    }
  };

  const getButtonStyles = () => {
    if (variant === 'header') {
      return 'inline-flex items-center justify-center gap-1.5 h-9 w-9 sm:w-auto sm:px-2.5 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition active:scale-95';
    }
    if (variant === 'icon') {
      return 'inline-flex items-center justify-center h-9 w-9 rounded-lg sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 transition active:scale-95';
    }
    if (variant === 'compact') {
      return 'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95';
    }
    if (variant === 'secondary') {
      return 'inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition active:scale-95';
    }
    if (variant === 'pill') {
      return 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-sm transition active:scale-95';
    }
    return 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition active:scale-95';
  };

  const isHeaderOrIcon = variant === 'header' || variant === 'icon';

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        title="Install as native mobile app on iPhone or Android"
        className={`${getButtonStyles()} ${className}`}
      >
        <Download className={`w-4 h-4 shrink-0 ${isHeaderOrIcon ? 'text-emerald-700' : 'text-emerald-300'}`} />
        {variant !== 'icon' && (
          <div className={`flex flex-col text-left ${variant === 'header' || iconOnlyOnMobile ? 'hidden sm:flex' : ''}`}>
            <span>{label}</span>
            {subtext && <span className="text-[10px] text-emerald-200/80 font-normal leading-tight">{subtext}</span>}
          </div>
        )}
      </button>

      {/* iOS Safari Install Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Install on iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Add to your Home Screen in 2 taps</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-white">Tap the Share button</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Located in Safari navigation bar (<Share className="w-3.5 h-3.5 inline text-blue-400" />)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-white">Select "Add to Home Screen"</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Scroll down and tap (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" /> <b>Add to Home Screen</b>)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-white">Tap "Add" in top right corner</p>
                  <p className="text-slate-400 mt-0.5">RestoERP will launch full-screen like a native app!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* General / Android instructions modal if not yet triggered */}
      {showGeneralModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 relative">
            <button
              onClick={() => setShowGeneralModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Install Mobile App</h3>
                <p className="text-xs text-slate-400">Android & Chrome Quick Setup</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-xs text-slate-300">
              <p className="text-slate-300">
                To install RestoERP on your phone or tablet:
              </p>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-400">Android / Chrome:</span>
                  <span>Tap browser menu (⋮) → "Install app" or "Add to Home screen"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-400">iPhone / Safari:</span>
                  <span>Tap Share (<Share className="w-3.5 h-3.5 inline" />) → "Add to Home Screen"</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowGeneralModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PwaInstallBanner: React.FC<{
  title?: string;
  description?: string;
  roleContext?: 'waiter' | 'customer' | 'general';
}> = ({
  title = 'Install Mobile App',
  description = 'Add to Home Screen for fast offline-ready access and full-screen experience',
  roleContext = 'general',
}) => {
  const { isInstalled } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  const roleText =
    roleContext === 'waiter'
      ? 'Fast table ordering & instant commission alerts'
      : roleContext === 'customer'
      ? 'Track your order in real-time & 1-tap reorders'
      : description;

  return (
    <aside aria-label="Install App Banner" className="w-full bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border-b border-emerald-500/20 px-3.5 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
              <span>{title}</span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-normal">
                PWA
              </span>
            </p>
            <p className="text-[11px] text-slate-400 truncate">{roleText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PwaInstallButton
            label="Install"
            variant="compact"
            className="!py-1.5 !px-3 font-medium text-xs"
          />
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export const PwaMobileBanner = PwaInstallBanner;

