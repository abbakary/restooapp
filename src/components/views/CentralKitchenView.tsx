import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Layers, 
  Send, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { ProductionOrder } from '../../types/erp';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';

export const CentralKitchenView: React.FC = () => {
  const { 
    productionOrders, 
    createProductionOrder, 
    updateProductionStatus, 
    sites, 
    currentRole 
  } = useErp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ProductionOrder>>({
    recipeName: 'Swahili Coconut Base Gravy (Master Pot)',
    targetQuantity: 100,
    unit: 'liters',
    destinationSiteId: sites[0]?.id || '',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    totalCost: 450000,
    yieldActualPercentage: 99.0
  });

  const handleCreateBatch = () => {
    createProductionOrder({
      centralKitchenSiteId: 'site-3',
      recipeName: formData.recipeName || 'Master Batch',
      targetQuantity: Number(formData.targetQuantity) || 50,
      unit: formData.unit || 'liters',
      destinationSiteId: formData.destinationSiteId || sites[0]?.id || '',
      scheduledDate: formData.scheduledDate || new Date().toISOString().split('T')[0],
      totalCost: Number(formData.totalCost) || 300000,
      yieldActualPercentage: Number(formData.yieldActualPercentage) || 100
    });
    setCreateModalOpen(false);
  };

  const actionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setCreateModalOpen(false),
      variant: 'secondary'
    },
    {
      label: 'Schedule Batch Production Run',
      onClick: handleCreateBatch,
      variant: 'primary',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Chef']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Central Production Kitchen & Multi-Branch Dispatch
          </h1>
          <p className="text-xs text-slate-500">
            Batch prep runs, master sauces, BOM yields, and automated inter-site delivery notes
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Batch Production Order</span>
        </button>
      </div>

      {/* Production Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {productionOrders.map(batch => {
          const destinationSite = sites.find(s => s.id === batch.destinationSiteId);

          return (
            <div key={batch.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-2xs font-mono text-slate-400">{batch.batchNumber}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{batch.recipeName}</h3>
                  </div>
                  <span className={`text-2xs font-bold px-2 py-0.5 rounded ${batch.status === 'Received at Branch' ? 'bg-emerald-100 text-emerald-800' : (batch.status === 'Dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}`}>
                    {batch.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-slate-50 rounded-lg text-xs font-mono">
                  <div>
                    <div className="text-2xs text-slate-400">Target Output</div>
                    <div className="font-bold text-slate-900 mt-0.5">{batch.targetQuantity} {batch.unit}</div>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-400">Actual Yield %</div>
                    <div className="font-bold text-emerald-700 mt-0.5">{batch.yieldActualPercentage}%</div>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-400">Batch Cost</div>
                    <div className="font-bold text-slate-900 mt-0.5">TZS {batch.totalCost.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div>Destination: <strong>{destinationSite?.name || 'Safari Grill Oysterbay'}</strong></div>
                  <div>Scheduled: <span className="font-mono">{batch.scheduledDate}</span></div>
                </div>
              </div>

              {/* Status Stepper Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-2xs text-slate-400">HACCP Batch Label Printed</span>
                <div className="flex gap-2">
                  {batch.status === 'Planned' && (
                    <button
                      onClick={() => updateProductionStatus(batch.id, 'In Production')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-purple-700 hover:bg-purple-800 text-white cursor-pointer"
                    >
                      Start Cooking Batch
                    </button>
                  )}
                  {batch.status === 'In Production' && (
                    <button
                      onClick={() => updateProductionStatus(batch.id, 'Dispatched')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-800 text-white cursor-pointer inline-flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch to Branch</span>
                    </button>
                  )}
                  {batch.status === 'Dispatched' && (
                    <button
                      onClick={() => updateProductionStatus(batch.id, 'Received at Branch')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer inline-flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Confirm Branch Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Width 12 Create Batch Order Modal */}
      <FullWidthFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Central Kitchen Batch Production Run"
        subtitle="12-column batch planning with recipe explosion and target branch allocation"
        currentRole={currentRole}
        actionButtons={actionButtons}
      >
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Master Recipe Name</label>
          <input
            type="text"
            value={formData.recipeName || ''}
            onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Yield Quantity</label>
          <input
            type="number"
            value={formData.targetQuantity || 50}
            onChange={(e) => setFormData({ ...formData, targetQuantity: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">Unit of Output</label>
          <select
            value={formData.unit || 'liters'}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            <option value="liters">liters (Sauce / Broth)</option>
            <option value="kg">kg (Pre-marinated cuts)</option>
            <option value="portions">portions</option>
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Destination Branch Outlet</label>
          <select
            value={formData.destinationSiteId}
            onChange={(e) => setFormData({ ...formData, destinationSiteId: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            {sites.filter(s => s.type !== 'Central Kitchen').map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
            ))}
          </select>
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Prep Date</label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Raw Material & Labor Cost (TZS)</label>
          <input
            type="number"
            value={formData.totalCost || 400000}
            onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Target Yield Tolerance %</label>
          <input
            type="number"
            value={formData.yieldActualPercentage || 98.5}
            onChange={(e) => setFormData({ ...formData, yieldActualPercentage: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>
      </FullWidthFormModal>
    </div>
  );
};
