import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Banknote, Smartphone, CreditCard, Users, Check, X, Delete, Percent, Split, Plus, CheckCircle2, ReceiptText, Tag,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Order } from '../../types/erp';
import { SentLines, TotalsBlock, calcTotals, tzs } from './shared';

type Method = 'Cash' | 'M-Pesa / Mobile Money' | 'Credit Card' | 'House Account';
interface Tender { method: Method; amount: number; ref?: string }

const METHODS: { id: Method; label: string; hint: string; icon: React.ElementType; tone: string }[] = [
  { id: 'Cash', label: 'Cash', hint: 'Notes & coins', icon: Banknote, tone: 'text-emerald-600' },
  { id: 'M-Pesa / Mobile Money', label: 'Mobile money', hint: 'M-Pesa · Tigo · Airtel', icon: Smartphone, tone: 'text-rose-600' },
  { id: 'Credit Card', label: 'Card', hint: 'POS terminal', icon: CreditCard, tone: 'text-blue-600' },
  { id: 'House Account', label: 'House account', hint: 'Bill to account', icon: Users, tone: 'text-violet-600' },
];

const roundUp = (n: number, step: number) => Math.ceil(n / step) * step;

export const CheckoutScreen: React.FC<{ orderId: string; onClose: () => void; onDone: () => void }> = ({ orderId, onClose, onDone }) => {
  const { orders, payOrder, applyOrderDiscount, requestBill, currentSite } = useErp();
  const order: Order | undefined = orders.find(o => o.id === orderId);

  const [method, setMethod] = useState<Method>('Cash');
  const [entry, setEntry] = useState<string>('');
  const [ref, setRef] = useState('');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [splitN, setSplitN] = useState<number>(0);
  const [customDisc, setCustomDisc] = useState('');
  const [paidInfo, setPaidInfo] = useState<{ change: number; methods: string; total: number } | null>(null);

  const due = order?.total ?? 0;
  const paid = tenders.reduce((s, t) => s + t.amount, 0);
  const remaining = Math.max(0, due - paid);
  const typed = Number(entry) || 0;
  const amount = entry === '' ? remaining : typed;

  const cashSuggestions = useMemo(() => {
    const base = remaining;
    const set = new Set<number>([base, roundUp(base, 1000), roundUp(base, 5000), roundUp(base, 10000), roundUp(base, 50000)]);
    return [...set].filter(v => v >= base).sort((a, b) => a - b).slice(0, 5);
  }, [remaining]);

  if (!order) {
    return (
      <div className="fixed inset-0 z-40 bg-slate-100 flex items-center justify-center">
        <button onClick={onClose} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold">Order not found — back</button>
      </div>
    );
  }

  const live = calcTotals(order.subtotal, order.type, currentSite, order.deliveryFee || 0, order.discount || 0);

  const press = (k: string) => {
    if (k === 'back') return setEntry(e => e.slice(0, -1));
    if (k === 'clear') return setEntry('');
    if (k === '000') return setEntry(e => (e === '' ? '' : (e + '000').slice(0, 9)));
    setEntry(e => (e + k).replace(/^0+(?=\d)/, '').slice(0, 9));
  };

  const addTender = () => {
    if (amount <= 0 || remaining <= 0) return;
    const capped = method === 'Cash' ? amount : Math.min(amount, remaining);
    const next = [...tenders, { method, amount: capped, ref: ref || undefined }];
    setTenders(next);
    setEntry('');
    setRef('');
    setSplitN(0);
  };

  const removeTender = (i: number) => setTenders(prev => prev.filter((_, idx) => idx !== i));

  // How much the live entry would settle, so "Charge" can finish in one tap.
  const canFinishNow = remaining > 0 && (method === 'Cash' ? amount >= remaining : amount >= remaining || entry === '');
  const finishWithCurrent = () => {
    const final: Tender[] = remaining > 0 ? [...tenders, { method, amount: method === 'Cash' ? amount : Math.min(amount, remaining), ref: ref || undefined }] : tenders;
    const total = final.reduce((s, t) => s + t.amount, 0);
    if (total < due) return;
    const cashIn = final.filter(t => t.method === 'Cash').reduce((s, t) => s + t.amount, 0);
    const change = Math.max(0, total - due);
    const used = [...new Set(final.map(t => t.method))];
    payOrder(order.id, used.length > 1 ? 'Mixed' : used[0]);
    setPaidInfo({ change: Math.min(change, cashIn), methods: used.join(' + '), total: due });
  };

  const applyPct = (pct: number) => applyOrderDiscount(order.id, Math.round((order.subtotal + order.tax + order.serviceCharge + (order.deliveryFee || 0)) * (pct / 100)));
  const clearDiscount = () => { applyOrderDiscount(order.id, 0); setCustomDisc(''); };

  /* ── Success screen ── */
  if (paidInfo) {
    return (
      <div className="fixed inset-0 z-40 bg-gradient-to-b from-brand-600 to-brand-800 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-14 h-14" /></div>
          <h2 className="mt-5 text-3xl font-black text-slate-900">Payment complete</h2>
          <p className="text-base text-slate-500 mt-1">{order.type === 'Dine-in' ? `Table ${order.tableNumber}` : order.pickupToken || order.orderNumber} · {paidInfo.methods}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-100 p-4"><div className="text-sm font-bold text-slate-500">Paid</div><div className="text-2xl font-black tabular-nums">{tzs(paidInfo.total)}</div></div>
            <div className={`rounded-2xl p-4 ${paidInfo.change > 0 ? 'bg-amber-100' : 'bg-slate-100'}`}><div className="text-sm font-bold text-slate-500">Change</div><div className="text-2xl font-black tabular-nums">{tzs(paidInfo.change)}</div></div>
          </div>
          <button onClick={onDone} className="mt-7 w-full h-16 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-xl font-black">Start next order</button>
        </div>
      </div>
    );
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

  return (
    <div className="fixed inset-0 z-40 bg-slate-100 flex flex-col">
      {/* Header (never scrolls) */}
      <header className="shrink-0 h-[72px] bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center gap-4">
        <button onClick={onClose} className="h-12 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center gap-2 font-extrabold"><ArrowLeft className="w-5 h-5" /> Back</button>
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 leading-tight">Checkout</h1>
          <p className="text-sm text-slate-500 truncate">{order.type}{order.type === 'Dine-in' ? ` · Table ${order.tableNumber}` : ` · ${order.customerName || 'Guest'}`} · #{order.pickupToken || order.orderNumber}</p>
        </div>
        <div className="ml-auto hidden md:flex items-center gap-2 text-sm font-extrabold">
          {['Review', 'Discount', 'Payment'].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className="w-8 h-0.5 bg-slate-300" />}
              <span className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">{i + 1}</span>{s}</span>
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="flex-1 min-h-0 grid lg:grid-cols-[minmax(0,1fr)_460px]">
        {/* LEFT: scrolls */}
        <div className="min-h-0 overflow-y-auto scrollbar-thin p-4 sm:p-6 space-y-6">
          {/* 1 Review */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-black mb-3"><ReceiptText className="w-5 h-5 text-brand-600" /> 1 · Review items</h2>
            <SentLines order={order} />
            {order.type === 'Dine-in' && !order.billRequested && (
              <button onClick={() => requestBill(order.id)} className="mt-3 h-12 px-5 rounded-xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 text-sky-900 font-extrabold">Mark bill as presented</button>
            )}
          </section>

          {/* 2 Discount */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-black mb-3"><Tag className="w-5 h-5 text-brand-600" /> 2 · Discount</h2>
            <div className="flex flex-wrap gap-2.5">
              {[5, 10, 15, 20].map(p => (
                <button key={p} onClick={() => applyPct(p)} className="h-14 px-6 rounded-2xl bg-slate-100 hover:bg-brand-50 border-2 border-slate-200 hover:border-brand-400 text-lg font-black flex items-center gap-1"><Percent className="w-4 h-4" />{p}</button>
              ))}
              <div className="flex items-center gap-2">
                <input value={customDisc} onChange={e => setCustomDisc(e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Amount TZS" className="h-14 w-44 px-4 rounded-2xl border-2 border-slate-200 text-base font-bold focus:border-brand-400 focus:outline-none" />
                <button onClick={() => applyOrderDiscount(order.id, Number(customDisc) || 0)} className="h-14 px-5 rounded-2xl bg-slate-900 text-white font-extrabold">Apply</button>
              </div>
              {order.discount > 0 && <button onClick={clearDiscount} className="h-14 px-5 rounded-2xl bg-rose-50 text-rose-700 border-2 border-rose-200 font-extrabold flex items-center gap-1"><X className="w-4 h-4" /> Remove ({tzs(order.discount)})</button>}
            </div>
          </section>

          {/* 3 Payment */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-card p-5">
            <h2 className="flex items-center gap-2 text-lg font-black mb-3"><Banknote className="w-5 h-5 text-brand-600" /> 3 · Payment</h2>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {METHODS.map(m => {
                const Icon = m.icon;
                const on = method === m.id;
                return (
                  <button key={m.id} onClick={() => { setMethod(m.id); setEntry(''); }} className={`rounded-2xl border-2 p-4 text-left transition-all ${on ? 'border-brand-500 bg-brand-50 shadow-md' : 'border-slate-200 hover:border-slate-400'}`}>
                    <Icon className={`w-8 h-8 ${on ? 'text-brand-600' : m.tone}`} />
                    <div className="mt-2 text-lg font-black leading-tight">{m.label}</div>
                    <div className="text-xs text-slate-500 font-semibold">{m.hint}</div>
                  </button>
                );
              })}
            </div>

            {/* Split equally */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-600 mr-1"><Split className="w-4 h-4" /> Split equally</span>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => { setSplitN(n); setEntry(String(Math.ceil(due / n))); }} className={`h-11 min-w-11 px-3 rounded-xl text-base font-black border-2 ${splitN === n ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 hover:border-slate-400'}`}>{n}</button>
              ))}
              {splitN > 0 && <span className="text-sm font-bold text-slate-600">each pays {tzs(Math.ceil(due / splitN))}</span>}
            </div>

            <div className="mt-5 grid md:grid-cols-[1fr_300px] gap-5">
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-900 text-white p-5">
                  <div className="text-sm font-bold text-white/60">{method} · amount</div>
                  <div className="text-5xl font-black tabular-nums mt-1">{amount.toLocaleString()}</div>
                  {method === 'Cash' && remaining > 0 && (
                    <div className={`mt-2 text-lg font-extrabold ${amount >= remaining ? 'text-amber-300' : 'text-white/50'}`}>
                      {amount >= remaining ? `Change due: ${tzs(amount - remaining)}` : `Short by ${tzs(remaining - amount)}`}
                    </div>
                  )}
                </div>

                {method === 'Cash' && (
                  <div className="flex flex-wrap gap-2">
                    {cashSuggestions.map((v, i) => (
                      <button key={v} onClick={() => setEntry(String(v))} className="h-12 px-4 rounded-xl bg-slate-100 hover:bg-brand-50 border-2 border-slate-200 hover:border-brand-400 text-base font-extrabold tabular-nums">{i === 0 ? 'Exact' : v.toLocaleString()}</button>
                    ))}
                  </div>
                )}
                {(method === 'M-Pesa / Mobile Money' || method === 'Credit Card') && (
                  <input value={ref} onChange={e => setRef(e.target.value.toUpperCase())} placeholder={method === 'Credit Card' ? 'Card approval code' : 'Transaction code e.g. QJ4…'} className="w-full h-14 px-4 rounded-2xl border-2 border-slate-200 font-mono text-lg font-bold uppercase focus:border-brand-400 focus:outline-none" />
                )}
                {method === 'House Account' && <p className="rounded-2xl bg-violet-50 border-2 border-violet-200 p-4 text-sm font-semibold text-violet-900">This amount will be billed to the house account for later settlement.</p>}
              </div>

              {/* Keypad */}
              <div>
                <div className="grid grid-cols-3 gap-2.5">
                  {keys.map(k => (
                    <button key={k} onClick={() => press(k)} className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-2xl font-black flex items-center justify-center transition-all" aria-label={k}>
                      {k === 'back' ? <Delete className="w-6 h-6" /> : k === 'clear' ? <span className="text-sm font-extrabold">CLEAR</span> : k}
                    </button>
                  ))}
                </div>
                <button onClick={() => press('000')} className="mt-2.5 w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xl font-black">000</button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: sticky summary — header + totals + pay button never scroll away */}
        <aside className="min-h-0 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200">
          <div className="shrink-0 px-6 pt-5 pb-3 border-b border-slate-100">
            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Amount due</div>
            <div className="text-5xl font-black tabular-nums text-slate-950 mt-1">{tzs(remaining)}</div>
            {paid > 0 && <div className="text-sm font-bold text-emerald-700 mt-1">{tzs(paid)} already tendered of {tzs(due)}</div>}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-6 py-4 space-y-5">
            <TotalsBlock t={live} vatLabel={`VAT (${Math.round(currentSite.taxRate * 100)}%)`} />
            {tenders.length > 0 && (
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Tendered</div>
                <ul className="space-y-2">
                  {tenders.map((t, i) => (
                    <li key={i} className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
                      <div className="min-w-0"><div className="text-sm font-extrabold truncate">{t.method}</div>{t.ref && <div className="text-xs font-mono text-slate-500">{t.ref}</div>}</div>
                      <div className="flex items-center gap-2"><span className="font-black tabular-nums">{tzs(t.amount)}</span><button onClick={() => removeTender(i)} className="w-8 h-8 rounded-lg hover:bg-emerald-100 flex items-center justify-center" aria-label="Remove tender"><X className="w-4 h-4" /></button></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="shrink-0 p-5 border-t border-slate-200 bg-slate-50 space-y-2.5">
            {remaining > 0 && amount > 0 && amount < remaining ? (
              <button onClick={addTender} className="w-full h-14 rounded-2xl bg-white border-2 border-brand-500 text-brand-700 text-lg font-black flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Add {tzs(amount)} · split payment</button>
            ) : null}
            <button
              onClick={finishWithCurrent}
              disabled={!(remaining === 0 || canFinishNow)}
              className="w-full h-[72px] rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 text-white text-xl font-black flex items-center justify-center gap-3 shadow-lg transition-colors"
            >
              <Check className="w-7 h-7" />
              {remaining === 0 ? 'Complete payment' : `Charge ${tzs(Math.min(amount, remaining) || remaining)}`}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
