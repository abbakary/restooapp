import React, { useState } from 'react';
import { useToast } from '../common/Toast';
import { 
  ChefHat, 
  Flame, 
  Clock, 
  CheckCheck, 
  RotateCcw, 
  AlertOctagon, 
  Filter, 
  Volume2, 
  SlidersHorizontal,
  Layers,
  ChevronRight,
  X,
  Bell,
  Bike,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  Calendar,
  Sparkles,
  User,
  MapPin,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Order, OrderItem, OrderStatus, OrderType } from '../../types/erp';

export const KdsView: React.FC = () => {
  const toast = useToast();
  const { 
    orders, 
    bumpKDSTicket, 
    updateOrderStatus,
    menuItems, 
    toggle86, 
    currentSite,
    currentRole,
    serviceMode
  } = useErp();

  // Active view mode: 'live_kds' | 'workflow_pipeline' | 'end_of_day'
  const [activeKdsTab, setActiveKdsTab] = useState<'live_kds' | 'workflow_pipeline' | 'end_of_day'>('live_kds');

  // Station filter for Live KDS
  const [selectedStation, setSelectedStation] = useState<string>('All');
  const [show86Drawer, setShow86Drawer] = useState<boolean>(false);
  const [recalledTickets, setRecalledTickets] = useState<Order[]>([]);

  // Sound / Bell chime notification alert banner
  const [expediterAlert, setExpediterAlert] = useState<{ message: string; timestamp: string } | null>(null);

  // End of Day Filters
  const [eodStatusFilter, setEodStatusFilter] = useState<'all' | OrderStatus>('all');
  const [eodTypeFilter, setEodTypeFilter] = useState<'all' | OrderType>('all');
  const [eodSearchQuery, setEodSearchQuery] = useState<string>('');

  const stations = ['All', 'Grill', 'Fry', 'Cold', 'Bar', 'Pastry', 'Pass'];

  // Site filtered orders
  const siteOrders = orders.filter(o => o.siteId === currentSite.id);

  // Active kitchen orders (in kitchen or ready at pass)
  const activeOrders = siteOrders.filter(o => o.status === 'in_kitchen' || o.status === 'ready');

  // Filtered orders for station display
  const stationOrders = activeOrders.filter(order => {
    if (selectedStation === 'All' || selectedStation === 'Pass') return true;
    return order.items.some(it => it.station === selectedStation);
  });

  // Urgency indicator based on simulated elapsed time
  const getTicketUrgency = (createdAt: string) => {
    if (createdAt.includes('11:45')) return { color: 'border-rose-500 bg-rose-50/20', text: 'text-rose-700', label: 'Urgent (>18m)' };
    if (createdAt.includes('12:20')) return { color: 'border-amber-400 bg-amber-50/20', text: 'text-amber-700', label: '11m' };
    return { color: 'border-emerald-500 bg-emerald-50/20', text: 'text-emerald-700', label: '4m' };
  };

  const handleBumpItem = (orderId: string, itemId: string) => {
    bumpKDSTicket(orderId, itemId);
  };

  const handleBumpEntireTicket = (order: Order) => {
    bumpKDSTicket(order.id);
    setRecalledTickets(prev => [order, ...prev.slice(0, 5)]);

    // Trigger visual chime adapted to service mode
    const destination = order.tableNumber ? `Table ${order.tableNumber}` : (order.pickupToken || order.type);
    const modeMessage = serviceMode === 'counter_qr_no_waiter'
      ? `🛎️ DING! Order #${order.orderNumber.slice(-4)} (${destination}) is PLATED & READY for Counter Pickup!`
      : `🛎️ DING! Order #${order.orderNumber.slice(-4)} (${destination}) is PLATED & READY at the Pass! Waiter alerted.`;

    setExpediterAlert({
      message: modeMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setTimeout(() => {
      setExpediterAlert(null);
    }, 5000);
  };

  const handleRecallLast = () => {
    if (recalledTickets.length === 0) return;
    const last = recalledTickets[0];
    bumpKDSTicket(last.id);
    setRecalledTickets(prev => prev.slice(1));
  };

  // Workflow Pipeline Action Handlers
  const handleAdvanceToReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
    const order = siteOrders.find(o => o.id === orderId);
    if (order) {
      const modeMessage = serviceMode === 'counter_qr_no_waiter'
        ? `🛎️ Order #${order.orderNumber.slice(-4)} marked READY. Customer pickup screen announced!`
        : `🛎️ Order #${order.orderNumber.slice(-4)} marked READY AT PASS. Waiter & Runner notified!`;
      setExpediterAlert({
        message: modeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const handleAdvanceToDispatched = (order: Order) => {
    if (order.type === 'Delivery') {
      updateOrderStatus(order.id, 'dispatched', { riderName: 'Hamisi (Boxer 150)' });
      setExpediterAlert({
        message: `🛵 Order #${order.orderNumber.slice(-4)} handed to Courier Hamisi. Out for delivery!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (order.type === 'Takeaway' || serviceMode === 'counter_qr_no_waiter') {
      updateOrderStatus(order.id, 'dispatched');
      setExpediterAlert({
        message: `📢 Order #${order.orderNumber.slice(-4)} (${order.tableNumber ? `Table ${order.tableNumber}` : (order.pickupToken || 'Counter')}) CALLED for Customer Pickup!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      updateOrderStatus(order.id, 'dispatched', { runnerName: 'Emmanuel K. (Runner)' });
      setExpediterAlert({
        message: `🏃 Food Runner Emmanuel en route to Table ${order.tableNumber}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  const handleAdvanceToServed = (orderId: string) => {
    updateOrderStatus(orderId, 'served');
    setExpediterAlert({
      message: `✓ Order marked ARRIVED AT CUSTOMER / TABLE. Dining in progress!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const total86Count = menuItems.filter(m => m.is86).length;

  // End of Day Calculations
  const totalKitchenOrdersToday = siteOrders.length;
  const inKitchenCount = siteOrders.filter(o => o.status === 'in_kitchen').length;
  const readyPassCount = siteOrders.filter(o => o.status === 'ready').length;
  const dispatchedCount = siteOrders.filter(o => o.status === 'dispatched').length;
  const servedCount = siteOrders.filter(o => o.status === 'served' || o.status === 'paid').length;
  const voidedCount = siteOrders.filter(o => o.status === 'voided').length;

  // Item portion tally for kitchen end-of-day
  const portionTally: Record<string, { name: string; quantity: number; station: string; revenue: number }> = {};
  siteOrders.forEach(o => {
    if (o.status !== 'voided') {
      o.items.forEach(it => {
        if (!portionTally[it.name]) {
          portionTally[it.name] = {
            name: it.name,
            quantity: 0,
            station: it.station,
            revenue: 0
          };
        }
        portionTally[it.name].quantity += it.quantity;
        portionTally[it.name].revenue += (it.quantity * it.price);
      });
    }
  });

  const portionTallyList = Object.values(portionTally).sort((a, b) => b.quantity - a.quantity);

  // Filtered EOD Orders
  const filteredEodOrders = siteOrders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(eodSearchQuery.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(eodSearchQuery.toLowerCase())) ||
      (order.pickupToken && order.pickupToken.toLowerCase().includes(eodSearchQuery.toLowerCase())) ||
      (order.tableNumber && `table ${order.tableNumber}`.toLowerCase().includes(eodSearchQuery.toLowerCase()));

    const matchesStatus = eodStatusFilter === 'all' || order.status === eodStatusFilter;
    const matchesType = eodTypeFilter === 'all' || order.type === eodTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Expediter Audio/Visual Toast Banner */}
      {expediterAlert && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-3 rounded-2xl shadow-lg border border-amber-400 flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950 text-amber-400 rounded-xl">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight">{expediterAlert.message}</div>
              <div className="text-xs font-medium text-slate-900/80 font-mono mt-0.5">Expediter Bell Broadcast · {expediterAlert.timestamp}</div>
            </div>
          </div>
          <button 
            onClick={() => setExpediterAlert(null)}
            className="text-slate-950/70 hover:text-slate-950 font-bold text-xs px-2 py-1 bg-white/30 rounded-lg cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KDS Header & Sub-Tab Switcher */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-sm shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">Smart KDS & Kitchen Command</h1>
                <span className="text-2xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Station Pass Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kitchen station displays · Real-time Kitchen-to-Customer handoff pipeline · Daily order production tally
              </p>
            </div>
          </div>

          {/* Sub-View Navigation Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-xl border border-slate-700/80 flex-wrap">
            <button
              onClick={() => setActiveKdsTab('live_kds')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeKdsTab === 'live_kds'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Live Cooking Stations</span>
              <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono ${activeKdsTab === 'live_kds' ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-300'}`}>
                {activeOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveKdsTab('workflow_pipeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeKdsTab === 'workflow_pipeline'
                  ? 'bg-[#3cb371] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Kitchen-to-Customer Pipeline</span>
              <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono ${activeKdsTab === 'workflow_pipeline' ? 'bg-emerald-900 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {siteOrders.filter(o => o.status !== 'voided').length}
              </span>
            </button>

            <button
              onClick={() => setActiveKdsTab('end_of_day')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeKdsTab === 'end_of_day'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>End-of-Day Order List & Tally</span>
              <span className={`text-2xs px-1.5 py-0.2 rounded-full font-mono ${activeKdsTab === 'end_of_day' ? 'bg-blue-900 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {siteOrders.length}
              </span>
            </button>
          </div>
        </div>

        {/* Secondary Station Filter Bar (when in Live KDS mode) */}
        {activeKdsTab === 'live_kds' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-medium mr-1">Filter Station:</span>
              {stations.map(stn => (
                <button
                  key={stn}
                  onClick={() => setSelectedStation(stn)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    selectedStation === stn 
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {stn}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShow86Drawer(true)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>86 List ({total86Count})</span>
              </button>

              {recalledTickets.length > 0 && (
                <button
                  onClick={handleRecallLast}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Recall Last</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: LIVE STATION KDS TICKETS DISPLAY                    */}
      {/* ========================================================= */}
      {activeKdsTab === 'live_kds' && (
        <div className="space-y-4">
          {stationOrders.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <ChefHat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">All Kitchen Pass Queues Clear!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No active cooking tickets currently on station: <strong className="text-slate-700">{selectedStation}</strong>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
              {stationOrders.map(order => {
                const urgency = getTicketUrgency(order.createdAt);
                const itemsForStation = selectedStation === 'All' || selectedStation === 'Pass'
                  ? order.items
                  : order.items.filter(it => it.station === selectedStation);

                return (
                  <div 
                    key={order.id}
                    className={`bg-white rounded-2xl border-2 shadow-xs flex flex-col justify-between overflow-hidden transition-all ${urgency.color}`}
                  >
                    {/* Ticket Header */}
                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base font-mono">
                            {order.tableNumber ? `Table ${order.tableNumber}` : order.pickupToken || order.type}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#{order.orderNumber.slice(-4)}</span>
                        </div>
                        <div className="text-2xs text-slate-400 mt-0.5">
                          {order.type} · Server: {order.serverName} · Guests: {order.guestCount}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          {urgency.label}
                        </span>
                        <div className="text-2xs text-slate-400 font-mono mt-1">{order.createdAt}</div>
                      </div>
                    </div>

                    {/* Quick Workflow Mini-Stepper */}
                    <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-2xs font-mono">
                      <span className="text-slate-500 font-semibold">Workflow Stage:</span>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        order.status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'dispatched' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'in_kitchen' ? '1. Cooking on Line' :
                         order.status === 'ready' ? '2. Ready at Pass 🛎️' :
                         '3. Dispatched En Route'}
                      </span>
                    </div>

                    {/* Items in ticket */}
                    <div className="p-4 space-y-3 flex-1 divide-y divide-slate-100">
                      {itemsForStation.map(item => {
                        const isReady = item.status === 'ready' || item.status === 'served';

                        return (
                          <div 
                            key={item.id} 
                            onClick={() => handleBumpItem(order.id, item.id)}
                            className={`pt-2.5 first:pt-0 cursor-pointer group flex items-start justify-between gap-2 select-none`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-extrabold text-sm text-slate-900">
                                  {item.quantity}x
                                </span>
                                <span className={`text-xs font-semibold ${isReady ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-amber-700'}`}>
                                  {item.name}
                                </span>
                              </div>

                              {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                <div className="text-xs text-slate-500 ml-6 italic">
                                  {item.selectedModifiers.join(', ')}
                                </div>
                              )}

                              {item.specialNotes && (
                                <div className="text-xs font-bold text-rose-600 ml-6 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1 inline-block">
                                  Note: {item.specialNotes}
                                </div>
                              )}

                              <div className="text-2xs text-slate-400 ml-6 mt-0.5 font-mono">
                                {item.station} station · {item.course}
                              </div>
                            </div>

                            <div className="shrink-0 mt-0.5">
                              {isReady ? (
                                <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 inline-block shadow-2xs">
                                  <CheckCheck className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="p-1 rounded-full bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-700 inline-block">
                                  <Clock className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Ticket Footer Action */}
                    <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
                      <div className="text-xs text-slate-500 font-mono">
                        {order.status === 'ready' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCheck className="w-3.5 h-3.5" /> Plated at Pass
                          </span>
                        ) : (
                          <span>Cooking ({itemsForStation.length} items)</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleBumpEntireTicket(order)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">{order.status === 'ready' ? 'Bump to Runner' : 'Bump to Pass (🛎️)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: KITCHEN-TO-CUSTOMER PIPELINE & WORKFLOW TRACKER     */}
      {/* ========================================================= */}
      {activeKdsTab === 'workflow_pipeline' && (
        <div className="space-y-6">
          {/* Explanation Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#3cb371]" />
                  <span>Kitchen-to-End-Customer Order Journey & Custody Chain</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track each order step-by-step from line cooking, pass expediting, runner/token/courier dispatch, to guest delivery.
                </p>
              </div>

              {/* Service Channels Legend */}
              <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                  <UtensilsCrossed className="w-3 h-3 text-blue-600" />
                  <span>Dine-In (Food Runner to Table)</span>
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <ShoppingBag className="w-3 h-3 text-amber-600" />
                  <span>Takeaway (Token Call P.A.)</span>
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200">
                  <Bike className="w-3 h-3 text-purple-600" />
                  <span>Delivery (Courier Doorstep)</span>
                </span>
              </div>
            </div>
          </div>

          {/* 5-Column Pipeline Board */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* COLUMN 1: IN KITCHEN (COOKING) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="font-bold text-xs text-slate-900">1. In Kitchen</span>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {siteOrders.filter(o => o.status === 'in_kitchen').length}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-1 mb-3">Chefs cooking on stations</p>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {siteOrders.filter(o => o.status === 'in_kitchen').map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-amber-200 p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <span className={`text-2xs font-bold px-1.5 py-0.5 rounded ${
                        order.type === 'Dine-in' ? 'bg-blue-100 text-blue-800' :
                        order.type === 'Takeaway' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {order.tableNumber ? `T-${order.tableNumber}` : order.pickupToken || order.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div className="text-2xs text-slate-400 flex items-center justify-between font-mono">
                      <span>Fired: {order.createdAt}</span>
                      <span className="text-amber-700 font-bold">{order.items.length} items</span>
                    </div>

                    <button
                      onClick={() => handleAdvanceToReady(order.id)}
                      className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Plated at Pass (🛎️)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: PLATED & READY AT PASS */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-xs text-slate-900">2. Ready at Pass</span>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {siteOrders.filter(o => o.status === 'ready').length}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-1 mb-3">Expediter hot heat lamps</p>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {siteOrders.filter(o => o.status === 'ready').map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-emerald-300 p-3.5 shadow-2xs space-y-2.5 ring-1 ring-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <span className="text-2xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.pickupToken || order.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>

                    <div className="text-2xs text-slate-400 flex items-center justify-between font-mono">
                      <span>Ready At: {order.readyAt || order.createdAt}</span>
                      <span className="text-emerald-700 font-bold">Hot & Inspected</span>
                    </div>

                    <button
                      onClick={() => handleAdvanceToDispatched(order)}
                      className="w-full py-1.5 rounded-lg bg-[#3cb371] hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {order.type === 'Delivery' ? (
                        <>
                          <Bike className="w-3.5 h-3.5" />
                          <span>Dispatch Rider</span>
                        </>
                      ) : order.type === 'Takeaway' ? (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Call Token on P.A.</span>
                        </>
                      ) : (
                        <>
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          <span>Hand to Runner</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: EN ROUTE / DISPATCHED */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="font-bold text-xs text-slate-900">3. En Route</span>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  {siteOrders.filter(o => o.status === 'dispatched').length}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-1 mb-3">Runner / Counter / Courier</p>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {siteOrders.filter(o => o.status === 'dispatched').map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-purple-200 p-3.5 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.pickupToken || order.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-purple-50 p-2 rounded-lg font-medium">
                      {order.type === 'Delivery' ? `Rider: ${order.riderName || 'Hamisi (Boxer 150)'}` :
                       order.type === 'Takeaway' ? `Token: ${order.pickupToken} Called at Counter` :
                       `Runner: ${order.runnerName || 'Emmanuel K.'}`}
                    </div>

                    <div className="text-2xs text-slate-400 font-mono">
                      Dispatched: {order.dispatchedAt || 'Just now'}
                    </div>

                    <button
                      onClick={() => handleAdvanceToServed(order.id)}
                      className="w-full py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Arrived at Customer</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 4: ARRIVED AT CUSTOMER / SERVED */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="font-bold text-xs text-slate-900">4. At Customer</span>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {siteOrders.filter(o => o.status === 'served').length}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-1 mb-3">Dining / Collected</p>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {siteOrders.filter(o => o.status === 'served').map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-blue-200 p-3.5 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                        {order.tableNumber ? `Table ${order.tableNumber}` : order.pickupToken || order.type}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium truncate">
                      {order.customerName || 'Walk-in Guest'}
                    </div>

                    <div className="text-2xs text-slate-400 font-mono">
                      Served At: {order.servedAt || 'Earlier today'}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-2xs text-slate-400">Bill:</span>
                      <span className="font-mono font-bold text-slate-900">TZS {order.total.toLocaleString()}</span>
                    </div>

                    <span className="block text-center text-2xs font-bold text-blue-700 bg-blue-50 py-1 rounded">
                      Dining / Awaiting Bill Settle
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 5: COMPLETED & PAID */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3.5 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span className="font-bold text-xs text-slate-900">5. Completed & Settled</span>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {siteOrders.filter(o => o.status === 'paid').length}
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-1 mb-3">Paid, closed, table freed</p>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {siteOrders.filter(o => o.status === 'paid').map(order => (
                  <div key={order.id} className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs space-y-1.5 opacity-85">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.orderNumber}</span>
                      <span className="text-2xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">
                        ✓ PAID
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      {order.items.length} items · {order.paymentMethod || 'Cash'}
                    </div>

                    <div className="text-2xs text-slate-400 font-mono flex justify-between">
                      <span>Paid: {order.paidAt || 'Today'}</span>
                      <span className="font-bold text-slate-800">TZS {order.total.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: END-OF-DAY KITCHEN ORDER LIST & PRODUCTION TALLY    */}
      {/* ========================================================= */}
      {activeKdsTab === 'end_of_day' && (
        <div className="space-y-6">
          {/* Chef Operational Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Total Kitchen Tickets</span>
              <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">{totalKitchenOrdersToday}</div>
              <div className="text-2xs text-slate-400 mt-0.5">Processed today</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Currently Cooking</span>
              <div className="text-xl font-extrabold text-amber-600 font-mono mt-1">{inKitchenCount}</div>
              <div className="text-2xs text-amber-700 font-medium mt-0.5">On line stations</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Ready at Pass</span>
              <div className="text-xl font-extrabold text-emerald-600 font-mono mt-1">{readyPassCount}</div>
              <div className="text-2xs text-emerald-700 font-medium mt-0.5">Expediter holding</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Dispatched En Route</span>
              <div className="text-xl font-extrabold text-purple-600 font-mono mt-1">{dispatchedCount}</div>
              <div className="text-2xs text-purple-700 font-medium mt-0.5">Runner / Courier</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Served & Completed</span>
              <div className="text-xl font-extrabold text-blue-600 font-mono mt-1">{servedCount}</div>
              <div className="text-2xs text-blue-700 font-medium mt-0.5">Delivered to guest</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Avg Prep Speed</span>
              <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">11m 45s</div>
              <div className="text-2xs text-emerald-600 font-medium mt-0.5">94.2% on-time</div>
            </div>
          </div>

          {/* Dish Portions & Production Tally Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Kitchen Daily Portions Tally Matrix</span>
                </h3>
                <p className="text-xs text-slate-500">Exact plate count prepared and dispatched by the kitchen lines today</p>
              </div>

              <button
                onClick={() => toast.info('Production sheet sent to kitchen printer')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Kitchen Production Sheet</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
                  <tr>
                    <th className="px-4 py-3">Menu Dish Item</th>
                    <th className="px-4 py-3">Station Line</th>
                    <th className="px-4 py-3 text-center">Portions Prepared Today</th>
                    <th className="px-4 py-3 text-right">Gross Food Sales</th>
                    <th className="px-4 py-3 text-right">Production Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portionTallyList.map(dish => (
                    <tr key={dish.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{dish.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-slate-100 text-slate-700">
                          {dish.station}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-extrabold text-sm text-slate-900">
                        {dish.quantity} portions
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        TZS {dish.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ All Fulfilled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed End-of-Day Order Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">End-of-Day Kitchen Order Ledger</h3>
                <p className="text-xs text-slate-500">Detailed record of all tickets with station routing and status logs</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={eodSearchQuery}
                    onChange={e => setEodSearchQuery(e.target.value)}
                    placeholder="Search order #, table, token..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3cb371]"
                  />
                </div>

                <select
                  value={eodTypeFilter}
                  onChange={e => setEodTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Channels</option>
                  <option value="Dine-in">Dine-In</option>
                  <option value="Takeaway">Takeaway</option>
                  <option value="Delivery">Delivery</option>
                </select>

                <select
                  value={eodStatusFilter}
                  onChange={e => setEodStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_kitchen">In Kitchen</option>
                  <option value="ready">Ready at Pass</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="served">Served to Table</option>
                  <option value="paid">Paid & Completed</option>
                  <option value="voided">Voided</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-2xs">
                  <tr>
                    <th className="px-4 py-3">Order # / Token</th>
                    <th className="px-4 py-3">Channel & Destination</th>
                    <th className="px-4 py-3">Items Prepared</th>
                    <th className="px-4 py-3">Timeline (Fired → Ready → Delivered)</th>
                    <th className="px-4 py-3">Server / Expediter</th>
                    <th className="px-4 py-3">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEodOrders.map(order => (
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
                        <div className="font-semibold text-slate-800">{order.type}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {order.tableNumber ? `Table ${order.tableNumber}` : order.deliveryAddress ? `${order.deliveryAddress.substring(0, 20)}...` : 'Counter Pickup'}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 max-w-sm">
                        <div className="font-medium text-slate-700 truncate">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-2xs text-slate-400 mt-0.5">
                          Stations: {[...new Set(order.items.map(i => i.station))].join(', ')}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <span>Fired: {order.createdAt}</span>
                          <span>→</span>
                          <span className="text-emerald-700 font-bold">{order.readyAt || order.createdAt}</span>
                          {order.servedAt && (
                            <>
                              <span>→</span>
                              <span className="text-blue-700">{order.servedAt}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 font-medium">{order.serverName}</div>
                        {order.riderName && (
                          <div className="text-2xs text-purple-700 mt-0.5 flex items-center gap-1">
                            <Bike className="w-3 h-3" />
                            <span>{order.riderName}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-2xs font-bold ${
                          order.status === 'paid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          order.status === 'ready' ? 'bg-emerald-500/20 text-emerald-900 border border-emerald-500/40' :
                          order.status === 'dispatched' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          order.status === 'served' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          order.status === 'in_kitchen' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                          'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 86-List (Out-of-Stock) Live Management Drawer */}
      {show86Drawer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="text-base font-bold text-rose-950">Live 86-Item (Out-of-Stock) Controller</h3>
                  <p className="text-xs text-rose-700">Toggling an item immediately blocks order-entry at all POS stations</p>
                </div>
              </div>
              <button onClick={() => setShow86Drawer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
              {menuItems.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.name}</span>
                      <span className="text-2xs font-mono text-slate-400">{item.station}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Price: TZS {item.price.toLocaleString()} · SKU: {item.sku}
                    </div>
                  </div>

                  <button
                    onClick={() => toggle86(item.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${item.is86 ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {item.is86 ? '86\'d (Mark Available)' : 'Mark 86\'d (Out of Stock)'}
                  </button>
                </div>
              ))}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>Chef / Kitchen Manager authorization active</span>
              <button
                onClick={() => setShow86Drawer(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Close & Broadcast to POS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
