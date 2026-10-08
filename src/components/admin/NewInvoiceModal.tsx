import React, { useState } from 'react';
import { X, Building, Plus, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { InvoiceItem } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface NewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInvoiceModal: React.FC<NewInvoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { suppliers, drugs, addSupplierInvoice } = usePharmacy();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Calculate due date default based on selected supplier's terms
  const currentSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (currentSupplier?.paymentTermsDays || 30));
    return d.toISOString().split('T')[0];
  });

  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      drugId: drugs[0]?.id || 'custom-1',
      drugName: drugs[0]?.name || 'Coartem 80/480mg Forte',
      sku: drugs[0]?.sku || 'DRG-COA-01',
      quantity: 50,
      unitCost: drugs[0]?.costPrice || 3500,
      lineTotal: 50 * (drugs[0]?.costPrice || 3500),
    }
  ]);

  if (!isOpen) return null;

  const handleSupplierChange = (supId: string) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find(s => s.id === supId);
    if (sup) {
      const pDate = new Date(purchaseDate);
      pDate.setDate(pDate.getDate() + sup.paymentTermsDays);
      setDueDate(pDate.toISOString().split('T')[0]);
    }
  };

  const handleAddItem = () => {
    const firstDrug = drugs[0];
    setItems(prev => [
      ...prev,
      {
        drugId: firstDrug?.id || `drug-${Date.now()}`,
        drugName: firstDrug?.name || 'Paracetamol 500mg',
        sku: firstDrug?.sku || 'DRG-PCM-04',
        quantity: 20,
        unitCost: firstDrug?.costPrice || 1000,
        lineTotal: 20 * (firstDrug?.costPrice || 1000),
      }
    ]);
  };

  const handleItemDrugSelect = (index: number, drugId: string) => {
    const d = drugs.find(item => item.id === drugId);
    if (!d) return;

    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          drugId: d.id,
          drugName: d.name,
          sku: d.sku,
          unitCost: d.costPrice,
          lineTotal: item.quantity * d.costPrice,
        };
      }
      return item;
    }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const qty = Math.max(1, quantity);
        return {
          ...item,
          quantity: qty,
          lineTotal: qty * item.unitCost,
        };
      }
      return item;
    }));
  };

  const handleUnitCostChange = (index: number, unitCost: number) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const cost = Math.max(0, unitCost);
        return {
          ...item,
          unitCost: cost,
          lineTotal: item.quantity * cost,
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const totalAmount = items.reduce((sum, i) => sum + i.lineTotal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || items.length === 0) return;

    addSupplierInvoice({
      invoiceNumber,
      supplierId: selectedSupplierId,
      supplierName: currentSupplier.name,
      purchaseDate,
      dueDate,
      totalAmount,
      items,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-sm">Record New Supplier Purchase Bill</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Supplier and Bill No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Wholesaler / Creditor *</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Net {s.paymentTermsDays} Days)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supplier Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase / Delivery Date *</label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-blue-900 mb-1 flex items-center justify-between">
                <span>Payment Due Date *</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  Based on {currentSupplier.paymentTermsDays} days credit
                </span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 bg-blue-50/40 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono font-bold text-blue-950"
              />
            </div>
          </div>

          {/* Line items being purchased */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold text-slate-700">
                Purchased Medications (Auto-updates Pharmacy Stock) *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold rounded text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Medicine Line</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <label className="block text-[10px] text-slate-500">Medicine</label>
                    <select
                      value={item.drugId}
                      onChange={(e) => handleItemDrugSelect(index, e.target.value)}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-medium"
                    >
                      {drugs.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.dosageForm})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500">Unit Cost (₦)</label>
                    <input
                      type="number"
                      min={0}
                      value={item.unitCost}
                      onChange={(e) => handleUnitCostChange(index, Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <label className="block text-[10px] text-slate-500">Line Total</label>
                    <span className="font-mono font-bold text-slate-900 block mt-1">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Invoice Notes / Batch References</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly batch delivery received in good condition. Stored in temperature-controlled room..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          {/* Total & Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Bill Amount (Added to Creditor Debt)</span>
              <span className="text-xl font-bold text-blue-950 font-mono">
                {formatCurrency(totalAmount)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                Save Bill & Restock Dispensary
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
