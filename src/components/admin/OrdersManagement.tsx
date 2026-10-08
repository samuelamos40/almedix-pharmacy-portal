import React, { useState } from 'react';
import { Package, Search, Filter, CheckCircle2, Clock, Truck, ShieldCheck, Eye, Download, FileText, X } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Order, OrderStatus } from '../../types/pharmacy';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { generateOrdersCsv, generateOrderLineItemsCsv, triggerDownload } from '../../utils/dataExports';

export const OrdersManagement: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const { orders, updateOrderStatus, quotePrescriptionOrder } = usePharmacy();
  const isFinanceTeam = userRole === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [quotingOrder, setQuotingOrder] = useState<Order | null>(null);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteTotal, setQuoteTotal] = useState('');

  console.log("Orders in OrdersManagement:", orders);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const m1 = (o.customerName || '').toLowerCase().includes(q);
      const m2 = (o.orderNumber || '').toLowerCase().includes(q);
      const m3 = (o.customerPhone || '').toLowerCase().includes(q);
      if (!m1 && !m2 && !m3) return false;
    }
    return true;
  });

  const handleExportOrders = () => {
    const csv = generateOrdersCsv(orders);
    triggerDownload(csv, `almedix_sales_orders_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportLineItems = () => {
    const csv = generateOrderLineItemsCsv(orders);
    triggerDownload(csv, `almedix_order_line_items_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleSendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotingOrder) return;
    
    const amt = parseFloat(quoteTotal);
    if (isNaN(amt) || amt < 0) return alert("Invalid total amount");

    // Replace the dummy rx item with a Quoted Rx item
    const quotedItems = [
      {
        drugId: `rx-quoted-${Date.now()}`,
        drugName: `Quoted Prescription Fulfillment`,
        dosageForm: 'Prescription Package',
        strength: 'As prescribed',
        unitPrice: amt,
        quantity: 1,
        lineTotal: amt,
        requiresPrescription: true,
      }
    ];

    try {
      await quotePrescriptionOrder(
        quotingOrder.id,
        quotedItems,
        amt,
        0, // Delivery fee handled differently if needed, 0 for now
        amt,
        `Pharmacist Quotation:\n${quoteNotes}`
      );
      setQuotingOrder(null);
      setQuoteNotes('');
      setQuoteTotal('');
    } catch (err) {
      console.error(err);
      alert("Failed to send quote.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Orders & Dispensing Desk</h2>
          <p className="text-xs text-slate-500">
            Fulfill prescriptions, verify doctor slips, and dispatch temperature-controlled orders.
          </p>
        </div>

        {isFinanceTeam && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportOrders}
              className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export Orders CSV</span>
            </button>

            <button
              onClick={handleExportLineItems}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-700" />
              <span>Export Line Items (Basket Analysis)</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order number, patient name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'Pending', 'Awaiting Payment', 'Dispensed', 'Out for Delivery', 'Delivered'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === status
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-3">Patient Customer</th>
                <th className="py-3 px-3">Destination</th>
                <th className="py-3 px-3 text-right">Items & Total</th>
                <th className="py-3 px-3 text-center">Prescription Slip</th>
                <th className="py-3 px-3 text-center">Fulfillment Status</th>
                <th className="py-3 px-4 text-center">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-950 block">{order.orderNumber}</span>
                      <span className="text-[10px] font-mono text-slate-400">{order.orderDate}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{order.customerName}</span>
                      <a href={`tel:${order.customerPhone}`} className="text-[11px] font-mono text-blue-600 hover:underline block">{order.customerPhone}</a>
                      {order.customerEmail && (
                        <a href={`mailto:${order.customerEmail}`} className="text-[10px] text-slate-500 hover:text-blue-700 hover:underline truncate max-w-[120px] block">
                          {order.customerEmail}
                        </a>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-800 line-clamp-1">{order.deliveryAddress}</span>
                      <span className="text-[10px] text-blue-700 font-semibold">{order.deliveryCity}</span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-mono font-bold text-sm text-slate-900 block">
                        {isFinanceTeam ? formatCurrency(order.totalAmount) : `${order.items.length} items`}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {order.paymentMethod} • <span className={order.paymentStatus === 'Paid' ? 'text-emerald-600 font-bold' : ''}>{order.paymentStatus}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {order.prescriptionUploaded ? (
                        <div className="flex flex-col items-center gap-1.5">
                          {order.notes?.includes('Image URL: ') ? (
                            <a 
                              href={order.notes.split('Image URL: ')[1].split('\n')[0].trim()}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded cursor-pointer transition-colors"
                              title="Click to view Prescription Image"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Slip</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              <FileText className="w-3.5 h-3.5" />
                              <span>Verified Rx</span>
                            </span>
                          )}
                          <button
                            onClick={() => setQuotingOrder(order)}
                            className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded cursor-pointer transition-colors"
                          >
                            Send Quote
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">OTC / Not req</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'Awaiting Payment'
                          ? 'bg-indigo-100 text-indigo-800'
                          : order.orderStatus === 'Out for Delivery'
                          ? 'bg-blue-100 text-blue-800'
                          : order.orderStatus === 'Dispensed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Awaiting Payment">Awaiting Payment</option>
                        <option value="Dispensed">Dispensed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {quotingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Quote Prescription</h3>
                <p className="text-xs text-blue-200">Order #{quotingOrder.orderNumber}</p>
              </div>
              <button onClick={() => setQuotingOrder(null)} className="text-blue-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendQuote} className="p-5 space-y-4">
              {quotingOrder.notes && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Patient Request/Notes:</span>
                    <span className="whitespace-pre-line">
                      {quotingOrder.notes.split('Image URL: ')[0]}
                      {quotingOrder.notes.includes('Notes:') && quotingOrder.notes.split('Notes:')[1]}
                    </span>
                  </div>
                  
                  {quotingOrder.notes.includes('Image URL: ') && (
                    <div className="pt-2 border-t border-slate-200">
                      <a 
                        href={quotingOrder.notes.split('Image URL: ')[1].split('\n')[0].trim()}
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Uploaded Prescription Slip</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability & Dosage Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. All items available. Dispensing Augmentin 625mg instead of 1g as requested. Take 1 tablet twice daily."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total Quoted Price (₦)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={quoteTotal}
                  onChange={(e) => setQuoteTotal(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuotingOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer flex items-center gap-2"
                >
                  Update Order & Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
