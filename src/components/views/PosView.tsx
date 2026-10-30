import React, { useEffect, useMemo, useState } from 'react';
import {
  Receipt, Flame, ShoppingCart, ShieldAlert, X, Trash2, Printer, LayoutGrid, UtensilsCrossed, ShoppingBag, Truck, ChevronUp, Zap, Wallet,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Order } from '../../types/erp';
import {
  CartLines, FulfilmentCard, MenuBrowser, OrderQueue, SentLines, ServiceSwitch, ServiceType, TableFloor, TotalsBlock,
  calcTotals, isOpenOrder, statusMeta, toOrderItems, tzs, useCart, useFulfilment,
} from '../front/shared';
import { CheckoutScreen } from '../front/CheckoutScreen';

type Pane = 'menu' | 'service';

export const PosView: React.FC = () => {
  const {
    tables, menuItems, orders, addOrder, addItemsToOrder, voidOrder, requestBill, currentSite, currentRole, setActiveTab,
  } = useErp();

  const [mode, setMode] = useState<ServiceType>('Dine-in');
  const [pane, setPane] = useState<Pane>('menu');
  const [counterOrderId, setCounterOrderId] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [cartSheet, setCartSheet] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('Customer changed mind');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const cart = useCart();
  const ful = useFulfilment(tables.find(t => t.status === 'vacant')?.number ?? tables[0]?.number ?? null);
  const { f, patch } = ful;

  const siteOrders = useMemo(() => orders.filter(o => o.siteId === currentSite.id && isOpenOrder(o)), [orders, currentSite.id]);
  const counts: Record<ServiceType, number> = {
    'Dine-in': siteOrders.filter(o => o.type === 'Dine-in').length,
    Takeaway: siteOrders.filter(o => o.type === 'Takeaway').length,
    Delivery: siteOrders.filter(o => o.type === 'Delivery').length,
  };

  // The open order that is currently "on the check"
  const activeOrder: Order | null = useMemo(() => {
    if (mode === 'Dine-in') return siteOrders.find(o => o.type === 'Dine-in' && o.tableNumber === f.tableNumber) || null;
    return siteOrders.find(o => o.id === counterOrderId && o.type === mode) || null;
  }, [mode, siteOrders, f.tableNumber, counterOrderId]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const switchMode = (m: ServiceType) => {
    setMode(m);
    setCounterOrderId(null);
    setPane(m === 'Dine-in' && !tables.find(t => t.number === f.tableNumber) ? 'service' : 'menu');
  };

  // Projected check (existing order + draft items)
  const baseSubtotal = (activeOrder?.subtotal ?? 0) + cart.subtotal;
  const fee = activeOrder ? activeOrder.deliveryFee || 0 : mode === 'Delivery' ? ful.fee : 0;
  const projected = calcTotals(baseSubtotal, mode, currentSite, fee, activeOrder?.discount || 0);

  /** Sends draft items to the kitchen; returns the order id they landed on. */
  const send = (): string | null => {
    if (cart.lines.length === 0) return activeOrder?.id ?? null;
    if (mode === 'Dine-in' && f.tableNumber == null) { setNotice('Pick a table first.'); setPane('service'); return null; }
    if (mode === 'Delivery' && !activeOrder && !f.address.trim()) { setNotice('Add the delivery address first.'); return null; }
    const items = toOrderItems(cart.lines);
    let id: string;
    if (activeOrder) {
      addItemsToOrder(activeOrder.id, items);
      id = activeOrder.id;
      setNotice(`Added ${cart.count} item${cart.count === 1 ? '' : 's'} · sent to kitchen`);
    } else {
      const created = addOrder({
        type: mode,
        tableNumber: mode === 'Dine-in' ? f.tableNumber ?? undefined : undefined,
        guestCount: mode === 'Dine-in' ? f.guests : 1,
        customerName: mode === 'Dine-in' ? undefined : f.name.trim() || undefined,
        customerPhone: mode === 'Dine-in' ? undefined : f.phone.trim() || undefined,
        deliveryAddress: mode === 'Delivery' ? f.address.trim() : undefined,
        deliveryFee: mode === 'Delivery' ? ful.fee : 0,
        pickupToken: mode === 'Takeaway' ? f.token : undefined,
        items,
        discount: 0,
      });
      id = created.id;
      if (mode !== 'Dine-in') setCounterOrderId(created.id);
      setNotice(`Order ${created.pickupToken || created.orderNumber} sent to kitchen`);
    }
    cart.clear();
    if (mode !== 'Dine-in') ful.reset();
    return id;
  };

  const sendAndPay = () => {
    const id = send();
    if (id) setCheckoutId(id);
  };

  const onPickTable = (t: { number: number }) => {
    setMode('Dine-in');
    patch({ tableNumber: t.number });
    setCounterOrderId(null);
    setPane('menu');
  };

  const openFromQueue = (o: Order) => {
    setCounterOrderId(o.id);
    setPane('menu');
  };

  const doVoid = () => {
    if (!activeOrder) return;
    if (pin !== '1234' && currentRole !== 'Owner' && currentRole !== 'Site Mgr') { setPinError('Invalid manager PIN (demo: 1234)'); return; }
    voidOrder(activeOrder.id, voidReason);
    setVoidOpen(false); setPin(''); setPinError('');
    setCounterOrderId(null);
    setNotice('Order voided');
  };

  const cartEmpty = cart.lines.length === 0 && !activeOrder;
  const heading = mode === 'Dine-in'
    ? (f.tableNumber != null ? `Table ${f.tableNumber}` : 'Pick a table')
    : mode === 'Takeaway' ? `Takeaway ${activeOrder?.pickupToken || f.token}` : activeOrder ? `Delivery ${activeOrder.pickupToken || ''}` : 'New delivery';

  /* ── Cart panel ── */
  const cartPanel = (
    <aside className={`${cartSheet ? 'fixed inset-0 z-40 flex' : 'hidden'} lg:static lg:z-auto lg:flex w-full lg:w-[410px] xl:w-[450px] shrink-0 flex-col bg-white border-l border-slate-200 min-h-0`}>
      {/* sticky header */}
      <div className="shrink-0 px-4 py-3 border-b border-slate-200 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center"><ShoppingCart className="w-6 h-6" /></div>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-black leading-tight truncate">{heading}</div>
          <div className="text-sm font-semibold text-slate-500">{cart.count} new · {activeOrder ? `${activeOrder.items.length} sent` : 'nothing sent yet'}</div>
        </div>
        {cart.lines.length > 0 && <button onClick={cart.clear} className="h-10 px-3 rounded-xl text-sm font-extrabold text-rose-600 hover:bg-rose-50">Clear</button>}
        <button onClick={() => setCartSheet(false)} className="lg:hidden w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center" aria-label="Close cart"><X className="w-5 h-5" /></button>
      </div>

      {/* scrolling body */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 space-y-4 bg-slate-50">
        <FulfilmentCard mode={mode} state={ful} tables={tables} locked={!!activeOrder} onBrowseTables={() => { setPane('service'); setCartSheet(false); }} />

        {activeOrder && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-extrabold uppercase tracking-wider text-slate-500">On the check</span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusMeta(activeOrder).cls}`}>{statusMeta(activeOrder).label}</span>
            </div>
            <SentLines order={activeOrder} />
          </div>
        )}

        {cart.lines.length > 0 ? (
          <div>
            <div className="text-sm font-extrabold uppercase tracking-wider text-slate-500 mb-2">New items · not sent</div>
            <CartLines cart={cart} />
          </div>
        ) : !activeOrder && (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <ShoppingCart className="w-14 h-14 mx-auto text-slate-300" />
            <div className="mt-3 text-lg font-extrabold text-slate-700">Your cart is empty</div>
            <div className="text-sm text-slate-500">Tap <b>Add</b> on any dish to start the order.</div>
          </div>
        )}
      </div>

      {/* sticky footer: totals + actions */}
      <div className="shrink-0 border-t-2 border-slate-200 bg-white p-4 space-y-3 shadow-[0_-8px_24px_-12px_rgba(15,23,42,0.2)]">
        {!cartEmpty && <TotalsBlock t={projected} vatLabel={`VAT (${Math.round(currentSite.taxRate * 100)}%)`} />}

        {cart.lines.length > 0 ? (
          mode === 'Dine-in' ? (
            <div className="grid grid-cols-[1fr_auto] gap-2.5">
              <button onClick={() => { send(); setCartSheet(false); }} className="h-16 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-lg font-black flex items-center justify-center gap-2.5 shadow-lg"><Flame className="w-6 h-6" /> Send to kitchen</button>
              <button onClick={sendAndPay} className="h-16 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold flex items-center gap-2"><Wallet className="w-5 h-5" /> Pay</button>
            </div>
          ) : (
            <div className="grid grid-cols-[1fr_auto] gap-2.5">
              <button onClick={sendAndPay} className="h-16 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-lg font-black flex items-center justify-center gap-2.5 shadow-lg"><Zap className="w-6 h-6" /> Charge {tzs(projected.total)}</button>
              <button onClick={() => { send(); setCartSheet(false); }} className="h-16 px-4 rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-500 text-sm font-extrabold leading-tight text-slate-800">Send,<br />pay later</button>
            </div>
          )
        ) : activeOrder ? (
          <div className="space-y-2.5">
            <button onClick={() => setCheckoutId(activeOrder.id)} className="w-full h-16 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xl font-black flex items-center justify-center gap-3 shadow-lg"><Wallet className="w-6 h-6" /> Checkout · {tzs(activeOrder.total)}</button>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => { requestBill(activeOrder.id); setNotice('Bill marked as presented'); }} disabled={activeOrder.type !== 'Dine-in'} className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-sm font-extrabold flex items-center justify-center gap-1.5"><Printer className="w-4 h-4" /> Bill</button>
              <button onClick={() => { setPane('menu'); setCartSheet(false); }} className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-extrabold">Add items</button>
              <button onClick={() => setVoidOpen(true)} className="h-12 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-extrabold flex items-center justify-center gap-1.5"><Trash2 className="w-4 h-4" /> Void</button>
            </div>
          </div>
        ) : (
          <button disabled className="w-full h-16 rounded-2xl bg-slate-200 text-slate-500 text-lg font-black">Add items to continue</button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="-m-2.5 sm:-m-4 lg:-m-5 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] flex flex-col bg-slate-100 overflow-hidden">
      {/* ── Sleek unified POS bar ── */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-2.5 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Channel switch (Dine-in / Takeaway / Delivery) */}
        <ServiceSwitch value={mode} onChange={switchMode} counts={counts} />

        {/* View Toggle (Tables/Queue vs Menu) + Shift Button */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setPane('service')}
              className={`flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                pane === 'service' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {mode === 'Dine-in' ? <UtensilsCrossed className="w-3.5 h-3.5" /> : mode === 'Takeaway' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
              <span>{mode === 'Dine-in' ? 'Tables' : 'Queue'}</span>
            </button>
            <button
              onClick={() => setPane('menu')}
              className={`flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                pane === 'menu' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>

          <button
            onClick={() => setActiveTab('cashier-tracking')}
            title="Cashier shift tracking and register cash counts"
            className="h-8 sm:h-8.5 px-2 sm:px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-extrabold text-xs flex items-center gap-1 transition active:scale-95 shrink-0"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shift</span>
          </button>
        </div>
      </div>

      {/* ── Work area: center + sticky cart, each scrolls on its own ── */}
      <div className="flex-1 min-h-0 flex relative">
        <main className="flex-1 min-w-0 min-h-0 relative">
          {pane === 'menu' ? (
            <MenuBrowser items={menuItems} cart={cart} />
          ) : mode === 'Dine-in' ? (
            <TableFloor selected={f.tableNumber} onSelect={t => (t.status === 'dirty' ? setNotice(`Table ${t.number} needs cleaning first`) : onPickTable(t))} />
          ) : (
            <OrderQueue mode={mode} selectedId={counterOrderId} onSelect={openFromQueue} onNew={() => { setCounterOrderId(null); ful.reset(); setPane('menu'); }} />
          )}

          {/* mobile / tablet floating cart bar */}
          {(cart.count > 0 || activeOrder) && (
            <div className="lg:hidden fixed bottom-[max(4.75rem,calc(env(safe-area-inset-bottom)+4.25rem))] inset-x-3 sm:inset-x-6 z-40">
              <button
                onClick={() => setCartSheet(true)}
                className="w-full h-13 sm:h-14 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center justify-between px-4 sm:px-5 active:scale-98 transition-transform"
              >
                <span className="flex items-center gap-2.5 text-xs sm:text-sm font-black">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-black">
                    {cart.count || activeOrder?.items.length}
                  </span>
                  View check
                </span>
                <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black tabular-nums font-mono text-emerald-300">
                  {tzs(projected.total)} <ChevronUp className="w-4 h-4 text-emerald-400" />
                </span>
              </button>
            </div>
          )}
        </main>
        {cartPanel}
      </div>

      {/* ── Toast ── */}
      {notice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-6 h-14 rounded-2xl bg-slate-900 text-white font-extrabold shadow-2xl flex items-center toast-enter">{notice}</div>
      )}

      {/* ── Checkout (full screen) ── */}
      {checkoutId && (
        <CheckoutScreen
          orderId={checkoutId}
          onClose={() => setCheckoutId(null)}
          onDone={() => { setCheckoutId(null); setCounterOrderId(null); setCartSheet(false); }}
        />
      )}

      {/* ── Void dialog ── */}
      {voidOpen && activeOrder && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <h3 className="text-lg font-black text-rose-900 flex-1">Void order {activeOrder.pickupToken || activeOrder.orderNumber}</h3>
              <button onClick={() => setVoidOpen(false)} className="w-10 h-10 rounded-xl hover:bg-rose-100 flex items-center justify-center" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <select value={voidReason} onChange={e => setVoidReason(e.target.value)} className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 text-base font-bold">
                {['Customer changed mind', 'Kitchen preparation delay', 'Cashier entry mistake', 'Dish quality reject'].map(r => <option key={r}>{r}</option>)}
              </select>
              <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value)} placeholder="Manager PIN (demo 1234)" className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 text-center text-xl tracking-[0.4em] font-mono focus:border-rose-400 focus:outline-none" />
              {pinError && <p className="text-sm font-bold text-rose-600">{pinError}</p>}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setVoidOpen(false)} className="h-12 px-5 rounded-xl bg-white border-2 border-slate-200 font-bold">Back</button>
              <button onClick={doVoid} className="h-12 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold">Authorize & void</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
