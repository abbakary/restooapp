import React, { useEffect, useMemo, useState } from 'react';
import {
  BellRing, Check, ChevronUp, Flame, Receipt, ShoppingCart, X, Plus, Clock, Users, ArrowLeft,
  QrCode, ConciergeBell, Brush, ChefHat, Share2, Copy, RotateCw, Wallet, DollarSign, Smartphone,
  MessageSquare, ExternalLink, Sparkles, AlertCircle, ShieldCheck, CheckCircle2,
  LayoutGrid, ClipboardList, Utensils
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Order, RestaurantTable, OrderSource } from '../../types/erp';
import {
  CartLines, COURSES, FulfilmentCard, MenuBrowser, OrderQueue, ServiceSwitch, ServiceType, TableFloor, TotalsBlock,
  calcTotals, isOpenOrder, itemStatusCls, statusMeta, toOrderItems, tzs, useCart, useFulfilment,
} from '../front/shared';
import { PwaInstallButton, PwaMobileBanner } from '../common/PwaInstallPrompt';

/* ────────────────────────────────────────────────────────────────
   Ordering workspace — full-screen mobile-optimized POS pad
   ──────────────────────────────────────────────────────────────── */
const OrderingWorkspace: React.FC<{
  mode: ServiceType;
  existing: Order | null;
  initialTable: number | null;
  onClose: () => void;
  onSent: (msg: string, order: Order | null) => void;
}> = ({ mode, existing, initialTable, onClose, onSent }) => {
  const { tables, menuItems, addOrder, addItemsToOrder, currentSite, waiterProfiles, currentUser } = useErp();
  const cart = useCart();
  const ful = useFulfilment(initialTable);
  const { f } = ful;
  const [sheet, setSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentWaiter = waiterProfiles.find(w => w.employeeId === currentUser?.id) || waiterProfiles[0];

  const fee = existing ? existing.deliveryFee || 0 : mode === 'Delivery' ? ful.fee : 0;
  const totals = calcTotals((existing?.subtotal ?? 0) + cart.subtotal, mode, currentSite, fee, existing?.discount || 0);

  const submit = () => {
    if (cart.lines.length === 0) return;
    if (!existing && mode === 'Dine-in' && f.tableNumber == null) { setError('Choose a table.'); return; }
    if (!existing && mode === 'Delivery' && !f.address.trim()) { setError('Add the delivery address.'); return; }
    const items = toOrderItems(cart.lines);
    if (existing) {
      addItemsToOrder(existing.id, items);
      onSent(`Added ${cart.count} item${cart.count === 1 ? '' : 's'} · kitchen ticket fired`, existing);
    } else {
      const created = addOrder({
        type: mode,
        source: 'POS',
        tableNumber: mode === 'Dine-in' ? f.tableNumber ?? undefined : undefined,
        guestCount: mode === 'Dine-in' ? f.guests : 1,
        customerName: mode === 'Dine-in' ? undefined : f.name.trim() || undefined,
        customerPhone: mode === 'Dine-in' ? undefined : f.phone.trim() || undefined,
        deliveryAddress: mode === 'Delivery' ? f.address.trim() : undefined,
        deliveryFee: mode === 'Delivery' ? ful.fee : 0,
        pickupToken: mode === 'Takeaway' ? f.token : undefined,
        serverName: currentWaiter ? `${currentWaiter.name} (${currentWaiter.code})` : 'Floor Server',
        assignedWaiterId: currentWaiter?.id,
        assignedWaiterCode: currentWaiter?.code,
        assignedWaiterName: currentWaiter?.name,
        items,
      });
      onSent(`${mode === 'Dine-in' ? `Table ${f.tableNumber}` : created.pickupToken || created.orderNumber} sent to kitchen`, created);
    }
  };

  const title = existing
    ? `Add to ${existing.type === 'Dine-in' ? `Table ${existing.tableNumber}` : existing.pickupToken || existing.orderNumber}`
    : mode === 'Dine-in' ? `New order · ${f.tableNumber != null ? `Table ${f.tableNumber}` : 'choose table'}` : `New ${mode.toLowerCase()} order`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] animate-fade-in">
      {/* Top Header */}
      <header className="shrink-0 h-16 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <button 
            onClick={onClose} 
            className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center gap-1.5 font-bold text-sm text-slate-800 transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-black leading-tight truncate text-slate-900">{title}</h1>
            <p className="text-2xs sm:text-xs text-slate-500 truncate">Tap dishes to add · notes & courses in ticket</p>
          </div>
        </div>

        {cart.count > 0 && (
          <button 
            onClick={() => setSheet(true)}
            className="lg:hidden h-10 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Ticket ({cart.count})</span>
          </button>
        )}
      </header>

      <div className="flex-1 min-h-0 flex relative">
        <div className="flex-1 min-w-0 min-h-0 relative pb-20 lg:pb-0">
          <MenuBrowser items={menuItems} cart={cart} hideSoldOut />

          {/* Floating ticket preview bar on mobile */}
          {cart.count > 0 && (
            <div className="lg:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-4 z-40">
              <button 
                onClick={() => setSheet(true)} 
                className="w-full h-14 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center justify-between px-5 active:scale-98 transition-transform"
              >
                <span className="flex items-center gap-2.5 text-sm font-black">
                  <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs">
                    {cart.count}
                  </span>
                  View ticket
                </span>
                <span className="flex items-center gap-2 text-sm font-black tabular-nums font-mono">
                  {tzs(cart.subtotal)} <ChevronUp className="w-4 h-4 text-emerald-400" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Ticket Drawer / Aside */}
        <aside className={`${sheet ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:static lg:z-auto lg:flex w-full lg:w-[410px] xl:w-[450px] shrink-0 flex-col bg-white border-l border-slate-200 min-h-0`}>
          <div className="shrink-0 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-base sm:text-lg font-black leading-tight text-slate-900">Kitchen ticket</div>
              <div className="text-xs font-semibold text-slate-500">{cart.count} item{cart.count === 1 ? '' : 's'}</div>
            </div>
            {cart.lines.length > 0 && (
              <button onClick={cart.clear} className="h-9 px-2.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50">
                Clear
              </button>
            )}
            <button 
              onClick={() => setSheet(false)} 
              className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600" 
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-4 space-y-4 bg-slate-50">
            <FulfilmentCard mode={mode} state={ful} tables={tables} locked={!!existing} />
            {cart.lines.length > 0 ? (
              <CartLines cart={cart} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
                <ShoppingCart className="w-12 h-12 mx-auto text-slate-300" />
                <div className="mt-2 text-base font-extrabold text-slate-700">Nothing added yet</div>
                <div className="text-xs text-slate-500">Pick dishes from the menu.</div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-4 space-y-3 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.2)] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {error && <p className="text-xs font-bold text-rose-600">{error}</p>}
            {(cart.lines.length > 0 || existing) && (
              <TotalsBlock t={totals} vatLabel={`VAT (${Math.round(currentSite.taxRate * 100)}%)`} />
            )}
            <button
              onClick={submit}
              disabled={cart.lines.length === 0}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:bg-slate-300 disabled:text-slate-500 text-white text-base font-black flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-900/20 transition-all"
            >
              <Flame className="w-5 h-5 text-amber-300" /> Send to kitchen
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Front-house view with Waiter Links, Commission Tracking & Payments
   Mobile-First Native App Interface
   ──────────────────────────────────────────────────────────────── */
type WaiterMobileTab = 'floor' | 'orders' | 'earnings' | 'share';

export const WaiterView: React.FC = () => {
  const {
    tables, orders, currentSite, serviceMode, setServiceMode, updateOrderItemStatus, updateOrderStatus,
    updateTableStatus, waiterProfiles, rotateWaiterLink, commissionLedger, commissionPayouts,
    recordWaiterDirectPayment, submitBillRequest, currentUser, setActiveCustomerWaiterCode, setActiveTab
  } = useErp();

  // Navigation tab state
  const [mobileTab, setMobileTab] = useState<WaiterMobileTab>('floor');
  const [viewTab, setViewTab] = useState<'floor' | 'earnings'>('floor');

  const [channel, setChannel] = useState<ServiceType>('Dine-in');
  const [selTable, setSelTable] = useState<number | null>(null);
  const [selOrderId, setSelOrderId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<{ mode: ServiceType; table: number | null; extra: boolean } | null>(null);
  const [detailSheet, setDetailSheet] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Modals
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [directPayMethod, setDirectPayMethod] = useState<'Cash' | 'M-Pesa / Mobile Money'>('Cash');
  const [mpesaRefInput, setMpesaRefInput] = useState<string>('MPESA-REF-' + Math.floor(100000 + Math.random() * 900000));
  const [copiedLink, setCopiedLink] = useState(false);

  // Active waiter profile (defaults to logged-in user or senior waiter)
  const currentWaiter = useMemo(() => {
    return waiterProfiles.find(w => w.employeeId === currentUser?.id) || waiterProfiles[0];
  }, [waiterProfiles, currentUser]);

  const siteOrders = useMemo(() => orders.filter(o => o.siteId === currentSite.id && isOpenOrder(o)), [orders, currentSite.id]);
  const counts: Record<ServiceType, number> = {
    'Dine-in': siteOrders.filter(o => o.type === 'Dine-in').length,
    Takeaway: siteOrders.filter(o => o.type === 'Takeaway').length,
    Delivery: siteOrders.filter(o => o.type === 'Delivery').length,
  };

  // Waiter ordering URL (canonical customer portal format)
  const waiterSlug = currentSite.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const orderingLink = `https://order.dukadigital.co.tz/restaurant/${waiterSlug}/w/${currentWaiter?.code || 'W-101'}`;

  // Private earnings for this waiter only (Strict Isolation)
  const myLedgerEntries = useMemo(() => {
    return commissionLedger.filter(e => e.waiterId === currentWaiter?.id);
  }, [commissionLedger, currentWaiter]);

  const myEarningsStats = useMemo(() => {
    const earned = myLedgerEntries.filter(e => e.status !== 'reversed').reduce((s, e) => s + e.commissionAmount, 0);
    const approved = myLedgerEntries.filter(e => e.status === 'approved').reduce((s, e) => s + e.commissionAmount, 0);
    const paid = myLedgerEntries.filter(e => e.status === 'paid').reduce((s, e) => s + e.commissionAmount, 0);
    const portalCount = myLedgerEntries.filter(e => e.source === 'WAITER_LINK' || e.source === 'CUSTOMER_PORTAL').length;
    return { earned, approved, paid, portalCount };
  }, [myLedgerEntries]);

  // Online orders assigned to this waiter from their customer link
  const myOnlineOrders = useMemo(() => {
    return siteOrders.filter(o => 
      o.assignedWaiterId === currentWaiter?.id && 
      (o.source === 'WAITER_LINK' || o.source === 'CUSTOMER_PORTAL')
    );
  }, [siteOrders, currentWaiter]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const hasReady = (o: Order) => o.status === 'ready' || o.items.some(i => i.status === 'ready');
  const readyOrders = siteOrders.filter(hasReady);
  const label = (o: Order) => (o.type === 'Dine-in' ? `Table ${o.tableNumber}` : o.pickupToken || o.orderNumber);

  const selected: Order | null = channel === 'Dine-in'
    ? siteOrders.find(o => o.type === 'Dine-in' && o.tableNumber === selTable) || null
    : siteOrders.find(o => o.id === selOrderId && o.type === channel) || null;
  const selectedTable: RestaurantTable | undefined = tables.find(t => t.number === selTable);

  const serveReady = (o: Order) => {
    const n = o.items.filter(i => i.status === 'ready').length;
    o.items.forEach(i => { if (i.status === 'ready') updateOrderItemStatus(o.id, i.id, 'served'); });
    updateOrderStatus(o.id, 'served');
    setNotice(`${n || 'All'} dish${n === 1 ? '' : 'es'} served · ${label(o)}`);
  };

  const onTable = (t: RestaurantTable) => {
    setChannel('Dine-in');
    if (t.status === 'dirty') { setNotice(`Table ${t.number} needs cleaning first`); return; }
    setSelTable(t.number);
    const hasOrder = siteOrders.some(o => o.type === 'Dine-in' && o.tableNumber === t.number);
    if (hasOrder) setDetailSheet(true);
    else setWorkspace({ mode: 'Dine-in', table: t.number, extra: false });
  };

  const switchChannel = (c: ServiceType) => { setChannel(c); setSelOrderId(null); setDetailSheet(false); };

  const courseGroups = selected ? COURSES.map(c => ({ course: c, items: selected.items.filter(i => i.course === c) })).filter(g => g.items.length) : [];
  const readyCount = selected ? selected.items.filter(i => i.status === 'ready').length : 0;

  // Handle direct payment confirmation
  const handleConfirmDirectPayment = () => {
    if (!selected) return;
    recordWaiterDirectPayment(
      selected.id,
      directPayMethod,
      selected.total,
      directPayMethod.includes('M-Pesa') ? mpesaRefInput : undefined
    );
    setPaymentModalOpen(false);
    setDetailSheet(false);
    setNotice(`Payment of ${tzs(selected.total)} confirmed via ${directPayMethod}!`);
  };

  // Handle bill request to cashier
  const handleRequestCashierBill = () => {
    if (!selected) return;
    submitBillRequest(selected.id, currentWaiter?.id);
    setNotice(`Bill request sent to Cashier Hub · Table ${selected.tableNumber || selected.orderNumber}`);
  };

  // Copy ordering link helper
  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Rotate link helper
  const handleRotateLink = () => {
    if (!currentWaiter) return;
    const { token } = rotateWaiterLink(currentWaiter.id);
    setNotice(`Ordering link rotated! New token: ${token}`);
  };

  // Test link in customer portal
  const handleTestAsCustomer = () => {
    if (currentWaiter) {
      setActiveCustomerWaiterCode(currentWaiter.code);
      setActiveTab('customer-portal');
    }
  };

  const detail = (
    <aside className={`${detailSheet ? 'fixed inset-0 z-40 flex' : 'hidden'} lg:static lg:z-auto lg:flex w-full lg:w-[410px] xl:w-[450px] shrink-0 flex-col bg-white border-l border-slate-200 min-h-0`}>
      <div className="shrink-0 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
          <ConciergeBell className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base sm:text-lg font-black leading-tight truncate">
            {selected ? label(selected) : channel === 'Dine-in' ? (selTable ? `Table ${selTable}` : 'Select a table') : 'Select an order'}
          </div>
          {selected && (
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selected.createdAt}</span>
              {selected.type === 'Dine-in' && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{selected.guestCount}</span>}
              {selected.source && (
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  selected.source === 'WAITER_LINK' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {selected.source === 'WAITER_LINK' ? '★ My Link' : selected.source}
                </span>
              )}
            </div>
          )}
        </div>
        {selected && (
          <span className={`text-2xs font-extrabold px-2.5 py-1 rounded-full border ${statusMeta(selected).cls}`}>
            {statusMeta(selected).label}
          </span>
        )}
        <button 
          onClick={() => setDetailSheet(false)} 
          className="lg:hidden w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600" 
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-4 space-y-4 bg-slate-50">
        {!selected ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">
            <ChefHat className="w-12 h-12 mx-auto text-slate-300" />
            <div className="mt-2 text-base font-extrabold text-slate-700">
              {channel === 'Dine-in' ? 'Tap a table' : `Pick a ${channel.toLowerCase()} order`}
            </div>
            <div className="text-xs text-slate-500">
              {channel === 'Dine-in' ? 'Free tables start an order in 1 tap.' : 'Or create one from queue.'}
            </div>
          </div>
        ) : (
          <>
            {courseGroups.map(g => (
              <div key={g.course}>
                <div className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{g.course}</div>
                <ul className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100">
                  {g.items.map(it => (
                    <li key={it.id} className="flex items-center gap-2.5 p-2.5">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${itemStatusCls(it.status)}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold truncate">{it.quantity} × {it.name}</div>
                        <div className="text-2xs text-slate-500 capitalize">{it.status}{it.specialNotes ? ` · ${it.specialNotes}` : ''}</div>
                      </div>
                      {it.status === 'ready' ? (
                        <button 
                          onClick={() => updateOrderItemStatus(selected.id, it.id, 'served')} 
                          className="h-9 px-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
                        >
                          <Check className="w-3.5 h-3.5" /> Serve
                        </button>
                      ) : (
                        <span className="text-2xs font-bold uppercase text-slate-400">{it.status}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {selected.billRequested && (
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Guest requested bill via Customer Portal</span>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4 space-y-2.5 shadow-lg pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Order Subtotal</span>
            <span className="text-base font-black text-slate-900 font-mono tabular-nums">{tzs(selected.total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setWorkspace({ mode: selected.type as ServiceType, table: selected.tableNumber ?? null, extra: true })}
              className="h-11 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Add items
            </button>

            {readyCount > 0 ? (
              <button
                onClick={() => serveReady(selected)}
                className="h-11 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <Check className="w-4 h-4" /> Serve ready ({readyCount})
              </button>
            ) : (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="h-11 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <DollarSign className="w-4 h-4" /> Collect payment
              </button>
            )}
          </div>

          <button
            onClick={handleRequestCashierBill}
            className="w-full h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            <span>Forward to Cashier Station</span>
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <div className="h-[100dvh] bg-slate-100 flex flex-col overflow-hidden relative select-none">
      {/* PWA Mobile Header Banner */}
      <PwaMobileBanner roleContext="waiter" title="Install Waiter PWA" />

      {/* Top Mobile/App Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2.5 z-20 shadow-xs">
        {/* Waiter identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <img 
            src={currentWaiter?.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'} 
            alt={currentWaiter?.name} 
            className="w-9 h-9 rounded-xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-slate-900 leading-tight flex items-center gap-1.5 truncate">
              <span className="truncate">{currentWaiter?.name}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-extrabold shrink-0">
                {currentWaiter?.code}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="truncate">{currentSite.name}</span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick PWA Install button */}
          <PwaInstallButton label="Install App" variant="header" />

          {/* Waiter Subview Toggle (Floor vs Earnings) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setViewTab('floor'); setMobileTab('floor'); }}
              className={`px-2.5 py-1 rounded-lg transition-colors text-xs font-bold ${viewTab === 'floor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Floor
            </button>
            <button
              onClick={() => { setViewTab('earnings'); setMobileTab('earnings'); }}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${viewTab === 'earnings' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Earnings</span>
              <span className="sm:hidden">{tzs(myEarningsStats.earned)}</span>
            </button>
          </div>

          {/* Share Link button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="h-8.5 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:from-purple-700 hover:to-indigo-700 transition active:scale-95 shrink-0"
            title="My Personal Ordering Link & QR"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My QR Link</span>
          </button>
        </div>
      </header>

      {/* Online Customer Order Alert Strip */}
      {myOnlineOrders.length > 0 && mobileTab !== 'earnings' && (
        <div className="shrink-0 bg-purple-50 border-b border-purple-200 px-3 sm:px-4 py-2 flex items-center justify-between text-xs font-bold text-purple-900 z-10 animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="w-4 h-4 text-purple-600 animate-bounce shrink-0" />
            <span className="truncate">
              <b>{myOnlineOrders.length} online order{myOnlineOrders.length === 1 ? '' : 's'}</b> from your customer link!
            </span>
          </div>
          <button
            onClick={() => {
              const firstOnline = myOnlineOrders[0];
              if (firstOnline) {
                setChannel(firstOnline.type as ServiceType);
                if (firstOnline.type === 'Dine-in') setSelTable(firstOnline.tableNumber ?? null);
                else setSelOrderId(firstOnline.id);
                setDetailSheet(true);
              }
            }}
            className="text-2xs font-extrabold px-2.5 py-1 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm shrink-0"
          >
            View Ticket →
          </button>
        </div>
      )}

      {/* Main Content View (Switches based on mobileTab / desktop viewTab) */}
      {(viewTab === 'floor' && mobileTab !== 'earnings') ? (
        <div className="flex-1 min-h-0 flex flex-col relative pb-[max(5rem,calc(env(safe-area-inset-bottom)+4.5rem))] lg:pb-0">
          {/* Channel selector (Dine-in / Takeaway / Delivery) */}
          <div className="shrink-0 px-3 sm:px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
            <ServiceSwitch value={channel} onChange={switchChannel} counts={counts} />

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWorkspace({ mode: channel, table: selTable, extra: false })}
                className="h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Order</span>
              </button>
            </div>
          </div>

          {/* Ready orders strip */}
          {readyOrders.length > 0 && (
            <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto">
              <span className="text-2xs font-black uppercase text-amber-900 flex items-center gap-1 shrink-0">
                <BellRing className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Ready at pass:
              </span>
              <div className="flex items-center gap-2">
                {readyOrders.map(o => (
                  <div key={o.id} className="shrink-0 flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 pl-2.5 pr-1 py-1 shadow-2xs">
                    <button 
                      onClick={() => { 
                        setChannel(o.type as ServiceType); 
                        if (o.type === 'Dine-in') setSelTable(o.tableNumber ?? null); 
                        else setSelOrderId(o.id); 
                        setDetailSheet(true); 
                      }} 
                      className="text-xs font-black text-slate-900 hover:underline"
                    >
                      {label(o)}
                    </button>
                    <span className="text-[10px] font-bold text-slate-500">
                      {o.items.filter(i => i.status === 'ready').length || '✓'} dish
                    </span>
                    <button 
                      onClick={() => serveReady(o)} 
                      className="h-7 px-2 rounded-lg bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 text-2xs font-extrabold flex items-center gap-0.5"
                    >
                      <Check className="w-3 h-3" /> Serve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work area: TableFloor or OrderQueue based on mobileTab or channel */}
          <div className="flex-1 min-h-0 flex relative">
            <main className="flex-1 min-w-0 min-h-0 overflow-y-auto">
              {channel === 'Dine-in' ? (
                mobileTab === 'orders' ? (
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="font-black text-base text-slate-900">Active Dine-in Table Tickets</h3>
                      <span className="text-xs text-slate-500">{siteOrders.filter(o => o.type === 'Dine-in').length} active</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {siteOrders.filter(o => o.type === 'Dine-in').map(o => (
                        <div
                          key={o.id}
                          onClick={() => { setSelTable(o.tableNumber ?? null); setDetailSheet(true); }}
                          className={`p-4 rounded-2xl bg-white border-2 cursor-pointer transition-all ${
                            selTable === o.tableNumber ? 'border-emerald-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-slate-900">Table {o.tableNumber}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${statusMeta(o).cls}`}>
                              {statusMeta(o).label}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span>{o.items.length} items</span>
                            <span>·</span>
                            <span>{o.guestCount} guests</span>
                            <span>·</span>
                            <span>{o.createdAt}</span>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="font-mono font-black text-emerald-700">{tzs(o.total)}</span>
                            <span className="text-2xs font-bold text-slate-400">Tap to manage →</span>
                          </div>
                        </div>
                      ))}
                      {siteOrders.filter(o => o.type === 'Dine-in').length === 0 && (
                        <div className="col-span-full p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-xs">
                          No active dine-in table orders right now. Tap "Floor" to start an order on a table!
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <TableFloor 
                    selected={selTable} 
                    onSelect={onTable} 
                    emptyHint="Green = Free (tap to order). Amber = Active Order. Tap for details." 
                  />
                )
              ) : (
                <OrderQueue
                  mode={channel}
                  selectedId={selOrderId}
                  onSelect={o => { setSelOrderId(o.id); setDetailSheet(true); }}
                  onNew={() => setWorkspace({ mode: channel, table: null, extra: false })}
                />
              )}
            </main>
            {detail}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           VIEW 2: WAITER PRIVATE EARNINGS DASHBOARD (Mobile-Optimized)
           ───────────────────────────────────────────────────────────── */
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50 pb-[max(5rem,calc(env(safe-area-inset-bottom)+4.5rem))]">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Shift Earnings & Commissions</h2>
              <p className="text-xs text-slate-500">Live order-by-order calculation snapshot for your shift.</p>
            </div>
            <button
              onClick={() => { setViewTab('floor'); setMobileTab('floor'); }}
              className="lg:hidden text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              ← Back to Floor
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="surface p-3.5 sm:p-4 border-l-4 border-emerald-500 bg-white rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Earned Today</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 tabular-nums font-mono">
                {tzs(myEarningsStats.earned)}
              </div>
              <span className="text-[11px] text-slate-500">Direct & Online orders</span>
            </div>

            <div className="surface p-3.5 sm:p-4 border-l-4 border-sky-500 bg-white rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Approved for Payout</span>
              <div className="text-xl sm:text-2xl font-black text-sky-700 mt-1 tabular-nums font-mono">
                {tzs(myEarningsStats.approved)}
              </div>
              <span className="text-[11px] text-slate-500">Manager authorized</span>
            </div>

            <div className="surface p-3.5 sm:p-4 border-l-4 border-purple-500 bg-white rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Paid Out To Date</span>
              <div className="text-xl sm:text-2xl font-black text-purple-700 mt-1 tabular-nums font-mono">
                {tzs(myEarningsStats.paid)}
              </div>
              <span className="text-[11px] text-slate-500">M-Pesa / Cash settled</span>
            </div>

            <div className="surface p-3.5 sm:p-4 border-l-4 border-indigo-500 bg-white rounded-2xl shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Customer Link Orders</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-700 mt-1 tabular-nums font-mono">
                {myEarningsStats.portalCount}
              </div>
              <span className="text-[11px] text-slate-500">Via your personal URL</span>
            </div>
          </div>

          {/* Waiter's Personal Ledger */}
          <div className="surface p-4 sm:p-5 bg-white rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Your Commission Ledger</h3>
                <p className="text-2xs sm:text-xs text-slate-500">Every order credited to code <b>{currentWaiter?.code}</b></p>
              </div>
              <span className="text-2xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                {myLedgerEntries.length} orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 font-bold text-slate-400 uppercase text-[10px] bg-slate-50">
                    <th className="py-2 px-2.5">Order</th>
                    <th className="py-2 px-2.5">Source</th>
                    <th className="py-2 px-2.5 text-right">Order Total</th>
                    <th className="py-2 px-2.5 text-right">Commission</th>
                    <th className="py-2 px-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myLedgerEntries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold font-mono text-slate-900">{entry.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{entry.createdAt}</div>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                          entry.source === 'WAITER_LINK' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {entry.source === 'WAITER_LINK' ? '★ Link' : entry.source}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right font-mono">{tzs(entry.orderTotal)}</td>
                      <td className="py-2.5 px-2.5 text-right font-black text-emerald-700 font-mono">
                        +{tzs(entry.commissionAmount)}
                      </td>
                      <td className="py-2.5 px-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          entry.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : (entry.status === 'approved' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800')
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {myLedgerEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No orders recorded yet for this shift. Share your link or take floor orders!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: SHARE MY ORDERING LINK
          ───────────────────────────────────────────────────────────── */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="surface p-5 max-w-md w-full bg-white rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-base sm:text-lg text-slate-900">My Customer Ordering Link</h3>
              </div>
              <button onClick={() => setShareModalOpen(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              When customers order through your link, it is <b>automatically assigned to you ({currentWaiter?.name})</b> with your commission tracked!
            </p>

            {/* Simulated QR Code Display */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="25" height="25" fill="#163a2b" rx="4" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="#163a2b" />

                  <rect x="70" y="5" width="25" height="25" fill="#163a2b" rx="4" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="#163a2b" />

                  <rect x="5" y="70" width="25" height="25" fill="#163a2b" rx="4" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="#163a2b" />

                  <rect x="35" y="10" width="8" height="8" fill="#10b981" />
                  <rect x="47" y="12" width="6" height="6" fill="#163a2b" />
                  <rect x="57" y="8" width="8" height="8" fill="#10b981" />
                  <rect x="15" y="35" width="8" height="8" fill="#163a2b" />
                  <rect x="28" y="38" width="6" height="6" fill="#10b981" />
                  <rect x="38" y="32" width="10" height="10" fill="#163a2b" />
                  <rect x="52" y="36" width="6" height="6" fill="#163a2b" />
                  <rect x="62" y="32" width="12" height="12" fill="#10b981" />
                  <rect x="78" y="35" width="8" height="8" fill="#163a2b" />
                  
                  <rect x="10" y="52" width="6" height="6" fill="#10b981" />
                  <rect x="22" y="48" width="8" height="8" fill="#163a2b" />
                  <rect x="35" y="55" width="8" height="8" fill="#10b981" />
                  <rect x="48" y="48" width="10" height="10" fill="#163a2b" />
                  <rect x="65" y="52" width="8" height="8" fill="#10b981" />
                  <rect x="78" y="48" width="12" height="12" fill="#163a2b" />

                  <rect x="35" y="70" width="8" height="8" fill="#163a2b" />
                  <rect x="47" y="75" width="10" height="10" fill="#10b981" />
                  <rect x="62" y="72" width="8" height="8" fill="#163a2b" />
                  <rect x="74" y="78" width="14" height="14" fill="#10b981" />
                </svg>
              </div>

              <div className="text-[11px] text-slate-500 font-mono truncate max-w-[280px]">
                {orderingLink}
              </div>
            </div>

            {/* Sharing buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleCopyLink}
                className="h-11 px-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-800 transition active:scale-95"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Hi! Order directly from our restaurant menu here: ${orderingLink}`)}`}
                target="_blank"
                rel="noreferrer"
                className="h-11 px-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-emerald-700 transition active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share WhatsApp</span>
              </a>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setShareModalOpen(false);
                  handleTestAsCustomer();
                }}
                className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test View as Customer</span>
              </button>

              <button
                onClick={handleRotateLink}
                className="text-[11px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition"
                title="Revoke and rotate compromised link token"
              >
                <RotateCw className="w-3 h-3" />
                <span>Rotate Token</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: DIRECT PAYMENT COLLECTION
          ───────────────────────────────────────────────────────────── */}
      {paymentModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="surface p-5 max-w-md w-full bg-white rounded-3xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Direct Waiter Payment Collection</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Due ({label(selected)})</span>
              <span className="text-lg font-black text-slate-950 font-mono">{tzs(selected.total)}</span>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Collection Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectPayMethod('Cash')}
                    className={`h-11 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      directPayMethod === 'Cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>Direct Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectPayMethod('M-Pesa / Mobile Money')}
                    className={`h-11 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      directPayMethod === 'M-Pesa / Mobile Money' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>M-Pesa Mobile</span>
                  </button>
                </div>
              </div>

              {directPayMethod.includes('M-Pesa') && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">M-Pesa Reference</label>
                  <input
                    type="text"
                    value={mpesaRefInput}
                    onChange={e => setMpesaRefInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. MPESA-TX-123456"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setPaymentModalOpen(false)} className="h-10 px-4 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleConfirmDirectPayment}
                className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment Received</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full screen ordering workspace modal */}
      {workspace && (
        <OrderingWorkspace
          mode={workspace.mode}
          existing={workspace.extra ? selected : null}
          initialTable={workspace.table}
          onClose={() => setWorkspace(null)}
          onSent={(msg, order) => {
            setWorkspace(null);
            setNotice(msg);
            if (order) {
              if (order.type === 'Dine-in') setSelTable(order.tableNumber ?? null);
              else { setChannel(order.type as ServiceType); setSelOrderId(order.id); }
            }
          }}
        />
      )}
    </div>
  );
};
