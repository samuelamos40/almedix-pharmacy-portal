import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Package, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Order, OrderStatus } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface TrackOrderPageProps {
  initialOrderNumber?: string;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'Pending', label: 'Order Confirmed', desc: 'Dispensary received prescription items' },
  { status: 'Dispensed', label: 'Packed & Cold-Chain Sealed', desc: 'Quality checked by clinical pharmacist' },
  { status: 'Out for Delivery', label: 'Dispatched With Rider', desc: 'In transit in temperature-controlled bag' },
  { status: 'Delivered', label: 'Delivered & Signed', desc: 'Safely handed over to patient' }
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderNumber = '',
}) => {
  const { orders } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState(initialOrderNumber);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    if (initialOrderNumber) {
      return orders.find(o => o.orderNumber.toLowerCase() === initialOrderNumber.toLowerCase()) || null;
    }
    return orders[0] || null;
  });
  const [hasSearched, setHasSearched] = useState(false);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold">
          <Truck className="w-4 h-4 text-blue-700" />
          <span>Real-Time Prescription Fulfillment</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Track Your Prescription Order & Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Enter your Order ID (e.g. <span className="font-mono text-blue-900 font-bold">HEX-2026-1001</span>) or phone number to track shipment progress.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            required
            placeholder="Enter Order ID or Phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 outline-none shadow-xs"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          Track Now
        </button>
      </form>

      {/* Result Card */}
      {searchedOrder ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg text-blue-950">
                  {searchedOrder.orderNumber}
                </span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                  {searchedOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Tracking Ref: {searchedOrder.trackingNumber} · Placed {searchedOrder.orderDate}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Order Value</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {formatCurrency(searchedOrder.totalAmount)}
              </span>
            </div>
          </div>

          {/* Fulfillment Milestones */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Fulfillment Journey
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {ORDER_STEPS.map((step, idx) => {
                const state = getStepStatus(idx, searchedOrder.orderStatus);
                const isDone = state === 'completed';

                return (
                  <div
                    key={step.status}
                    className={`p-4 rounded-xl border text-xs transition-colors ${
                      isDone
                        ? 'border-blue-300 bg-blue-50/60 text-blue-950'
                        : 'border-slate-200 bg-slate-50/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isDone ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <span className="font-bold">{step.label}</span>
                    </div>
                    <p className={`text-[11px] leading-tight ${isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery & Medications Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Delivery Destination:</span>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-700">
                <p className="font-semibold text-slate-900">{searchedOrder.customerName}</p>
                <p>{searchedOrder.deliveryAddress}, {searchedOrder.deliveryCity}</p>
                <p className="font-mono text-slate-500">{searchedOrder.customerPhone}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Medications In Package:</span>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-700 divide-y divide-slate-200">
                {searchedOrder.items.map(item => (
                  <div key={item.drugId} className="pt-1 first:pt-0 flex justify-between">
                    <span>{item.quantity}x {item.drugName}</span>
                    <span className="font-mono font-semibold">{formatCurrency(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : hasSearched ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-800 text-sm">No order found matching "{searchTerm}"</p>
          <p className="max-w-sm mx-auto">
            Please double-check your order number on your SMS or contact our 24/7 hotline (09066666814).
          </p>
        </div>
      ) : null}
    </div>
  );
};
