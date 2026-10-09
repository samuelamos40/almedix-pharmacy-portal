import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header, PublicPage } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { PrescriptionsPage } from './components/pages/PrescriptionsPage';
import { ConsultationsPage } from './components/pages/ConsultationsPage';
import { PatientAccountPage } from './components/pages/PatientAccountPage';
import { TrackOrderPage } from './components/pages/TrackOrderPage';
import { DrugCatalog } from './components/store/DrugCatalog';
import { DrugDetailModal } from './components/store/DrugDetailModal';
import { CartDrawer } from './components/store/CartDrawer';
import { ConsultationBookingModal } from './components/store/ConsultationBookingModal';
import { OrderSuccessModal } from './components/store/OrderSuccessModal';
import { OrderTrackerModal } from './components/store/OrderTrackerModal';
import { LoginModal } from './components/auth/LoginModal';
import { StaffWorkstation } from './components/admin/StaffWorkstation';
import { DrugItem, Order } from './types/pharmacy';

function MainAppContent() {
  const { drugs, addToCart } = usePharmacy();
  const { user, isAuthenticated, isInitializing } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: public site or staff workstation
  const [inWorkstationMode, setInWorkstationMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Derive current page from URL to keep legacy props working perfectly
  const currentPath = location.pathname.substring(1);
  const currentPage = (currentPath || 'home') as PublicPage;

  // Adapter function for legacy components
  const setCurrentPage = (page: PublicPage) => {
    if (page === 'home') navigate('/');
    else navigate(`/${page}`);
  };

  // Modals state
  const [selectedDrug, setSelectedDrug] = useState<DrugItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginDefaultTab, setLoginDefaultTab] = useState<'patient' | 'staff'>('patient');
  const [loginDefaultMode, setLoginDefaultMode] = useState<'login' | 'register'>('login');
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');

  const isStaff = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'accounts_officer' || user?.role === 'data_analyst';

  const handleOpenLogin = (tab: 'patient' | 'staff' = 'patient', mode: 'login' | 'register' = 'login') => {
    setLoginDefaultTab(tab);
    setLoginDefaultMode(mode);
    setIsLoginOpen(true);
  };

  const handleLoginSuccess = (role: string) => {
    if (role === 'admin' || role === 'pharmacist' || role === 'accounts_officer' || role === 'data_analyst') {
      setInWorkstationMode(true);
      navigate('/admin');
    } else {
      navigate('/account');
    }
  };

  const handleOrderCompleted = (order: Order) => {
    setRecentOrder(order);
  };

  const handleTrackSpecificOrder = (orderNum: string) => {
    setTrackingOrderNumber(orderNum);
    setIsTrackerOpen(true);
    setRecentOrder(null);
  };

  // Automatic redirect to home page when user signs out
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      if (currentPage === 'account') navigate('/');
      setTrackingOrderNumber(''); // Clear any lingering tracking state on logout
    }
  }, [isAuthenticated, isInitializing, currentPage, navigate]);

  const handleOpenConsultation = () => {
    if (!isAuthenticated) {
      alert("Please login or create a patient account to book a consultation so you can track your appointment.");
      setLoginDefaultTab('patient');
      setLoginDefaultMode('login');
      setIsLoginOpen(true);
      return;
    }
    setIsConsultationOpen(true);
  };

  const handleOpenPrescription = () => {
    if (!isAuthenticated) {
      alert("Please login or create a patient account to upload a prescription. Our pharmacy team will review it and send a quotation directly to your dashboard.");
      setLoginDefaultTab('patient');
      setLoginDefaultMode('login');
      setIsLoginOpen(true);
      return;
    }
    navigate('/prescriptions');
  };

  // If in dedicated Staff Workstation mode, render that workstation
  if (inWorkstationMode && isStaff) {
    return (
      <StaffWorkstation
        onExitToStore={() => {
          setInWorkstationMode(false);
          navigate('/');
        }}
      />
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-purple-200 selection:text-purple-900">
      {/* Universal Top Navigation */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={handleOpenLogin}
        onSwitchToWorkstation={() => setInWorkstationMode(true)}
      />

      {/* Main Public Page Router */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <HomePage
              onNavigate={(page) => setCurrentPage(page as PublicPage)}
              featuredDrugs={drugs}
              onSelectDrug={(drug) => setSelectedDrug(drug)}
              onAddToCart={(drug) => addToCart(drug, 1)}
            />
          } />
          
          <Route path="/about" element={<AboutPage />} />
          
          <Route path="/shop" element={
            <div className="py-8">
              <DrugCatalog
                searchQuery={searchQuery}
                onSelectDrug={(drug) => setSelectedDrug(drug)}
                onOpenConsultation={handleOpenConsultation}
                onOpenPrescriptionUpload={handleOpenPrescription}
              />
            </div>
          } />
          
          <Route path="/consultations" element={
            <ConsultationsPage
              onOpenBookingModal={handleOpenConsultation}
            />
          } />
          
          <Route path="/prescriptions" element={
            isAuthenticated ? (
              <PrescriptionsPage onTrackOrder={handleTrackSpecificOrder} />
            ) : <Navigate to="/" replace />
          } />
          
          <Route path="/track" element={
            <TrackOrderPage
              initialOrderNumber={trackingOrderNumber}
            />
          } />
          
          <Route path="/account" element={
            isAuthenticated ? (
              <PatientAccountPage
                onNavigate={(page) => setCurrentPage(page as PublicPage)}
                onTrackOrder={handleTrackSpecificOrder}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenConsultation={handleOpenConsultation}
              />
            ) : <Navigate to="/" replace />
          } />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={setCurrentPage}
        onOpenLogin={handleOpenLogin}
        onSwitchToWorkstation={() => setInWorkstationMode(true)}
        isStaff={isStaff}
      />

      {/* Slide-overs & Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        defaultTab={loginDefaultTab}
        defaultMode={loginDefaultMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <DrugDetailModal
        drug={selectedDrug}
        onClose={() => setSelectedDrug(null)}
        onOpenConsultation={handleOpenConsultation}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenPrescriptionUpload={() => {
          setIsCartOpen(false);
          navigate('/prescriptions');
        }}
        onOrderCompleted={handleOrderCompleted}
      />

      <ConsultationBookingModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
      />

      <OrderSuccessModal
        order={recentOrder}
        onClose={() => setRecentOrder(null)}
        onTrackOrder={handleTrackSpecificOrder}
      />
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        initialOrderNumber={trackingOrderNumber}
      />
    </div>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PharmacyProvider>
            <MainAppContent />
          </PharmacyProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
