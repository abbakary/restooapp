import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Thermometer, 
  ShieldCheck, 
  DollarSign, 
  PackageCheck,
  Search,
  Filter
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { PurchaseOrder, Supplier, PurchaseOrderItem } from '../../types/erp';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';

export const ProcurementView: React.FC = () => {
  const { 
    purchaseOrders, 
    suppliers, 
    inventory, 
    createPurchaseOrder, 
    approvePurchaseOrder, 
    receivePurchaseOrder, 
    currentRole, 
    currentSite 
  } = useErp();

  const [activeTab, setActiveTab] = useState<'orders' | 'suppliers'>('orders');
  const [createPoModalOpen, setCreatePoModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedPoForReceive, setSelectedPoForReceive] = useState<PurchaseOrder | null>(null);

  // Receiving state (HACCP & quality)
  const [tempCelsius, setTempCelsius] = useState<number>(3.5);
  const [qualityPassed, setQualityPassed] = useState<boolean>(true);
  const [receivingNotes, setReceivingNotes] = useState<string>('Temperature checked upon van arrival, seal intact.');

  // Create PO Form State (Full width 12 grid)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
  );
  const [poLines, setPoLines] = useState<PurchaseOrderItem[]>([
    {
      stockItemId: inventory[0]?.id || '',
      itemName: inventory[0]?.name || '',
      unit: inventory[0]?.unit || 'kg',
      quantity: 20,
      unitPrice: inventory[0]?.costPerUnit || 25000,
      lineTotal: 20 * (inventory[0]?.costPerUnit || 25000)
    }
  ]);

  const handleAddPoLine = () => {
    const inv = inventory[1] || inventory[0];
    if (!inv) return;
    setPoLines(prev => [
      ...prev,
      {
        stockItemId: inv.id,
        itemName: inv.name,
        unit: inv.unit,
        quantity: 10,
        unitPrice: inv.costPerUnit,
        lineTotal: 10 * inv.costPerUnit
      }
    ]);
  };

  const handleRemovePoLine = (index: number) => {
    setPoLines(prev => prev.filter((_, idx) => idx !== index));
  };

  const poSubtotal = poLines.reduce((sum, line) => sum + line.lineTotal, 0);
  const poTax = Math.round(poSubtotal * 0.18);
  const poTotal = poSubtotal + poTax;

  const handleSavePO = () => {
    const sup = suppliers.find(s => s.id === selectedSupplierId);
    if (!sup) return;

    createPurchaseOrder({
      siteId: currentSite.id,
      supplierId: sup.id,
      supplierName: sup.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDeliveryDate,
      items: poLines,
      subtotal: poSubtotal,
      tax: poTax,
      totalAmount: poTotal,
      approvalLimitRequired: 500000
    });

    setCreatePoModalOpen(false);
  };

  const handleOpenReceive = (po: PurchaseOrder) => {
    setSelectedPoForReceive(po);
    setTempCelsius(3.2);
    setQualityPassed(true);
    setReceiveModalOpen(true);
  };

  const handleConfirmReceive = () => {
    if (!selectedPoForReceive) return;
    receivePurchaseOrder(selectedPoForReceive.id, tempCelsius, qualityPassed);
    setReceiveModalOpen(false);
  };

  // Create PO Action Buttons
  const createPoActionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setCreatePoModalOpen(false),
      variant: 'secondary'
    },
    {
      label: currentRole === 'Storekeeper' ? 'Submit PO for Manager Approval' : 'Authorize & Issue PO',
      onClick: handleSavePO,
      variant: 'primary',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Storekeeper']
    }
  ];

  // Receive Action Buttons
  const receiveActionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setReceiveModalOpen(false),
      variant: 'secondary'
    },
    {
      label: 'Accept Goods, Log Temp & Post to Stock',
      onClick: handleConfirmReceive,
      variant: 'success',
      icon: <PackageCheck className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Storekeeper']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Procurement, Supplier Contracts & 3-Way Invoice Matching
          </h1>
          <p className="text-xs text-slate-500">
            Requisition → Purchase Order (PO) → Goods Receiving Note (GRN) with HACCP Chiller Temperature Audit
          </p>
        </div>

        <button
          onClick={() => setCreatePoModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'orders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${activeTab === 'suppliers' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          Approved Suppliers ({suppliers.length})
        </button>
      </div>

      {/* Tab 1: Orders Table */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">PO Number & Date</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3 text-right">Items</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3 text-right">Total (incl. VAT)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">HACCP Temp</th>
                  <th className="p-3 text-center">Action / Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-900 font-mono">{po.poNumber}</div>
                      <div className="text-2xs text-slate-400">{po.orderDate} · Expected: {po.expectedDate}</div>
                    </td>
                    <td className="p-3 font-sans font-medium text-slate-900">{po.supplierName}</td>
                    <td className="p-3 text-right font-bold">{po.items.length} lines</td>
                    <td className="p-3 text-right tabular-nums">TZS {po.subtotal.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                      TZS {po.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-3 font-sans">
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded ${po.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : (po.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-3 font-sans">
                      {po.temperatureLoggedCelsius !== undefined ? (
                        <span className="text-2xs font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {po.temperatureLoggedCelsius}°C (Pass)
                        </span>
                      ) : (
                        <span className="text-2xs text-slate-400">Pending arrival</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-sans">
                      {po.status === 'Submitted' && (
                        <button
                          onClick={() => approvePurchaseOrder(po.id, currentSite.manager)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                        >
                          Approve PO
                        </button>
                      )}

                      {po.status === 'Approved' && (
                        <button
                          onClick={() => handleOpenReceive(po)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer"
                        >
                          Receive Goods (GRN)
                        </button>
                      )}

                      {po.status === 'Delivered' && (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3-Way Matched</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Approved Suppliers List */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map(sup => (
            <div key={sup.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xs font-mono text-slate-400">{sup.code}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{sup.name}</h3>
                </div>
                <span className="text-xs font-bold text-amber-600 font-mono">
                  ★ {sup.rating}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                <div>Contact: <strong>{sup.contactPerson}</strong></div>
                <div>Phone: <span className="font-mono">{sup.phone}</span></div>
                <div>Terms: <span className="font-mono">{sup.paymentTerms}</span></div>
                <div>Avg Lead Time: <strong>{sup.leadTimeDays} days</strong></div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-emerald-700 font-medium">HACCP Approved</span>
                <button
                  onClick={() => {
                    setSelectedSupplierId(sup.id);
                    setCreatePoModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium cursor-pointer"
                >
                  Create PO →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Create PO Modal - Full Width 12 Grid */}
      <FullWidthFormModal
        isOpen={createPoModalOpen}
        onClose={() => setCreatePoModalOpen(false)}
        title="Issue New Purchase Requisition & Supplier PO"
        subtitle="12-column procurement line configuration with automatic supplier price indexing"
        currentRole={currentRole}
        actionButtons={createPoActionButtons}
      >
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Registered Supplier</label>
          <select
            value={selectedSupplierId}
            onChange={(e) => setSelectedSupplierId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-medium"
          >
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.paymentTerms})</option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Expected Delivery Date</label>
          <input
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        {/* PO Line Items */}
        <div className="col-span-12 pt-2 border-t border-slate-200 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">PO Requisition Line Items</h4>
          <button
            type="button"
            onClick={handleAddPoLine}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Item</span>
          </button>
        </div>

        <div className="col-span-12 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="p-2.5">Stock Item</th>
                <th className="p-2.5">Quantity</th>
                <th className="p-2.5">Unit</th>
                <th className="p-2.5">Supplier Rate</th>
                <th className="p-2.5 text-right">Extended Total</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {poLines.map((line, idx) => (
                <tr key={idx}>
                  <td className="p-2.5 font-sans">
                    <select
                      value={line.stockItemId}
                      onChange={(e) => {
                        const inv = inventory.find(i => i.id === e.target.value);
                        if (!inv) return;
                        setPoLines(prev => prev.map((l, i) => i === idx ? {
                          ...l,
                          stockItemId: inv.id,
                          itemName: inv.name,
                          unit: inv.unit,
                          unitPrice: inv.costPerUnit,
                          lineTotal: l.quantity * inv.costPerUnit
                        } : l));
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200"
                    >
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2.5">
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => {
                        const qty = parseFloat(e.target.value) || 0;
                        setPoLines(prev => prev.map((l, i) => i === idx ? { ...l, quantity: qty, lineTotal: qty * l.unitPrice } : l));
                      }}
                      className="w-20 px-2 py-1 text-xs rounded border border-slate-200 font-bold"
                    />
                  </td>
                  <td className="p-2.5 text-slate-500">{line.unit}</td>
                  <td className="p-2.5">TZS {line.unitPrice.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    TZS {line.lineTotal.toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemovePoLine(idx)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="col-span-12 p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
          <div className="text-slate-500">Includes 18% VAT standard compliance</div>
          <div className="text-right">
            <span className="text-slate-500 mr-2">Grand Total:</span>
            <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
              TZS {poTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </FullWidthFormModal>

      {/* 4. Goods Receiving Modal (GRN & HACCP Temperature Audit) - Full Width 12 Grid */}
      {selectedPoForReceive && (
        <FullWidthFormModal
          isOpen={receiveModalOpen}
          onClose={() => setReceiveModalOpen(false)}
          title={`Receive Goods & HACCP Inspection: ${selectedPoForReceive.poNumber}`}
          subtitle="Mandatory food safety cold-chain inspection prior to inventory acceptance"
          currentRole={currentRole}
          actionButtons={receiveActionButtons}
        >
          <div className="col-span-12 md:col-span-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
            <div className="font-bold text-slate-900">Supplier: {selectedPoForReceive.supplierName}</div>
            <div className="text-slate-500">PO Value: TZS {selectedPoForReceive.totalAmount.toLocaleString()}</div>
            <div className="text-slate-500">Items: {selectedPoForReceive.items.map(it => `${it.quantity} ${it.unit} ${it.itemName}`).join(', ')}</div>
          </div>

          <div className="col-span-12 md:col-span-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Thermometer className="w-4 h-4 text-emerald-700" />
              <span>Chilled Van Arrival Temperature (°C)</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                value={tempCelsius}
                onChange={(e) => setTempCelsius(parseFloat(e.target.value) || 0)}
                className="w-28 px-3 py-2 text-base font-bold font-mono rounded-lg border border-emerald-300 bg-white"
              />
              <span className={`text-xs font-semibold ${tempCelsius <= 4.0 ? 'text-emerald-700' : 'text-rose-700 font-bold'}`}>
                {tempCelsius <= 4.0 ? '✓ Within Safe Critical Limit (<= 4°C)' : '⚠ Critical Safety Limit Exceeded!'}
              </span>
            </div>
          </div>

          <div className="col-span-12">
            <label className="block text-xs font-bold text-slate-700 mb-1">Quality & Packaging Verification</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={qualityPassed}
                  onChange={(e) => setQualityPassed(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Passed physical freshness, odor, temperature, and intact manufacturer vacuum seals</span>
              </label>
            </div>
          </div>

          <div className="col-span-12">
            <label className="block text-xs font-bold text-slate-700 mb-1">Receiving Storekeeper Notes</label>
            <textarea
              rows={2}
              value={receivingNotes}
              onChange={(e) => setReceivingNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            />
          </div>
        </FullWidthFormModal>
      )}
    </div>
  );
};
