import React, { useState } from 'react';
import { 
  Building2, 
  UtensilsCrossed, 
  ChefHat, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Receipt, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag, 
  Truck,
  KeyRound,
  UserCheck,
  QrCode,
  Layers,
  TrendingUp,
  Clock,
  ChevronRight,
  MapPin,
  Laptop
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';

export const LandingPage: React.FC = () => {
  const { setViewMode, setCurrentRole, setActiveTab, currentSite, setCurrentSite, sites } = useErp();
  const [selectedWorkflowStep, setSelectedWorkflowStep] = useState<number>(0);

  const openAuth = (role?: UserRole, tab?: string, siteId?: string) => {
    if (role) setCurrentRole(role);
    if (tab) setActiveTab(tab);
    if (siteId) {
      const foundSite = sites.find(s => s.id === siteId);
      if (foundSite) setCurrentSite(foundSite);
    }
    setViewMode('auth');
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Order Placement',
      role: 'Customer / Waiter',
      color: 'border-blue-500 text-blue-700 bg-blue-50',
      description: 'Waiters use handheld tablets on tables, or cashiers take takeaway/delivery orders with modifiers and allergen notes.',
      badge: 'Dine-in · Takeaway · Delivery'
    },
    {
      step: '02',
      title: 'Kitchen KDS Prep',
      role: 'Head Chef & Stations',
      color: 'border-amber-500 text-amber-700 bg-amber-50',
      description: 'Tickets automatically route to Grill, Fryer, and Salad stations. Chefs bump item states: Cooking → Ready.',
      badge: 'Ticket Prioritization & Course Timing'
    },
    {
      step: '03',
      title: 'Service & Food Runner',
      role: 'Floor Waiter',
      color: 'border-emerald-500 text-emerald-700 bg-emerald-50',
      description: 'Waiters receive immediate pass alerts when hot dishes are ready, deliver to the table, and confirm service.',
      badge: 'Real-Time Pass Alert'
    },
    {
      step: '04',
      title: 'Cashier Settlement',
      role: 'Cashier & Finance',
      color: 'border-purple-500 text-purple-700 bg-purple-50',
      description: 'Cashier reviews table bill or takeaway ticket, applies discounts, processes M-Pesa/Card/Cash, and prints receipt.',
      badge: 'Split Bills & Mobile Money'
    },
    {
      step: '05',
      title: 'Inventory & Reporting',
      role: 'HQ & Storekeeper',
      color: 'border-emerald-600 text-[#163a2b] bg-emerald-50',
      description: 'Recipe items automatically deplete raw ingredients in real-time, preventing stock variance and updating journal ledgers.',
      badge: 'Auto Depletion & P&L'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#3cb371] selection:text-white w-full max-w-full overflow-x-hidden">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#163a2b] flex items-center justify-center text-white font-extrabold text-base shadow-xs">
              R
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span>RestoERP</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3cb371]" />
              </div>
              <div className="text-2xs text-slate-400 font-medium">Enterprise Restaurant OS</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <a href="#stations" className="hover:text-slate-900 transition-colors">Terminals</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Order Engine</a>
            <a href="#branches" className="hover:text-slate-900 transition-colors">Multi-Branch</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Inventory & Costing</a>
          </nav>

          {/* Primary Action Buttons: Staff Login & Register / Launch POS */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => openAuth('Cashier', 'pos')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#3cb371]" />
              <span>POS Terminal</span>
            </button>

            <button
              onClick={() => openAuth()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#163a2b] hover:bg-[#1d4d38] rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer border border-[#2d6a4f]"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#3cb371]" />
              <span>Staff Login / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-emerald-50/20 to-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#3cb371]" />
                <span>Next-Gen Connected Restaurant Operations</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#3cb371] animate-pulse" />
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                One Shared Order Engine from <span className="text-[#163a2b] underline decoration-[#3cb371] decoration-wavy decoration-2">Waiter Handheld</span> to <span className="text-[#163a2b]">Kitchen KDS</span> & <span className="text-[#163a2b]">Billing</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Connect Waiters, Kitchen Chefs, Cashiers, and HQ into a synchronized order flow. Fast iPhone PIN keypad login, real-time ticket statuses, split bills, multi-branch inventory, and automated day-end reporting.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => openAuth()}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#163a2b] hover:bg-[#1d4d38] rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-[#2d6a4f] group"
                >
                  <KeyRound className="w-4 h-4 text-[#3cb371] group-hover:rotate-12 transition-transform" />
                  <span>Enter Staff Terminal & Passcode</span>
                  <ArrowRight className="w-4 h-4 text-[#3cb371]" />
                </button>

                <button
                  onClick={() => openAuth('Cashier', 'pos')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#3cb371]" />
                  <span>Launch POS Register</span>
                </button>
              </div>

              {/* Highlights Checklist */}
              <div className="pt-2 flex flex-wrap gap-y-2 gap-x-5 text-xs text-slate-600 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3cb371]" />
                  Dine-In, Takeaway & Delivery
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3cb371]" />
                  iPhone Fast PIN Dialpad
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#3cb371]" />
                  Multi-Branch Auto Routing
                </span>
              </div>

            </div>

            {/* Right Column: Interactive Quick Launch Cards */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200 relative">
                
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div>
                    <div className="text-2xs font-bold uppercase tracking-wider text-slate-400">Station Quick Launch</div>
                    <div className="text-sm font-bold text-slate-900">Choose Your Workstation</div>
                  </div>
                  <span className="text-2xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                    Direct PIN
                  </span>
                </div>

                <div className="space-y-2.5">
                  
                  {/* Waiter Station Card */}
                  <button
                    onClick={() => openAuth('Waiter', 'waiter', 'site-1')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#3cb371] bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#163a2b]">Waiter Handheld Terminal</div>
                        <div className="text-xs text-slate-500">Floor tables, order creation & ready alerts</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#3cb371]">
                      <span>PIN 1234</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Kitchen KDS Card */}
                  <button
                    onClick={() => openAuth('Chef', 'kds', 'site-1')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#3cb371] bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center shrink-0">
                        <ChefHat className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#163a2b]">Kitchen Display System (KDS)</div>
                        <div className="text-xs text-slate-500">Live order tickets, cook states & pass notify</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#3cb371]">
                      <span>PIN 2026</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Cashier Billing Card */}
                  <button
                    onClick={() => openAuth('Cashier', 'pos', 'site-1')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#3cb371] bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#163a2b]">Cashier & Checkout POS</div>
                        <div className="text-xs text-slate-500">Cash, M-Pesa, card splits, drawer & receipts</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#3cb371]">
                      <span>PIN 5555</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* Zanzibar Spice Bistro Branch Card */}
                  <button
                    onClick={() => openAuth('Waiter', 'waiter', 'site-2')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#3cb371] bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#163a2b]">Zanzibar Spice Bistro Branch</div>
                        <div className="text-xs text-slate-500">Auto-routes to Zanzibar branch tables</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#3cb371]">
                      <span>PIN 2424</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {/* HQ Executive & Inventory Card */}
                  <button
                    onClick={() => openAuth('Owner', 'dashboard', 'site-1')}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-[#3cb371] bg-slate-50/70 hover:bg-emerald-50/40 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-slate-700" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#163a2b]">Owner & HQ Multi-Branch Admin</div>
                        <div className="text-xs text-slate-500">Sales KPIs, recipes, central kitchen & ledger</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#3cb371]">
                      <span>PIN 0000</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Need to create a new staff account?</span>
                  <button
                    onClick={() => openAuth()}
                    className="font-bold text-[#3cb371] hover:underline cursor-pointer"
                  >
                    Register New Staff →
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. ORDER ENGINE WORKFLOW (Customer → Waiter → Kitchen → Cashier → Completed) */}
      <section id="workflow" className="py-14 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#3cb371]" />
              <span>Unified Order Lifecycle Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Every Staff Member Works on the Exact Same Order
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              No manual re-entry between dining room, kitchen, and cashier. Role-based updates occur in real-time.
            </p>
          </div>

          {/* Workflow Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {workflowSteps.map((step, idx) => (
              <div
                key={step.step}
                onClick={() => setSelectedWorkflowStep(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedWorkflowStep === idx 
                    ? 'border-[#3cb371] bg-emerald-50/30 shadow-md ring-2 ring-[#3cb371]/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-extrabold text-slate-400">{step.step}</span>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${step.color}`}>
                    {step.role}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">{step.description}</p>
                <div className="text-2xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {step.badge}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. MULTI-BRANCH SHOWCASE (Auto-opens on Login) */}
      <section id="branches" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Multi-Site Architecture</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Active Operational Branches
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
              When any staff member signs in, RestoERP automatically detects and launches their designated restaurant branch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sites.slice(0, 3).map((site) => (
              <div key={site.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#163a2b] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5 text-[#3cb371]" />
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    {site.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{site.name}</h3>
                <div className="text-xs text-slate-500 mb-4">{site.type} · {site.city}</div>

                <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Floor Tables:</span>
                    <span className="font-bold text-slate-900">{site.tablesCount} Tables</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Rate:</span>
                    <span className="font-bold text-slate-900">{(site.taxRate * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Site Manager:</span>
                    <span className="font-bold text-slate-900">{site.manager}</span>
                  </div>
                </div>

                <button
                  onClick={() => openAuth('Site Mgr', 'dashboard', site.id)}
                  className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#163a2b] hover:text-white text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Launch {site.city} Station</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. BOTTOM CALL TO ACTION */}
      <section className="py-16 bg-[#163a2b] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-[#3cb371]/40 text-emerald-200 text-xs font-bold">
            <KeyRound className="w-3.5 h-3.5 text-[#3cb371]" />
            <span>Ready to Open Shift?</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Access Your Station with PIN or Staff Credentials
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Quick 4-digit passcodes for Waiters, Chefs, and Cashiers, with full multi-branch support and offline reliability.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openAuth()}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-[#163a2b] bg-[#3cb371] hover:bg-[#2e8b57] hover:text-white rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Staff Login & Register Station</span>
            </button>
            
            <button
              onClick={() => openAuth('Cashier', 'pos')}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all cursor-pointer"
            >
              <UtensilsCrossed className="w-4 h-4 text-[#3cb371]" />
              <span>Open POS Terminal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-[#112a1f] text-slate-400 py-6 border-t border-emerald-900/60 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <div className="w-6 h-6 rounded-md bg-[#3cb371] text-white flex items-center justify-center text-xs">
              R
            </div>
            <span>RestoERP Platform</span>
          </div>
          <div>Enterprise Restaurant POS, KDS, Central Kitchen & Multi-Branch Management</div>
          <div className="text-slate-500">© 2026 RestoERP. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
};
