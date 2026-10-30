import React, { useState, useMemo } from 'react';
import { 
  QrCode, 
  ShoppingBag, 
  Search, 
  UtensilsCrossed, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Receipt, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  AlertCircle, 
  CreditCard, 
  Share2, 
  X,
  User,
  ExternalLink,
  ChevronRight,
  Flame,
  Check,
  Compass,
  Radio,
  SlidersHorizontal,
  Info,
  MapPin,
  Store,
  ChevronDown
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { MenuItem, Order, OrderItem, OrderType } from '../../types/erp';
import { PwaInstallButton, PwaMobileBanner } from '../common/PwaInstallPrompt';

type CustomerMobileTab = 'menu' | 'search' | 'tracker' | 'cart';

export const CustomerPortalView: React.FC = () => {
  const { 
    currentSite, 
    menuItems, 
    orders, 
    tables, 
    serviceMode, 
    addOrder, 
    addItemsToOrder, 
    requestBill,
    payOrder,
    waiterProfiles,
    activeCustomerWaiterCode,
    setActiveCustomerWaiterCode
  } = useErp();

  // Active Dining choice
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(3);
  const [guestName, setGuestName] = useState<string>('Sophia Baraka');
  const [guestPhone, setGuestPhone] = useState<string>('+255 784 990 011');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Masaki Peninsula, Apt 4B');

  // Customer Cart
  const [cart, setCart] = useState<{ menuItem: MenuItem; quantity: number; notes: string }[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);

  // Mobile active tab: 'menu' | 'search' | 'tracker' | 'cart'
  const [mobileTab, setMobileTab] = useState<CustomerMobileTab>('menu');

  // Active tracked order
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Category filter and search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerToast, setCustomerToast] = useState<string | null>(null);

  // Selected item detail modal
  const [selectedItemDetail, setSelectedItemDetail] = useState<MenuItem | null>(null);
  const [itemNoteInput, setItemNoteInput] = useState<string>('');
  const [detailModalQty, setDetailModalQty] = useState<number>(1);

  // Simulator popover state (unobtrusive)
  const [simulatorMenuOpen, setSimulatorMenuOpen] = useState<boolean>(false);

  // Payment modal
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedPayMethod, setSelectedPayMethod] = useState<'M-Pesa / Mobile Money' | 'Cash' | 'Credit Card'>('M-Pesa / Mobile Money');
  const [mpesaPhone, setMpesaPhone] = useState<string>('0784 990 011');

  const categories = ['All', 'Main Course', 'Steaks & Grill', 'Seafood', 'Starters & Salads', 'Desserts', 'Beverages & Cocktails'];
  const currency = currentSite.currency;

  // Resolve assigned waiter based on customer link
  const assignedWaiter = useMemo(() => {
    if (!activeCustomerWaiterCode || activeCustomerWaiterCode === 'general') return null;
    return waiterProfiles.find(w => w.code === activeCustomerWaiterCode || w.publicToken === activeCustomerWaiterCode) || null;
  }, [activeCustomerWaiterCode, waiterProfiles]);

  // Current tracked order
  const currentTrackedOrder = useMemo(() => {
    if (activeOrderId) return orders.find(o => o.id === activeOrderId);
    // Find open order on table
    if (orderType === 'Dine-in') {
      return orders.find(o => o.siteId === currentSite.id && o.tableNumber === selectedTableNumber && o.status !== 'paid' && o.status !== 'voided');
    }
    return undefined;
  }, [orders, activeOrderId, orderType, selectedTableNumber, currentSite.id]);

  const showToast = (msg: string) => {
    setCustomerToast(msg);
    setTimeout(() => setCustomerToast(null), 3200);
  };

  // Filter menu items for current restaurant
  const filteredMenu = useMemo(() => {
    return menuItems.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch && !item.is86;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0);
  const cartTax = Math.round(cartSubtotal * currentSite.taxRate);
  const cartServiceCharge = orderType === 'Dine-in' ? Math.round(cartSubtotal * currentSite.serviceChargeRate) : 0;
  const cartTotal = cartSubtotal + cartTax + cartServiceCharge;

  const handleAddToCart = (item: MenuItem, notes: string = '', quantity: number = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.menuItem.id === item.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += quantity;
        if (notes) copy[idx].notes = notes;
        return copy;
      }
      return [...prev, { menuItem: item, quantity, notes }];
    });
    setSelectedItemDetail(null);
    setItemNoteInput('');
    setDetailModalQty(1);
    showToast(`Added ${item.name} to order`);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menuItem.id === itemId) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(Boolean) as { menuItem: MenuItem; quantity: number; notes: string }[]);
  };

  // Place order into Shared Order Engine
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const formattedItems: OrderItem[] = cart.map(c => ({
      id: `cit-${Math.random().toString(36).substring(2, 7)}`,
      menuItemId: c.menuItem.id,
      name: c.menuItem.name,
      imageUrl: c.menuItem.imageUrl,
      price: c.menuItem.price,
      quantity: c.quantity,
      station: c.menuItem.station,
      course: c.menuItem.category.includes('Starters') ? 'Starter' : (c.menuItem.category.includes('Desserts') ? 'Dessert' : (c.menuItem.category.includes('Beverages') ? 'Drinks' : 'Main')),
      specialNotes: c.notes || undefined,
      status: 'pending',
      firedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    if (currentTrackedOrder && currentTrackedOrder.status !== 'paid') {
      addItemsToOrder(currentTrackedOrder.id, formattedItems);
      showToast(`Extra items sent directly to the kitchen!`);
    } else {
      const newOrder = addOrder({
        siteId: currentSite.id,
        type: orderType,
        source: assignedWaiter ? 'WAITER_LINK' : 'CUSTOMER_PORTAL',
        tableNumber: orderType === 'Dine-in' ? selectedTableNumber : undefined,
        customerName: guestName,
        customerPhone: guestPhone,
        deliveryAddress: orderType === 'Delivery' ? deliveryAddress : undefined,
        assignedWaiterId: assignedWaiter?.id,
        assignedWaiterCode: assignedWaiter?.code,
        assignedWaiterName: assignedWaiter?.name,
        waiterLinkToken: assignedWaiter?.publicToken,
        serverName: assignedWaiter ? `${assignedWaiter.name} (${assignedWaiter.code})` : 'Floor Server',
        items: formattedItems
      });
      setActiveOrderId(newOrder.id);
      showToast(`Order #${newOrder.orderNumber} sent directly to the kitchen!`);
    }

    setCart([]);
    setCartDrawerOpen(false);
  };

  // Settle payment
  const handleSettleCustomerPayment = () => {
    if (!currentTrackedOrder) return;
    payOrder(currentTrackedOrder.id, selectedPayMethod, {
      collectedBy: selectedPayMethod === 'Cash' ? 'waiter' : 'online',
      providerRef: selectedPayMethod.includes('M-Pesa') ? `MPESA-${Math.floor(100000 + Math.random() * 900000)}` : undefined
    });
    setPaymentModalOpen(false);
    showToast(`Payment of ${currency} ${currentTrackedOrder.total.toLocaleString()} confirmed via ${selectedPayMethod}!`);
  };

  return (
    <div className="-m-2.5 sm:-m-4 lg:-m-5 min-h-[100dvh] bg-slate-50 flex flex-col font-sans select-none pb-24 sm:pb-12">
      {/* ─────────────────────────────────────────────────────────────
          PWA MOBILE APP BANNER (Customer)
          ───────────────────────────────────────────────────────────── */}
      <PwaMobileBanner roleContext="customer" title="Install Resto App" />

      {/* ─────────────────────────────────────────────────────────────
          REFINED RESTAURANT HEADER (Clean Hospitality Branding)
          ───────────────────────────────────────────────────────────── */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {currentSite.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white truncate">
                  {currentSite.name}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Open Now
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {currentSite.city}
                </span>
                <span>·</span>
                <span>Taxes & Service Included</span>
              </div>
            </div>
          </div>

          {/* Right Header Status: Server Attribution & Link Simulator Trigger */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t border-slate-800 sm:border-t-0">
            {assignedWaiter ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold leading-none">Your Server</span>
                  <span className="font-bold text-white text-xs">{assignedWaiter.name}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">Table Self-Ordering</span>
              </div>
            )}

            {/* Subtle Attribution Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setSimulatorMenuOpen(prev => !prev)}
                className="h-8 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                title="Switch waiter link attribution for testing"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Link Mode</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {simulatorMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Simulate QR Link
                  </div>
                  <button
                    onClick={() => { setActiveCustomerWaiterCode('W-101'); setSimulatorMenuOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      activeCustomerWaiterCode === 'W-101' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Emmanuel (W-101)</span>
                    <span className="text-[10px] opacity-75">5% Comm.</span>
                  </button>
                  <button
                    onClick={() => { setActiveCustomerWaiterCode('W-102'); setSimulatorMenuOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      activeCustomerWaiterCode === 'W-102' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>Neema Joseph (W-102)</span>
                    <span className="text-[10px] opacity-75">5% Comm.</span>
                  </button>
                  <button
                    onClick={() => { setActiveCustomerWaiterCode(null); setSimulatorMenuOpen(false); }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      activeCustomerWaiterCode === null ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>General Portal</span>
                    <span className="text-[10px] opacity-75">No Waiter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          COMPACT SERVICE SELECTOR & TABLE CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {(['Dine-in', 'Takeaway', 'Delivery'] as OrderType[]).map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  orderType === type 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {orderType === 'Dine-in' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Your Table:</span>
              <select
                value={selectedTableNumber}
                onChange={e => setSelectedTableNumber(Number(e.target.value))}
                className="h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.number}>
                    Table {t.number} ({t.capacity} seats)
                  </option>
                ))}
              </select>
            </div>
          ) : orderType === 'Takeaway' ? (
            <span className="text-xs text-slate-500 font-medium">
              Pick up at the front counter when ready
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">
              Fast courier dispatch in Dar es Salaam
            </span>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT CONTAINER
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-5">
        {/* Active Order Tracker Card (Compact & High Contrast) */}
        {currentTrackedOrder && (
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-emerald-500/30 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Live Order #{currentTrackedOrder.orderNumber}
                    </h3>
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {currentTrackedOrder.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-normal">
                    {currentTrackedOrder.type === 'Dine-in' ? `Table ${currentTrackedOrder.tableNumber}` : currentTrackedOrder.type} · Placed at {currentTrackedOrder.createdAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    requestBill(currentTrackedOrder.id);
                    showToast('Bill requested! Your waiter has been notified.');
                  }}
                  disabled={!!currentTrackedOrder.billRequested}
                  className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition disabled:bg-sky-50 disabled:text-sky-700"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{currentTrackedOrder.billRequested ? 'Bill Requested ✓' : 'Request Bill'}</span>
                </button>

                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Now</span>
                </button>
              </div>
            </div>

            {/* 4-Step Progress Indicator */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-[11px] font-bold">
                  ✓
                </div>
                <span className="text-[11px] font-semibold text-slate-700 block">Received</span>
              </div>
              <div className="space-y-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[11px] font-bold ${
                  currentTrackedOrder.status !== 'new' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  2
                </div>
                <span className="text-[11px] font-semibold text-slate-700 block">Kitchen Fire</span>
              </div>
              <div className="space-y-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[11px] font-bold ${
                  currentTrackedOrder.status === 'ready' || currentTrackedOrder.status === 'served' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-500'
                }`}>
                  3
                </div>
                <span className="text-[11px] font-semibold text-slate-700 block">Ready</span>
              </div>
              <div className="space-y-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto text-[11px] font-bold ${
                  currentTrackedOrder.status === 'served' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  4
                </div>
                <span className="text-[11px] font-semibold text-slate-700 block">Delivered</span>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SEARCH & CATEGORIES FILTER
            ───────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dishes, burgers, cocktails, desserts..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-slate-300 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Clean Horizontal Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`h-8 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            EXQUISITE FOOD ITEM CARD GRID
            ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMenu.map(item => {
            const inCart = cart.find(c => c.menuItem.id === item.id);

            return (
              <div 
                key={item.id} 
                onClick={() => {
                  setSelectedItemDetail(item);
                  setItemNoteInput(inCart?.notes || '');
                  setDetailModalQty(inCart ? inCart.quantity : 1);
                }}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Photo & Prep Time */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Subtle Floating Prep Chip */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-sm text-white font-mono text-[11px] font-medium flex items-center gap-1 shadow-xs">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{item.preparationTimeMins}m</span>
                  </div>

                  {/* Station / Category tag */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-semibold uppercase tracking-wider shadow-xs">
                    {item.station}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div 
                    className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2"
                    onClick={e => e.stopPropagation()} // Prevent card modal when interacting with stepper
                  >
                    <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono tabular-nums">
                      {currency} {item.price.toLocaleString()}
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="w-7 h-7 rounded-md bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 active:scale-95 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-bold text-xs px-1.5 tabular-nums font-mono text-slate-900">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 active:scale-95 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMenu.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <UtensilsCrossed className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No dishes found</h4>
            <p className="text-xs text-slate-400">Try adjusting your search query or category filter</p>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────
          ITEM CUSTOMIZER MODAL (Tap Dish to Customize Notes)
          ───────────────────────────────────────────────────────────── */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">
            {/* Modal Image */}
            <div className="relative aspect-[16/9] bg-slate-100">
              <img
                src={selectedItemDetail.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'}
                alt={selectedItemDetail.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedItemDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Prep: ~{selectedItemDetail.preparationTimeMins} minutes</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedItemDetail.name}</h3>
                  <div className="text-lg font-black text-slate-900 font-mono">
                    {currency} {selectedItemDetail.price.toLocaleString()}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {selectedItemDetail.description}
                </p>
              </div>

              {/* Special Cooking Instructions Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Special Instructions for the Kitchen
                </label>
                <input
                  type="text"
                  value={itemNoteInput}
                  onChange={e => setItemNoteInput(e.target.value)}
                  placeholder="e.g. Extra spicy, dressing on side, no onions..."
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Quantity selector inside modal */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Quantity</span>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setDetailModalQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-sm font-mono px-2">{detailModalQty}</span>
                  <button
                    onClick={() => setDetailModalQty(q => q + 1)}
                    className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="h-11 px-4 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddToCart(selectedItemDetail, itemNoteInput, detailModalQty)}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Order · {currency} {(selectedItemDetail.price * detailModalQty).toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FLOATING QUICK-CART BAR (Visible when items in cart)
          ───────────────────────────────────────────────────────────── */}
      {cartCount > 0 && !cartDrawerOpen && (
        <div className="fixed bottom-3 inset-x-4 max-w-md mx-auto z-40 animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setCartDrawerOpen(true)}
            className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-bold flex items-center justify-between px-4 shadow-xl transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white text-emerald-800 flex items-center justify-center font-extrabold text-xs">
                {cartCount}
              </span>
              <span>View Cart</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-sm font-bold">
              <span>{currency} {cartSubtotal.toLocaleString()}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CART & CHECKOUT DRAWER
          ───────────────────────────────────────────────────────────── */}
      {cartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setCartDrawerOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Your Order</h3>
                <span className="text-xs text-slate-400 font-semibold">({cartCount} items)</span>
              </div>
              <button 
                onClick={() => setCartDrawerOpen(false)} 
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.map(line => (
                <div key={line.menuItem.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{line.menuItem.name}</h4>
                    <span className="text-xs font-mono text-slate-500">{currency} {line.menuItem.price.toLocaleString()} each</span>
                    {line.notes && <div className="text-[11px] text-emerald-700 italic mt-0.5">Note: {line.notes}</div>}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpdateQty(line.menuItem.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold tabular-nums font-mono px-1">{line.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(line.menuItem.id, 1)}
                      className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Fulfilment info */}
              <div className="p-3.5 rounded-xl bg-slate-100 space-y-2.5 text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">Guest Details</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5 font-semibold">Your Name</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-0.5 font-semibold">Mobile Phone</label>
                    <input
                      type="text"
                      value={guestPhone}
                      onChange={e => setGuestPhone(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-lg border border-slate-300 bg-white font-bold text-xs"
                    />
                  </div>
                </div>

                {orderType === 'Dine-in' && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-600 font-semibold">Dining Table:</span>
                    <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      Table {selectedTableNumber}
                    </span>
                  </div>
                )}

                {assignedWaiter && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-semibold">Attributed Waiter:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {assignedWaiter.name} ({assignedWaiter.code})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals & Submit */}
            <div className="p-4 border-t border-slate-200 bg-white space-y-3 shadow-lg">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-mono">{currency} {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>VAT ({Math.round(currentSite.taxRate * 100)}%)</span>
                  <span className="font-mono">{currency} {cartTax.toLocaleString()}</span>
                </div>
                {orderType === 'Dine-in' && (
                  <div className="flex justify-between text-slate-500">
                    <span>Service Charge ({Math.round(currentSite.serviceChargeRate * 100)}%)</span>
                    <span className="font-mono">{currency} {cartServiceCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-base text-slate-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-emerald-700">{currency} {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>Submit Order to Kitchen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAYMENT MODAL
          ───────────────────────────────────────────────────────────── */}
      {paymentModalOpen && currentTrackedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="p-5 max-w-md w-full bg-white rounded-3xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Settle Your Bill</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 text-center">
              <span className="text-xs font-semibold text-slate-500 block">Total Due Amount</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
                {currency} {currentTrackedOrder.total.toLocaleString()}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Choose Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('M-Pesa / Mobile Money')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all ${
                      selectedPayMethod === 'M-Pesa / Mobile Money' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    M-Pesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('Cash')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all ${
                      selectedPayMethod === 'Cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPayMethod('Credit Card')}
                    className={`p-2 rounded-xl border-2 font-bold text-center transition-all ${
                      selectedPayMethod === 'Credit Card' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Card
                  </button>
                </div>
              </div>

              {selectedPayMethod.includes('M-Pesa') && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Money Phone Number</label>
                  <input
                    type="text"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-300 font-mono font-bold text-xs"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">A secure payment prompt will be sent to your phone.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setPaymentModalOpen(false)} className="h-9 px-3.5 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleSettleCustomerPayment}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Check className="w-4 h-4" />
                <span>Confirm {selectedPayMethod === 'Cash' ? 'Cash Handover' : 'Payment'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Toast Notification */}
      {customerToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{customerToast}</span>
        </div>
      )}
    </div>
  );
};
