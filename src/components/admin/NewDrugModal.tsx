import React, { useState } from 'react';
import { X, Pill, ShieldCheck } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { DrugCategory, DosageForm } from '../../types/pharmacy';

interface NewDrugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewDrugModal: React.FC<NewDrugModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { suppliers, addDrug } = usePharmacy();

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [brand, setBrand] = useState('Emzor');
  const [category, setCategory] = useState<DrugCategory>('Prescription');
  const [dosageForm, setDosageForm] = useState<DosageForm>('Tablets');
  const [strength, setStrength] = useState('500mg');
  const [packSize, setPackSize] = useState('Box of 30 Tablets');
  const [costPrice, setCostPrice] = useState<number>(1500);
  const [sellingPrice, setSellingPrice] = useState<number>(2400);
  const [stockLevel, setStockLevel] = useState<number>(50);
  const [minStockLevel, setMinStockLevel] = useState<number>(20);
  const [batchNumber, setBatchNumber] = useState(`BT-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [requiresPrescription, setRequiresPrescription] = useState(true);
  const [nafdacRegNo, setNafdacRegNo] = useState(`04-${Math.floor(1000 + Math.random() * 9000)}`);
  const [description, setDescription] = useState('');
  const [usageInstructions, setUsageInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];
    const generatedSku = `DRG-${name.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    addDrug({
      sku: generatedSku,
      name,
      genericName: genericName || name,
      brand,
      category,
      dosageForm,
      strength,
      packSize,
      costPrice,
      sellingPrice,
      stockLevel,
      minStockLevel,
      maxStockLevel: stockLevel * 3,
      batchNumber,
      expiryDate,
      supplierId: supplier.id,
      supplierName: supplier.name,
      requiresPrescription,
      nafdacRegNo,
      description: description || 'High-grade pharmaceutical medication stored under certified conditions.',
      usageInstructions: usageInstructions || 'Take strictly according to physician or pharmacist instructions.',
      storageCondition: 'Store in a cool dry place below 30°C.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-300" />
            <h3 className="font-bold text-sm">Add New Medicine to Pharmacy Inventory</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Suppliers Found</h3>
            <p className="text-sm text-slate-600 mb-4 max-w-sm mx-auto">
              Every medication must be linked to a primary wholesaler for tracking and restocking. Please add at least one supplier in the Accounts & Suppliers tab before adding inventory.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm cursor-pointer"
            >
              Close and Go to Suppliers
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medication Name (Commercial Brand) *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxil 500mg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic Name / Active Substance *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin Trihydrate"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DrugCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="Prescription">Prescription</option>
                <option value="Chronic Care">Chronic Care</option>
                <option value="Over-the-Counter">Over-the-Counter</option>
                <option value="Mother & Child">Mother & Child</option>
                <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                <option value="Medical Devices">Medical Devices</option>
                <option value="First Aid & Wound Care">First Aid & Wound Care</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dosage Form *</label>
              <select
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value as DosageForm)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="Tablets">Tablets</option>
                <option value="Capsules">Capsules</option>
                <option value="Syrup">Syrup</option>
                <option value="Suspension">Suspension</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Injectable">Injectable</option>
                <option value="Drops">Drops</option>
                <option value="Medical Device">Medical Device</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Strength</label>
              <input
                type="text"
                placeholder="e.g. 500mg, 10ml"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Price (₦) *</label>
              <input
                type="number"
                required
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Selling Price (₦) *</label>
              <input
                type="number"
                required
                min={0}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono font-bold text-blue-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Stock Units *</label>
              <input
                type="number"
                required
                min={0}
                value={stockLevel}
                onChange={(e) => setStockLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Reorder Level *</label>
              <input
                type="number"
                required
                min={1}
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Wholesaler *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NAFDAC Reg Number</label>
              <input
                type="text"
                value={nafdacRegNo}
                onChange={(e) => setNafdacRegNo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pack Size Specification</label>
              <input
                type="text"
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g. 100 Tablets / 10 Blisters"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl flex items-center gap-2">
            <input
              type="checkbox"
              id="prescriptionReq"
              checked={requiresPrescription}
              onChange={(e) => setRequiresPrescription(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <label htmlFor="prescriptionReq" className="text-blue-900 font-semibold cursor-pointer">
              Requires Valid Doctor's Prescription (POM classification)
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Indications & Clinical Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indication, therapeutic class, primary symptoms treated..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
              Save Medicine to Inventory
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
