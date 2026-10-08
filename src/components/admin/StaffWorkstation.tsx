import React, { useState } from 'react';
import { 
  Layers, 
  Package, 
  CreditCard, 
  ShoppingBag, 
  Calendar, 
  Database, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  Building 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePharmacy } from '../../context/PharmacyContext';
import { AdminDashboard } from './AdminDashboard';
import { InventoryManagement } from './InventoryManagement';
import { SupplierPayables } from './SupplierPayables';
import { OrdersManagement } from './OrdersManagement';
import { ConsultationsManagement } from './ConsultationsManagement';
import { NewDrugModal } from './NewDrugModal';
import { NewInvoiceModal } from './NewInvoiceModal';
import { StaffManagement } from './StaffManagement';

export type WorkstationTab = 
  | 'overview' 
  | 'inventory' 
  | 'suppliers' 
  | 'orders' 
  | 'consultations' 
  | 'staff';

interface StaffWorkstationProps {
  onExitToStore: () => void;
}

export const StaffWorkstation: React.FC<StaffWorkstationProps> = ({
  onExitToStore,
}) => {
  const { user, logout } = useAuth();
  const { invoices, drugs } = usePharmacy();
  const [activeTab, setActiveTab] = useState<WorkstationTab>('overview');

  const [isNewDrugOpen, setIsNewDrugOpen] = useState(false);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  const overdueCount = invoices.filter(i => i.status === 'OVERDUE').length;
  const lowStockCount = drugs.filter(d => d.stockLevel <= d.minStockLevel).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Workstation Header */}
      <header className="bg-blue-950 text-white border-b border-blue-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitToStore}
              className="p-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-blue-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="Return to Public Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public Site</span>
            </button>
            <div className="border-l border-blue-800 pl-3">
              <span className="font-serif font-bold text-lg text-white tracking-tight">
                Alme<span className="text-blue-400">dix</span>
              </span>
              <span className="text-xs text-blue-300 ml-2 font-mono hidden md:inline">
                Dispensary & Accounts Workstation
              </span>
            </div>
          </div>

          {/* User profile & Sign out */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Staff Member'}</p>
              <p className="text-[10px] text-blue-300">{user?.title || 'Clinical Operations'}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-800 text-blue-200 border border-blue-700 flex items-center justify-center font-bold text-xs font-mono">
              {user?.avatarInitials || 'ST'}
            </div>
            <button
              onClick={() => {
                logout();
                onExitToStore();
              }}
              className="p-1.5 rounded-lg hover:bg-blue-900 text-blue-300 hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workstation Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto text-xs font-semibold border-t border-blue-900/60 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-slate-100 text-blue-950 font-bold'
                : 'text-blue-200 hover:text-white hover:bg-blue-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {(user?.role === 'admin' || user?.role === 'pharmacist') && (
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'inventory'
                  ? 'bg-slate-100 text-blue-950 font-bold'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Dispensary Stockroom</span>
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'suppliers'
                  ? 'bg-slate-100 text-blue-950 font-bold'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Supplier Debt & Payables</span>
              {overdueCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded text-[10px] font-bold">
                  {overdueCount} Overdue
                </span>
              )}
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'pharmacist') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-slate-100 text-blue-950 font-bold'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Patient Orders & Dispensing</span>
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'pharmacist') && (
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'consultations'
                  ? 'bg-slate-100 text-blue-950 font-bold'
                  : 'text-blue-200 hover:text-white hover:bg-blue-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Consultations Queue</span>
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-2 rounded-t-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'bg-slate-100 text-blue-950 font-bold'
                  : 'text-purple-300 hover:text-purple-100 hover:bg-blue-900 font-bold'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Management</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Workstation View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'overview' && (
          <AdminDashboard
            userRole={user?.role}
            onNavigate={(view) => {
              if (view === 'admin-inventory') setActiveTab('inventory');
              else if (view === 'admin-suppliers') setActiveTab('suppliers');
              else if (view === 'admin-orders') setActiveTab('orders');
              else if (view === 'admin-consultations') setActiveTab('consultations');

            }}
            onOpenNewDrugModal={() => setIsNewDrugOpen(true)}
            onOpenNewInvoiceModal={() => setIsNewInvoiceOpen(true)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManagement
            userRole={user?.role}
            onOpenNewDrugModal={() => setIsNewDrugOpen(true)}
          />
        )}

        {activeTab === 'suppliers' && (
          <SupplierPayables
            onOpenNewInvoiceModal={() => setIsNewInvoiceOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersManagement userRole={user?.role} />
        )}

        {activeTab === 'consultations' && (
          <ConsultationsManagement userRole={user?.role} />
        )}



        {activeTab === 'staff' && (
          <StaffManagement />
        )}
      </main>

      {/* Workstation Modals */}
      <NewDrugModal
        isOpen={isNewDrugOpen}
        onClose={() => setIsNewDrugOpen(false)}
      />

      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        onClose={() => setIsNewInvoiceOpen(false)}
      />
    </div>
  );
};
