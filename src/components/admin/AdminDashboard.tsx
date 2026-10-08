import React from 'react';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  CheckCircle2, 
  Calendar,
  Layers,
  Database,
  Building,
  MapPin
} from 'lucide-react';
import { ASSETS } from '../../assets/images';
import { usePharmacy } from '../../context/PharmacyContext';
import { UserRole } from '../../context/AuthContext';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/formatters';
export type AdminView = 'admin-inventory' | 'admin-suppliers' | 'admin-orders' | 'admin-consultations';

interface AdminDashboardProps {
  userRole?: string;
  onNavigate: (view: AdminView) => void;
  onOpenNewDrugModal: () => void;
  onOpenNewInvoiceModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  userRole,
  onNavigate,
  onOpenNewDrugModal,
  onOpenNewInvoiceModal,
}) => {
  const { drugs, suppliers, invoices, orders, consultations } = usePharmacy();
  const isFinanceTeam = userRole === 'admin';

  // Metrics computation
  const totalCostValuation = drugs.reduce((acc, d) => acc + d.stockLevel * d.costPrice, 0);
  const totalRetailValuation = drugs.reduce((acc, d) => acc + d.stockLevel * d.sellingPrice, 0);
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  
  // Total Supplier Debt Owed
  const totalAccountsPayable = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');
  const dueSoonInvoices = invoices.filter(i => i.status === 'DUE_SOON');
  const lowStockDrugs = drugs.filter(d => d.stockLevel <= d.minStockLevel);
  const scheduledConsultations = consultations.filter(c => c.status === 'Scheduled');

  return (
    <div className="space-y-8">
      {/* Top Banner Alert if there is overdue debt or critical stock */}
      {(overdueInvoices.length > 0 || lowStockDrugs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueInvoices.length > 0 && isFinanceTeam && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-rose-900 text-sm">
                    {overdueInvoices.length} Supplier Bill{overdueInvoices.length > 1 ? 's' : ''} Overdue For Payment!
                  </p>
                  <p className="text-rose-700 mt-0.5">
                    Total overdue: <span className="font-mono font-bold">{formatCurrency(overdueInvoices.reduce((a, b) => a + b.balanceDue, 0))}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('admin-suppliers')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                Review Debt Ledger
              </button>
            </div>
          )}

          {lowStockDrugs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 text-sm">
                    {lowStockDrugs.length} Medication{lowStockDrugs.length > 1 ? 's' : ''} Below Reorder Point
                  </p>
                  <p className="text-amber-700 mt-0.5">
                    Prevent stockouts: Augmentin, Accu-Chek Kit, etc.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('admin-inventory')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0"
              >
                Restock Items
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Supplier Debt Owed (Only Finance) */}
        {isFinanceTeam && (
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs space-y-2">
            <div className="flex justify-between items-start text-xs">
              <span className="text-slate-500 font-medium">Supplier Debt (Owed)</span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
                {formatCurrency(totalAccountsPayable)}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
              <span>{invoices.filter(i => i.balanceDue > 0).length} Unpaid bills</span>
              <span className="text-rose-600 font-semibold">{overdueInvoices.length} Overdue</span>
            </div>
          </div>
        )}

        {/* KPI 2: Inventory Value / Count */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs space-y-2">
          <div className="flex justify-between items-start text-xs">
            <span className="text-slate-500 font-medium">{isFinanceTeam ? 'Inventory Stock Valuation' : 'Inventory Catalog'}</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {isFinanceTeam ? formatCurrency(totalCostValuation) : drugs.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            {isFinanceTeam ? (
              <>
                <span>Cost Valuation</span>
                <span className="text-emerald-700 font-mono font-medium">Retail: {formatCurrency(totalRetailValuation)}</span>
              </>
            ) : (
              <>
                <span>Unique Medicines</span>
                <span className="text-amber-600 font-medium">{lowStockDrugs.length} Low Stock</span>
              </>
            )}
          </div>
        </div>

        {/* KPI 3: Sales Orders Revenue / Count */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs space-y-2">
          <div className="flex justify-between items-start text-xs">
            <span className="text-slate-500 font-medium">{isFinanceTeam ? 'Completed Dispensed Sales' : 'Total Patient Orders'}</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-blue-950 font-mono tabular-nums">
              {isFinanceTeam ? formatCurrency(totalRevenue) : orders.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{isFinanceTeam ? `${orders.length} Total orders` : `${orders.filter(o => o.orderStatus === 'Delivered').length} Delivered`}</span>
            <span className="text-blue-700 font-medium">100% Fulfilled</span>
          </div>
        </div>

        {/* KPI 4: Telehealth Consultations */}
        <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs space-y-2">
          <div className="flex justify-between items-start text-xs">
            <span className="text-slate-500 font-medium">Active Consultations</span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {consultations.length}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>{scheduledConsultations.length} Scheduled</span>
            <span className="text-emerald-700 font-medium">{consultations.length - scheduledConsultations.length} Completed</span>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Operational Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {(userRole === 'admin' || userRole === 'pharmacist') && (
            <button
              onClick={onOpenNewDrugModal}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 text-blue-700" />
              <span>+ Add New Drug SKU</span>
            </button>
          )}

          {isFinanceTeam && (
            <button
              onClick={onOpenNewInvoiceModal}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Building className="w-4 h-4 text-blue-700" />
              <span>+ Record Supplier Bill</span>
            </button>
          )}

          {isFinanceTeam && (
            <button
              onClick={() => onNavigate('admin-suppliers')}
              className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-200 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-blue-700" />
              <span>Pay Supplier Balance</span>
            </button>
          )}


        </div>
      </div>

      {/* Two Columns: Recent Supplier Due Dates & Recent Customer Orders */}
      <div className={`grid grid-cols-1 ${isFinanceTeam ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6`}>
        {/* Left Column: Supplier Invoices & Due Dates */}
        {isFinanceTeam && (
          <div className="lg:col-span-7 bg-white rounded-xl border border-blue-100 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Supplier Payables & Upcoming Due Dates</h3>
              <p className="text-xs text-slate-500">Track pharmaceutical creditors and settlement deadlines</p>
            </div>
            <button
              onClick={() => onNavigate('admin-suppliers')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
            >
              View Full Ledger →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Supplier</th>
                  <th className="py-2.5 px-3">Invoice No</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {invoices.slice(0, 5).map(inv => {
                  const { days, isOverdue } = getDaysRemaining(inv.dueDate);
                  return (
                    <tr key={inv.id} className="hover:bg-blue-50/30">
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.supplierName}</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-slate-700">{inv.dueDate}</span>
                        <span className={`block text-[10px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                          {isOverdue ? `${days}d overdue` : `${days}d left`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inv.balanceDue)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : inv.status === 'DUE_SOON'
                            ? 'bg-amber-100 text-amber-800'
                            : inv.status === 'PARTIAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Right Column: Recent Patient Orders */}
        <div className={`${isFinanceTeam ? 'lg:col-span-5' : 'lg:col-span-1'} bg-white rounded-xl border border-blue-100 shadow-xs overflow-hidden`}>
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Recent Patient Orders</h3>
              <p className="text-xs text-slate-500">Live dispensary order queue</p>
            </div>
            <button
              onClick={() => onNavigate('admin-orders')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
            >
              All Orders →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map(o => (
              <div key={o.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{o.customerName}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{o.orderNumber}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {o.items.length} item{o.items.length > 1 ? 's' : ''} · {o.deliveryCity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-blue-950 block">
                    {isFinanceTeam ? formatCurrency(o.totalAmount) : o.paymentStatus}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {o.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Physical Dispensary Branch Status & Cold-Chain Monitoring */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-700" />
              <span>Physical Dispensary Branches & Environmental Sensors</span>
            </h3>
            <p className="text-[11px] text-slate-500">Live operational sync between Lekki Flagship, Ikeja Hub and Central Storage</p>
          </div>
          <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All 3 Dispensary Hubs Connected & Synchronized</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lekki */}
          <div className="rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-28 overflow-hidden bg-blue-100 relative">
                <img
                  src={ASSETS.clientStoreWide}
                  alt="Lekki Flagship Dispensary"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-blue-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Lekki Flagship
                </span>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="font-bold text-slate-900">Poly Junction, Bida</p>
                <p className="text-[11px] text-slate-500">Dispensary, Retail & Consultation</p>
              </div>
            </div>
            <div className="p-3 pt-0 flex justify-between items-center text-[11px] border-t border-slate-100 mt-2">
              <span className="text-emerald-600 font-semibold">● Active (Open)</span>
              <span className="font-mono text-slate-500">Temp: 21.2°C</span>
            </div>
          </div>

          {/* Ikeja */}
          <div className="rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-28 overflow-hidden bg-blue-100 relative">
                <img
                  src={ASSETS.clientDispensaryStock}
                  alt="Ikeja Central Dispensary Hub"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-blue-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Ikeja Central
                </span>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="font-bold text-slate-900">Inec Road, Niger State</p>
                <p className="text-[11px] text-slate-500">Clinical Compounding & Dispatch</p>
              </div>
            </div>
            <div className="p-3 pt-0 flex justify-between items-center text-[11px] border-t border-slate-100 mt-2">
              <span className="text-emerald-600 font-semibold">● Active (Open)</span>
              <span className="font-mono text-slate-500">Temp: 19.8°C</span>
            </div>
          </div>

          {/* Cold Chain Shelves */}
          <div className="rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between">
            <div>
              <div className="h-28 overflow-hidden bg-blue-100 relative">
                <img
                  src={ASSETS.clientPurpleShelves}
                  alt="Central GDP Storage Shelves"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 bg-blue-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  GDP Cold Vault
                </span>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="font-bold text-slate-900">Central Biologicals & Insulin Vault</p>
                <p className="text-[11px] text-slate-500">Solar Backup Inverter Monitored</p>
              </div>
            </div>
            <div className="p-3 pt-0 flex justify-between items-center text-[11px] border-t border-slate-100 mt-2">
              <span className="text-emerald-600 font-semibold">● Regulated 2°C–8°C</span>
              <span className="font-mono text-emerald-700 font-bold">Sensors OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
