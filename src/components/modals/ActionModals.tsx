import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Thermometer, 
  Flame, 
  Plus, 
  Minus, 
  Lock 
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';
import { OrderType } from '../../types/erp';

interface ActionModalsProps {
  modalType: string | null;
  onClose: () => void;
}

export const ActionModals: React.FC<ActionModalsProps> = ({ modalType, onClose }) => {
  const { 
    currentRole, 
    currentSite, 
    tables, 
    menuItems, 
    inventory, 
    purchaseOrders, 
    addOrder, 
    receivePurchaseOrder, 
    logWaste, 
    executeDayEndClose 
  } = useErp();

  // Quick Order State
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [selectedTableNum, setSelectedTableNum] = useState<number>(3);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedItems, setSelectedItems] = useState<{ [menuId: string]: number }>({
    'menu-1': 1,
    'menu-6': 2
  });

  // Quick Receive State
  const pendingPos = purchaseOrders.filter(p => p.status === 'Approved' || p.status === 'Submitted');
  const [selectedPoId, setSelectedPoId] = useState<string>(pendingPos[0]?.id || '');
  const [tempLogged, setTempLogged] = useState<number>(3.1);
  const [qualityOk, setQualityOk] = useState<boolean>(true);

  // Quick Waste State
  const [wasteItemId, setWasteItemId] = useState<string>(inventory[0]?.id || '');
  const [wasteQty, setWasteQty] = useState<number>(2);
  const [wasteReason, setWasteReason] = useState<'Expired' | 'Prep Spoilage' | 'Dropped / Damaged' | 'Quality Reject' | 'Customer Return'>('Prep Spoilage');
  const [wasteNotes, setWasteNotes] = useState<string>('Trimming loss from morning batch prep');

  // Quick Close State
  const [countedCash, setCountedCash] = useState<number>(1450000);

  // 1. Fire Quick Order
  const handleFireQuickOrder = () => {
    const itemsToFire = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([menuId, qty]) => {
        const m = menuItems.find(item => item.id === menuId)!;
        return {
          id: `oi-${Math.random().toString(36).substring(2, 7)}`,
          menuItemId: m.id,
          name: m.name,
          price: m.price,
          quantity: qty,
          station: m.station,
          course: (m.category.includes('Starters') ? 'Starter' : (m.category.includes('Dessert') ? 'Dessert' : (m.category.includes('Beverage') ? 'Drinks' : 'Main'))) as any,
          status: 'pending' as const,
          firedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      });

    if (itemsToFire.length === 0) return;

    addOrder({
      tableNumber: orderType === 'Dine-in' ? selectedTableNum : undefined,
      guestCount,
      type: orderType,
      items: itemsToFire,
      discount: 0
    });

    onClose();
  };

  // 2. Quick Receive
  const handleQuickReceive = () => {
    if (!selectedPoId) return;
    receivePurchaseOrder(selectedPoId, tempLogged, qualityOk);
    onClose();
  };

  // 3. Quick Waste
  const handleQuickWaste = () => {
    const item = inventory.find(i => i.id === wasteItemId);
    if (!item) return;

    logWaste({
      stockItemId: item.id,
      itemName: item.name,
      quantity: wasteQty,
      unit: item.unit,
      totalCost: item.costPerUnit * wasteQty,
      reason: wasteReason,
      loggedBy: `${currentRole} - Floor Staff`,
      notes: wasteNotes
    });

    onClose();
  };

  // 4. Quick Day Close
  const handleQuickClose = () => {
    executeDayEndClose(countedCash);
    onClose();
  };

  if (!modalType) return null;

  return (
    <>
      {/* 1. Quick New Order Modal (Full Width 12 Grid) */}
      {modalType === 'new_order' && (
        <FullWidthFormModal
          isOpen={true}
          onClose={onClose}
          title="Rapid Order Entry & Kitchen Ticket Dispatch"
          subtitle="Full 12-column terminal with automatic course routing and real-time inventory depletion"
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: onClose,
              variant: 'secondary'
            },
            {
              label: 'Fire Order to Kitchen & Bar',
              onClick: handleFireQuickOrder,
              variant: 'primary',
              icon: <Flame className="w-3.5 h-3.5" />,
              requiredRole: ['Owner', 'Site Mgr', 'Cashier', 'Waiter']
            }
          ]}
        >
          <div className="col-span-12 md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Service Channel</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-medium"
            >
              <option value="Dine-in">Dine-in Service</option>
              <option value="Takeaway">Takeaway Counter</option>
              <option value="Delivery">Direct Delivery</option>
              <option value="Bar Tab">Bar Tab</option>
            </select>
          </div>

          {orderType === 'Dine-in' && (
            <>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Table</label>
                <select
                  value={selectedTableNum}
                  onChange={(e) => setSelectedTableNum(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.number}>
                      Table {t.number} ({t.section}) - {t.status.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-12 md:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Guest Covers</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
                />
              </div>
            </>
          )}

          {/* Quick Dishes Checklist */}
          <div className="col-span-12 pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2">Select Dishes & Cocktails</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {menuItems.map(item => {
                const qty = selectedItems[item.id] || 0;

                return (
                  <div key={item.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-md object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-md bg-slate-200 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="font-semibold text-slate-900 truncate">{item.name}</div>
                        <div className="text-2xs text-slate-500 font-mono">
                          TZS {item.price.toLocaleString()} · {item.station}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedItems(prev => ({ ...prev, [item.id]: Math.max(0, qty - 1) }))}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedItems(prev => ({ ...prev, [item.id]: qty + 1 }))}
                        className="p-1 rounded bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FullWidthFormModal>
      )}

      {/* 2. Quick Receive Modal */}
      {modalType === 'receive_goods' && (
        <FullWidthFormModal
          isOpen={true}
          onClose={onClose}
          title="Quick Goods Receiving & Cold-Chain HACCP Probe"
          subtitle="12-column verification for incoming supplier deliveries"
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: onClose,
              variant: 'secondary'
            },
            {
              label: 'Confirm GRN & Post to Inventory',
              onClick: handleQuickReceive,
              variant: 'success',
              icon: <Package className="w-3.5 h-3.5" />,
              requiredRole: ['Owner', 'Site Mgr', 'Storekeeper']
            }
          ]}
        >
          <div className="col-span-12 md:col-span-8">
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Pending Purchase Order</label>
            <select
              value={selectedPoId}
              onChange={(e) => setSelectedPoId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
            >
              {pendingPos.length === 0 ? (
                <option value="">No pending POs available</option>
              ) : (
                pendingPos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.poNumber} — {p.supplierName} (TZS {p.totalAmount.toLocaleString()})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">Arrival Temperature (°C)</label>
            <input
              type="number"
              step="0.1"
              value={tempLogged}
              onChange={(e) => setTempLogged(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div className="col-span-12">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={qualityOk}
                onChange={(e) => setQualityOk(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Physical inspection completed: weights verified, packaging intact, expiry within range.</span>
            </label>
          </div>
        </FullWidthFormModal>
      )}

      {/* 3. Quick Waste Modal */}
      {modalType === 'log_waste' && (
        <FullWidthFormModal
          isOpen={true}
          onClose={onClose}
          title="Rapid Waste / Spoilage Registration"
          subtitle="12-column waste loss documentation with reversing journal postings"
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: onClose,
              variant: 'secondary'
            },
            {
              label: 'Post Waste Write-off',
              onClick: handleQuickWaste,
              variant: 'danger',
              icon: <AlertTriangle className="w-3.5 h-3.5" />,
              requiredRole: ['Owner', 'Site Mgr', 'Chef', 'Storekeeper']
            }
          ]}
        >
          <div className="col-span-12 md:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">Stock Item</label>
            <select
              value={wasteItemId}
              onChange={(e) => setWasteItemId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            >
              {inventory.map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.name} ({inv.currentStock} {inv.unit} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Discarded Quantity</label>
            <input
              type="number"
              step="0.5"
              value={wasteQty}
              onChange={(e) => setWasteQty(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
            />
          </div>

          <div className="col-span-12 md:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
            <select
              value={wasteReason}
              onChange={(e) => setWasteReason(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            >
              <option value="Prep Spoilage">Prep Spoilage</option>
              <option value="Expired">Expired</option>
              <option value="Dropped / Damaged">Dropped / Damaged</option>
              <option value="Quality Reject">Quality Reject</option>
            </select>
          </div>

          <div className="col-span-12">
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              value={wasteNotes}
              onChange={(e) => setWasteNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            />
          </div>
        </FullWidthFormModal>
      )}

      {/* 4. Quick Day Close */}
      {modalType === 'day_close' && (
        <FullWidthFormModal
          isOpen={true}
          onClose={onClose}
          title="Emergency Day-End Close Trigger"
          subtitle="12-column daily closing wizard: blind cash count, open tab auto-closure, and finance ledger lock"
          currentRole={currentRole}
          actionButtons={[
            {
              label: 'Cancel',
              onClick: onClose,
              variant: 'secondary'
            },
            {
              label: 'Lock Day & Generate Z-Report',
              onClick: handleQuickClose,
              variant: 'danger',
              icon: <Lock className="w-3.5 h-3.5" />,
              requiredRole: ['Owner', 'Site Mgr']
            }
          ]}
        >
          <div className="col-span-12 md:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900">Branch: {currentSite.name}</div>
            <div className="text-slate-500">Day status will transition from OPEN to CLOSED.</div>
            <div className="text-slate-500">All journals locked for trading date: {new Date().toISOString().split('T')[0]}.</div>
          </div>

          <div className="col-span-12 md:col-span-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
            <label className="block font-bold text-amber-950">Counted Cash in Drawer (TZS)</label>
            <input
              type="number"
              value={countedCash}
              onChange={(e) => setCountedCash(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 text-base font-bold font-mono rounded-lg border border-amber-300 bg-white"
            />
          </div>
        </FullWidthFormModal>
      )}
    </>
  );
};
