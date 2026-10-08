import React, { useState, useMemo } from 'react';
import { 
  Building, 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  Download, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { Supplier, SupplierInvoice, InvoicePaymentStatus, PaymentRecord } from '../../types/pharmacy';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/formatters';
import { generateSupplierPayablesCsv, triggerDownload } from '../../utils/dataExports';

interface SupplierPayablesProps {
  onOpenNewInvoiceModal: () => void;
}

export const SupplierPayables: React.FC<SupplierPayablesProps> = ({
  onOpenNewInvoiceModal,
}) => {
  const { suppliers, invoices, recordInvoicePayment, addSupplier } = usePharmacy();
  const [activeTab, setActiveTab] = useState<'invoices' | 'suppliers'>('invoices');
  const [statusFilter, setStatusFilter] = useState<'all' | 'OVERDUE' | 'DUE_SOON' | 'PARTIAL' | 'PAID'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Recording Modal State
  const [payingInvoice, setPayingInvoice] = useState<SupplierInvoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Bank Transfer' | 'Cheque' | 'Cash'>('Bank Transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // New Supplier Modal State
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupCode, setNewSupCode] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupTerms, setNewSupTerms] = useState<number>(30);
  const [newSupBank, setNewSupBank] = useState('Zenith Bank');
  const [newSupAccount, setNewSupAccount] = useState('');

  // Invoice History Drawer State
  const [inspectingInvoice, setInspectingInvoice] = useState<SupplierInvoice | null>(null);

  // Financial aggregates
  const totalDebtOwed = invoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE');
  const totalOverdueAmount = overdueInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const dueSoonInvoices = invoices.filter(i => i.status === 'DUE_SOON');
  const totalDueSoonAmount = dueSoonInvoices.reduce((acc, i) => acc + i.balanceDue, 0);
  const totalPaidToDate = invoices.reduce((acc, i) => acc + i.amountPaid, 0);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const m1 = inv.supplierName.toLowerCase().includes(q);
        const m2 = inv.invoiceNumber.toLowerCase().includes(q);
        if (!m1 && !m2) return false;
      }
      return true;
    }).sort((a, b) => {
      // Prioritize overdue, then upcoming due dates
      if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
      if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [invoices, statusFilter, searchTerm]);

  // Open Pay Modal
  const handleOpenPay = (inv: SupplierInvoice) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    setPaymentRef(`TRF-${Math.floor(10000 + Math.random() * 90000)}`);
    setPaymentNotes(`Payment for ${inv.invoiceNumber}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || paymentAmount <= 0) return;

    recordInvoicePayment(payingInvoice.id, {
      date: new Date().toISOString().split('T')[0],
      amount: paymentAmount,
      paymentMethod,
      reference: paymentRef,
      notes: paymentNotes,
    });

    setPayingInvoice(null);
  };

  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    addSupplier({
      code: newSupCode || `SUP-${newSupName.slice(0, 4).toUpperCase()}`,
      name: newSupName,
      contactPerson: newSupContact,
      phone: newSupPhone,
      email: newSupEmail,
      address: newSupAddress,
      city: 'Lagos',
      paymentTermsDays: newSupTerms,
      bankName: newSupBank,
      accountNumber: newSupAccount,
      accountName: `${newSupName} Operations`,
    });

    setIsAddingSupplier(false);
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
    setNewSupEmail('');
    setNewSupAddress('');
    setNewSupAccount('');
  };

  const handleExportCsv = () => {
    const csv = generateSupplierPayablesCsv(invoices, suppliers);
    triggerDownload(csv, `almedix_supplier_debt_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Supplier Debt & Accounts Payable Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Keep track of who the pharmacy buys medications from, how much is owed, and when payments are due.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-700" />
            <span>Export Debt CSV</span>
          </button>

          <button
            onClick={() => setIsAddingSupplier(true)}
            className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Building className="w-3.5 h-3.5 text-blue-700" />
            <span>+ Add Supplier</span>
          </button>

          <button
            onClick={onOpenNewInvoiceModal}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Purchase Bill</span>
          </button>
        </div>
      </div>

      {/* Financial Health KPIs for Accounts Payable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Debt Currently Owed</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-rose-700 font-mono tabular-nums">
            {formatCurrency(totalDebtOwed)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Across {suppliers.filter(s => s.outstandingBalance > 0).length} Creditor Wholesalers
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-600 mb-1">
            <span className="font-semibold">Overdue For Payment</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold text-rose-800 font-mono tabular-nums">
            {formatCurrency(totalOverdueAmount)}
          </span>
          <span className="text-[11px] text-rose-600 font-medium block mt-1">
            {overdueInvoices.length} Bills past maturity date!
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
            <span className="font-semibold">Due in Next 7 Days</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-amber-800 font-mono tabular-nums">
            {formatCurrency(totalDueSoonAmount)}
          </span>
          <span className="text-[11px] text-amber-700 block mt-1">
            {dueSoonInvoices.length} Bills due this week
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Paid To Suppliers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalPaidToDate)}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-1">Settled invoices & deposits</span>
        </div>
      </div>

      {/* Tabs Switcher: Invoices & Due Dates VS Registered Suppliers Directory */}
      <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'invoices'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          Purchase Bills & Due Dates ({invoices.length})
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'suppliers'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-blue-50'
          }`}
        >
          Suppliers Directory & Balances ({suppliers.length})
        </button>
      </div>

      {activeTab === 'invoices' ? (
        /* View 1: Invoices & Due Dates */
        <div className="space-y-4">
          {/* Sub Filters */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice number or supplier name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'OVERDUE', 'DUE_SOON', 'PARTIAL', 'PAID'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {status === 'all' && 'All Statuses'}
                  {status === 'OVERDUE' && `Overdue (${overdueInvoices.length})`}
                  {status === 'DUE_SOON' && `Due Soon (${dueSoonInvoices.length})`}
                  {status === 'PARTIAL' && 'Partially Paid'}
                  {status === 'PAID' && 'Paid in Full'}
                </button>
              ))}
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-blue-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Supplier & Bill No</th>
                    <th className="py-3 px-3">Purchase Date</th>
                    <th className="py-3 px-3">Payment Due Date</th>
                    <th className="py-3 px-3 text-right">Total Bill</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-right">Balance Due (Owed)</th>
                    <th className="py-3 px-3 text-center">Payment Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No purchase bills found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => {
                      const { days, isOverdue } = getDaysRemaining(inv.dueDate);
                      const isSettled = inv.balanceDue <= 0;

                      return (
                        <tr key={inv.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{inv.supplierName}</span>
                            <span className="font-mono text-[11px] text-slate-400">{inv.invoiceNumber}</span>
                          </td>

                          <td className="py-3 px-3 font-mono text-slate-600">
                            {inv.purchaseDate}
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-slate-900 block">{inv.dueDate}</span>
                            {isSettled ? (
                              <span className="text-[10px] text-emerald-600 font-semibold">Settled</span>
                            ) : isOverdue ? (
                              <span className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{days} days overdue</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Due in {days} days</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            {formatCurrency(inv.totalAmount)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-emerald-700">
                            {formatCurrency(inv.amountPaid)}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                            <span className={inv.balanceDue > 0 ? (isOverdue ? 'text-rose-700 font-bold' : 'text-slate-900') : 'text-slate-400'}>
                              {formatCurrency(inv.balanceDue)}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
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

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {inv.balanceDue > 0 ? (
                                <button
                                  onClick={() => handleOpenPay(inv)}
                                  className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-[11px] font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  <span>Pay Bill</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Paid</span>
                                </span>
                              )}

                              <button
                                onClick={() => setInspectingInvoice(inv)}
                                title="View Bill Line Items & Payment History"
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Suppliers Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(sup => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-xl border border-blue-100 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{sup.name}</span>
                    <p className="text-[11px] text-blue-700 font-mono mt-0.5">{sup.code}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                    Net {sup.paymentTermsDays} Days
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{sup.address}, {sup.city}</span>
                  </div>
                </div>

                {/* Bank settlement account */}
                <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-[11px] border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Settlement Account</span>
                  <p className="font-bold text-slate-800">{sup.bankName} · {sup.accountNumber}</p>
                  <p className="text-slate-500 text-[10px] truncate">{sup.accountName}</p>
                </div>
              </div>

              {/* Debt & Purchase Summary */}
              <div className="pt-3 border-t border-slate-100 flex justify-between items-end text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Purchased</span>
                  <span className="font-mono text-slate-700">{formatCurrency(sup.totalPurchased)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">Outstanding Debt Owed</span>
                  <span className={`font-mono font-bold text-sm ${sup.outstandingBalance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {formatCurrency(sup.outstandingBalance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Record Payment against an Invoice */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Record Payment to Supplier</h3>
                <p className="text-xs text-blue-200">{payingInvoice.supplierName} · {payingInvoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setPayingInvoice(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="p-5 space-y-4 text-xs">
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Outstanding Balance:</span>
                <span className="font-mono font-bold text-base text-rose-700">
                  {formatCurrency(payingInvoice.balanceDue)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Payment Amount (₦) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={payingInvoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque">Corporate Cheque</option>
                  <option value="Cash">Cash Voucher</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank Transaction Reference / Cheque No *
                </label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Notes</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Submit Payment Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Supplier */}
      {isAddingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden my-8">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Register New Pharmaceutical Wholesaler</h3>
              <button onClick={() => setIsAddingSupplier(false)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplierSubmit} className="p-5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Wholesaler Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dana Pharmaceuticals Ltd"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Pharm. Adeleke"
                    value={newSupContact}
                    onChange={(e) => setNewSupContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+234 800..."
                    value={newSupPhone}
                    onChange={(e) => setNewSupPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@wholesaler.com"
                    value={newSupEmail}
                    onChange={(e) => setNewSupEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credit Terms (Days) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newSupTerms}
                    onChange={(e) => setNewSupTerms(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office / Warehouse Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 12 Commercial Avenue, Ikeja"
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zenith Bank"
                    value={newSupBank}
                    onChange={(e) => setNewSupBank(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    placeholder="10-digit NUBAN"
                    value={newSupAccount}
                    onChange={(e) => setNewSupAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSupplier(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer: Detailed Inspection of Invoice Items and Payment Audit Trail */}
      {inspectingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm">Purchase Bill Breakdown</h3>
                <p className="text-xs text-blue-200">{inspectingInvoice.invoiceNumber} · {inspectingInvoice.supplierName}</p>
              </div>
              <button onClick={() => setInspectingInvoice(null)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Purchase Date:</span>
                  <span className="font-mono font-semibold">{inspectingInvoice.purchaseDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Due Date:</span>
                  <span className="font-mono font-bold text-blue-900">{inspectingInvoice.dueDate}</span>
                </div>
              </div>

              {/* Items in Invoice */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Medications Received In This Shipment:</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {inspectingInvoice.items.map(item => (
                    <div key={item.drugId} className="p-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-slate-900">{item.drugName}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {item.quantity} units @ {formatCurrency(item.unitCost)}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment History Log */}
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Payments Applied:</h4>
                {inspectingInvoice.payments.length === 0 ? (
                  <p className="text-slate-400 italic">No payments have been recorded for this bill yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {inspectingInvoice.payments.map(p => (
                      <div key={p.id} className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg flex justify-between items-center">
                        <div>
                          <span className="font-bold text-emerald-900">{formatCurrency(p.amount)}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {p.date} via {p.paymentMethod} · Ref: {p.reference}
                          </span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Balances */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-sm">
                <span>Remaining Debt:</span>
                <span className="font-mono text-rose-700">{formatCurrency(inspectingInvoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
