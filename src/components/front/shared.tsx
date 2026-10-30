import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Search, Plus, Minus, Trash2, LayoutGrid, Beef, Fish, Salad, IceCream, Wine, Utensils,
  Camera, X, Upload, Clock, Image as ImageIcon, StickyNote, Users, MapPin, Phone, User,
  Flame, Check, Brush, ShoppingBag, Truck, UtensilsCrossed, ChevronDown, Hash, BellRing, Receipt,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { onImgError } from '../../utils/images';
import { FOOD_IMAGE_PRESETS } from '../../data/mockData';
import { MenuItem, Order, OrderItem, OrderType, RestaurantTable } from '../../types/erp';

/* ────────────────────────────────────────────────────────────────
   Formatting + money helpers
   ──────────────────────────────────────────────────────────────── */
export const tzs = (n: number) => `TZS ${Math.round(n).toLocaleString()}`;
export const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
export const isOpenOrder = (o: Order) => o.status !== 'paid' && o.status !== 'voided';

export type ServiceType = 'Dine-in' | 'Takeaway' | 'Delivery';

export const SERVICE_TYPES: { id: ServiceType; label: string; sub: string; icon: React.ElementType }[] = [
  { id: 'Dine-in', label: 'Dine-in', sub: 'Table service', icon: UtensilsCrossed },
  { id: 'Takeaway', label: 'Takeaway', sub: 'Counter pickup', icon: ShoppingBag },
  { id: 'Delivery', label: 'Delivery', sub: 'Rider dispatch', icon: Truck },
];

export const DELIVERY_ZONES = [
  { id: 'A', label: 'Zone A', hint: 'up to 3 km', fee: 3000 },
  { id: 'B', label: 'Zone B', hint: '3 – 6 km', fee: 5000 },
  { id: 'C', label: 'Zone C', hint: '6 – 10 km', fee: 8000 },
];

export const calcTotals = (
  subtotal: number,
  mode: OrderType,
  site: { taxRate: number; serviceChargeRate: number },
  deliveryFee = 0,
  discount = 0,
) => {
  const tax = Math.round(subtotal * site.taxRate);
  const service = mode === 'Dine-in' ? Math.round(subtotal * site.serviceChargeRate) : 0;
  const total = Math.max(0, subtotal + tax + service + deliveryFee - discount);
  return { subtotal, tax, service, deliveryFee, discount, total };
};

