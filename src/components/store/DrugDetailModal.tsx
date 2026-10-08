import React, { useState } from 'react';
import { X, Pill, ShieldCheck, AlertTriangle, Check, ShoppingBag, Plus, Minus, Info } from 'lucide-react';
import { DrugItem } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';
import { usePharmacy } from '../../context/PharmacyContext';

interface DrugDetailModalProps {
  drug: DrugItem | null;
  onClose: () => void;
  onOpenConsultation: () => void;
}

export const DrugDetailModal: React.FC<DrugDetailModalProps> = ({
  drug,
  onClose,
  onOpenConsultation,
}) => {
  const { addToCart, cart } = usePharmacy();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!drug) return null;

  const inCart = cart.find(c => c.drug.id === drug.id);
  const isOutOfStock = drug.stockLevel <= 0;

  const handleAdd = () => {
    addToCart(drug, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Pill className="w-4 h-4 text-blue-300" />
            <span>Medication Monograph</span>
            <span aria-hidden="true">·</span>
            <span>NAFDAC: {drug.nafdacRegNo}</span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Top Title & Price Block */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                {drug.brand} · {drug.category}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {drug.name}
              </h2>
              <p className="text-sm text-slate-500 italic mt-0.5">
                Active Ingredient: {drug.genericName}
              </p>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs text-slate-500 block">Retail Price</span>
              <span className="text-2xl font-bold text-blue-950 font-mono tabular-nums">
                {formatCurrency(drug.sellingPrice)}
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">{drug.packSize}</span>
            </div>
          </div>

          {/* Prescription Warning if applicable */}
          {drug.requiresPrescription && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
              <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Prescription-Only Medicine (POM)</p>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  In compliance with Pharmacists Council of Nigeria (PCN) guidelines, this medication requires a valid doctor's prescription. You can upload an existing prescription at checkout or book a telepharmacy consultation below.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenConsultation();
                  }}
                  className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer"
                >
                  Need a prescription? Consult our clinical doctors →
                </button>
              </div>
            </div>
          )}

          {/* Clinical Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Dosage Form</span>
              <span className="font-semibold text-slate-900">{drug.dosageForm}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Strength</span>
              <span className="font-semibold text-slate-900">{drug.strength}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Batch Number</span>
              <span className="font-mono text-slate-900">{drug.batchNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Expiry Date</span>
              <span className="font-mono text-slate-900">{drug.expiryDate}</span>
            </div>
          </div>

          {/* Description & Clinical Information */}
          <div className="space-y-4 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Clinical Indications & Description</h4>
              <p className="text-slate-600 leading-relaxed">{drug.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Dosage & Usage Instructions</h4>
              <p className="text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                {drug.usageInstructions}
              </p>
            </div>

            {drug.sideEffects && (
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Possible Side Effects & Cautions</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">{drug.sideEffects}</p>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Storage & Handling</h4>
              <p className="text-slate-600">{drug.storageCondition}</p>
            </div>
          </div>
        </div>

        {/* Footer Purchase Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Quantity:</span>
            <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 text-xs font-bold font-mono tabular-nums text-slate-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(drug.stockLevel, q + 1))}
                disabled={quantity >= drug.stockLevel}
                className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              ({drug.stockLevel} units available in dispensary)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white shadow-sm'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added To Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Bag · {formatCurrency(drug.sellingPrice * quantity)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
