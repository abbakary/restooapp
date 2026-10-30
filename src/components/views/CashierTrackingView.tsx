import React, { useState } from 'react';
import { useToast } from '../common/Toast';
import { ReasonDialog } from '../common/ReasonDialog';
import { 
  Receipt, 
  DollarSign, 
  CreditCard, 
  Smartphone, 
  TrendingUp, 
  Clock, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Plus, 
  Minus, 
  FileText, 
  Phone, 
  MapPin, 
  Bike, 
  ArrowRight,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Order, OrderType, OrderStatus, CustomerProfile, CashDrawerTransaction } from '../../types/erp';
import { FullWidthFormModal } from '../common/FullWidthFormModal';

export const CashierTrackingView: React.FC = () => {
  const toast = useToast();
  const [voidTarget, setVoidTarget] = useState<{ id: string; number: string } | null>(null);
  const { 
    currentSite, 
    orders, 
    currentRole, 
    payOrder, 
    voidOrder,
    setActiveTab, 
    customers, 
    addCustomer,
    cashDrawerTransactions, 
    addCashDrawerTransaction,
    billRequests,
    settleBillRequest
  } = useErp();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'drawer' | 'customers' | 'delivery'>('orders');

  // Search & Filters for orders
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | OrderType>('all');

  // Modals state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [showXReportModal, setShowXReportModal] = useState(false);
  const [showCashTxModal, setShowCashTxModal] = useState<'payout' | 'float_in' | 'cash_drop' | null>(null);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState<Order | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Credit Card' | 'M-Pesa / Mobile Money'>('Cash');

  // New cash transaction form
  const [txAmount, setTxAmount] = useState('');
  const [txReason, setTxReason] = useState('');
  const [txAuthorizedBy, setTxAuthorizedBy] = useState('Juma Mwamburi (Site Mgr)');

  // New customer form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+255 ');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustType, setNewCustType] = useState<OrderType>('Dine-in');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // X-Report actual counted cash
  const [countedCashInput, setCountedCashInput] = useState('');

  // Format currency helper
  const fmt = (val: number) => `TZS ${val.toLocaleString()}`;

  // Filter site orders
  const siteOrders = orders.filter(o => o.siteId === currentSite.id);
  const paidOrders = siteOrders.filter(o => o.status === 'paid');
  const activeOrders = siteOrders.filter(o => o.status !== 'paid' && o.status !== 'voided');

  // Financial aggregates
  const shiftGrossSales = paidOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const shiftDiscounts = paidOrders.reduce((sum, o) => sum + o.discount, 0);
  const shiftTax = paidOrders.reduce((sum, o) => sum + o.tax, 0);
  const shiftServiceCharge = paidOrders.reduce((sum, o) => sum + o.serviceCharge, 0);
  const shiftDeliveryFees = paidOrders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const shiftNetSales = shiftGrossSales - shiftDiscounts;
  const shiftTotalCollected = paidOrders.reduce((sum, o) => sum + o.total, 0);

  // Method breakdowns
  const cashPayments = paidOrders.filter(o => o.paymentMethod === 'Cash').reduce((sum, o) => sum + o.total, 0);
  const mobileMoneyPayments = paidOrders.filter(o => o.paymentMethod === 'M-Pesa / Mobile Money').reduce((sum, o) => sum + o.total, 0);
  const cardPayments = paidOrders.filter(o => o.paymentMethod === 'Credit Card').reduce((sum, o) => sum + o.total, 0);

  // Drawer reconciliation
  const floatIn = cashDrawerTransactions
    .filter(t => t.type === 'float_in')
    .reduce((sum, t) => sum + t.amount, 0);
  const drawerSales = cashDrawerTransactions
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0);
  const drawerPayouts = cashDrawerTransactions
    .filter(t => t.type === 'payout')
    .reduce((sum, t) => sum + t.amount, 0);
  const drawerDrops = cashDrawerTransactions
    .filter(t => t.type === 'cash_drop')
    .reduce((sum, t) => sum + t.amount, 0);

  const expectedDrawerCash = floatIn + drawerSales - drawerPayouts - drawerDrops;

  // Filtered orders list
  const filteredOrders = siteOrders.filter(o => {
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.pickupToken && o.pickupToken.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.tableNumber && `table ${o.tableNumber}`.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesType = typeFilter === 'all' || o.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle cash drawer transaction submit
  const handleCashTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (!amountNum || amountNum <= 0 || !txReason) return;

    if (showCashTxModal) {
      addCashDrawerTransaction({
        type: showCashTxModal,
        amount: amountNum,
        reason: txReason,
        cashierName: `${currentRole} - Neema J.`,
        authorizedBy: txAuthorizedBy
      });
    }

    setTxAmount('');
    setTxReason('');
    setShowCashTxModal(null);
  };

  // Handle new customer submit
  const handleNewCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    addCustomer({
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || undefined,
      preferredOrderType: newCustType,
      deliveryAddress: newCustAddress || undefined,
      notes: newCustNotes || undefined
    });

    setNewCustName('');
    setNewCustPhone('+255 ');
    setNewCustEmail('');
    setNewCustAddress('');
    setNewCustNotes('');
    setShowNewCustomerModal(false);
  };

  // Handle order settlement
  const handleSettleOrder = () => {
    if (!showSettleModal) return;
    payOrder(showSettleModal.id, selectedPaymentMethod);
    setShowSettleModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Cashier Shift Operational Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-sm shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cashier Operations & Tracking Hub</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Register #01 Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Cashier: <strong className="text-slate-800 font-semibold">{currentRole} (Neema Joseph)</strong></span>
                <span>•</span>
                <span>Shift Started: <strong className="text-slate-800">08:00 AM</strong></span>
                <span>•</span>
                <span>Active Branch: <strong className="text-slate-800">{currentSite.name}</strong></span>
              </p>
            </div>
          </div>

          {/* Rapid Cashier Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setShowCashTxModal('payout')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Record petty cash withdrawal (emergency supplies, ice, transport)"
            >
              <Minus className="w-3.5 h-3.5 text-rose-600" />
              <span>Petty Cash Out</span>
            </button>

            <button
              onClick={() => setShowCashTxModal('cash_drop')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Move excess drawer cash to manager safe"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Safe Drop</span>
            </button>

            <button
              onClick={() => setShowXReportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors cursor-pointer border border-amber-300"
              title="Audit current drawer balance and verify zero variance"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Mid-Shift X-Report</span>
            </button>

            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3cb371] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Open POS Terminal</span>
            </button>
          </div>
        </div>

        {/* Shift High-Level KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Gross Shift Sales</div>
            <div className="text-base font-extrabold text-slate-900 mt-1 font-mono">{fmt(shiftGrossSales)}</div>
            <div className="text-2xs text-emerald-600 font-medium mt-0.5">{paidOrders.length} settled tickets</div>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div className="text-xs font-medium text-emerald-800">Net Sales (Excl. Disc)</div>
            <div className="text-base font-extrabold text-emerald-900 mt-1 font-mono">{fmt(shiftNetSales)}</div>
            <div className="text-2xs text-slate-500 font-medium mt-0.5">Disc: {fmt(shiftDiscounts)}</div>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <div className="text-xs font-medium text-blue-800">Expected Drawer Cash</div>
            <div className="text-base font-extrabold text-blue-900 mt-1 font-mono">{fmt(expectedDrawerCash)}</div>
            <div className="text-2xs text-blue-700 font-medium mt-0.5">Float + Cash Sales - Payouts</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Mobile Money (M-Pesa)</div>
            <div className="text-base font-extrabold text-slate-900 mt-1 font-mono">{fmt(mobileMoneyPayments)}</div>
            <div className="text-2xs text-emerald-600 font-medium mt-0.5">Direct merchant escrow</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500">Credit Card POS</div>
            <div className="text-base font-extrabold text-slate-900 mt-1 font-mono">{fmt(cardPayments)}</div>
            <div className="text-2xs text-slate-500 font-medium mt-0.5">Visa / Mastercard / Amex</div>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="text-xs font-medium text-amber-800">Open Unsettled Orders</div>
            <div className="text-base font-extrabold text-amber-900 mt-1 font-mono">{activeOrders.length} tickets</div>
            <div className="text-2xs text-amber-700 font-medium mt-0.5">In Kitchen & Ready</div>
          </div>
        </div>
      </div>

      {/* Pending Waiter Bill Requests Strip */}
      {billRequests.filter(r => r.siteId === currentSite.id && r.status === 'pending').length > 0 && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-950 font-black text-sm">
              <Receipt className="w-4 h-4 text-sky-700 animate-pulse" />
              <span>Waiter Bill Preparation Requests ({billRequests.filter(r => r.siteId === currentSite.id && r.status === 'pending').length} Waiting)</span>
            </div>
            <span className="text-2xs font-bold text-sky-700 uppercase tracking-wider font-mono">Cashier Collection Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {billRequests.filter(r => r.siteId === currentSite.id && r.status === 'pending').map(req => (
              <div key={req.id} className="bg-white p-3.5 rounded-xl border border-sky-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="font-extrabold text-sm text-slate-900">
                    {req.tableNumber ? `Table ${req.tableNumber}` : req.orderNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Waiter: <b className="text-slate-800">{req.waiterName}</b> · {req.requestedAt}
                  </div>
                  <div className="text-sm font-black text-sky-800 font-mono mt-0.5">
                    TZS {req.totalAmount.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      settleBillRequest(req.id, 'Cashier (Neema J.)', 'Cash');
                      toast.success(`Settled ${req.orderNumber} in Cash at Cashier`);
                    }}
                    className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Settle Cash
                  </button>
                  <button
                    onClick={() => {
                      settleBillRequest(req.id, 'Cashier (Neema J.)', 'M-Pesa / Mobile Money');
                      toast.success(`Settled ${req.orderNumber} via M-Pesa at Cashier`);
                    }}
                    className="h-8 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Settle M-Pesa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'orders'
              ? 'bg-[#163a2b] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Orders & Transactions Stream</span>
          <span className={`text-2xs px-1.5 py-0.5 rounded-full font-mono ${activeSubTab === 'orders' ? 'bg-[#3cb371] text-white' : 'bg-slate-200 text-slate-700'}`}>
            {siteOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('drawer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'drawer'
              ? 'bg-[#163a2b] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Cash Drawer Ledger</span>
          <span className={`text-2xs px-1.5 py-0.5 rounded-full font-mono ${activeSubTab === 'drawer' ? 'bg-[#3cb371] text-white' : 'bg-slate-200 text-slate-700'}`}>
            {cashDrawerTransactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('customers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'customers'
              ? 'bg-[#163a2b] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Customers & Loyalty</span>
          <span className={`text-2xs px-1.5 py-0.5 rounded-full font-mono ${activeSubTab === 'customers' ? 'bg-[#3cb371] text-white' : 'bg-slate-200 text-slate-700'}`}>
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('delivery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'delivery'
              ? 'bg-[#163a2b] text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Delivery Dispatch Tracking</span>
          <span className={`text-2xs px-1.5 py-0.5 rounded-full font-mono ${activeSubTab === 'delivery' ? 'bg-[#3cb371] text-white' : 'bg-slate-200 text-slate-700'}`}>
            {siteOrders.filter(o => o.type === 'Delivery').length}
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: ORDERS & TRANSACTIONS STREAM */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by order #, token, customer name, table..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3cb371] focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
              >
                <option value="all">All Service Channels</option>
                <option value="Dine-in">Dine-in (Tables)</option>
                <option value="Takeaway">Takeaway (Tokens)</option>
                <option value="Delivery">Delivery (Riders)</option>
                <option value="Bar Tab">Bar Tab</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
              >
                <option value="all">All Statuses</option>
                <option value="in_kitchen">In Kitchen</option>
                <option value="ready">Ready to Settle</option>
                <option value="served">Served</option>
                <option value="paid">Paid & Settled</option>
                <option value="voided">Voided</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
                  <tr>
                    <th className="px-4 py-3">Order # / Token</th>
                    <th className="px-4 py-3">Channel & Destination</th>
                    <th className="px-4 py-3">Customer / Guest</th>
                    <th className="px-4 py-3">Items Summary</th>
                    <th className="px-4 py-3">Time & Server</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3 text-right">Total (TZS)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                        No orders matching the active search or filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isPaid = order.status === 'paid';
                      const isVoided = order.status === 'voided';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-slate-900">{order.orderNumber}</div>
                            {order.pickupToken && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-2xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 mt-0.5">
                                {order.pickupToken}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                                order.type === 'Dine-in' ? 'bg-blue-100 text-blue-800' :
                                order.type === 'Takeaway' ? 'bg-amber-100 text-amber-800' :
                                order.type === 'Delivery' ? 'bg-purple-100 text-purple-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {order.type}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">
                              {order.tableNumber ? `Table ${order.tableNumber}` : order.deliveryAddress ? `${order.deliveryAddress.substring(0, 22)}...` : 'Counter Pickup'}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800">{order.customerName || 'Walk-in Guest'}</div>
                            {order.customerPhone && (
                              <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                {order.customerPhone}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="truncate text-slate-700 font-medium">
                              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </div>
                            <div className="text-2xs text-slate-400 mt-0.5">
                              {order.items.length} unique line {order.items.length === 1 ? 'item' : 'items'}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="text-slate-700 font-medium">{order.createdAt}</div>
                            <div className="text-2xs text-slate-400">{order.serverName}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-2xs font-bold ${
                              order.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              order.status === 'ready' ? 'bg-[#3cb371]/20 text-emerald-900 border border-[#3cb371]/40' :
                              order.status === 'served' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              order.status === 'in_kitchen' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                              'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            {order.paymentMethod ? (
                              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                                {order.paymentMethod === 'Cash' && <DollarSign className="w-3 h-3 text-emerald-600" />}
                                {order.paymentMethod === 'Credit Card' && <CreditCard className="w-3 h-3 text-blue-600" />}
                                {order.paymentMethod === 'M-Pesa / Mobile Money' && <Smartphone className="w-3 h-3 text-green-600" />}
                                <span>{order.paymentMethod}</span>
                              </div>
                            ) : (
                              <span className="text-2xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Unsettled
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                            {fmt(order.total)}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Thermal Receipt Button */}
                              <button
                                onClick={() => setSelectedReceiptOrder(order)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="View & Print 80mm ESC/POS Thermal Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Settle button if unpaid */}
                              {!isPaid && !isVoided && (
                                <button
                                  onClick={() => setShowSettleModal(order)}
                                  className="px-2.5 py-1 rounded-lg bg-[#3cb371] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                >
                                  Settle
                                </button>
                              )}

                              {/* Void button */}
                              {!isPaid && !isVoided && (
                                <button
                                  onClick={() => setVoidTarget({ id: order.id, number: order.orderNumber })}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Void order ticket"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CASH DRAWER LEDGER */}
      {activeSubTab === 'drawer' && (
        <div className="space-y-6">
          {/* Drawer Balance Overview Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-[#163a2b] text-white p-6 rounded-2xl shadow-lg border border-emerald-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">Register #01 Balance Status</span>
                <h2 className="text-2xl font-black font-mono tracking-tight text-white mt-1">
                  {fmt(expectedDrawerCash)}
                </h2>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Expected cash in physical drawer right now (Opening float + cash settlements - payouts)
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowCashTxModal('payout')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer border border-white/20"
                >
                  + Record Cash Payout
                </button>
                <button
                  onClick={() => setShowCashTxModal('cash_drop')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer border border-white/20"
                >
                  + Record Safe Drop
                </button>
                <button
                  onClick={() => setShowXReportModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#3cb371] hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  Count & Verify Drawer
                </button>
              </div>
            </div>

            {/* Reconciliation breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="text-emerald-300/80 text-xs">Opening Float</span>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{fmt(floatIn)}</div>
              </div>
              <div>
                <span className="text-emerald-300/80 text-xs">Total Cash Inflow (Sales)</span>
                <div className="font-mono font-bold text-emerald-300 text-sm mt-0.5">+{fmt(drawerSales)}</div>
              </div>
              <div>
                <span className="text-emerald-300/80 text-xs">Petty Cash Payouts</span>
                <div className="font-mono font-bold text-rose-300 text-sm mt-0.5">-{fmt(drawerPayouts)}</div>
              </div>
              <div>
                <span className="text-emerald-300/80 text-xs">Midday Safe Drops</span>
                <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">-{fmt(drawerDrops)}</div>
              </div>
            </div>
          </div>

          {/* Audit Trail List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cash Drawer Real-Time Audit Log</h3>
                <p className="text-xs text-slate-500">Every single movement of physical currency logged with timestamp</p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
                {cashDrawerTransactions.length} Transactions
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {cashDrawerTransactions.map(tx => (
                <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'sale' ? 'bg-emerald-100 text-emerald-700' :
                      tx.type === 'float_in' ? 'bg-blue-100 text-blue-700' :
                      tx.type === 'payout' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tx.type === 'sale' && <DollarSign className="w-4 h-4" />}
                      {tx.type === 'float_in' && <Plus className="w-4 h-4" />}
                      {tx.type === 'payout' && <Minus className="w-4 h-4" />}
                      {tx.type === 'cash_drop' && <TrendingUp className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 capitalize">
                          {tx.type.replace('_', ' ')}
                        </span>
                        {tx.receiptNumber && (
                          <span className="text-2xs font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {tx.receiptNumber}
                          </span>
                        )}
                        <span className="text-2xs text-slate-400 font-mono">{tx.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{tx.reason}</p>
                      <div className="text-2xs text-slate-400 mt-0.5">
                        Cashier: {tx.cashierName} {tx.authorizedBy ? `• Auth by: ${tx.authorizedBy}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className={`font-mono font-bold text-sm ${
                    tx.type === 'sale' || tx.type === 'float_in' ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {tx.type === 'sale' || tx.type === 'float_in' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CUSTOMERS & LOYALTY DIRECTORY */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Profiles & Frequent Diners</h3>
              <p className="text-xs text-slate-500">Track regular guests, delivery clients, dietary notes and loyalty points</p>
            </div>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3cb371] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Customer</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map(cust => (
              <div key={cust.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-[#3cb371] transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{cust.name}</h4>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      ★ {cust.loyaltyPoints} Pts
                    </span>
                  </div>

                  {cust.deliveryAddress && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{cust.deliveryAddress}</span>
                    </div>
                  )}

                  {cust.notes && (
                    <div className="mt-2 text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      "{cust.notes}"
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-2xs text-slate-400">Lifetime Spend:</span>
                    <div className="font-mono font-bold text-slate-800">{fmt(cust.totalSpend)}</div>
                  </div>
                  <div>
                    <span className="text-2xs text-slate-400">Total Orders:</span>
                    <div className="font-mono font-bold text-slate-800 text-right">{cust.totalOrders} visits</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: DELIVERY DISPATCH TRACKING */}
      {activeSubTab === 'delivery' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Delivery Orders & Rider Fleet</h3>
              <p className="text-xs text-slate-500">Real-time delivery progress, rider dispatch status, and customer phone contacts</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
              {siteOrders.filter(o => o.type === 'Delivery').length} Delivery Runs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteOrders.filter(o => o.type === 'Delivery').length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                No active delivery orders recorded today.
              </div>
            ) : (
              siteOrders.filter(o => o.type === 'Delivery').map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                          {order.pickupToken && (
                            <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-purple-100 text-purple-900">
                              {order.pickupToken}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">{order.customerName}</div>
                        <div className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {order.customerPhone}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-2xs font-bold ${
                        order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'ready' ? 'bg-[#3cb371]/20 text-emerald-900' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'paid' ? 'DELIVERED & PAID' : order.status === 'ready' ? 'READY FOR RIDER' : 'IN KITCHEN'}
                      </span>
                    </div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold">Drop-off Address</div>
                      <div className="text-slate-800 font-medium mt-0.5 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{order.deliveryAddress || 'Address on file'}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 font-medium">
                      Items: {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-2xs text-slate-400">Total With Delivery Fee:</span>
                      <div className="font-mono font-bold text-slate-900 text-base">{fmt(order.total)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedReceiptOrder(order)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Print Rider Bill
                      </button>

                      {order.status !== 'paid' && (
                        <button
                          onClick={() => setShowSettleModal(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#3cb371] hover:bg-emerald-600 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark Delivered & Settle
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: AUTHENTIC 80MM ESC/POS THERMAL RECEIPT MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">80mm ESC/POS Thermal Receipt</span>
              </div>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Thermal paper container */}
            <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
              <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 font-mono text-xs leading-tight text-slate-900 w-full max-w-[320px]">
                {/* Header */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                  <div className="font-extrabold text-sm tracking-widest">{currentSite.name.toUpperCase()}</div>
                  <div className="text-2xs text-slate-500">TIN: 104-982-340 · VRN: 40019283-T</div>
                  <div className="text-2xs text-slate-500">Oysterbay Waterfront, Dar es Salaam</div>
                  <div className="text-2xs text-slate-500">Tel: +255 22 260 1920</div>
                </div>

                {/* Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-2xs">
                  <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <span className="font-bold">{selectedReceiptOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date & Time:</span>
                    <span>{new Date().toLocaleDateString()} {selectedReceiptOrder.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Channel:</span>
                    <span className="font-bold">{selectedReceiptOrder.type.toUpperCase()}</span>
                  </div>
                  {selectedReceiptOrder.tableNumber && (
                    <div className="flex justify-between">
                      <span>Table:</span>
                      <span className="font-bold">Table {selectedReceiptOrder.tableNumber}</span>
                    </div>
                  )}
                  {selectedReceiptOrder.pickupToken && (
                    <div className="flex justify-between">
                      <span>Token #:</span>
                      <span className="font-bold">{selectedReceiptOrder.pickupToken}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Server / Cashier:</span>
                    <span>{selectedReceiptOrder.serverName}</span>
                  </div>
                  {selectedReceiptOrder.customerName && (
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="font-bold">{selectedReceiptOrder.customerName}</span>
                    </div>
                  )}
                </div>

                {/* Items table */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1.5">
                  <div className="flex justify-between text-2xs font-bold text-slate-500 border-b border-slate-200 pb-1">
                    <span>ITEM</span>
                    <span>QTY x PRICE</span>
                    <span>TOTAL</span>
                  </div>
                  {selectedReceiptOrder.items.map(item => (
                    <div key={item.id} className="text-2xs">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="flex justify-between text-slate-500">
                        <span>{item.quantity} x {item.price.toLocaleString()}</span>
                        <span className="font-bold text-slate-900">{(item.quantity * item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-2xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{selectedReceiptOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedReceiptOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span>-{selectedReceiptOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT (18% Incl):</span>
                    <span>{selectedReceiptOrder.tax.toLocaleString()}</span>
                  </div>
                  {selectedReceiptOrder.serviceCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge (5%):</span>
                      <span>{selectedReceiptOrder.serviceCharge.toLocaleString()}</span>
                    </div>
                  )}
                  {selectedReceiptOrder.deliveryFee ? (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>{selectedReceiptOrder.deliveryFee.toLocaleString()}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-slate-300">
                    <span>TOTAL DUE:</span>
                    <span>TZS {selectedReceiptOrder.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-2xs text-slate-600 pt-0.5">
                    <span>Payment Tender:</span>
                    <span className="font-bold">{selectedReceiptOrder.paymentMethod || 'PENDING'}</span>
                  </div>
                </div>

                {/* Footer and QR barcode simulation */}
                <div className="pt-3 text-center space-y-2">
                  <div className="text-2xs text-slate-400">
                    FISCAL INVOICE VALIDATED BY TRA EFD
                  </div>
                  <div className="text-2xs font-bold text-slate-800">
                    ASANTE SANA! KARIBU TENA
                  </div>
                  <div className="h-10 bg-slate-100 flex items-center justify-center border border-dashed border-slate-300 text-2xs text-slate-400 tracking-widest">
                    |||||| | |||||||| |||| | ||||||
                  </div>
                  <div className="text-2xs text-slate-400">
                    RestoERP Cloud POS · CodeGraphics
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  toast.success('Receipt sent to printer', `${selectedReceiptOrder.orderNumber} → 80mm thermal printer`);
                  setSelectedReceiptOrder(null);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#3cb371] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CASH TRANSACTION MODAL (12-COLUMN FULL-WIDTH) */}
      {showCashTxModal && (
        <FullWidthFormModal
          isOpen={true}
          onClose={() => setShowCashTxModal(null)}
          title={
            showCashTxModal === 'payout' ? 'Record Petty Cash Payout' :
            showCashTxModal === 'cash_drop' ? 'Midday Safe Drop (Vault Transfer)' :
            'Inject Register Float'
          }
          subtitle="All physical cash events are recorded to the register ledger with authorization"
          roleBadge={currentRole}
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: () => setShowCashTxModal(null),
              variant: 'secondary'
            },
            {
              label: 'Post Transaction',
              onClick: () => {
                const amountNum = parseFloat(txAmount);
                if (!amountNum || amountNum <= 0 || !txReason) return;
                addCashDrawerTransaction({
                  type: showCashTxModal,
                  amount: amountNum,
                  reason: txReason,
                  cashierName: `${currentRole} - Neema J.`,
                  authorizedBy: txAuthorizedBy
                });
                setTxAmount('');
                setTxReason('');
                setShowCashTxModal(null);
              },
              variant: 'primary'
            }
          ]}
        >
          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Transaction Type</label>
            <input
              type="text"
              readOnly
              value={showCashTxModal.replace('_', ' ').toUpperCase()}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-mono font-bold text-slate-700"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Amount (TZS) *</label>
            <input
              type="number"
              required
              min={100}
              step={500}
              value={txAmount}
              onChange={e => setTxAmount(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Reason / Expense Description *</label>
            <input
              type="text"
              required
              value={txReason}
              onChange={e => setTxReason(e.target.value)}
              placeholder="e.g. Emergency purchase of 50kg crushed ice from Oysterbay Iceworks"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Authorized By Manager</label>
            <input
              type="text"
              value={txAuthorizedBy}
              onChange={e => setTxAuthorizedBy(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Current Expected Drawer Cash</label>
            <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-800">
              {fmt(expectedDrawerCash)}
            </div>
          </div>
        </FullWidthFormModal>
      )}

      {/* MODAL 3: MID-SHIFT X-REPORT AUDIT (12-COLUMN FULL-WIDTH) */}
      {showXReportModal && (
        <FullWidthFormModal
          isOpen={true}
          onClose={() => setShowXReportModal(false)}
          title="Mid-Shift Register X-Report (Cash Drawer Audit)"
          subtitle="Audit actual counted cash against system expected cash without closing the register"
          roleBadge={currentRole}
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Close',
              onClick: () => setShowXReportModal(false),
              variant: 'secondary'
            },
            {
              label: 'Verify Drawer Audit',
              onClick: () => {
                toast.success('X-Report verified', 'Drawer audit logged to the manager console.');
                setShowXReportModal(false);
              },
              variant: 'primary'
            }
          ]}
        >
          <div className="col-span-12 sm:col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expected Drawer Cash</div>
            <div className="text-lg font-black font-mono text-slate-900 mt-1">{fmt(expectedDrawerCash)}</div>
            <div className="text-2xs text-slate-500 mt-1">Based on initial float + cash orders - payouts</div>
          </div>

          <div className="col-span-12 sm:col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cash Count Input (TZS)</div>
            <input
              type="number"
              placeholder="Counted bills & coins"
              value={countedCashInput}
              onChange={e => setCountedCashInput(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 sm:col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drawer Variance</div>
            <div className={`text-lg font-black font-mono mt-1 ${
              countedCashInput ? (
                parseFloat(countedCashInput) - expectedDrawerCash === 0 ? 'text-emerald-700' :
                parseFloat(countedCashInput) - expectedDrawerCash > 0 ? 'text-blue-700' : 'text-rose-700'
              ) : 'text-slate-400'
            }`}>
              {countedCashInput ? fmt(parseFloat(countedCashInput) - expectedDrawerCash) : 'Pending Count'}
            </div>
            <div className="text-2xs text-slate-500 mt-1">
              {countedCashInput && (parseFloat(countedCashInput) - expectedDrawerCash === 0 ? '✓ Balanced (Zero discrepancy)' : 'Discrepancy logged')}
            </div>
          </div>

          <div className="col-span-12 space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-700">Digital Payment Ledger (Escrow Verification)</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="text-slate-500 text-2xs">M-Pesa / Mobile Money</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{fmt(mobileMoneyPayments)}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="text-slate-500 text-2xs">Credit Card Terminals</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{fmt(cardPayments)}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="text-slate-500 text-2xs">Total Settled Tickets</div>
                <div className="font-mono font-bold text-slate-800 mt-0.5">{paidOrders.length} orders</div>
              </div>
            </div>
          </div>
        </FullWidthFormModal>
      )}

      {/* MODAL 4: REGISTER NEW CUSTOMER (12-COLUMN FULL-WIDTH) */}
      {showNewCustomerModal && (
        <FullWidthFormModal
          isOpen={true}
          onClose={() => setShowNewCustomerModal(false)}
          title="Register New Customer / Client Record"
          subtitle="Capture phone contact, delivery destination, and dining preferences"
          roleBadge={currentRole}
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: () => setShowNewCustomerModal(false),
              variant: 'secondary'
            },
            {
              label: 'Save Customer Profile',
              onClick: () => {
                if (!newCustName || !newCustPhone) return;
                addCustomer({
                  name: newCustName,
                  phone: newCustPhone,
                  email: newCustEmail || undefined,
                  preferredOrderType: newCustType,
                  deliveryAddress: newCustAddress || undefined,
                  notes: newCustNotes || undefined
                });
                setNewCustName('');
                setNewCustPhone('+255 ');
                setNewCustEmail('');
                setNewCustAddress('');
                setNewCustNotes('');
                setShowNewCustomerModal(false);
              },
              variant: 'primary'
            }
          ]}
        >
          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              value={newCustName}
              onChange={e => setNewCustName(e.target.value)}
              placeholder="e.g. Maryam Said"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Phone Number (Tanzania) *</label>
            <input
              type="text"
              required
              value={newCustPhone}
              onChange={e => setNewCustPhone(e.target.value)}
              placeholder="+255 7..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
            <input
              type="email"
              value={newCustEmail}
              onChange={e => setNewCustEmail(e.target.value)}
              placeholder="e.g. maryam@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Preferred Order Channel</label>
            <select
              value={newCustType}
              onChange={e => setNewCustType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            >
              <option value="Dine-in">Dine-in (Restaurant Table)</option>
              <option value="Takeaway">Takeaway (Counter Pickup)</option>
              <option value="Delivery">Delivery (Home / Office)</option>
            </select>
          </div>

          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Delivery Address (Street, Building, Landmark)</label>
            <input
              type="text"
              value={newCustAddress}
              onChange={e => setNewCustAddress(e.target.value)}
              placeholder="e.g. Haile Selassie Road, Plot 14, Masaki, Dar es Salaam"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>

          <div className="col-span-12 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Customer Preferences / Dietary Notes</label>
            <textarea
              rows={2}
              value={newCustNotes}
              onChange={e => setNewCustNotes(e.target.value)}
              placeholder="e.g. VIP guest, likes well-done beef, allergic to peanuts"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
            />
          </div>
        </FullWidthFormModal>
      )}

      {/* MODAL 5: SETTLE PAYMENT DIALOG */}
      {showSettleModal && (
        <FullWidthFormModal
          isOpen={true}
          onClose={() => setShowSettleModal(null)}
          title={`Settle Bill: ${showSettleModal.orderNumber}`}
          subtitle={`Total Due: ${fmt(showSettleModal.total)} · ${showSettleModal.type}`}
          roleBadge={currentRole}
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: () => setShowSettleModal(null),
              variant: 'secondary'
            },
            {
              label: 'Confirm Settlement & Print Receipt',
              onClick: handleSettleOrder,
              variant: 'primary'
            }
          ]}
        >
          <div className="col-span-12 space-y-2">
            <label className="text-xs font-bold text-slate-700">Select Payment Method</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('Cash')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPaymentMethod === 'Cash'
                    ? 'border-[#3cb371] bg-emerald-50/70 ring-2 ring-[#3cb371]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-5 h-5 text-emerald-700" />
                <div className="font-bold text-xs text-slate-900 mt-2">Cash Tender</div>
                <div className="text-2xs text-slate-500">Auto added to physical drawer float</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('M-Pesa / Mobile Money')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPaymentMethod === 'M-Pesa / Mobile Money'
                    ? 'border-[#3cb371] bg-emerald-50/70 ring-2 ring-[#3cb371]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-green-700" />
                <div className="font-bold text-xs text-slate-900 mt-2">M-Pesa / Tigo Pesa</div>
                <div className="text-2xs text-slate-500">Direct merchant till code</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('Credit Card')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedPaymentMethod === 'Credit Card'
                    ? 'border-[#3cb371] bg-emerald-50/70 ring-2 ring-[#3cb371]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-blue-700" />
                <div className="font-bold text-xs text-slate-900 mt-2">Credit Card / Debit</div>
                <div className="text-2xs text-slate-500">Visa / Mastercard POS terminal</div>
              </button>
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-2xs font-bold text-slate-400 uppercase">Items Breakdown</span>
            <div className="text-xs text-slate-700 mt-1 space-y-1">
              {showSettleModal.items.map(i => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.quantity}x {i.name}</span>
                  <span className="font-mono font-medium">{fmt(i.quantity * i.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 sm:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-mono">{fmt(showSettleModal.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>VAT (18%):</span>
                <span className="font-mono">{fmt(showSettleModal.tax)}</span>
              </div>
              {showSettleModal.serviceCharge > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Service (5%):</span>
                  <span className="font-mono">{fmt(showSettleModal.serviceCharge)}</span>
                </div>
              )}
              {showSettleModal.deliveryFee ? (
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Fee:</span>
                  <span className="font-mono">{fmt(showSettleModal.deliveryFee)}</span>
                </div>
              ) : null}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-extrabold text-sm text-slate-900">Total Due:</span>
              <span className="font-mono font-black text-emerald-800 text-lg">{fmt(showSettleModal.total)}</span>
            </div>
          </div>
        </FullWidthFormModal>
      )}
      <ReasonDialog
        open={!!voidTarget}
        title={`Void ${voidTarget?.number ?? 'order'}?`}
        description="This cancels the ticket and is recorded in the void audit. A reason is required."
        placeholder="e.g. Guest left before order was served"
        confirmLabel="Void order"
        onCancel={() => setVoidTarget(null)}
        onConfirm={reason => {
          if (voidTarget) { voidOrder(voidTarget.id, reason); toast.warning('Order voided', `${voidTarget.number} — ${reason}`); }
          setVoidTarget(null);
        }}
      />
    </div>
  );
};