export const statusMeta = (o: Order): { label: string; cls: string } => {
  if (o.status === 'ready' || o.items.some(i => i.status === 'ready')) return { label: 'Ready', cls: 'bg-amber-100 text-amber-900 border-amber-300' };
  switch (o.status) {
    case 'in_kitchen': return { label: 'Cooking', cls: 'bg-orange-100 text-orange-900 border-orange-300' };
    case 'dispatched': return { label: 'On the way', cls: 'bg-blue-100 text-blue-900 border-blue-300' };
    case 'served': return { label: o.type === 'Dine-in' ? 'Served' : 'Handed over', cls: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    case 'paid': return { label: 'Paid', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
    case 'voided': return { label: 'Voided', cls: 'bg-rose-100 text-rose-800 border-rose-300' };
    default: return { label: 'New', cls: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
};

/* ────────────────────────────────────────────────────────────────
   Cart
   ──────────────────────────────────────────────────────────────── */
export type Course = 'Starter' | 'Main' | 'Dessert' | 'Drinks';
export const COURSES: Course[] = ['Starter', 'Main', 'Dessert', 'Drinks'];

export interface CartLine { menuItem: MenuItem; quantity: number; course: Course; notes: string }

export const courseFor = (m: MenuItem): Course =>
  m.category.includes('Starters') ? 'Starter' : m.category.includes('Dessert') ? 'Dessert' : m.category.includes('Beverage') ? 'Drinks' : 'Main';

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const add = useCallback((item: MenuItem) => {
    if (item.is86) return;
    setLines(prev => {
      const ex = prev.find(l => l.menuItem.id === item.id);
      if (ex) return prev.map(l => (l.menuItem.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...prev, { menuItem: item, quantity: 1, course: courseFor(item), notes: '' }];
    });
  }, []);

  const change = useCallback((id: string, delta: number) => {
    setLines(prev =>
      prev.flatMap(l => {
        if (l.menuItem.id !== id) return [l];
        const q = l.quantity + delta;
        return q > 0 ? [{ ...l, quantity: q }] : [];
      }),
    );
  }, []);

  const remove = useCallback((id: string) => setLines(prev => prev.filter(l => l.menuItem.id !== id)), []);
  const setNote = useCallback((id: string, notes: string) => setLines(prev => prev.map(l => (l.menuItem.id === id ? { ...l, notes } : l))), []);
  const setCourse = useCallback((id: string, course: Course) => setLines(prev => prev.map(l => (l.menuItem.id === id ? { ...l, course } : l))), []);
  const clear = useCallback(() => setLines([]), []);

  const count = lines.reduce((s, l) => s + l.quantity, 0);
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.menuItem.price, 0);
  const qtyOf = useCallback((id: string) => lines.find(l => l.menuItem.id === id)?.quantity ?? 0, [lines]);

  return { lines, add, change, remove, setNote, setCourse, clear, count, subtotal, qtyOf };
}
export type Cart = ReturnType<typeof useCart>;

export const toOrderItems = (lines: CartLine[]): OrderItem[] =>
  lines.map(l => ({
    id: `oi-${Math.random().toString(36).slice(2, 8)}`,
    menuItemId: l.menuItem.id,
    name: l.menuItem.name,
    imageUrl: l.menuItem.imageUrl,
    price: l.menuItem.price,
    quantity: l.quantity,
    station: l.menuItem.station,
    course: l.course,
    status: 'pending' as const,
    specialNotes: l.notes.trim() || undefined,
    firedAt: nowTime(),
  }));

/* ────────────────────────────────────────────────────────────────
   Fulfilment (order-type details) state
   ──────────────────────────────────────────────────────────────── */
export interface Fulfilment {
  tableNumber: number | null;
  guests: number;
  name: string;
  phone: string;
  address: string;
  zone: string;
  token: string;
}

const newToken = (prefix: string) => `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

export function useFulfilment(initialTable: number | null = null) {
  const [f, setF] = useState<Fulfilment>({
    tableNumber: initialTable,
    guests: 2,
    name: '',
    phone: '',
    address: '',
    zone: 'A',
    token: newToken('TK'),
  });
  const patch = useCallback((p: Partial<Fulfilment>) => setF(prev => ({ ...prev, ...p })), []);
  const reset = useCallback(() => setF(prev => ({ ...prev, name: '', phone: '', address: '', token: newToken('TK') })), []);
  const fee = DELIVERY_ZONES.find(z => z.id === f.zone)?.fee ?? 0;
  return { f, patch, reset, fee };
}
export type FulfilmentState = ReturnType<typeof useFulfilment>;

const Field: React.FC<{ icon: React.ElementType; label: string; children: React.ReactNode }> = ({ icon: Icon, label, children }) => (
  <label className="block">
    <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
    {children}
  </label>
);
const inputCls = 'w-full h-12 px-3.5 rounded-xl border-2 border-slate-200 bg-white text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-brand-400 focus:outline-none';

/** Order-type card: one component that adapts to Dine-in / Takeaway / Delivery. */
export const FulfilmentCard: React.FC<{
  mode: ServiceType;
  state: FulfilmentState;
  tables: RestaurantTable[];
  locked?: boolean;
  onBrowseTables?: () => void;
}> = ({ mode, state, tables, locked, onBrowseTables }) => {
  const { f, patch } = state;
  const [picker, setPicker] = useState(false);
  const table = tables.find(t => t.number === f.tableNumber);

  if (mode === 'Dine-in') {
    return (
      <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-brand-500 text-white flex flex-col items-center justify-center shrink-0 leading-none">
            <span className="text-2xs font-bold uppercase opacity-80">Table</span>
            <span className="text-2xl font-black">{table ? table.number : '–'}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-base font-extrabold text-slate-900 truncate">{table ? table.name || `Table ${table.number}` : 'Pick a table'}</div>
            <div className="text-sm text-slate-600 truncate">{table ? `${table.section} · ${table.capacity} seats` : 'Choose where the guests are seated'}</div>
          </div>
          {!locked && (
            <button
              onClick={() => (onBrowseTables ? onBrowseTables() : setPicker(p => !p))}
              className="h-11 px-4 rounded-xl bg-white border-2 border-slate-200 text-sm font-bold text-slate-800 hover:border-brand-400 flex items-center gap-1.5 shrink-0"
            >
              Change <ChevronDown className={`w-4 h-4 transition-transform ${picker ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        {!locked && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-white border border-slate-200 p-2">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700 pl-2"><Users className="w-4 h-4 text-slate-500" /> Guests</span>
            <div className="flex items-center gap-1">
              <button onClick={() => patch({ guests: Math.max(1, f.guests - 1) })} className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center" aria-label="Fewer guests"><Minus className="w-5 h-5" /></button>
              <span className="w-10 text-center text-xl font-black tabular-nums">{f.guests}</span>
              <button onClick={() => patch({ guests: f.guests + 1 })} className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center" aria-label="More guests"><Plus className="w-5 h-5" /></button>
            </div>
          </div>
        )}
        {picker && !locked && (
          <div className="mt-3 grid grid-cols-4 gap-2 max-h-48 overflow-y-auto scrollbar-thin">
            {tables.map(t => {
              const busy = t.status === 'occupied' || t.status === 'bill_requested';
              return (
                <button
                  key={t.id}
                  onClick={() => { patch({ tableNumber: t.number }); setPicker(false); }}
                  className={`h-12 rounded-xl border-2 text-base font-black ${f.tableNumber === t.number ? 'bg-brand-500 border-brand-500 text-white' : busy ? 'bg-amber-50 border-amber-300 text-amber-900' : t.status === 'dirty' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-white border-slate-200 text-slate-800 hover:border-brand-400'}`}
                >
                  {t.number}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const isDelivery = mode === 'Delivery';
  return (
    <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          {isDelivery ? <Truck className="w-5 h-5 text-brand-600" /> : <ShoppingBag className="w-5 h-5 text-brand-600" />}
          {isDelivery ? 'Delivery details' : 'Pickup details'}
        </span>
        <span className="font-mono text-sm font-black px-3 py-1 rounded-lg bg-slate-900 text-white">{isDelivery ? 'DEL' : f.token}</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field icon={User} label="Name"><input className={inputCls} value={f.name} onChange={e => patch({ name: e.target.value })} placeholder="Walk-in guest" /></Field>
        <Field icon={Phone} label="Phone"><input className={`${inputCls} font-mono`} inputMode="tel" value={f.phone} onChange={e => patch({ phone: e.target.value })} placeholder="+255 7.." /></Field>
      </div>
      {isDelivery && (
        <>
          <Field icon={MapPin} label="Drop-off address"><input className={inputCls} value={f.address} onChange={e => patch({ address: e.target.value })} placeholder="Street, area, landmark" /></Field>
          <div>
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery zone</div>
            <div className="grid grid-cols-3 gap-2">
              {DELIVERY_ZONES.map(z => (
                <button
                  key={z.id}
                  onClick={() => patch({ zone: z.id })}
                  className={`rounded-xl border-2 py-2 px-1 text-center leading-tight ${f.zone === z.id ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-slate-200 text-slate-800 hover:border-brand-400'}`}
                >
                  <div className="text-sm font-extrabold">{z.label}</div>
                  <div className={`text-2xs ${f.zone === z.id ? 'text-white/85' : 'text-slate-500'}`}>{z.hint}</div>
                  <div className="text-sm font-black tabular-nums">{z.fee.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Photo editor modal
   ──────────────────────────────────────────────────────────────── */
export const PhotoModal: React.FC<{ item: MenuItem; onClose: () => void }> = ({ item, onClose }) => {
  const { updateMenuItem } = useErp();
  const [url, setUrl] = useState(item.imageUrl || '');
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => typeof ev.target?.result === 'string' && setUrl(ev.target.result);
    r.readAsDataURL(file);
  };
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Item photo</h3>
            <p className="text-sm text-slate-500">{item.name}</p>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-xl hover:bg-slate-100 flex items-center justify-center" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-5 gap-4">
            <div className="sm:col-span-2 h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              {url ? <img src={url} alt="Preview" className="w-full h-full object-cover" onError={onImgError} /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon className="w-10 h-10" /></div>}
            </div>
            <div className="sm:col-span-3 space-y-3">
              <input className={`${inputCls} font-mono text-sm`} placeholder="Paste image URL" value={url.startsWith('data:') ? '(uploaded image)' : url} onChange={e => setUrl(e.target.value)} />
              <label className="h-12 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 inline-flex items-center gap-2 text-sm font-bold cursor-pointer">
                <Upload className="w-4 h-4" /> Upload from device
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 max-h-44 overflow-y-auto scrollbar-thin">
            {FOOD_IMAGE_PRESETS.map((p, i) => (
              <button key={i} onClick={() => setUrl(p.url)} className={`rounded-xl overflow-hidden border-2 ${url === p.url ? 'border-brand-500' : 'border-slate-200'}`}>
                <img src={p.url} alt={p.name} className="h-16 w-full object-cover" onError={onImgError} />
                <div className="text-2xs font-semibold truncate px-1 py-0.5 bg-slate-50">{p.name}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="h-12 px-5 rounded-xl bg-white border-2 border-slate-200 font-bold">Cancel</button>
          <button
            disabled={!url}
            onClick={() => { updateMenuItem({ ...item, imageUrl: url }); onClose(); }}
            className="h-12 px-6 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold disabled:opacity-40"
          >
            Save photo
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Menu browser — aisle rail + search + large product cards
   ──────────────────────────────────────────────────────────────── */
export const CATEGORIES: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'All', label: 'All items', icon: LayoutGrid },
  { id: 'Starters & Salads', label: 'Starters', icon: Salad },
  { id: 'Main Course', label: 'Mains', icon: Utensils },
  { id: 'Steaks & Grill', label: 'Grill', icon: Beef },
  { id: 'Seafood', label: 'Seafood', icon: Fish },
  { id: 'Desserts', label: 'Desserts', icon: IceCream },
  { id: 'Beverages & Cocktails', label: 'Drinks', icon: Wine },
];

const ProductCard: React.FC<{ item: MenuItem; qty: number; cart: Cart; onEditPhoto?: (m: MenuItem) => void }> = ({ item, qty, cart, onEditPhoto }) => (
  <div className={`group relative flex flex-col rounded-3xl bg-white border-2 overflow-hidden shadow-card transition-all ${qty > 0 ? 'border-brand-400 shadow-pop' : 'border-slate-200 hover:border-slate-300 hover:shadow-pop'} ${item.is86 ? 'opacity-60' : ''}`}>
    <button
      type="button"
      disabled={item.is86}
      onClick={() => cart.add(item)}
      className="relative block h-28 sm:h-40 w-full overflow-hidden bg-slate-200 text-left"
      aria-label={`Add ${item.name}`}
    >
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" referrerPolicy="no-referrer" onError={onImgError} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200"><ImageIcon className="w-8 h-8 sm:w-12 sm:h-12" /></div>
      )}
      <div className="absolute inset-x-0 top-0 h-12 sm:h-16 bg-gradient-to-b from-slate-950/50 to-transparent pointer-events-none" />
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {item.salesVelocity === 'high' && (
          <span className="flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950"><Flame className="w-3 h-3" /> Popular</span>
        )}
        <span className="hidden sm:flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-md bg-slate-950/70 text-white backdrop-blur-sm"><Clock className="w-3 h-3" />{item.preparationTimeMins}m</span>
      </div>
      {qty > 0 && (
        <span className="absolute top-2 right-2 min-w-6 h-6 sm:min-w-8 sm:h-8 px-1.5 rounded-full bg-brand-500 text-white text-xs sm:text-sm font-black flex items-center justify-center shadow-lg ring-2 ring-white">{qty}</span>
      )}
      {item.is86 && (
        <div className="absolute inset-0 bg-slate-950/75 flex items-center justify-center">
          <span className="px-2.5 py-1 rounded-lg border-2 border-rose-400 text-rose-300 font-black uppercase tracking-wider text-xs">Sold out</span>
        </div>
      )}
    </button>
    {onEditPhoto && (
      <button
        type="button"
        onClick={() => onEditPhoto(item)}
        title="Change photo"
        className="absolute top-20 sm:top-[7.25rem] right-2 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    )}
    <div className="flex-1 flex flex-col p-2.5 sm:p-4 gap-1">
      <h3 className="text-xs sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-1 sm:line-clamp-2">{item.name}</h3>
      <p className="hidden sm:block text-xs sm:text-sm text-slate-500 line-clamp-2 leading-snug">{item.description}</p>
      {item.allergens && item.allergens.length > 0 && <p className="text-[10px] font-semibold text-amber-700 truncate">Contains: {item.allergens.join(', ')}</p>}
      <div className="mt-auto pt-2 sm:pt-3">
        <div className="text-sm sm:text-xl font-black text-slate-950 tabular-nums mb-1.5 sm:mb-2.5">{tzs(item.price)}</div>
        {qty === 0 ? (
          <button
            disabled={item.is86}
            onClick={() => cart.add(item)}
            className="w-full h-8 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-xs sm:text-base font-extrabold flex items-center justify-center gap-1.5 disabled:bg-slate-300 transition-all"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add
          </button>
        ) : (
          <div className="h-8 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-50 border sm:border-2 border-brand-400 flex items-center justify-between px-1">
            <button onClick={() => cart.change(item.id, -1)} className="w-7 h-6 sm:w-11 sm:h-10 rounded-lg sm:rounded-xl bg-white hover:bg-slate-100 flex items-center justify-center shadow-xs" aria-label="Remove one">
              {qty === 1 ? <Trash2 className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-rose-600" /> : <Minus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
            </button>
            <span className="text-xs sm:text-lg font-black tabular-nums text-brand-800">{qty}</span>
            <button onClick={() => cart.add(item)} className="w-7 h-6 sm:w-11 sm:h-10 rounded-lg sm:rounded-xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-xs" aria-label="Add one"><Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" /></button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export const MenuBrowser: React.FC<{ items: MenuItem[]; cart: Cart; hideSoldOut?: boolean }> = ({ items, cart, hideSoldOut }) => {
  const [search, setSearch] = useState('');
  const [active, setActive] = useState('All');
  const [photoItem, setPhotoItem] = useState<MenuItem | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const visible = useMemo(() => items.filter(i => !(hideSoldOut && i.is86)), [items, hideSoldOut]);
  const q = search.trim().toLowerCase();
  const searching = q.length > 0;
  const results = useMemo(() => visible.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)), [visible, q]);
  const sections = CATEGORIES.slice(1).map(c => ({ ...c, items: visible.filter(i => i.category === c.id) })).filter(s => s.items.length > 0);

  const jump = (id: string) => {
    setActive(id);
    setSearch('');
    const sc = scroller.current;
    if (!sc) return;
    if (id === 'All') { sc.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    window.setTimeout(() => {
      const el = sectionRefs.current[id];
      if (el) sc.scrollTo({ top: el.offsetTop - 4, behavior: 'smooth' });
    }, 0);
  };

  const onScroll = () => {
    const sc = scroller.current;
    if (!sc || searching) return;
    let cur = 'All';
    for (const s of sections) {
      const el = sectionRefs.current[s.id];
      if (el && el.offsetTop - sc.scrollTop <= 90) cur = s.id;
    }
    if (sc.scrollTop < 40) cur = 'All';
    setActive(prev => (prev === cur ? prev : cur));
  };

  const countFor = (id: string) => (id === 'All' ? visible.length : visible.filter(i => i.category === id).length);

  const grid = 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4';

  return (
    <div className="flex h-full min-h-0">
      {/* Aisle rail */}
      <aside className="hidden md:flex w-[176px] xl:w-[200px] shrink-0 flex-col gap-2 overflow-y-auto scrollbar-thin p-3 bg-white border-r border-slate-200">
        <div className="text-2xs font-extrabold uppercase tracking-widest text-slate-400 px-2 pt-1">Aisles</div>
        {CATEGORIES.map(c => {
          const Icon = c.icon;
          const on = active === c.id && !searching;
          return (
            <button
              key={c.id}
              onClick={() => jump(c.id)}
              className={`w-full flex items-center gap-3 rounded-2xl p-2.5 text-left transition-all ${on ? 'bg-brand-500 text-white shadow-md' : 'hover:bg-slate-100 text-slate-800'}`}
            >
              <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${on ? 'bg-white/20' : 'bg-slate-100'}`}><Icon className="w-5 h-5" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold leading-tight truncate">{c.label}</span>
                <span className={`block text-2xs font-semibold ${on ? 'text-white/80' : 'text-slate-500'}`}>{countFor(c.id)} items</span>
              </span>
            </button>
          );
        })}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky search + (mobile) aisle chips */}
        <div className="shrink-0 bg-white border-b border-slate-200 p-2.5 sm:p-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes, drinks or SKU"
              className="w-full h-10 sm:h-12 pl-10 pr-10 rounded-xl sm:rounded-2xl bg-slate-100 border border-transparent focus:bg-white focus:border-brand-400 focus:outline-none text-xs sm:text-sm font-semibold"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500" aria-label="Clear search"><X className="w-3.5 h-3.5" /></button>
            )}
          </div>
          <div className="md:hidden flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => jump(c.id)} className={`shrink-0 h-8 px-3 rounded-lg text-xs font-bold transition-all ${active === c.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{c.label}</button>
            ))}
          </div>
        </div>

        <div ref={scroller} onScroll={onScroll} className="relative flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 pb-24 lg:pb-6 bg-slate-100">
          {searching ? (
            <div className="pt-4">
              <div className="text-sm font-bold text-slate-600 mb-3">{results.length} result{results.length === 1 ? '' : 's'} for “{search}”</div>
              {results.length === 0 ? (
                <div className="rounded-3xl bg-white border-2 border-dashed border-slate-300 p-12 text-center text-slate-500 font-semibold">Nothing matches. Try another word.</div>
              ) : (
                <div className={grid}>{results.map(i => <ProductCard key={i.id} item={i} qty={cart.qtyOf(i.id)} cart={cart} onEditPhoto={setPhotoItem} />)}</div>
              )}
            </div>
          ) : (
            sections.map(s => (
              <section key={s.id} ref={el => { sectionRefs.current[s.id] = el; }} className="pb-6">
                <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-slate-100/95 backdrop-blur-sm flex items-baseline justify-between">
                  <h2 className="text-xl font-black text-slate-900">{s.label}</h2>
                  <span className="text-sm font-semibold text-slate-500">{s.items.length} items</span>
                </div>
                <div className={grid}>{s.items.map(i => <ProductCard key={i.id} item={i} qty={cart.qtyOf(i.id)} cart={cart} onEditPhoto={setPhotoItem} />)}</div>
              </section>
            ))
          )}
        </div>
      </div>
      {photoItem && <PhotoModal item={photoItem} onClose={() => setPhotoItem(null)} />}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Cart lines (draft items not yet sent)
   ──────────────────────────────────────────────────────────────── */
export const CartLines: React.FC<{ cart: Cart }> = ({ cart }) => {
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  return (
    <ul className="space-y-2.5">
      {cart.lines.map(l => {
        const id = l.menuItem.id;
        return (
          <li key={id} className="rounded-2xl bg-white border-2 border-slate-200 p-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                {l.menuItem.imageUrl && <img src={l.menuItem.imageUrl} alt="" className="w-full h-full object-cover" onError={onImgError} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-base font-extrabold text-slate-900 leading-snug line-clamp-2">{l.menuItem.name}</div>
                  <button onClick={() => cart.remove(id)} className="w-9 h-9 -mt-1 -mr-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center shrink-0" aria-label="Remove"><X className="w-5 h-5" /></button>
                </div>
                <div className="text-sm text-slate-500 tabular-nums">{tzs(l.menuItem.price)} each</div>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center rounded-xl bg-slate-100 p-1">
                <button onClick={() => cart.change(id, -1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center" aria-label="Less"><Minus className="w-4.5 h-4.5" /></button>
                <span className="w-10 text-center text-lg font-black tabular-nums">{l.quantity}</span>
                <button onClick={() => cart.change(id, 1)} className="w-10 h-10 rounded-lg bg-brand-500 text-white shadow-sm flex items-center justify-center" aria-label="More"><Plus className="w-4.5 h-4.5" /></button>
              </div>
              <div className="text-lg font-black tabular-nums text-slate-950">{tzs(l.menuItem.price * l.quantity)}</div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {COURSES.map(c => (
                <button key={c} onClick={() => cart.setCourse(id, c)} className={`shrink-0 h-9 px-3 rounded-full text-xs font-bold border-2 ${l.course === c ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>{c}</button>
              ))}
              <button onClick={() => setNoteOpen(noteOpen === id ? null : id)} className={`shrink-0 h-9 px-3 rounded-full text-xs font-bold border-2 flex items-center gap-1 ${l.notes || noteOpen === id ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}>
                <StickyNote className="w-3.5 h-3.5" /> Note
              </button>
            </div>
            {(noteOpen === id || l.notes) && (
              <input
                value={l.notes}
                onChange={e => cart.setNote(id, e.target.value)}
                autoFocus={noteOpen === id}
                placeholder="e.g. no onions, well done, sauce on side"
                className="mt-2 w-full h-11 px-3 rounded-xl border-2 border-amber-200 bg-amber-50/50 text-sm font-semibold focus:outline-none focus:border-amber-400"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
};

/* ────────────────────────────────────────────────────────────────
   Totals block
   ──────────────────────────────────────────────────────────────── */
export const TotalsBlock: React.FC<{ t: ReturnType<typeof calcTotals>; vatLabel?: string }> = ({ t, vatLabel = 'VAT' }) => (
  <dl className="space-y-1 text-sm">
    <div className="flex justify-between text-slate-600"><dt>Subtotal</dt><dd className="font-bold tabular-nums">{tzs(t.subtotal)}</dd></div>
    <div className="flex justify-between text-slate-600"><dt>{vatLabel}</dt><dd className="font-bold tabular-nums">{tzs(t.tax)}</dd></div>
    {t.service > 0 && <div className="flex justify-between text-slate-600"><dt>Service charge</dt><dd className="font-bold tabular-nums">{tzs(t.service)}</dd></div>}
    {t.deliveryFee > 0 && <div className="flex justify-between text-slate-600"><dt>Delivery fee</dt><dd className="font-bold tabular-nums">{tzs(t.deliveryFee)}</dd></div>}
    {t.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd className="font-bold tabular-nums">− {tzs(t.discount)}</dd></div>}
    <div className="flex justify-between items-baseline pt-2 mt-1 border-t-2 border-slate-200">
      <dt className="text-base font-extrabold text-slate-900">Total</dt>
      <dd className="text-3xl font-black tabular-nums text-slate-950">{tzs(t.total)}</dd>
    </div>
  </dl>
);

/* ────────────────────────────────────────────────────────────────
   Sent-order lines (read-only, with kitchen status)
   ──────────────────────────────────────────────────────────────── */
export const itemStatusCls = (s: OrderItem['status']) =>
  s === 'ready' ? 'bg-amber-400' : s === 'served' ? 'bg-emerald-500' : s === 'cooking' ? 'bg-orange-500' : 'bg-slate-300';

export const SentLines: React.FC<{ order: Order }> = ({ order }) => (
  <ul className="rounded-2xl bg-slate-50 border-2 border-slate-200 divide-y divide-slate-200">
    {order.items.map(it => (
      <li key={it.id} className="flex items-center gap-3 p-3">
        <span className={`w-3 h-3 rounded-full shrink-0 ${itemStatusCls(it.status)}`} title={it.status} />
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-slate-900 truncate">{it.quantity} × {it.name}</div>
          <div className="text-xs text-slate-500 capitalize">{it.status} · {it.course}{it.specialNotes ? ` · ${it.specialNotes}` : ''}</div>
        </div>
        <span className="text-sm font-black tabular-nums shrink-0">{tzs(it.price * it.quantity)}</span>
      </li>
    ))}
  </ul>
);

/* ────────────────────────────────────────────────────────────────
   Table floor — large status tiles
   ──────────────────────────────────────────────────────────────── */
const SECTIONS = ['All', 'Main Dining', 'Terrace Patio', 'VIP Lounge', 'Bar Area'];

export const TableFloor: React.FC<{
  selected: number | null;
  onSelect: (t: RestaurantTable) => void;
  emptyHint?: string;
}> = ({ selected, onSelect, emptyHint }) => {
  const { tables, orders, currentSite, updateTableStatus } = useErp();
  const [section, setSection] = useState('All');
  const siteOrders = orders.filter(o => o.siteId === currentSite.id && isOpenOrder(o));
  const list = tables.filter(t => section === 'All' || t.section === section);

  const counts = {
    free: tables.filter(t => t.status === 'vacant').length,
    busy: tables.filter(t => t.status === 'occupied').length,
    bill: tables.filter(t => t.status === 'bill_requested').length,
    dirty: tables.filter(t => t.status === 'dirty').length,
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* Streamlined section tabs + live status strip */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 py-2 space-y-1.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {SECTIONS.map(s => {
            const count = s === 'All' ? tables.length : tables.filter(t => t.section === s).length;
            const on = section === s;
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`shrink-0 h-7.5 sm:h-8 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all ${
                  on ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <span className={`ml-1.5 text-[10px] font-semibold ${on ? 'text-white/75' : 'text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Clean unboxed status indicators with typographic separators */}
        <div className="flex items-center gap-2 sm:gap-3 text-2xs sm:text-xs font-medium text-slate-500 overflow-x-auto scrollbar-none py-0.5">
          <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {counts.free} free
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
            {counts.busy} dining
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
            {counts.bill} bill
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            {counts.dirty} clean
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2.5 sm:p-4 bg-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
          {list.map(t => {
            const ord = siteOrders.find(o => o.tableNumber === t.number);
            const ready = !!ord && (ord.status === 'ready' || ord.items.some(i => i.status === 'ready'));
            const bill = t.status === 'bill_requested' || !!ord?.billRequested;
            const tone = ready
              ? { ring: 'border-amber-400 bg-amber-50/80', dot: 'bg-amber-500', label: 'Ready', badge: 'bg-amber-100 text-amber-900 border-amber-300' }
              : bill
                ? { ring: 'border-sky-400 bg-sky-50/80', dot: 'bg-sky-500', label: 'Bill', badge: 'bg-sky-100 text-sky-900 border-sky-300' }
                : t.status === 'occupied'
                  ? { ring: 'border-orange-300 bg-orange-50/60', dot: 'bg-orange-500', label: 'Dining', badge: 'bg-orange-100 text-orange-900 border-orange-200' }
                  : t.status === 'dirty'
                    ? { ring: 'border-rose-300 bg-rose-50/70', dot: 'bg-rose-500', label: 'Dirty', badge: 'bg-rose-100 text-rose-900 border-rose-200' }
                    : t.status === 'reserved'
                      ? { ring: 'border-violet-300 bg-violet-50/70', dot: 'bg-violet-500', label: 'Reserved', badge: 'bg-violet-100 text-violet-900 border-violet-200' }
                      : { ring: 'border-slate-200 hover:border-emerald-400 bg-white', dot: 'bg-emerald-500', label: 'Free', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
            const sel = selected === t.number;
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(t)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(t)}
                className={`relative min-h-[120px] sm:min-h-[144px] rounded-2xl border-2 p-2.5 sm:p-3.5 flex flex-col justify-between text-left transition-all active:scale-[0.98] cursor-pointer shadow-2xs hover:shadow-sm ${tone.ring} ${sel ? 'ring-3 ring-brand-500 ring-offset-1' : ''}`}
              >
                {ready && (
                  <span className="absolute -top-1.5 -right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-bounce">
                    <BellRing className="w-3.5 h-3.5" />
                  </span>
                )}
                
                {/* Header: Table Number + Status Badge */}
                <div className="flex items-start justify-between gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none tabular-nums tracking-tight">
                    {t.number}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md border ${tone.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                    {tone.label}
                  </span>
                </div>

                {/* Subtitle: Section & Capacity */}
                <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate mt-1">
                  {t.section} · {t.capacity} seats{ord ? ` (${ord.guestCount}g)` : ''}
                </div>

                {/* Footer: Order total / Actions */}
                <div className="mt-2 pt-1.5 border-t border-slate-200/50">
                  {ord ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-black tabular-nums text-slate-900 truncate">
                        {tzs(ord.total)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5 shrink-0">
                        <Clock className="w-3 h-3" />
                        {t.seatedAt || ord.createdAt}
                      </span>
                    </div>
                  ) : t.status === 'dirty' ? (
                    <button
                      onClick={e => { e.stopPropagation(); updateTableStatus(t.id, 'vacant'); }}
                      className="w-full h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-2xs font-extrabold flex items-center justify-center gap-1 active:scale-95 transition"
                    >
                      <Brush className="w-3 h-3" /> Clean
                    </button>
                  ) : (
                    <span className="text-2xs font-extrabold text-emerald-700 flex items-center gap-0.5">
                      Open check →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Takeaway / Delivery queue — large order cards with next-step button
   ──────────────────────────────────────────────────────────────── */
export const OrderQueue: React.FC<{
  mode: 'Takeaway' | 'Delivery';
  selectedId: string | null;
  onSelect: (o: Order) => void;
  onNew: () => void;
}> = ({ mode, selectedId, onSelect, onNew }) => {
  const { orders, currentSite, updateOrderStatus } = useErp();
  const list = orders.filter(o => o.siteId === currentSite.id && o.type === mode && isOpenOrder(o));
  const isDel = mode === 'Delivery';

  const next = (o: Order): { label: string; run: () => void } | null => {
    const ready = o.status === 'ready' || (o.items.length > 0 && o.items.every(i => i.status === 'ready' || i.status === 'served') && o.status !== 'served' && o.status !== 'dispatched');
    if (isDel) {
      if (ready) return { label: 'Dispatch rider', run: () => updateOrderStatus(o.id, 'dispatched') };
      if (o.status === 'dispatched') return { label: 'Mark delivered', run: () => updateOrderStatus(o.id, 'served') };
    } else if (ready) return { label: 'Hand over', run: () => updateOrderStatus(o.id, 'served') };
    return null;
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-thin p-4 bg-slate-100">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        <button onClick={onNew} className="min-h-[200px] rounded-3xl border-2 border-dashed border-brand-400 bg-brand-50/60 hover:bg-brand-50 flex flex-col items-center justify-center gap-2 text-brand-700">
          <span className="w-16 h-16 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg"><Plus className="w-8 h-8" /></span>
          <span className="text-lg font-black">New {mode.toLowerCase()} order</span>
          <span className="text-sm font-semibold text-brand-700/80">{isDel ? 'Customer, address, zone' : 'Name & token, no table needed'}</span>
        </button>
        {list.map(o => {
          const st = statusMeta(o);
          const n = next(o);
          const sel = selectedId === o.id;
          return (
            <div
              key={o.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(o)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(o)}
              className={`min-h-[200px] rounded-3xl bg-white border-2 p-4 flex flex-col transition-all hover:shadow-pop ${sel ? 'border-brand-500 ring-4 ring-brand-200' : 'border-slate-200'}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-mono text-xl font-black text-slate-900"><Hash className="w-4 h-4 text-slate-400" />{o.pickupToken || o.orderNumber}</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${st.cls}`}>{st.label}</span>
              </div>
              <div className="mt-2 text-base font-extrabold text-slate-900 truncate">{o.customerName || 'Walk-in guest'}</div>
              <div className="text-sm text-slate-500 truncate">{isDel ? (o.deliveryAddress || 'Address on file') : (o.customerPhone || 'No phone')}</div>
              <div className="mt-1 text-sm text-slate-600 line-clamp-2">{o.items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</div>
              <div className="mt-auto pt-3 flex items-center justify-between">
                <span className="text-xl font-black tabular-nums">{tzs(o.total)}</span>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{o.createdAt}</span>
              </div>
              {n && (
                <button
                  onClick={e => { e.stopPropagation(); n.run(); }}
                  className="mt-3 h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> {n.label}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="text-center text-slate-500 font-semibold mt-6">No active {mode.toLowerCase()} orders right now.</p>}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   Service-type switch (big segmented control)
   ──────────────────────────────────────────────────────────────── */
export const ServiceSwitch: React.FC<{
  value: ServiceType;
  onChange: (v: ServiceType) => void;
  counts: Record<ServiceType, number>;
}> = ({ value, onChange, counts }) => (
  <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60 shrink-0">
    {SERVICE_TYPES.map(s => {
      const Icon = s.icon;
      const on = value === s.id;
      return (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`relative flex items-center gap-1.5 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
            on ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
          }`}
          aria-pressed={on}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="text-left font-bold">{s.label}</span>
          {counts[s.id] > 0 && (
            <span className={`min-w-4.5 h-4.5 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
              on ? 'bg-emerald-400 text-slate-950 font-mono' : 'bg-slate-200 text-slate-800 font-mono'
            }`}>
              {counts[s.id]}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const ReceiptIcon = Receipt;
