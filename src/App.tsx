import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ViewSkeleton } from './components/common/ViewSkeleton';
import { LandingPage } from './components/layout/LandingPage';
import { ErpHeader } from './components/layout/ErpHeader';
import { ErpSidebar } from './components/layout/ErpSidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ActionModals } from './components/modals/ActionModals';
import { AuthView } from './components/auth/AuthView';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { canAccess, getNavItem, landingTabForRole } from './config/navigation';

// Each module is its own chunk: the first screen no longer ships the entire 780 KB app.
const lazyNamed = <T extends Record<string, React.ComponentType<any>>>(
  loader: () => Promise<T>, name: keyof T
) => lazy(() => loader().then(m => ({ default: m[name] as React.ComponentType<any> })));

const DashboardView = lazyNamed(() => import('./components/views/DashboardView'), 'DashboardView');
const PosView = lazyNamed(() => import('./components/views/PosView'), 'PosView');
const CashierTrackingView = lazyNamed(() => import('./components/views/CashierTrackingView'), 'CashierTrackingView');
const WaiterView = lazyNamed(() => import('./components/views/WaiterView'), 'WaiterView');
const CustomerPortalView = lazyNamed(() => import('./components/views/CustomerPortalView'), 'CustomerPortalView');
const KdsView = lazyNamed(() => import('./components/views/KdsView'), 'KdsView');
const MenuRecipeView = lazyNamed(() => import('./components/views/MenuRecipeView'), 'MenuRecipeView');
const InventoryView = lazyNamed(() => import('./components/views/InventoryView'), 'InventoryView');
const ProcurementView = lazyNamed(() => import('./components/views/ProcurementView'), 'ProcurementView');
const CentralKitchenView = lazyNamed(() => import('./components/views/CentralKitchenView'), 'CentralKitchenView');
const FinanceView = lazyNamed(() => import('./components/views/FinanceView'), 'FinanceView');
const StaffView = lazyNamed(() => import('./components/views/StaffView'), 'StaffView');
const DayLifecycleView = lazyNamed(() => import('./components/views/DayLifecycleView'), 'DayLifecycleView');
const ReportsView = lazyNamed(() => import('./components/views/ReportsView'), 'ReportsView');
const CommissionManagerView = lazyNamed(() => import('./components/views/CommissionManagerView'), 'CommissionManagerView');

const ErpAppContent: React.FC = () => {
  const {
    isAuthenticated, viewMode, activeTab, setActiveTab, currentRole,
    sidebarDrawerOpen, setSidebarDrawerOpen, sidebarCollapsed,
  } = useErp();
  const [quickModalType, setQuickModalType] = useState<string | null>(null);

  // Role guard: switching persona (or a stale saved session) must never leave you on a screen your role can't use.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!canAccess(getNavItem(activeTab), currentRole)) setActiveTab(landingTabForRole(currentRole));
  }, [isAuthenticated, activeTab, currentRole, setActiveTab]);

  // Close the drawer with Escape; lock body scroll while it is open.
  useEffect(() => {
    if (!sidebarDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarDrawerOpen, setSidebarDrawerOpen]);

  if (viewMode === 'landing') return <LandingPage />;
  if (viewMode === 'auth' || !isAuthenticated) return <AuthView />;

  const navItem = getNavItem(activeTab);
  const isTerminal = !!navItem?.terminal;

  const openModal = (type: string) => setQuickModalType(type);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'pos': return <PosView />;
      case 'cashier-tracking': return <CashierTrackingView />;
      case 'waiter': return <WaiterView />;
      case 'commissions': return <CommissionManagerView />;
      case 'customer-portal': return <CustomerPortalView />;
      case 'kds': return <KdsView />;
      case 'menu': return <MenuRecipeView />;
      case 'inventory': return <InventoryView />;
      case 'procurement': return <ProcurementView />;
      case 'central-kitchen': return <CentralKitchenView />;
      case 'finance': return <FinanceView />;
      case 'staff': return <StaffView />;
      case 'checklists': return <DayLifecycleView />;
      case 'reports': return <ReportsView />;
      case 'dashboard':
      default: return <DashboardView onOpenQuickModal={openModal} />;
    }
  };

  return (
    <div className="h-[100dvh] bg-slate-100 flex flex-col font-sans text-slate-900 w-full overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-brand-800 focus:text-white focus:font-bold"
      >
        Skip to content
      </a>

      <ErpHeader isTerminal={isTerminal} onOpenQuickModal={openModal} />

      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Desktop sidebar – full width for admin screens, icon rail on full-screen terminals */}
        <div className="hidden lg:block shrink-0 h-full z-20">
          <ErpSidebar
            collapsed={isTerminal || sidebarCollapsed}
            lockedRail={isTerminal}
            onOpenDrawer={() => setSidebarDrawerOpen(true)}
          />
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className={`flex-1 h-full overflow-y-auto overflow-x-hidden scrollbar-thin outline-none pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+4.25rem))] lg:pb-0 ${
            isTerminal ? 'p-2.5 sm:p-4 lg:p-5' : 'p-4 sm:p-6 lg:p-8'
          }`}
        >
          <div className={isTerminal ? 'w-full' : 'max-w-[1680px] mx-auto w-full'}>
            <ErrorBoundary resetKey={activeTab}>
              <Suspense fallback={<ViewSkeleton />}>
                <div key={activeTab} className="view-enter">
                  {renderActiveView()}
                </div>
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Role-tailored Mobile Bottom Navigation Bar with attractive icons & theme colors */}
      <MobileBottomNav />

      {/* Slide-out drawer: mobile/tablet navigation and the expanded menu for terminals */}
      {sidebarDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSidebarDrawerOpen(false)}
          />
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-200">
            <ErpSidebar isDrawer onClose={() => setSidebarDrawerOpen(false)} />
          </div>
        </div>
      )}

      <CommandPalette onOpenQuickModal={openModal} />
      <ActionModals modalType={quickModalType} onClose={() => setQuickModalType(null)} />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <ToastProvider>
        <ErpAppContent />
      </ToastProvider>
    </ErpProvider>
  );
}
