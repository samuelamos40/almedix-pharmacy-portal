import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Download, 
  CheckCircle2, 
  X, 
  ArrowUpDown,
  History
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { DrugItem, DrugCategory, DosageForm } from '../../types/pharmacy';
import { formatCurrency, calculateMargin } from '../../utils/formatters';
import { generateInventoryCsv, triggerDownload } from '../../utils/dataExports';

interface InventoryManagementProps {
  userRole?: string;
  onOpenNewDrugModal: () => void;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({
  userRole,
  onOpenNewDrugModal,
}) => {
  const { drugs, suppliers, adjustDrugStock, deleteDrug, updateDrug } = usePharmacy();
  const isFinanceTeam = userRole === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | DrugCategory>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');

  // Stock Adjust Modal State
  const [adjustingDrug, setAdjustingDrug] = useState<DrugItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState('New Shipment Stock In');

  // Edit Drug Modal State
  const [editingDrug, setEditingDrug] = useState<DrugItem | null>(null);

  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug => {
      if (categoryFilter !== 'All' && drug.category !== categoryFilter) return false;

      if (stockStatusFilter === 'low' && (drug.stockLevel > drug.minStockLevel || drug.stockLevel === 0)) return false;
      if (stockStatusFilter === 'out' && drug.stockLevel > 0) return false;
      if (stockStatusFilter === 'normal' && drug.stockLevel <= drug.minStockLevel) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const m1 = drug.name.toLowerCase().includes(q);
        const m2 = drug.genericName.toLowerCase().includes(q);
        const m3 = drug.sku.toLowerCase().includes(q);
        const m4 = drug.brand.toLowerCase().includes(q);
        const m5 = drug.supplierName.toLowerCase().includes(q);
        if (!m1 && !m2 && !m3 && !m4 && !m5) return false;
      }

      return true;
    });
  }, [drugs, categoryFilter, stockStatusFilter, searchTerm]);

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingDrug) return;
    adjustDrugStock(adjustingDrug.id, adjustDelta, adjustReason);
    setAdjustingDrug(null);
  };

  const handleUpdateDrugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrug) return;
    updateDrug(editingDrug.id, editingDrug);
    setEditingDrug(null);
  };

  const handleExportCsv = () => {
    const csv = generateInventoryCsv(drugs);
    triggerDownload(csv, `almedix_inventory_stock_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const totalCostValuation = drugs.reduce((acc, d) => acc + d.stockLevel * d.costPrice, 0);
  const totalRetailValuation = drugs.reduce((acc, d) => acc + d.stockLevel * d.sellingPrice, 0);
  const lowStockCount = drugs.filter(d => d.stockLevel <= d.minStockLevel && d.stockLevel > 0).length;
  const outOfStockCount = drugs.filter(d => d.stockLevel === 0).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dispensary Stock & Inventory Room</h2>
          <p className="text-xs text-slate-500">
            Real-time batch tracking, expiration monitoring, unit costs, and reorder levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Export Stock CSV</span>
          </button>

          {(userRole === 'admin' || userRole === 'pharmacist') && (
            <button
              onClick={onOpenNewDrugModal}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Medicine</span>
            </button>
          )}
        </div>
      </div>

      {/* Stock Summary Strip */}
      <div className={`grid grid-cols-2 ${isFinanceTeam ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-3 text-xs`}>
        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
          <span className="text-slate-500 block">Total SKUs Tracked</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-0.5">{drugs.length}</span>
        </div>
        {isFinanceTeam && (
          <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
            <span className="text-slate-500 block">Inventory Cost Value</span>
            <span className="text-xl font-bold text-blue-900 font-mono mt-0.5">
              {formatCurrency(totalCostValuation)}
            </span>
          </div>
        )}
        {isFinanceTeam && (
          <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
            <span className="text-slate-500 block">Potential Retail Value</span>
            <span className="text-xl font-bold text-emerald-800 font-mono mt-0.5">
              {formatCurrency(totalRetailValuation)}
            </span>
          </div>
        )}
        <div className="bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
          <span className="text-slate-500 block">Stock Alerts</span>
          <div className="flex items-center gap-2 mt-0.5 font-bold font-mono">
            <span className="text-amber-700">{lowStockCount} Low</span>
            <span className="text-slate-300">·</span>
            <span className="text-rose-700">{outOfStockCount} Out</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU, brand, active ingredient or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="All">All Categories</option>
            <option value="Prescription">Prescription</option>
            <option value="Chronic Care">Chronic Care</option>
            <option value="Over-the-Counter">Over-the-Counter</option>
            <option value="Mother & Child">Mother & Child</option>
            <option value="Vitamins & Supplements">Vitamins & Supplements</option>
            <option value="Medical Devices">Medical Devices</option>
            <option value="First Aid & Wound Care">First Aid & Wound Care</option>
          </select>

          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 bg-white outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock (≤ Reorder)</option>
            <option value="out">Out of Stock (0 Units)</option>
            <option value="normal">Normal Stock</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Medicine Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">In Stock / Min</th>
                {isFinanceTeam && <th className="py-3 px-3 text-right">Cost Price</th>}
                <th className="py-3 px-3 text-right">Selling Price</th>
                {isFinanceTeam && <th className="py-3 px-3 text-right">Margin %</th>}
                <th className="py-3 px-3">Batch & Expiry</th>
                <th className="py-3 px-3">Supplier</th>
                {(userRole === 'admin' || userRole === 'pharmacist') && (
                  <th className="py-3 px-4 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDrugs.length === 0 ? (
                <tr>
                  <td colSpan={isFinanceTeam ? 9 : 7} className="py-12 text-center text-slate-400">
                    No medications match your filter.
                  </td>
                </tr>
              ) : (
                filteredDrugs.map(drug => {
                  const isOut = drug.stockLevel === 0;
                  const isLow = drug.stockLevel > 0 && drug.stockLevel <= drug.minStockLevel;
                  const margin = calculateMargin(drug.costPrice, drug.sellingPrice);

                  return (
                    <tr key={drug.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{drug.name}</span>
                          {drug.requiresPrescription && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1 py-0.2 rounded">
                              Rx
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{drug.genericName}</p>
                        <p className="text-[10px] font-mono text-slate-400">SKU: {drug.sku}</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-800">{drug.category}</span>
                        <span className="block text-[10px] text-slate-400">{drug.dosageForm}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`font-bold text-sm ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-900'
                          }`}>
                            {drug.stockLevel}
                          </span>
                          <span className="text-slate-400 text-xs">/ {drug.minStockLevel}</span>
                        </div>
                        <span className={`text-[10px] font-semibold block ${
                          isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {isOut ? 'Out of Stock' : isLow ? 'Reorder Needed' : 'Adequate'}
                        </span>
                      </td>

                      {isFinanceTeam && (
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          {formatCurrency(drug.costPrice)}
                        </td>
                      )}

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(drug.sellingPrice)}
                      </td>

                      {isFinanceTeam && (
                        <td className="py-3 px-3 text-right font-mono font-semibold text-blue-900">
                          {margin}%
                        </td>
                      )}

                      <td className="py-3 px-3 text-[11px]">
                        <span className="font-mono text-slate-600 block">{drug.batchNumber}</span>
                        <span className="font-mono text-slate-400 block">{drug.expiryDate}</span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-700 font-medium">
                        {drug.supplierName}
                      </td>

                      {(userRole === 'admin' || userRole === 'pharmacist') && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setAdjustingDrug(drug)}
                              title="Adjust Stock Quantity (+/-)"
                              className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingDrug(drug)}
                              title="Edit Medicine Details"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${drug.name}?`)) {
                                  deleteDrug(drug.id);
                                }
                              }}
                              title="Delete Item"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Quick Stock Adjustment */}
      {adjustingDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Dispensary Stock Adjustment</h3>
                <p className="text-xs text-blue-200">{adjustingDrug.name}</p>
              </div>
              <button onClick={() => setAdjustingDrug(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyAdjustment} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <span className="text-slate-600">Current Stock On Shelf:</span>
                <span className="font-mono font-bold text-base text-blue-950">{adjustingDrug.stockLevel} Units</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Stock Change (+ for restock, - for damage/waste) *
                </label>
                <input
                  type="number"
                  required
                  value={adjustDelta}
                  onChange={(e) => setAdjustDelta(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Resulting Stock will be:{' '}
                  <strong className="font-mono text-slate-900">
                    {Math.max(0, adjustingDrug.stockLevel + adjustDelta)} units
                  </strong>
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment *</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="New Shipment Stock In">New Shipment Stock In</option>
                  <option value="Physical Count Reconciliation">Physical Count Reconciliation</option>
                  <option value="Damaged / Expired Disposal">Damaged / Expired Disposal</option>
                  <option value="Customer Return to Stock">Customer Return to Stock</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustingDrug(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Drug Details */}
      {editingDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-blue-100 overflow-hidden my-8">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Edit Medicine Details</h3>
              <button onClick={() => setEditingDrug(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDrugSubmit} className="p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medicine Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editingDrug.name}
                  onChange={(e) => setEditingDrug({ ...editingDrug, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editingDrug.costPrice}
                    onChange={(e) => setEditingDrug({ ...editingDrug, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Selling Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editingDrug.sellingPrice}
                    onChange={(e) => setEditingDrug({ ...editingDrug, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Reorder Level *</label>
                  <input
                    type="number"
                    required
                    value={editingDrug.minStockLevel}
                    onChange={(e) => setEditingDrug({ ...editingDrug, minStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={editingDrug.batchNumber}
                    onChange={(e) => setEditingDrug({ ...editingDrug, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDrug(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
