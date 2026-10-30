import React, { useState, useMemo } from 'react';
import { 
  BadgePercent, 
  Calculator, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  User, 
  Layers, 
  DollarSign, 
  Calendar, 
  Download, 
  Printer, 
  Plus, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink, 
  QrCode, 
  Send, 
  Eye, 
  X, 
  Check, 
  Sparkles,
  TrendingUp,
  Receipt,
  Wallet
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { 
  CommissionPolicy, 
  CommissionTier, 
  CommissionLedgerEntry, 
  WaiterProfile, 
  Order, 
  OrderType 
} from '../../types/erp';

export const CommissionManagerView: React.FC = () => {
  const { 
    currentSite, 
    commissionPolicies, 
    updateCommissionPolicy, 
    waiterProfiles, 
    orders, 
    commissionLedger, 
    commissionPayouts, 
    approveCommissionEntries, 
    payoutCommissions, 
    recordCashHandover, 
    cashSettlements, 
    reverseCommissionEntry, 
    auditLogs, 
    currentUser, 
    currentRole 
  } = useErp();

  // Active subtab
  const [activeTab, setActiveTab] = useState<'policies' | 'reconciliation' | 'ledger' | 'payouts' | 'audit'>('reconciliation');

  // Period filter for reconciliation
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>('all');
  const [drillDownOrder, setDrillDownOrder] = useState<Order | null>(null);

  // Policy editor modal state
  const [editingPolicy, setEditingPolicy] = useState<CommissionPolicy | null>(null);
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false);

  // Handover modal state
  const [handoverModalWaiter, setHandoverModalWaiter] = useState<WaiterProfile | null>(null);
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [handoverNotes, setHandoverNotes] = useState<string>('');

  // Payout modal state
  const [payoutModalWaiter, setPayoutModalWaiter] = useState<WaiterProfile | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'M-Pesa / Mobile Money' | 'Cash' | 'Bank Transfer'>('M-Pesa / Mobile Money');
  const [payoutRef, setPayoutRef] = useState<string>('MPESA-TX-' + Math.floor(10000000 + Math.random() * 90000000));

  // Reversal modal state
  const [reversalEntry, setReversalEntry] = useState<CommissionLedgerEntry | null>(null);
  const [reversalReason, setReversalReason] = useState<string>('');

  // Interactive Commission Calculator / Simulator State
  const [simOrderSubtotal, setSimOrderSubtotal] = useState<number>(50000);
  const [simDiscount, setSimDiscount] = useState<number>(0);
  const [simSelectedPolicyId, setSimSelectedPolicyId] = useState<string>(commissionPolicies[0]?.id || '');

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currency = currentSite.currency;

  // Filtered orders based on selected period
  const filteredOrders = useMemo(() => {
    return orders.filter(o => o.siteId === currentSite.id);
  }, [orders, currentSite.id]);

  // Waiter summaries for reconciliation
  const waiterSummaries = useMemo(() => {
    const profiles = waiterProfiles.filter(w => w.siteId === currentSite.id);
    return profiles.map(waiter => {
      // Find orders assigned to this waiter
      const waiterOrders = filteredOrders.filter(o => 
        o.assignedWaiterId === waiter.id || 
        o.serverName?.toLowerCase().includes(waiter.name.split(' ')[0].toLowerCase())
      );

      const totalOrdersCount = waiterOrders.length;
      const portalOrdersCount = waiterOrders.filter(o => o.source === 'WAITER_LINK' || o.source === 'CUSTOMER_PORTAL').length;
      
      const grossSales = waiterOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.total, 0);
      const netSales = waiterOrders.filter(o => o.status === 'paid').reduce((sum, o) => sum + Math.max(0, o.subtotal - o.discount), 0);

      // Direct cash collections by waiter
      const waiterCashCollected = waiterOrders
        .filter(o => o.status === 'paid' && o.paymentMethod === 'Cash' && o.collectedBy === 'waiter')
        .reduce((sum, o) => sum + o.total, 0);

      // Cashier collections for this waiter's orders
      const cashierCollected = waiterOrders
        .filter(o => o.status === 'paid' && o.collectedBy === 'cashier')
        .reduce((sum, o) => sum + o.total, 0);

      // Mobile money collections directly recorded
      const mobileMoneyCollected = waiterOrders
        .filter(o => o.status === 'paid' && o.paymentMethod?.includes('M-Pesa'))
        .reduce((sum, o) => sum + o.total, 0);

      // Unpaid / Outstanding bills
      const outstandingBills = waiterOrders
        .filter(o => o.status !== 'paid' && o.status !== 'voided')
        .reduce((sum, o) => sum + o.total, 0);

      // Commission entries for this waiter
      const entries = commissionLedger.filter(e => e.waiterId === waiter.id);
      const earnedCommission = entries.filter(e => e.status !== 'reversed').reduce((sum, e) => sum + e.commissionAmount, 0);
      const pendingApproval = entries.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.commissionAmount, 0);
      const approvedUnpaid = entries.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.commissionAmount, 0);
      const paidCommission = entries.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.commissionAmount, 0);

      // Cash handover variance
      const settlement = cashSettlements.find(s => s.waiterId === waiter.id);
      const handoverDifference = settlement ? settlement.variance : 0;
      const handoverCompleted = !!settlement;

      return {
        waiter,
        totalOrdersCount,
        portalOrdersCount,
        grossSales,
        netSales,
        waiterCashCollected,
        cashierCollected,
        mobileMoneyCollected,
        outstandingBills,
        earnedCommission,
        pendingApproval,
        approvedUnpaid,
        paidCommission,
        handoverDifference,
        handoverCompleted
      };
    });
  }, [waiterProfiles, filteredOrders, commissionLedger, cashSettlements, currentSite.id]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const totalSales = waiterSummaries.reduce((sum, w) => sum + w.grossSales, 0);
    const totalCommissions = waiterSummaries.reduce((sum, w) => sum + w.earnedCommission, 0);
    const totalCashHeld = waiterSummaries.reduce((sum, w) => sum + w.waiterCashCollected, 0);
    const totalPendingApproval = waiterSummaries.reduce((sum, w) => sum + w.pendingApproval, 0);
    const totalApprovedUnpaid = waiterSummaries.reduce((sum, w) => sum + w.approvedUnpaid, 0);
    const totalPortalOrders = waiterSummaries.reduce((sum, w) => sum + w.portalOrdersCount, 0);

    return {
      totalSales,
      totalCommissions,
      totalCashHeld,
      totalPendingApproval,
      totalApprovedUnpaid,
      totalPortalOrders
    };
  }, [waiterSummaries]);

  // Simulator calculation
  const simCalculation = useMemo(() => {
    const policy = commissionPolicies.find(p => p.id === simSelectedPolicyId) || commissionPolicies[0];
    if (!policy) return { basisAmount: 0, commission: 0, formula: 'No policy' };

    const taxAmount = Math.round(simOrderSubtotal * currentSite.taxRate);
    const serviceCharge = Math.round(simOrderSubtotal * currentSite.serviceChargeRate);
    const gross = simOrderSubtotal - simDiscount + taxAmount + serviceCharge;
    const net = Math.max(0, simOrderSubtotal - simDiscount);

    const eligible = policy.basis === 'gross' ? gross : net;
    let commission = 0;
    let formula = '';

    if (policy.method === 'percentage') {
      commission = Math.round(eligible * policy.rate);
      formula = `${(policy.rate * 100).toFixed(1)}% × ${eligible.toLocaleString()} ${currency} (${policy.basis.toUpperCase()})`;
    } else if (policy.method === 'fixed') {
      commission = policy.fixedAmount;
      formula = `Fixed ${policy.fixedAmount.toLocaleString()} ${currency} / order`;
    } else if (policy.method === 'tiered') {
      const tier = policy.tiers.find(t => eligible >= t.minSales && eligible < t.maxSales) || policy.tiers[policy.tiers.length - 1];
      const rate = tier ? tier.rate : policy.rate;
      commission = Math.round(eligible * rate);
      formula = `Tier Rate ${(rate * 100).toFixed(1)}% × ${eligible.toLocaleString()} ${currency}`;
    }

    return { basisAmount: eligible, commission, formula, gross, net };
  }, [simOrderSubtotal, simDiscount, simSelectedPolicyId, commissionPolicies, currentSite, currency]);

  // Handover confirmation
  const handleConfirmHandover = () => {
    if (!handoverModalWaiter) return;
    const counted = parseFloat(countedCashInput) || 0;
    recordCashHandover(handoverModalWaiter.id, counted, handoverNotes, currentUser?.name || 'Manager');
    setHandoverModalWaiter(null);
    setCountedCashInput('');
    setHandoverNotes('');
    showToast(`Recorded cash handover for ${handoverModalWaiter.name}`);
  };

  // Payout confirmation
  const handleConfirmPayout = () => {
    if (!payoutModalWaiter) return;
    const eligibleEntries = commissionLedger
      .filter(e => e.waiterId === payoutModalWaiter.id && e.status === 'approved')
      .map(e => e.id);

    if (eligibleEntries.length === 0) {
      showToast('No approved commissions to pay out. Approve entries first!');
      return;
    }

    payoutCommissions(
      payoutModalWaiter.id,
      eligibleEntries,
      payoutMethod,
      payoutRef,
      currentUser?.name || 'Manager'
    );

    setPayoutModalWaiter(null);
    showToast(`Disbursed payout to ${payoutModalWaiter.name} via ${payoutMethod}!`);
  };

  // Reversal confirmation
  const handleConfirmReversal = () => {
    if (!reversalEntry) return;
    if (!reversalReason.trim()) {
      showToast('Please provide a reason for reversal');
      return;
    }
    reverseCommissionEntry(reversalEntry.id, reversalReason.trim(), currentUser?.name || 'Manager');
    setReversalEntry(null);
    setReversalReason('');
    showToast(`Reversed commission for order ${reversalEntry.orderNumber}`);
  };

  // CSV Export for Manager
  const exportToCsv = () => {
    const headers = ['Waiter Name', 'Code', 'Total Orders', 'Portal Orders', 'Gross Sales (TZS)', 'Cash Collected (TZS)', 'Cashier Collected (TZS)', 'Earned Commission (TZS)', 'Pending (TZS)', 'Approved (TZS)', 'Paid (TZS)'];
    const rows = waiterSummaries.map(s => [
      `"${s.waiter.name}"`,
      s.waiter.code,
      s.totalOrdersCount,
      s.portalOrdersCount,
      s.grossSales,
      s.waiterCashCollected,
      s.cashierCollected,
      s.earnedCommission,
      s.pendingApproval,
      s.approvedUnpaid,
      s.paidCommission
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `waiter_reconciliation_${currentSite.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Reconciliation CSV exported successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-emerald-500/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="surface p-6 bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-brand-300 mb-1">
            <BadgePercent className="w-4 h-4 text-brand-400" />
            <span>Management & Finance Controls · {currentSite.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Waiter Commissions & Order Reconciliation</h1>
          <p className="text-sm text-slate-300 mt-1">
            Tenant-isolated rules, unique customer link attribution, automated ledger snapshots & end-of-shift cash settlement.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToCsv}
            className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2 transition-colors border border-white/15"
          >
            <Download className="w-4 h-4 text-brand-300" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="h-11 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-2 transition-colors border border-white/15"
          >
            <Printer className="w-4 h-4 text-brand-300" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'reconciliation'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Shift & Day Reconciliation</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'policies'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Commission Policies & Overrides</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Order Ledger & Snapshots ({commissionLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'payouts'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Disbursed Payouts ({commissionPayouts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-brand-500 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Audit History ({auditLogs.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: RECONCILIATION REPORT (Shift & Day Cross-check)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="surface p-4 border-l-4 border-emerald-500">
              <span className="text-2xs font-bold uppercase text-slate-400">Total Waiter Sales</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
                {aggregateStats.totalSales.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">{currency} paid orders</span>
            </div>

            <div className="surface p-4 border-l-4 border-indigo-500">
              <span className="text-2xs font-bold uppercase text-slate-400">Customer Link Orders</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 tabular-nums">
                {aggregateStats.totalPortalOrders}
              </div>
              <span className="text-xs text-slate-500">via waiter personal URLs</span>
            </div>

            <div className="surface p-4 border-l-4 border-amber-500">
              <span className="text-2xs font-bold uppercase text-slate-400">Commissions Accrued</span>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1 tabular-nums">
                {aggregateStats.totalCommissions.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">{currency} total earned</span>
            </div>

            <div className="surface p-4 border-l-4 border-rose-500">
              <span className="text-2xs font-bold uppercase text-slate-400">Waiter Cash In Hand</span>
              <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1 tabular-nums">
                {aggregateStats.totalCashHeld.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">to be handed over to cashier</span>
            </div>

            <div className="surface p-4 border-l-4 border-sky-500">
              <span className="text-2xs font-bold uppercase text-slate-400">Pending Approval</span>
              <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1 tabular-nums">
                {aggregateStats.totalPendingApproval.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">{currency} awaits manager check</span>
            </div>

            <div className="surface p-4 border-l-4 border-purple-500">
              <span className="text-2xs font-bold uppercase text-slate-400">Ready for Payout</span>
              <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1 tabular-nums">
                {aggregateStats.totalApprovedUnpaid.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500">{currency} approved</span>
            </div>
          </div>

          {/* Side-by-Side Waiter Reconciliation Table */}
          <div className="surface p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Waiter Shift Reconciliation Table</h2>
                <p className="text-xs text-slate-500">
                  Compare waiters side-by-side: track order count, online customer portal attribution, cash collections and approve earnings.
                </p>
              </div>

              {/* Quick Period Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPeriodFilter('today')}
                  className={`px-3 py-1.5 rounded-lg ${periodFilter === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setPeriodFilter('week')}
                  className={`px-3 py-1.5 rounded-lg ${periodFilter === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setPeriodFilter('month')}
                  className={`px-3 py-1.5 rounded-lg ${periodFilter === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  This Month
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase bg-slate-50">
                    <th className="py-3 px-3">Waiter</th>
                    <th className="py-3 px-3 text-center">Orders</th>
                    <th className="py-3 px-3 text-center">Link Orders</th>
                    <th className="py-3 px-3 text-right">Gross Sales</th>
                    <th className="py-3 px-3 text-right">Waiter Cash Held</th>
                    <th className="py-3 px-3 text-right">Cashier Coll.</th>
                    <th className="py-3 px-3 text-right">Commission Earned</th>
                    <th className="py-3 px-3 text-center">Cash Handover</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {waiterSummaries.map(s => {
                    const pendingEntries = commissionLedger.filter(e => e.waiterId === s.waiter.id && e.status === 'pending');
                    const hasPendingApproval = pendingEntries.length > 0;
                    const hasApprovedUnpaid = s.approvedUnpaid > 0;

                    return (
                      <tr key={s.waiter.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={s.waiter.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                              alt="" 
                              className="w-9 h-9 rounded-full object-cover border border-slate-200" 
                            />
                            <div>
                              <div className="font-bold text-slate-900">{s.waiter.name}</div>
                              <div className="text-2xs text-slate-400 font-mono">Code: {s.waiter.code}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold tabular-nums">
                          {s.totalOrdersCount}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                            s.portalOrdersCount > 0 ? 'bg-indigo-100 text-indigo-800 font-extrabold' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {s.portalOrdersCount} online
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right font-black text-slate-900 tabular-nums">
                          {s.grossSales.toLocaleString()} {currency}
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold text-rose-700 tabular-nums">
                          {s.waiterCashCollected.toLocaleString()} {currency}
                        </td>

                        <td className="py-3.5 px-3 text-right text-slate-600 tabular-nums">
                          {s.cashierCollected.toLocaleString()} {currency}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="font-black text-emerald-700 tabular-nums">
                            {s.earnedCommission.toLocaleString()} {currency}
                          </div>
                          {hasPendingApproval && (
                            <div className="text-2xs font-bold text-amber-600">
                              {s.pendingApproval.toLocaleString()} pending
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {s.handoverCompleted ? (
                            <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" /> Reconciled
                            </span>
                          ) : s.waiterCashCollected > 0 ? (
                            <button
                              onClick={() => {
                                setHandoverModalWaiter(s.waiter);
                                setCountedCashInput(s.waiterCashCollected.toString());
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
                            >
                              Settle Cash
                            </button>
                          ) : (
                            <span className="text-2xs text-slate-400 font-medium">No cash</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {hasPendingApproval && (
                              <button
                                onClick={() => {
                                  approveCommissionEntries(pendingEntries.map(e => e.id), currentUser?.name);
                                  showToast(`Approved ${pendingEntries.length} commission entries for ${s.waiter.name}!`);
                                }}
                                className="h-8 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                title="Approve pending commissions"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                            )}

                            {hasApprovedUnpaid && (
                              <button
                                onClick={() => setPayoutModalWaiter(s.waiter)}
                                className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                                title="Disburse commission payout"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Disburse</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedWaiterId(s.waiter.id);
                                setActiveTab('ledger');
                              }}
                              className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                              title="Inspect order-by-order ledger"
                            >
                              Ledger →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: COMMISSION POLICIES & OVERRIDES
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Policies List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Configured Commission Policies</h2>
                  <p className="text-xs text-slate-500">
                    Default restaurant rate, individual waiter overrides, basis (Gross vs Net) & qualifying conditions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newPol: CommissionPolicy = {
                      id: `pol-${Date.now()}`,
                      siteId: currentSite.id,
                      name: 'New Custom Commission Policy',
                      isDefault: false,
                      method: 'percentage',
                      rate: 0.05,
                      fixedAmount: 0,
                      tiers: [
                        { minSales: 0, maxSales: 500000, rate: 0.05 },
                        { minSales: 500000, maxSales: 1500000, rate: 0.08 },
                        { minSales: 1500000, maxSales: 99999999, rate: 0.12 }
                      ],
                      basis: 'net',
                      qualifyCondition: 'payment_confirmed',
                      effectiveFrom: new Date().toISOString().split('T')[0],
                      active: true,
                      updatedBy: currentUser?.name || 'Manager',
                      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };
                    setEditingPolicy(newPol);
                    setIsNewPolicyModalOpen(true);
                  }}
                  className="h-10 px-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Policy</span>
                </button>
              </div>

              {/* Policy Cards List */}
              <div className="space-y-3">
                {commissionPolicies.map(policy => {
                  const overrideWaiter = policy.waiterId ? waiterProfiles.find(w => w.id === policy.waiterId) : null;

                  return (
                    <div 
                      key={policy.id} 
                      className={`p-4 rounded-2xl border-2 transition-all ${
                        policy.isDefault 
                          ? 'border-brand-500/40 bg-brand-50/20' 
                          : (policy.waiterId ? 'border-indigo-400/40 bg-indigo-50/20' : 'border-slate-200 bg-white')
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900">{policy.name}</h3>
                            {policy.isDefault && (
                              <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-brand-100 text-brand-800 uppercase tracking-wide">
                                Restaurant Default
                              </span>
                            )}
                            {overrideWaiter && (
                              <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-indigo-100 text-indigo-800 uppercase tracking-wide">
                                Override: {overrideWaiter.name} ({overrideWaiter.code})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Basis: <b className="text-slate-800 capitalize">{policy.basis === 'gross' ? 'Gross Order Total' : 'Net Sales (After discount, Excl. VAT)'}</b> · Qualifies: <b className="text-slate-800">{policy.qualifyCondition === 'payment_confirmed' ? 'On Payment Confirmation' : 'On Order Served'}</b>
                          </p>
                        </div>

                        {/* Rate / Amount Badge */}
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-slate-900 tabular-nums">
                            {policy.method === 'percentage' && `${(policy.rate * 100).toFixed(1)}%`}
                            {policy.method === 'fixed' && `${policy.fixedAmount.toLocaleString()} ${currency}`}
                            {policy.method === 'tiered' && `Tiered (${(policy.rate * 100).toFixed(0)}%+)`}
                          </div>
                          <span className="text-2xs text-slate-400 capitalize">{policy.method} calc</span>
                        </div>
                      </div>

                      {/* Tier details if tiered */}
                      {policy.method === 'tiered' && policy.tiers.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-2xs">
                          {policy.tiers.map((t, idx) => (
                            <div key={idx} className="bg-white/80 p-2 rounded-lg border border-slate-100 text-center">
                              <span className="text-slate-400 block font-mono">
                                {t.minSales.toLocaleString()} - {t.maxSales > 90000000 ? '∞' : t.maxSales.toLocaleString()}
                              </span>
                              <span className="font-black text-indigo-700 text-xs">{(t.rate * 100).toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
                        <span>Updated by {policy.updatedBy} · Effective from {policy.effectiveFrom}</span>
                        <button
                          onClick={() => {
                            setEditingPolicy({ ...policy });
                            setIsNewPolicyModalOpen(true);
                          }}
                          className="font-bold text-brand-700 hover:text-brand-900 hover:underline"
                        >
                          Configure Rule →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Policy Simulator & Calculator */}
          <div className="lg:col-span-5 space-y-4">
            <div className="surface p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-4 border-2 border-slate-800 shadow-xl">
              <div className="flex items-center gap-2.5">
                <Calculator className="w-5 h-5 text-brand-400" />
                <h3 className="font-extrabold text-base">Interactive Commission Simulator</h3>
              </div>
              <p className="text-xs text-slate-400">
                Preview exact commission calculation on sample order amounts before activating or modifying policies.
              </p>

              {/* Policy selector */}
              <div className="space-y-1.5">
                <label className="text-2xs font-bold uppercase tracking-wider text-slate-400">Select Policy to Simulate</label>
                <select
                  value={simSelectedPolicyId}
                  onChange={e => setSimSelectedPolicyId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:border-brand-400"
                >
                  {commissionPolicies.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.method === 'percentage' ? `${(p.rate * 100).toFixed(0)}%` : p.method})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Order Subtotal */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Sample Order Subtotal</span>
                  <span className="font-mono font-bold text-brand-300">{simOrderSubtotal.toLocaleString()} {currency}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="300000"
                  step="5000"
                  value={simOrderSubtotal}
                  onChange={e => setSimOrderSubtotal(Number(e.target.value))}
                  className="w-full accent-brand-400 cursor-pointer"
                />
              </div>

              {/* Sample Order Discount */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Customer Discount (TZS)</span>
                  <span className="font-mono font-bold text-slate-400">{simDiscount.toLocaleString()} {currency}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="2000"
                  value={simDiscount}
                  onChange={e => setSimDiscount(Number(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>

              {/* Simulation Result Card */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Gross Total (inc. VAT/Service):</span>
                  <span className="text-white font-mono">{simCalculation.gross?.toLocaleString()} {currency}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Net Eligible Sales (excl. VAT/Disc):</span>
                  <span className="text-white font-mono">{simCalculation.net?.toLocaleString()} {currency}</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-2xs uppercase tracking-wider text-brand-300 font-bold block">Estimated Commission</span>
                    <span className="text-2xs text-slate-400">{simCalculation.formula}</span>
                  </div>
                  <div className="text-2xl font-black text-brand-400 tabular-nums">
                    {simCalculation.commission.toLocaleString()} {currency}
                  </div>
                </div>
              </div>

              <div className="text-2xs text-slate-500 italic">
                * Note: Snapshotting ensures that when this policy is saved, existing completed order earnings remain strictly unchanged.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: ORDER-LEVEL COMMISSION LEDGER & SNAPSHOTS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="surface p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Commission Ledger & Policy Snapshots</h2>
              <p className="text-xs text-slate-500">
                Every eligible order captures an immutable policy snapshot. Check status (Pending, Approved, Paid, Reversed).
              </p>
            </div>

            {/* Filter by waiter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-bold">Filter Waiter:</span>
              <select
                value={selectedWaiterId}
                onChange={e => setSelectedWaiterId(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="all">All Waiters</option>
                {waiterProfiles.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-3">Order / Date</th>
                  <th className="py-3 px-3">Waiter</th>
                  <th className="py-3 px-3 text-center">Source</th>
                  <th className="py-3 px-3 text-right">Order Total</th>
                  <th className="py-3 px-3">Policy Snapshot Applied</th>
                  <th className="py-3 px-3 text-right">Commission</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {commissionLedger
                  .filter(e => selectedWaiterId === 'all' || e.waiterId === selectedWaiterId)
                  .map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{entry.orderNumber}</div>
                        <div className="text-2xs text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.createdAt}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{entry.waiterName}</div>
                        <div className="text-2xs text-slate-400 font-mono">{entry.waiterCode}</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-full ${
                          entry.source === 'WAITER_LINK'
                            ? 'bg-purple-100 text-purple-800'
                            : (entry.source === 'CUSTOMER_PORTAL' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600')
                        }`}>
                          {entry.source}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black tabular-nums">
                        {entry.orderTotal.toLocaleString()} {currency}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[260px]">
                          {entry.policySnapshot.policyName}
                        </div>
                        <div className="text-2xs text-slate-500 font-mono">
                          {entry.policySnapshot.appliedFormula}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-brand-700 tabular-nums">
                        {entry.commissionAmount.toLocaleString()} {currency}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          entry.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : (entry.status === 'approved' 
                              ? 'bg-sky-100 text-sky-800' 
                              : (entry.status === 'reversed' ? 'bg-rose-100 text-rose-800 line-through' : 'bg-amber-100 text-amber-800'))
                        }`}>
                          {entry.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {entry.status === 'pending' && (
                            <button
                              onClick={() => {
                                approveCommissionEntries([entry.id], currentUser?.name);
                                showToast(`Approved commission for ${entry.orderNumber}!`);
                              }}
                              className="h-7 px-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
                            >
                              Approve
                            </button>
                          )}

                          {entry.status !== 'reversed' && entry.status !== 'paid' && (
                            <button
                              onClick={() => setReversalEntry(entry)}
                              className="h-7 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors"
                              title="Reverse or cancel commission"
                            >
                              Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: DISBURSED PAYOUTS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'payouts' && (
        <div className="surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Recorded Commission Payouts</h2>
              <p className="text-xs text-slate-500">
                Official payout vouchers and mobile money / bank settlement references.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-3">Payout #</th>
                  <th className="py-3 px-3">Waiter</th>
                  <th className="py-3 px-3 text-right">Amount Disbursed</th>
                  <th className="py-3 px-3 text-center">Orders Paid</th>
                  <th className="py-3 px-3">Method & Ref</th>
                  <th className="py-3 px-3">Authorized By</th>
                  <th className="py-3 px-3">Disbursed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {commissionPayouts.map(payout => (
                  <tr key={payout.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                      {payout.payoutNumber}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{payout.waiterName}</div>
                      <div className="text-2xs text-slate-400 font-mono">{payout.waiterCode}</div>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-emerald-700 tabular-nums">
                      {payout.amount.toLocaleString()} {currency}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold">
                      {payout.orderCount} orders
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-xs font-bold text-slate-800">{payout.paymentMethod}</div>
                      <div className="text-2xs font-mono text-slate-400">{payout.paymentReference}</div>
                    </td>

                    <td className="py-3.5 px-3 text-xs text-slate-600">
                      {payout.approvedBy}
                    </td>

                    <td className="py-3.5 px-3 text-xs text-slate-500 font-mono">
                      {payout.paidAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: AUDIT LOGS
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Commission & Order Routing Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Immutable record of policy changes, waiter link rotations, commission payouts and cancellations.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {log.actorName} ({log.actorRole})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {log.details}
                  </p>
                </div>
                <div className="text-2xs text-slate-400 font-mono shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT OR CREATE COMMISSION POLICY
          ───────────────────────────────────────────────────────────── */}
      {isNewPolicyModalOpen && editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="surface p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600" />
                <h3 className="font-black text-lg text-slate-900">
                  {commissionPolicies.some(p => p.id === editingPolicy.id) ? 'Edit Commission Policy' : 'Create Commission Policy'}
                </h3>
              </div>
              <button 
                onClick={() => setIsNewPolicyModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Policy Name</label>
                <input
                  type="text"
                  value={editingPolicy.name}
                  onChange={e => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Senior Waiter 7% Incentive"
                />
              </div>

              {/* Scope: Default vs Waiter Override */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Scope</label>
                  <select
                    value={editingPolicy.waiterId ? 'waiter_override' : 'default'}
                    onChange={e => {
                      if (e.target.value === 'default') {
                        setEditingPolicy({ ...editingPolicy, isDefault: true, waiterId: undefined });
                      } else {
                        setEditingPolicy({ ...editingPolicy, isDefault: false, waiterId: waiterProfiles[0]?.id });
                      }
                    }}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="default">Restaurant Default</option>
                    <option value="waiter_override">Individual Waiter Override</option>
                  </select>
                </div>

                {editingPolicy.waiterId && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Override For Waiter</label>
                    <select
                      value={editingPolicy.waiterId}
                      onChange={e => setEditingPolicy({ ...editingPolicy, waiterId: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                    >
                      {waiterProfiles.map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Calculation Method */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy({ ...editingPolicy, method: 'percentage' })}
                  className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                    editingPolicy.method === 'percentage' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPolicy({ ...editingPolicy, method: 'fixed' })}
                  className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                    editingPolicy.method === 'fixed' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Fixed Bounty
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPolicy({ ...editingPolicy, method: 'tiered' })}
                  className={`p-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                    editingPolicy.method === 'tiered' 
                      ? 'border-brand-500 bg-brand-50 text-brand-900' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tiered Target
                </button>
              </div>

              {/* Rate slider or amount */}
              {editingPolicy.method === 'percentage' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Commission Rate</span>
                    <span className="text-lg font-black text-brand-600 font-mono">
                      {(editingPolicy.rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.30"
                    step="0.005"
                    value={editingPolicy.rate}
                    onChange={e => setEditingPolicy({ ...editingPolicy, rate: Number(e.target.value) })}
                    className="w-full accent-brand-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-2xs text-slate-400 font-mono">
                    <span>0%</span>
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                  </div>
                </div>
              )}

              {editingPolicy.method === 'fixed' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Fixed Amount Per Qualifying Order</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      value={editingPolicy.fixedAmount}
                      onChange={e => setEditingPolicy({ ...editingPolicy, fixedAmount: Number(e.target.value) })}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 font-bold font-mono focus:outline-none"
                    />
                    <span className="absolute right-3 top-3 text-xs text-slate-400 font-bold">{currency}</span>
                  </div>
                </div>
              )}

              {/* Commission Basis */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Commission Basis</label>
                  <select
                    value={editingPolicy.basis}
                    onChange={e => setEditingPolicy({ ...editingPolicy, basis: e.target.value as 'gross' | 'net' })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="net">Net Eligible Sales (Excl. Tax)</option>
                    <option value="gross">Gross Order Total</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Qualifying Condition</label>
                  <select
                    value={editingPolicy.qualifyCondition}
                    onChange={e => setEditingPolicy({ ...editingPolicy, qualifyCondition: e.target.value as any })}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                  >
                    <option value="payment_confirmed">On Payment Confirmed</option>
                    <option value="served_approved">On Served & Approved</option>
                  </select>
                </div>
              </div>

              {/* Warning note */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-2xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <b>Snapshot Protection:</b> Updating this policy activates from the effective date onward. It will never recalculate previous order ledger entries.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewPolicyModalOpen(false)}
                className="h-11 px-4 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateCommissionPolicy(editingPolicy, currentUser?.name);
                  setIsNewPolicyModalOpen(false);
                  showToast(`Policy "${editingPolicy.name}" saved!`);
                }}
                className="h-11 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-black shadow-lg"
              >
                Save & Activate Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RECORD CASH HANDOVER
          ───────────────────────────────────────────────────────────── */}
      {handoverModalWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="surface p-6 max-w-md w-full space-y-4 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">Record Shift Cash Handover</h3>
              <button onClick={() => setHandoverModalWaiter(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Waiter <b>{handoverModalWaiter.name} ({handoverModalWaiter.code})</b> collected cash directly from customers during this shift.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Actual Cash Counted & Handed Over</label>
                <div className="relative">
                  <input
                    type="number"
                    value={countedCashInput}
                    onChange={e => setCountedCashInput(e.target.value)}
                    className="w-full h-12 px-3 rounded-xl border-2 border-brand-500 font-black text-lg font-mono focus:outline-none"
                    placeholder="e.g. 150000"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-slate-400 font-bold">{currency}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Settlement Notes (Optional)</label>
                <input
                  type="text"
                  value={handoverNotes}
                  onChange={e => setHandoverNotes(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium"
                  placeholder="e.g. Clean shift, no discrepancy"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setHandoverModalWaiter(null)} className="h-10 px-4 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md"
              >
                Confirm Cash Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: RECORD COMMISSION PAYOUT
          ───────────────────────────────────────────────────────────── */}
      {payoutModalWaiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="surface p-6 max-w-md w-full space-y-4 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-lg text-slate-900">Disburse Commission Payout</h3>
              <button onClick={() => setPayoutModalWaiter(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Paying approved commissions for <b>{payoutModalWaiter.name} ({payoutModalWaiter.code})</b>.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
                <select
                  value={payoutMethod}
                  onChange={e => setPayoutMethod(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  <option value="M-Pesa / Mobile Money">M-Pesa / Mobile Money</option>
                  <option value="Cash">Cash Voucher</option>
                  <option value="Bank Transfer">CRDB / NMB Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Transaction / Voucher Reference</label>
                <input
                  type="text"
                  value={payoutRef}
                  onChange={e => setPayoutRef(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-bold font-mono"
                  placeholder="e.g. MPESA-TX-123456"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setPayoutModalWaiter(null)} className="h-10 px-4 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleConfirmPayout}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md"
              >
                Disburse Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: REVERSE COMMISSION
          ───────────────────────────────────────────────────────────── */}
      {reversalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="surface p-6 max-w-md w-full space-y-4 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-lg text-rose-700">Reverse Commission Entry</h3>
              <button onClick={() => setReversalEntry(null)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Reversing commission for Order <b>#{reversalEntry.orderNumber}</b> ({reversalEntry.commissionAmount.toLocaleString()} {currency}) for waiter <b>{reversalEntry.waiterName}</b>.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Reversal</label>
              <textarea
                value={reversalReason}
                onChange={e => setReversalReason(e.target.value)}
                className="w-full h-24 p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-rose-500"
                placeholder="e.g. Order cancelled, customer refunded, or wrong attribution"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setReversalEntry(null)} className="h-10 px-4 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleConfirmReversal}
                className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md"
              >
                Confirm Reversal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
