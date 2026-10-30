import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  AlertTriangle, 
  Search, 
  Filter, 
  Trash2, 
  ArrowRightLeft, 
  Calendar, 
  CheckCircle2, 
  FileText,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { InventoryItem, WasteEntry } from '../../types/erp';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';

export const InventoryView: React.FC = () => {
  const { 
    inventory, 
    wasteEntries, 
    addInventoryItem, 
    updateInventoryItem, 
    logWaste, 
    currentRole 
  } = useErp();

  const [activeTab, setActiveTab] = useState<'stock' | 'waste' | 'count'>('stock');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // New / Edit Item Form State (Full width 12 grid)
  const [itemFormData, setItemFormData] = useState<Partial<InventoryItem>>({
    name: '',
    sku: '',
    category: 'Meat & Poultry',
    currentStock: 10,
    unit: 'kg',
    parLevel: 25,
    reorderPoint: 8,
    costPerUnit: 25000,
    storageLocation: 'Cold Walk-in',
    batchNumber: 'BCH-2026-99',
    expiryDate: '2026-11-30',
    status: 'In Stock'
  });

  // Waste Form State (Full width 12 grid)
  const [wasteFormData, setWasteFormData] = useState<{
    stockItemId: string;
    quantity: number;
    reason: WasteEntry['reason'];
    notes: string;
  }>({
    stockItemId: inventory[0]?.id || '',
    quantity: 1,
    reason: 'Prep Spoilage',
    notes: ''
  });

  const categories = ['All', 'Meat & Poultry', 'Seafood', 'Produce', 'Dairy & Dry', 'Beverage & Spirits', 'Packaging'];

  const filteredInventory = inventory.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      sku: `INV-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Meat & Poultry',
      currentStock: 15,
      unit: 'kg',
      parLevel: 30,
      reorderPoint: 10,
      costPerUnit: 22000,
      storageLocation: 'Cold Walk-in',
      batchNumber: `BCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'In Stock'
    });
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemFormData(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!itemFormData.name || !itemFormData.costPerUnit) return;

    if (editingItem) {
      updateInventoryItem({
        ...(itemFormData as InventoryItem),
        id: editingItem.id
      });
    } else {
      addInventoryItem({
        name: itemFormData.name || 'Stock Item',
        sku: itemFormData.sku || 'SKU-001',
        category: itemFormData.category || 'Produce',
        currentStock: Number(itemFormData.currentStock) || 0,
        unit: itemFormData.unit || 'kg',
        parLevel: Number(itemFormData.parLevel) || 10,
        reorderPoint: Number(itemFormData.reorderPoint) || 5,
        costPerUnit: Number(itemFormData.costPerUnit) || 0,
        storageLocation: itemFormData.storageLocation || 'Main Store',
        lastCountDate: new Date().toISOString().split('T')[0],
        batchNumber: itemFormData.batchNumber || 'BCH-01',
        expiryDate: itemFormData.expiryDate || '2027-01-01',
        status: (Number(itemFormData.currentStock) || 0) <= (Number(itemFormData.reorderPoint) || 5) ? 'Low Stock' : 'In Stock'
      });
    }
    setItemModalOpen(false);
  };

  const handleSaveWaste = () => {
    const targetItem = inventory.find(i => i.id === wasteFormData.stockItemId);
    if (!targetItem) return;

    const totalCost = targetItem.costPerUnit * wasteFormData.quantity;

    logWaste({
      stockItemId: targetItem.id,
      itemName: targetItem.name,
      quantity: wasteFormData.quantity,
      unit: targetItem.unit,
      totalCost,
      reason: wasteFormData.reason,
      loggedBy: `${currentRole} - Store Officer`,
      notes: wasteFormData.notes || 'Routine kitchen prep trimming / spoilage'
    });

    setWasteModalOpen(false);
  };

  // Action buttons configuration for FullWidthFormModal (Item)
  const itemActionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setItemModalOpen(false),
      variant: 'secondary'
    },
    {
      label: editingItem ? 'Save Updates' : 'Add Stock Item to Ledger',
      onClick: handleSaveItem,
      variant: 'primary',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Storekeeper']
    }
  ];

  // Action buttons configuration for Waste Modal
  const wasteActionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setWasteModalOpen(false),
      variant: 'secondary'
    },
    {
      label: 'Authorize & Post Waste Write-off',
      onClick: handleSaveWaste,
      variant: 'danger',
      icon: <Trash2 className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Chef', 'Storekeeper']
    }
  ];

  const totalInventoryValuation = inventory.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0);
  const totalWasteLoss = wasteEntries.reduce((sum, w) => sum + w.totalCost, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Inventory Ledger & Spoilage Write-Off Control
          </h1>
          <p className="text-xs text-slate-500">
            Multi-location stock · Theoretical depletion by sales BOM · Batch and expiry traceability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWasteModalOpen(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Log Waste / Spoilage</span>
          </button>

          <button
            onClick={handleOpenAddItem}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Stock Item</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Inventory Asset Valuation</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            TZS {totalInventoryValuation.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 mt-1">{inventory.length} active SKUs tracked</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Waste & Spoilage Write-Off (Month)</div>
          <div className="text-xl font-bold font-mono text-rose-700 mt-1 tabular-nums">
            TZS {totalWasteLoss.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">{wasteEntries.length} logged incidents</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Critical Stock Reorder Flags</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {inventory.filter(i => i.status === 'Critical' || i.status === 'Low Stock').length} Items
          </div>
          <div className="text-xs text-amber-600 mt-1">Auto-requisitions generated for review</div>
        </div>
      </div>

      {/* Sub Tabs: Stock Ledger vs Waste Entries vs Cycle Count */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === 'stock' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Stock Ledger ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab('waste')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${activeTab === 'waste' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Waste & Spoilage Log ({wasteEntries.length})
            </button>
          </div>

          {activeTab === 'stock' && (
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Search stock..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1 text-xs rounded-lg border border-slate-200 w-44"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Stock Ledger Table */}
        {activeTab === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">SKU & Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3 text-right">In Stock</th>
                  <th className="p-3 text-right">PAR / Reorder</th>
                  <th className="p-3 text-right">Theoretical Depleted</th>
                  <th className="p-3 text-right">Unit Cost</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-2xs text-slate-400 font-mono">{item.sku} · Lot: {item.batchNumber}</div>
                    </td>
                    <td className="p-3 font-sans text-slate-600">{item.category}</td>
                    <td className="p-3 font-sans text-slate-600">{item.storageLocation}</td>
                    <td className="p-3 text-right font-bold text-slate-900 tabular-nums">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="p-3 text-right text-slate-500 tabular-nums">
                      {item.parLevel} / {item.reorderPoint} {item.unit}
                    </td>
                    <td className="p-3 text-right text-amber-700 tabular-nums">
                      {item.theoreticalDepletedToday} {item.unit}
                    </td>
                    <td className="p-3 text-right tabular-nums">
                      TZS {item.costPerUnit.toLocaleString()}
                    </td>
                    <td className="p-3 font-sans">
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded ${item.status === 'Critical' ? 'bg-rose-100 text-rose-800' : (item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center font-sans">
                      <button
                        onClick={() => handleOpenEditItem(item)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Waste & Spoilage Log */}
        {activeTab === 'waste' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="p-3">Date & Item</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3 text-right">Financial Loss</th>
                  <th className="p-3">Reason Code</th>
                  <th className="p-3">Logged By</th>
                  <th className="p-3">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {wasteEntries.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-900">{w.itemName}</div>
                      <div className="text-2xs text-slate-400 font-mono">{w.date}</div>
                    </td>
                    <td className="p-3 tabular-nums font-bold">{w.quantity} {w.unit}</td>
                    <td className="p-3 text-right font-bold text-rose-700 tabular-nums">
                      TZS {w.totalCost.toLocaleString()}
                    </td>
                    <td className="p-3 font-sans">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                        {w.reason}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-slate-600">{w.loggedBy}</td>
                    <td className="p-3 font-sans text-slate-500 italic">{w.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Add / Edit Stock Item Full Width 12 Modal */}
      <FullWidthFormModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? `Adjust Stock Item: ${editingItem.name}` : 'Create New Stock Item in Master Inventory'}
        subtitle="12-column master item registration with storage locations, reorder thresholds, and FIFO tracking"
        currentRole={currentRole}
        actionButtons={itemActionButtons}
      >
        {/* Col-span-12 md:col-span-6 */}
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Stock Item Name</label>
          <input
            type="text"
            value={itemFormData.name || ''}
            onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
            placeholder="e.g. Grass-fed Ribeye Loins"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Col-span-12 md:col-span-3 */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Barcode</label>
          <input
            type="text"
            value={itemFormData.sku || ''}
            onChange={(e) => setItemFormData({ ...itemFormData, sku: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono uppercase"
          />
        </div>

        {/* Col-span-12 md:col-span-3 */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
          <select
            value={itemFormData.category || 'Meat & Poultry'}
            onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value as InventoryItem['category'] })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Col-span-12 md:col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Current Stock Quantity</label>
          <input
            type="number"
            value={itemFormData.currentStock || 0}
            onChange={(e) => setItemFormData({ ...itemFormData, currentStock: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        {/* Col-span-12 md:col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Measure (UoM)</label>
          <select
            value={itemFormData.unit || 'kg'}
            onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            <option value="kg">kg (Kilograms)</option>
            <option value="liters">liters (Liters)</option>
            <option value="pcs">pcs (Pieces)</option>
            <option value="portions">portions</option>
            <option value="packs">packs</option>
          </select>
        </div>

        {/* Col-span-12 md:col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Cost per Unit (TZS)</label>
          <input
            type="number"
            value={itemFormData.costPerUnit || 0}
            onChange={(e) => setItemFormData({ ...itemFormData, costPerUnit: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        {/* Col-span-12 md:col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Target PAR Level</label>
          <input
            type="number"
            value={itemFormData.parLevel || 20}
            onChange={(e) => setItemFormData({ ...itemFormData, parLevel: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        {/* Col-span-12 md:col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Reorder Trigger Point</label>
          <input
            type="number"
            value={itemFormData.reorderPoint || 8}
            onChange={(e) => setItemFormData({ ...itemFormData, reorderPoint: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        {/* Col-span-12 md:col-span-4 */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Storage Location</label>
          <select
            value={itemFormData.storageLocation || 'Main Store'}
            onChange={(e) => setItemFormData({ ...itemFormData, storageLocation: e.target.value as InventoryItem['storageLocation'] })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            <option value="Main Store">Main Store</option>
            <option value="Cold Walk-in">Cold Walk-in</option>
            <option value="Kitchen Line">Kitchen Line</option>
            <option value="Bar Storage">Bar Storage</option>
          </select>
        </div>

        {/* Col-span-12 md:col-span-6 */}
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Lot Identifier</label>
          <input
            type="text"
            value={itemFormData.batchNumber || ''}
            onChange={(e) => setItemFormData({ ...itemFormData, batchNumber: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        {/* Col-span-12 md:col-span-6 */}
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date (FEFO Policy)</label>
          <input
            type="date"
            value={itemFormData.expiryDate || ''}
            onChange={(e) => setItemFormData({ ...itemFormData, expiryDate: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>
      </FullWidthFormModal>

      {/* 4. Log Waste / Spoilage Full Width 12 Modal */}
      <FullWidthFormModal
        isOpen={wasteModalOpen}
        onClose={() => setWasteModalOpen(false)}
        title="Log Kitchen Spoilage, Trimming Loss or Waste Write-off"
        subtitle="Full 12-column audit log with reason codes and automated reversing ledger journal entries"
        currentRole={currentRole}
        actionButtons={wasteActionButtons}
      >
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Select Discarded Stock Item</label>
          <select
            value={wasteFormData.stockItemId}
            onChange={(e) => setWasteFormData({ ...wasteFormData, stockItemId: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-medium"
          >
            {inventory.map(inv => (
              <option key={inv.id} value={inv.id}>
                {inv.name} (In stock: {inv.currentStock} {inv.unit} @ TZS {inv.costPerUnit.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Wasted</label>
          <input
            type="number"
            step="0.1"
            value={wasteFormData.quantity}
            onChange={(e) => setWasteFormData({ ...wasteFormData, quantity: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Reason Code</label>
          <select
            value={wasteFormData.reason}
            onChange={(e) => setWasteFormData({ ...wasteFormData, reason: e.target.value as WasteEntry['reason'] })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            <option value="Prep Spoilage">Prep Spoilage / Trimming</option>
            <option value="Expired">Expired (FEFO Failure)</option>
            <option value="Dropped / Damaged">Dropped / Physical Damage</option>
            <option value="Quality Reject">Quality Reject on Line</option>
            <option value="Customer Return">Customer Return</option>
          </select>
        </div>

        <div className="col-span-12">
          <label className="block text-xs font-bold text-slate-700 mb-1">Auditor Notes & Root Cause</label>
          <textarea
            rows={2}
            value={wasteFormData.notes}
            onChange={(e) => setWasteFormData({ ...wasteFormData, notes: e.target.value })}
            placeholder="Describe reason for discard and corrective preventive action..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          />
        </div>

        {/* Loss estimation banner */}
        <div className="col-span-12 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-900">
          <div>
            <strong>Financial Loss Impact:</strong> Will debit Account 5020 (Spoilage Expense) and credit 1210 (Inventory Asset).
          </div>
          <div className="font-mono font-bold text-sm">
            TZS {((inventory.find(i => i.id === wasteFormData.stockItemId)?.costPerUnit || 0) * wasteFormData.quantity).toLocaleString()}
          </div>
        </div>
      </FullWidthFormModal>
    </div>
  );
};
