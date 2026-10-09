import React, { useState, useEffect } from 'react';
import { X, Search, Package, CheckCircle2, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Order, OrderStatus } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Received', desc: 'Prescription verified by dispensary' },
  { status: 'Dispensed', label: 'Medications Dispensed', desc: 'Quality checked & packed in cold chain pouch' },
  { status: 'Out for Delivery', label: 'Out for Delivery', desc: 'Assigned to licensed medical dispatch rider' },
  { status: 'Delivered', label: 'Delivered', desc: 'Signed and handed over to patient' }
];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
}) => {
  const { orders } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialOrderNumber) {
        setSearchTerm(initialOrderNumber);
        const found = orders.find(o => o.orderNumber.toLowerCase() === initialOrderNumber.toLowerCase());
        setSearchedOrder(found || null);
        setHasSearched(true);
      } else {
        setSearchTerm('');
        setSearchedOrder(null);
        setHasSearched(false);
      }
    }
  }, [isOpen, initialOrderNumber, orders]);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const term = searchTerm.trim().toLowerCase();
    const found = orders.find(o => 
      o.orderNumber.toLowerCase().includes(term) ||
      o.customerPhone.replace(/\s+/g, '').includes(term.replace(/\s+/g, '')) ||
      o.trackingNumber.toLowerCase().includes(term)
    );
    setSearchedOrder(found || null);
  };

  const getStepStatus = (stepIndex: number, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = ['Pending', 'Dispensed', 'Out for Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Truck className="w-4 h-4 text-blue-300" />
            <span>Prescription Dispatch & Live Order Tracker</span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. HEX-2026-1001) or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>

          {/* Result view */}
          {searchedOrder ? (
            <div className="space-y-6">
              {/* Order summary card */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Order #{searchedOrder.orderNumber}</span>
                    <p className="text-slate-500 font-mono text-[11px]">Placed on {searchedOrder.orderDate}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-700 text-white rounded-md font-bold text-[11px]">
                    {searchedOrder.orderStatus}
                  </span>
                </div>

                <div className="pt-2 border-t border-blue-100 grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient:</span>
                    <span className="font-semibold">{searchedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Destination:</span>
                    <span className="font-semibold">{searchedOrder.deliveryAddress}, {searchedOrder.deliveryCity}</span>
                  </div>
                </div>
              </div>

              {/* Progress Step Timeline */}
              <div className="space-y-4 px-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fulfillment Timeline</h4>
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                  {ORDER_STEPS.map((step, idx) => {
                    const state = getStepStatus(idx, searchedOrder.orderStatus);
                    const isDone = state === 'completed';

                    return (
                      <div key={step.status} className="relative">
                        <div
                          className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            isDone ? 'bg-blue-700 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <div className="text-xs">
                          <p className={`font-bold ${isDone ? 'text-blue-950' : 'text-slate-400'}`}>
                            {step.label}
                          </p>
                          <p className="text-[11px] text-slate-500">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Itemized preview */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-800 block mb-2">Package Contents:</span>
                <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {searchedOrder.items.map(i => (
                    <div key={i.drugId} className="flex justify-between">
                      <span>{i.quantity}x {i.drugName}</span>
                      <span className="font-mono">{formatCurrency(i.lineTotal)}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span className="font-mono text-blue-900">{formatCurrency(searchedOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-xl">
              <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No order found matching "{searchTerm}"</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Please double-check your order number (e.g. HEX-2026-1001) or contact our pharmacy helpline.
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-slate-100">
              <MapPin className="w-8 h-8 text-blue-200 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-sm">Track Your Prescription</p>
              <p className="max-w-xs mx-auto mt-2 text-slate-500">
                Enter your unique Order Number (e.g. ALM-369915) or Phone Number in the search bar above to see the live dispatch status of your medications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
