import React from 'react';
import { X, CheckCircle2, PackageCheck, Printer, MapPin, Phone, Truck } from 'lucide-react';
import { Order } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <PackageCheck className="w-4 h-4 text-emerald-400" />
            <span>Order Confirmed & Queued for Dispensing</span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-blue-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Thank You For Your Order!</h3>
            <p className="text-xs text-slate-500">
              Order ID: <span className="font-mono font-bold text-blue-900">{order.orderNumber}</span>
            </p>
            <p className="text-[11px] text-slate-400 font-mono">Tracking: {order.trackingNumber}</p>
          </div>

          {/* Delivery & Status Card */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">{order.customerName}</span>
                <p className="text-slate-600">{order.deliveryAddress}, {order.deliveryCity}</p>
                <p className="text-slate-500 font-mono mt-0.5">{order.customerPhone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-100">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-semibold text-blue-950 font-mono">{order.paymentStatus} ({order.paymentMethod})</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Estimated Delivery:</span>
              <span className="font-bold text-emerald-700">Today, within 90 minutes (Cold Chain)</span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">Ordered Medications</h4>
            <div className="divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {order.items.map(item => (
                <div key={item.drugId} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-900">{item.drugName}</p>
                    <p className="text-[11px] text-slate-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
              <span>Total Paid:</span>
              <span className="font-mono text-blue-950">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onTrackOrder(order.orderNumber);
              }}
              className="w-full sm:flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery Status</span>
            </button>
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
