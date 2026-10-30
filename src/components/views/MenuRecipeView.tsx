import React, { useState } from 'react';
import { onImgError } from '../../utils/images';
import { 
  BookOpen, 
  Plus, 
  Layers, 
  DollarSign, 
  Percent, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { MenuItem, RecipeIngredient } from '../../types/erp';
import { FullWidthFormModal, ActionButtonConfig } from '../common/FullWidthFormModal';
import { FOOD_IMAGE_PRESETS } from '../../data/mockData';

export const MenuRecipeView: React.FC = () => {
  const { menuItems, inventory, addMenuItem, updateMenuItem, currentRole } = useErp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Add / Edit (Full width 12 grid)
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    sku: '',
    category: 'Main Course',
    price: 35000,
    cost: 12000,
    station: 'Grill',
    allergens: [],
    preparationTimeMins: 15,
    description: '',
    salesVelocity: 'high',
    recipe: []
  });

  const [recipeLines, setRecipeLines] = useState<RecipeIngredient[]>([]);

  const categories = ['All', 'Steaks & Grill', 'Seafood', 'Main Course', 'Starters & Salads', 'Desserts', 'Beverages & Cocktails'];

  const filteredItems = menuItems.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: `MENU-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Main Course',
      price: 38000,
      cost: 11500,
      station: 'Grill',
      allergens: [],
      preparationTimeMins: 15,
      description: '',
      salesVelocity: 'high',
      recipe: []
    });
    setRecipeLines([
      { stockItemId: inventory[0]?.id || '', name: inventory[0]?.name || '', quantity: 0.25, unit: 'kg', unitCost: inventory[0]?.costPerUnit || 20000 }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setRecipeLines(item.recipe || []);
    setIsModalOpen(true);
  };

  // Recipe calculation
  const calculatedBOMCost = recipeLines.reduce((sum, line) => sum + (line.quantity * line.unitCost), 0);
  const currentPrice = Number(formData.price) || 1;
  const foodCostPercentage = ((calculatedBOMCost / currentPrice) * 100).toFixed(1);
  const grossMarginPercentage = (100 - Number(foodCostPercentage)).toFixed(1);

  const handleAddRecipeIngredient = () => {
    const defaultInv = inventory[0];
    if (!defaultInv) return;
    setRecipeLines(prev => [
      ...prev,
      {
        stockItemId: defaultInv.id,
        name: defaultInv.name,
        quantity: 0.1,
        unit: defaultInv.unit,
        unitCost: defaultInv.costPerUnit
      }
    ]);
  };

  const handleRemoveRecipeIngredient = (index: number) => {
    setRecipeLines(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveRecipe = () => {
    if (!formData.name || !formData.price) return;

    if (editingItem) {
      updateMenuItem({
        ...(formData as MenuItem),
        id: editingItem.id,
        imageUrl: formData.imageUrl,
        cost: calculatedBOMCost,
        recipe: recipeLines
      });
    } else {
      addMenuItem({
        name: formData.name || 'New Dish',
        sku: formData.sku || 'SKU-000',
        category: formData.category || 'Main Course',
        price: Number(formData.price) || 0,
        cost: calculatedBOMCost,
        station: formData.station || 'Grill',
        is86: false,
        allergens: formData.allergens || [],
        preparationTimeMins: Number(formData.preparationTimeMins) || 15,
        description: formData.description || '',
        salesVelocity: formData.salesVelocity || 'high',
        imageUrl: formData.imageUrl,
        recipe: recipeLines
      });
    }
    setIsModalOpen(false);
  };

  // Action buttons configuration for FullWidthFormModal based on user roles
  const modalActionButtons: ActionButtonConfig[] = [
    {
      label: 'Cancel',
      onClick: () => setIsModalOpen(false),
      variant: 'secondary'
    },
    {
      label: currentRole === 'Chef' ? 'Propose Recipe BOM' : 'Approve & Save Recipe BOM',
      onClick: handleSaveRecipe,
      variant: 'primary',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      requiredRole: ['Owner', 'Site Mgr', 'Chef']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            Menu Catalog, Bill of Materials (BOM) & Recipe Costing
          </h1>
          <p className="text-xs text-slate-500">
            Real-time margin analysis from raw ingredient purchasing costs · Automated stock depletion on sales
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Menu Item & BOM</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors cursor-pointer ${selectedCategory === cat ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Menu & BOM Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const margin = ((item.price - item.cost) / item.price) * 100;
          const foodCostPct = (item.cost / item.price) * 100;

          return (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
              {/* Image banner */}
              <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={onImgError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800">
                    <ImageIcon className="w-6 h-6 opacity-40 mr-1" />
                    <span className="text-2xs font-mono">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-2 left-2 text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                  {item.station}
                </span>
                <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded bg-white/90 text-slate-900 shadow-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xs font-mono uppercase tracking-wider text-slate-400">{item.sku}</span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>

                {/* Financial Health strip */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xs text-slate-400">Menu Price</div>
                    <div className="font-mono font-bold text-xs text-slate-900 mt-0.5 tabular-nums">
                      TZS {item.price.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-400">BOM Cost</div>
                    <div className="font-mono font-bold text-xs text-slate-700 mt-0.5 tabular-nums">
                      TZS {item.cost.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xs text-slate-400">Gross Margin</div>
                    <div className="font-mono font-bold text-xs text-emerald-700 mt-0.5 tabular-nums">
                      {margin.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Recipe Ingredients Preview */}
                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-emerald-600" />
                    <span>Bill of Materials ({item.recipe?.length || 0} items):</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    {item.recipe?.map((ing, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{ing.name}</span>
                        <span className="font-mono">{ing.quantity} {ing.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-2xs text-slate-400 font-mono">Prep: {item.preparationTimeMins} mins</span>
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Recipe BOM</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Full-Width 12 Grid Modal for Add / Edit Recipe BOM */}
      <FullWidthFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Recipe & BOM: ${editingItem.name}` : 'Add New Menu Item & BOM Formulation'}
        subtitle="Full 12-column engineering layout with ingredient yields and automatic theoretical cost tracking"
        currentRole={currentRole}
        actionButtons={modalActionButtons}
      >
        {/* Col-span-12 md:col-span-6: Item Name */}
        <div className="col-span-12 md:col-span-6">
          <label className="block text-xs font-bold text-slate-700 mb-1">Menu Item Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Swahili Charcoal Grilled Snapper"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Col-span-12 md:col-span-3: SKU */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">SKU / Item Code</label>
          <input
            type="text"
            value={formData.sku || ''}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono uppercase"
          />
        </div>

        {/* Col-span-12 md:col-span-3: Station */}
        <div className="col-span-12 md:col-span-3">
          <label className="block text-xs font-bold text-slate-700 mb-1">KDS Cooking Station</label>
          <select
            value={formData.station || 'Grill'}
            onChange={(e) => setFormData({ ...formData, station: e.target.value as MenuItem['station'] })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            <option value="Grill">Grill</option>
            <option value="Fry">Fry</option>
            <option value="Cold">Cold</option>
            <option value="Bar">Bar</option>
            <option value="Pastry">Pastry</option>
          </select>
        </div>

        {/* Col-span-12 md:col-span-4: Category */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
          <select
            value={formData.category || 'Main Course'}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem['category'] })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          >
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Col-span-12 md:col-span-4: Price */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (TZS)</label>
          <input
            type="number"
            value={formData.price || 0}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono font-bold"
          />
        </div>

        {/* Col-span-12 md:col-span-4: Prep Time */}
        <div className="col-span-12 md:col-span-4">
          <label className="block text-xs font-bold text-slate-700 mb-1">Standard Prep Time (Minutes)</label>
          <input
            type="number"
            value={formData.preparationTimeMins || 15}
            onChange={(e) => setFormData({ ...formData, preparationTimeMins: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
          />
        </div>

        {/* Col-span-12: Description */}
        <div className="col-span-12">
          <label className="block text-xs font-bold text-slate-700 mb-1">Menu Description & Guest-Facing Notes</label>
          <textarea
            rows={2}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ingredient provenance, culinary prep notes..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
          />
        </div>

        {/* Col-span-12: Dish Presentation Image & Presets */}
        <div className="col-span-12 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>Dish Presentation Photo & Image URL</span>
            </label>
            <span className="text-2xs text-slate-400">Displayed in POS terminal</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-2 h-20 rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
              {formData.imageUrl ? (
                <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xs">
                  No Photo
                </div>
              )}
            </div>

            <div className="md:col-span-10">
              <input
                type="text"
                placeholder="Enter image URL or select from presets below..."
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono bg-white"
              />

              <div className="flex flex-wrap gap-1.5 mt-2">
                {FOOD_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                    className={`px-2 py-1 text-2xs rounded border transition-colors cursor-pointer ${formData.imageUrl === p.url ? 'bg-emerald-700 text-white border-emerald-700 font-bold' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {p.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Col-span-12: Real-time BOM Section Header */}
        <div className="col-span-12 pt-3 border-t border-slate-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Bill of Materials (BOM Ingredients)</h4>
            <p className="text-xs text-slate-500">Add raw store items. Cost will be computed dynamically from store purchase rates.</p>
          </div>
          <button
            type="button"
            onClick={handleAddRecipeIngredient}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Ingredient Line</span>
          </button>
        </div>

        {/* Col-span-12: Recipe Line Items Table */}
        <div className="col-span-12 border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="p-2.5">Raw Stock Item</th>
                <th className="p-2.5">Portion Quantity</th>
                <th className="p-2.5">Unit</th>
                <th className="p-2.5">Purchase Unit Cost</th>
                <th className="p-2.5 text-right">Extended Cost</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
              {recipeLines.map((line, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-sans">
                    <select
                      value={line.stockItemId}
                      onChange={(e) => {
                        const inv = inventory.find(i => i.id === e.target.value);
                        if (!inv) return;
                        setRecipeLines(prev => prev.map((l, i) => i === idx ? {
                          ...l,
                          stockItemId: inv.id,
                          name: inv.name,
                          unit: inv.unit,
                          unitCost: inv.costPerUnit
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
                      step="0.01"
                      value={line.quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setRecipeLines(prev => prev.map((l, i) => i === idx ? { ...l, quantity: val } : l));
                      }}
                      className="w-20 px-2 py-1 text-xs rounded border border-slate-200 font-bold"
                    />
                  </td>
                  <td className="p-2.5 text-slate-500">{line.unit}</td>
                  <td className="p-2.5">TZS {line.unitCost.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    TZS {Math.round(line.quantity * line.unitCost).toLocaleString()}
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipeIngredient(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Col-span-12: Live Profitability KPI strip */}
        <div className="col-span-12 p-4 rounded-xl bg-slate-900 text-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xs text-slate-400 uppercase font-mono">Calculated Total BOM Cost</div>
            <div className="text-lg font-bold font-mono text-white mt-0.5 tabular-nums">
              TZS {calculatedBOMCost.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-2xs text-slate-400 uppercase font-mono">Food Cost % (Target &le; 32%)</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-0.5 tabular-nums">
              {foodCostPercentage}%
            </div>
          </div>
          <div>
            <div className="text-2xs text-slate-400 uppercase font-mono">Gross Margin %</div>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {grossMarginPercentage}%
            </div>
          </div>
        </div>
      </FullWidthFormModal>
    </div>
  );
};
