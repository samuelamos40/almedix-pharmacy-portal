import React from 'react';
import { ShoppingBag, Lock, User, Phone, LogOut, LayoutDashboard, Pill, UploadCloud, Calendar, Truck } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useAuth } from '../../context/AuthContext';

export type PublicPage = 
  | 'home' 
  | 'about' 
  | 'shop' 
  | 'consultations' 
  | 'prescriptions' 
  | 'track' 
  | 'account';

interface HeaderProps {
  currentPage: PublicPage;
  setCurrentPage: (page: PublicPage) => void;
  onOpenCart: () => void;
  onOpenLogin: (defaultTab?: 'patient' | 'staff', defaultMode?: 'login' | 'register') => void;
  onSwitchToWorkstation: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  setCurrentPage,
  onOpenCart,
  onOpenLogin,
  onSwitchToWorkstation,
}) => {
  const { cartItemCount } = usePharmacy();
  const { user, isAuthenticated, logout } = useAuth();

  const isStaff = user?.role === 'admin' || user?.role === 'accounts_officer' || user?.role === 'data_analyst';

  const handleSignOut = () => {
    logout();
    setCurrentPage('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-blue-100 shadow-2xs">

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isAuthenticated && !isStaff) setCurrentPage('account');
              else setCurrentPage('home');
            }}
            className="text-left group cursor-pointer flex items-center gap-3"
          >
            <img src="/logo.jpg" alt="Al-Medix and Sons LTD Logo" className="h-10 w-auto rounded-lg shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-lg leading-tight tracking-tight">Al-Medix and Sons LTD</span>
              <span className="text-[10px] text-slate-500 font-medium">Pharmacy & Telehealth</span>
            </div>
          </button>
        </div>

        {/* Navigation Links: Global Navigation (Hidden inside Dashboard) */}
        {currentPage !== 'account' && (
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold">
            <button
              onClick={() => setCurrentPage('home')}
              className={`hover:text-blue-900 transition-colors cursor-pointer ${
                currentPage === 'home' ? 'text-blue-900 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`hover:text-blue-900 transition-colors cursor-pointer ${
                currentPage === 'about' ? 'text-blue-900 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setCurrentPage('shop')}
              className={`hover:text-blue-900 transition-colors cursor-pointer ${
                currentPage === 'shop' ? 'text-blue-900 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600'
              }`}
            >
              Online Pharmacy
            </button>
            <button
              onClick={() => setCurrentPage('consultations')}
              className={`hover:text-blue-900 transition-colors cursor-pointer ${
                currentPage === 'consultations' ? 'text-blue-900 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600'
              }`}
            >
              Doctor Consultations
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert("Please login or create a patient account to upload a prescription.");
                  onOpenLogin('patient', 'login');
                } else {
                  setCurrentPage('prescriptions');
                }
              }}
              className={`hover:text-blue-900 transition-colors cursor-pointer ${
                currentPage === 'prescriptions' ? 'text-blue-900 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600'
              }`}
            >
              Prescription Upload
            </button>
            <button
              onClick={() => setCurrentPage('track')}
              className={`hover:text-blue-900 transition-colors cursor-pointer ${
                currentPage === 'track' ? 'text-blue-900 font-bold border-b-2 border-blue-700 pb-1' : 'text-slate-600'
              }`}
            >
              Track Order
            </button>
          </nav>
        )}

        {/* Primary Actions (Cart & Authentication) */}
        <div className="flex items-center gap-3">
          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-950 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-blue-700" />
            <span className="hidden xs:inline">Bag</span>
            {cartItemCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-blue-700 text-white rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Sign In / Register / Profile action */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => {
                  if (isStaff) {
                    onSwitchToWorkstation();
                  } else {
                    setCurrentPage('account');
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title={isStaff ? "Open Workstation" : "View My Health Account"}
              >
                <div className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] font-bold">
                  {user?.avatarInitials || 'AL'}
                </div>
                <span className="truncate max-w-[100px]">{user?.name.split(' ')[0]}</span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-blue-900/60 rounded text-[9px] uppercase font-bold tracking-wider text-blue-200">
                  {user?.role === 'patient' ? 'Patient' : 'Staff'}
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Sign Out (Return to Home)"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenLogin('patient', 'login')}
                className="px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-blue-200"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenLogin('patient', 'register')}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav links */}
      <div className="lg:hidden flex items-center gap-3 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-blue-100 text-xs text-slate-700 scrollbar-none">
        {isAuthenticated && !isStaff ? (
          <>
            <button
              onClick={() => setCurrentPage('account')}
              className={`whitespace-nowrap ${currentPage === 'account' ? 'font-bold text-blue-900' : ''}`}
            >
              My Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('shop')}
              className={`whitespace-nowrap ${currentPage === 'shop' ? 'font-bold text-blue-900' : ''}`}
            >
              Order Drugs
            </button>
            <button
              onClick={() => setCurrentPage('prescriptions')}
              className={`whitespace-nowrap ${currentPage === 'prescriptions' ? 'font-bold text-blue-900' : ''}`}
            >
              Upload Rx
            </button>
            <button
              onClick={() => setCurrentPage('consultations')}
              className={`whitespace-nowrap ${currentPage === 'consultations' ? 'font-bold text-blue-900' : ''}`}
            >
              Consultations
            </button>
            <button
              onClick={() => setCurrentPage('track')}
              className={`whitespace-nowrap ${currentPage === 'track' ? 'font-bold text-blue-900' : ''}`}
            >
              Track Deliveries
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentPage('home')}
              className={`whitespace-nowrap ${currentPage === 'home' ? 'font-bold text-blue-900' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('shop')}
              className={`whitespace-nowrap ${currentPage === 'shop' ? 'font-bold text-blue-900' : ''}`}
            >
              Pharmacy
            </button>
            <button
              onClick={() => setCurrentPage('consultations')}
              className={`whitespace-nowrap ${currentPage === 'consultations' ? 'font-bold text-blue-900' : ''}`}
            >
              Consultations
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert("Please login or create a patient account to upload a prescription.");
                  onOpenLogin('patient', 'login');
                } else {
                  setCurrentPage('prescriptions');
                }
              }}
              className={`whitespace-nowrap ${currentPage === 'prescriptions' ? 'font-bold text-blue-900' : ''}`}
            >
              Prescription Upload
            </button>
            <button
              onClick={() => setCurrentPage('track')}
              className={`whitespace-nowrap ${currentPage === 'track' ? 'font-bold text-blue-900' : ''}`}
            >
              Track Order
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`whitespace-nowrap ${currentPage === 'about' ? 'font-bold text-blue-900' : ''}`}
            >
              About Us
            </button>
          </>
        )}
      </div>
    </header>
  );
};
