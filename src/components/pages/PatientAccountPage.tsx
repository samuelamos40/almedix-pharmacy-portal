import React, { useState, useMemo } from 'react';
import { PaystackButton } from 'react-paystack';
import { 
  User, 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  LogOut, 
  ArrowRight, 
  ShieldCheck, 
  Edit3, 
  Save, 
  KeyRound, 
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Search,
  Pill,
  ShoppingBag,
  Plus,
  Minus,
  RefreshCw,
  UploadCloud,
  Check,
  CreditCard,
  Truck,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePharmacy } from '../../context/PharmacyContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DrugItem, Order, PaymentMethod, DrugCategory } from '../../types/pharmacy';
import { TrackOrderPage } from './TrackOrderPage';
import { OrderTrackerModal } from '../store/OrderTrackerModal';
import { supabase } from '../../lib/supabase';

interface PatientAccountPageProps {
  onNavigate: (page: string) => void;
  onTrackOrder: (orderNum: string) => void;
  onOpenCart?: () => void;
  onOpenConsultation?: () => void;
}

export const PatientAccountPage: React.FC<PatientAccountPageProps> = ({
  onNavigate,
  onTrackOrder,
  onOpenCart,
  onOpenConsultation,
}) => {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { 
    drugs, 
    orders, 
    consultations, 
    placeOrder, 
    addToCart, 
    cartItemCount,
    updateOrderStatus,
    deleteOrder
  } = usePharmacy();

  // Active Tab: 'order_meds' | 'orders' | 'upload_rx' | 'consultations' | 'track_order'
  const [activeTab, setActiveTab] = useState<'order_meds' | 'orders' | 'upload_rx' | 'consultations' | 'track_order'>('order_meds');

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editAllergies, setEditAllergies] = useState(user?.allergies || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // In-Dashboard Medicine Ordering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderNotification, setOrderNotification] = useState<string>('');

  // Direct 1-Click Order Modal State
  const [selectedDrugForDirectOrder, setSelectedDrugForDirectOrder] = useState<DrugItem | null>(null);
  const [directOrderQty, setDirectOrderQty] = useState(1);
  const [directPaymentMethod, setDirectPaymentMethod] = useState<PaymentMethod>('Direct Bank Transfer');
  const [directOrderNotes, setDirectOrderNotes] = useState('');

  // Order Tracker State
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [isSubmittingDirectOrder, setIsSubmittingDirectOrder] = useState(false);

  // In-Dashboard Prescription Upload State
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [rxFile, setRxFile] = useState<File | null>(null);
  const [rxNotes, setRxNotes] = useState('');
  const [rxSuccess, setRxSuccess] = useState('');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  // Filter orders matching this account
  const userOrders = useMemo(() => {
    return orders.filter(o => {
      const oEmail = o.customerEmail || '';
      const oName = o.customerName || '';
      const uEmail = user?.email || '';
      const uName = user?.name || '';
      
      const emailMatch = uEmail && oEmail.toLowerCase() === uEmail.toLowerCase();
      const nameMatch = uName && oName.toLowerCase() === uName.toLowerCase();
      
      return emailMatch || nameMatch;
    });
  }, [orders, user]);

  const userConsultations = useMemo(() => {
    return consultations.filter(c => {
      const cEmail = c.patientEmail || '';
      const cName = c.patientName || '';
      const uEmail = user?.email || '';
      const uName = user?.name || '';
      
      const emailMatch = uEmail && cEmail.toLowerCase() === uEmail.toLowerCase();
      const nameMatch = uName && cName.toLowerCase() === uName.toLowerCase();
      
      return emailMatch || nameMatch;
    });
  }, [consultations, user]);

  // Filter medicines for dashboard catalog
  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug => {
      const matchesSearch = 
        drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.brand.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || drug.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [drugs, searchQuery, selectedCategory]);

  const categories = ['All', 'Prescription', 'Over-the-Counter', 'Chronic Care', 'Vitamins & Supplements', 'Mother & Child'];

  const getQty = (drugId: string) => quantities[drugId] || 1;
  const setQty = (drugId: string, val: number) => {
    setQuantities(prev => ({ ...prev, [drugId]: Math.max(1, val) }));
  };

  const handleAddToCart = (drug: DrugItem) => {
    const qty = getQty(drug.id);
    addToCart(drug, qty);
    setOrderNotification(`Added ${qty}x ${drug.name} to your medical bag.`);
    setTimeout(() => setOrderNotification(''), 3000);
  };

  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrugForDirectOrder || !user) return;

    setIsSubmittingDirectOrder(true);
    const drug = selectedDrugForDirectOrder;
    const qty = directOrderQty;
    const lineTotal = drug.sellingPrice * qty;
    const deliveryFee = lineTotal >= 30000 ? 0 : 1500;
    const totalAmount = lineTotal + deliveryFee;

    try {
      const newOrder = await placeOrder({
        customerName: user.name,
        customerPhone: user.phone || '+234 800 000 0000',
        customerEmail: user.email,
        deliveryAddress: user.address || 'Address on file',
        deliveryCity: 'Lagos',
        orderStatus: directPaymentMethod === 'Cash on Delivery' ? 'Pending' : 'Awaiting Payment',
        paymentStatus: 'Pending',
        paymentMethod: directPaymentMethod,
        items: [
          {
            drugId: drug.id,
            drugName: drug.name,
            dosageForm: drug.dosageForm,
            strength: drug.strength,
            unitPrice: drug.sellingPrice,
            quantity: qty,
            lineTotal,
            requiresPrescription: drug.requiresPrescription,
          }
        ],
        subtotal: lineTotal,
        deliveryFee,
        totalAmount,
        notes: directOrderNotes || 'Placed directly via Patient Portal Dashboard',
      });
      setIsSubmittingDirectOrder(false);
      setSelectedDrugForDirectOrder(null);
      setDirectOrderNotes('');
      setActiveTab('orders');
      
      if (directPaymentMethod !== 'Cash on Delivery') {
        setPayingOrder(newOrder);
      } else {
        setOrderNotification(`Success! Order #${newOrder.orderNumber} placed.`);
        setTimeout(() => setOrderNotification(''), 4000);
      }
    } catch (err: any) {
      setIsSubmittingDirectOrder(false);
      alert('Failed to place order: ' + err.message);
    }
  };

  // Quick 1-Click Refill of a previous order
  const handleRefillOrder = async (order: Order) => {
    if (!user) return;
    try {
      const newOrder = await placeOrder({
        customerName: user.name,
        customerPhone: user.phone || order.customerPhone,
        customerEmail: user.email,
        deliveryAddress: user.address || order.deliveryAddress,
        deliveryCity: order.deliveryCity,
        orderStatus: 'Pending',
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        notes: `Prescription Refill for Order #${order.orderNumber}`,
      });

      setOrderNotification(`Refill order #${newOrder.orderNumber} placed successfully! Dispatch pending.`);
      setTimeout(() => setOrderNotification(''), 4000);
    } catch (err: any) {
      alert('Refill error: ' + err.message);
    }
  };

  // Direct In-Dashboard Prescription Upload
  const handleRxUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxFile || !user) return;

    setIsSubmittingRx(true);
    try {
      let fileUrl = '';
      
      // Try to upload to Supabase Storage
      const fileExt = rxFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, rxFile);

      if (uploadError) {
        console.warn("Storage upload failed, bucket might not exist:", uploadError);
        // Fallback: Notify admin that bucket is missing, but still submit the order
        alert('Warning: Prescription bucket not found. The image could not be uploaded. Please notify the admin to create a public "prescriptions" bucket in Supabase.');
      } else if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('prescriptions')
          .getPublicUrl(fileName);
        fileUrl = publicUrl;
      }

      const combinedNotes = fileUrl 
        ? `Uploaded slip: ${rxFile.name}\nImage URL: ${fileUrl}\n\nNotes: ${rxNotes}`
        : `Uploaded slip: ${rxFile.name} (UPLOAD FAILED - BUCKET MISSING)\nNotes: ${rxNotes}`;

      const order = await placeOrder({
        customerName: user.name,
        customerPhone: user.phone || '+234 800 000 0000',
        customerEmail: user.email,
        deliveryAddress: user.address || 'Address on file',
        deliveryCity: 'Lagos',
        orderStatus: 'Pending',
        paymentStatus: 'Pending Cash on Delivery',
        paymentMethod: 'Cash on Delivery',
        items: [
          {
            drugId: `rx-${Date.now()}`,
            drugName: `Prescription Slip: ${rxFile.name}`,
            dosageForm: 'Prescription Slip',
            strength: 'Clinical audit required',
            unitPrice: 0,
            quantity: 1,
            lineTotal: 0,
            requiresPrescription: true,
          }
        ],
        subtotal: 0,
        deliveryFee: 0,
        totalAmount: 0,
        prescriptionUploaded: true,
        prescriptionFileName: rxFile.name,
        prescriptionNotes: rxNotes,
        notes: combinedNotes,
      });

      setIsSubmittingRx(false);
      setRxFile(null);
      setRxNotes('');
      setRxSuccess(`Prescription submitted! Order #${order.orderNumber} is under clinical pharmacist audit.`);
      setActiveTab('orders');
      setTimeout(() => setRxSuccess(''), 5000);
    } catch (err: any) {
      setIsSubmittingRx(false);
      alert('Failed to upload prescription: ' + err.message);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      allergies: editAllergies.trim(),
    });

    setProfileSuccess('Profile updated successfully.');
    setIsEditingProfile(false);
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    const res = await changePassword(oldPassword, newPassword);
    if (!res.success) {
      setPasswordError(res.error || 'Password update failed.');
      return;
    }

    setPasswordSuccess('Password successfully changed!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordSuccess('');
    }, 2000);
  };

  const handleConfirmPaymentSuccess = async (reference: any) => {
    if (!payingOrder) return;
    setIsProcessingPayment(true);
    try {
      await updateOrderStatus(payingOrder.id, 'Pending', 'Paid');
      
      setOrderNotification(`Payment successful for ₦${payingOrder.totalAmount.toLocaleString()}! Order #${payingOrder.orderNumber} is now being processed.`);
      setPayingOrder(null);
      setTimeout(() => setOrderNotification(''), 5000);
    } catch (err: any) {
      alert("Payment processing failed: " + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Patient Profile & Clinical ID Header */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-xs p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-950 text-white font-bold text-2xl flex items-center justify-center font-mono shadow-xs border border-blue-800 shrink-0">
              {user?.avatarInitials || 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{user?.email}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  <span>{user?.phone || 'No phone recorded'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[200px]">{user?.address || 'Lekki Phase 1, Lagos'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCart && cartItemCount > 0 && (
              <button
                onClick={onOpenCart}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Checkout Bag ({cartItemCount})</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setEditName(user?.name || '');
                setEditPhone(user?.phone || '');
                setEditAddress(user?.address || '');
                setEditAllergies(user?.allergies || '');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-700" />
              <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
            </button>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-700" />
              <span>Security</span>
            </button>
            <button
              onClick={() => {
                logout();
                onNavigate('home');
              }}
              className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Sign Out to Homepage"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {/* Inline Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-700" />
              <span>Update Medical Account Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Poly Junction area, along Inec Road. Bida Niger State"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Drug Allergies & Clinical Alerts</label>
                <input
                  type="text"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Aspirin, or None"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Inline Password Change Form */}
        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit} className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs space-y-3">
            <h4 className="font-bold text-blue-950 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-700" />
              <span>Update Password</span>
            </h4>
            {passwordError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </form>
        )}

        {/* Patient Dashboard Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-blue-100 text-xs">
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-0.5">
              Prescription Orders
            </span>
            <p className="font-bold text-lg text-slate-900 font-mono">{userOrders.length}</p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-0.5">
              Doctor Appointments
            </span>
            <p className="font-bold text-lg text-slate-900 font-mono">{userConsultations.length}</p>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-0.5">
              Allergy Alerts
            </span>
            <p className="font-medium text-xs text-slate-800 truncate" title={user?.allergies || 'None'}>
              {user?.allergies || 'No allergies recorded'}
            </p>
          </div>

        </div>
      </div>

      {/* Global Notification Banner */}
      {orderNotification && (
        <div className="p-4 bg-emerald-900 text-white rounded-xl shadow-md flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span className="font-medium">{orderNotification}</span>
          </div>
          {onOpenCart && (
            <button
              onClick={onOpenCart}
              className="px-3 py-1 bg-white text-emerald-900 font-bold rounded-lg text-xs cursor-pointer hover:bg-emerald-50"
            >
              Open Bag →
            </button>
          )}
        </div>
      )}

      {/* Main In-Dashboard Tabbed Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('order_meds')}
            className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'order_meds'
                ? 'border-blue-700 text-blue-950 bg-white font-bold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4 text-blue-700" />
            <span>Order Medications Directly</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-blue-700 text-blue-950 bg-white font-bold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-blue-700" />
            <span>My Orders & Refills</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_rx')}
            className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upload_rx'
                ? 'border-blue-700 text-blue-950 bg-white font-bold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-blue-700" />
            <span>Upload Doctor Prescription</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'consultations'
                ? 'border-blue-700 text-blue-950 bg-white font-bold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-700" />
            <span>Doctor Consultations</span>
          </button>

          <button
            onClick={() => setActiveTab('track_order')}
            className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'track_order'
                ? 'border-blue-700 text-blue-950 bg-white font-bold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-700" />
            <span>Track Order</span>
          </button>
        </div>

        {/* Tab 1: DIRECT IN-DASHBOARD MEDICINE ORDERING */}
        {activeTab === 'order_meds' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-700" />
                  <span>Order Prescription & OTC Medications Directly</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order verified pharmaceuticals dispatched directly to your address: {user?.address || 'Lekki Phase 1, Lagos'}.
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-900 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* In-Dashboard Medicine Catalog Grid */}
            {filteredDrugs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No medications found matching "{searchQuery}"</p>
                <p className="text-slate-400 mt-1">Try searching for generic names like Paracetamol, Amoxicillin, or Metformin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrugs.map(drug => {
                  const qty = getQty(drug.id);
                  const isOutOfStock = drug.stockLevel <= 0;

                  return (
                    <div 
                      key={drug.id} 
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            drug.requiresPrescription 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {drug.requiresPrescription ? 'POM · Prescription Required' : 'OTC · Over The Counter'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {drug.dosageForm}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{drug.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{drug.genericName} · {drug.strength}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Pack: {drug.packSize}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-slate-400 block text-[10px]">Price per pack</span>
                            <span className="font-bold text-base text-blue-950 font-mono">
                              {formatCurrency(drug.sellingPrice)}
                            </span>
                          </div>

                          {/* Quantity stepper */}
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              type="button"
                              onClick={() => setQty(drug.id, qty - 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-l cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold font-mono text-slate-800">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(drug.id, qty + 1)}
                              className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded-r cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Order Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(drug)}
                            disabled={isOutOfStock}
                            className="py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-blue-700" />
                            <span>Add to Bag</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDrugForDirectOrder(drug);
                              setDirectOrderQty(qty);
                            }}
                            disabled={isOutOfStock}
                            className="py-2 px-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>1-Click Order</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: MY ORDERS & REFILLS */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-700" />
                <span>My Prescription Orders ({userOrders.length})</span>
              </h3>
              <button
                onClick={() => setActiveTab('order_meds')}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                + Order New Medicine
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="p-10 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">You have no active or previous orders.</p>
                <p className="text-xs text-slate-400">Order verified medications directly from your dashboard anytime.</p>
                <button
                  onClick={() => setActiveTab('order_meds')}
                  className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Browse Available Medications
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map(order => (
                  <div key={order.id} className="p-5 rounded-xl border border-slate-200 shadow-xs bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">{order.orderNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.orderStatus === 'Delivered' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : order.orderStatus === 'Awaiting Payment'
                              ? 'bg-indigo-100 text-indigo-800'
                              : order.orderStatus === 'Out for Delivery'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {formatDate(order.orderDate)} · Dispatch to: {order.deliveryAddress}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        {order.orderStatus === 'Awaiting Payment' && (
                          <button
                            type="button"
                            onClick={() => setPayingOrder(order)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs animate-pulse"
                          >
                            <span>Pay ₦{order.totalAmount.toLocaleString()} Now</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRefillOrder(order)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          title="Instantly re-order these medicines"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-blue-700" />
                          <span>Refill</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTrackingOrderNumber(order.orderNumber);
                            setIsTrackerOpen(true);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Track</span>
                        </button>
                        {(order.orderStatus === 'Pending' || order.orderStatus === 'Awaiting Payment') && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (order.prescriptionUploaded) {
                                if (window.confirm('Are you sure you want to delete this prescription upload? You can re-upload a new one.')) {
                                  await deleteOrder(order.id);
                                  setOrderNotification(`Prescription #${order.orderNumber} deleted successfully.`);
                                  setActiveTab('upload_rx');
                                  setTimeout(() => setOrderNotification(''), 4000);
                                }
                              } else {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                  await updateOrderStatus(order.id, 'Cancelled');
                                  setOrderNotification(`Order #${order.orderNumber} has been cancelled.`);
                                  setTimeout(() => setOrderNotification(''), 4000);
                                }
                              }
                            }}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{order.prescriptionUploaded ? 'Delete / Cancel' : 'Cancel'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {order.orderStatus === 'Awaiting Payment' && order.prescriptionUploaded && (
                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg text-xs text-indigo-900 mb-2">
                        <span className="font-bold block mb-1">Pharmacist Feedback / Quotation:</span>
                        <span className="whitespace-pre-line">{order.notes}</span>
                      </div>
                    )}

                    {/* Order items table */}
                    <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs">
                      {order.items.map(item => (
                        <div key={item.drugId} className="flex justify-between items-center text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-900 font-mono">{item.quantity}x</span>
                            <span>{item.drugName}</span>
                            <span className="text-[10px] text-slate-400">({item.dosageForm})</span>
                          </div>
                          <span className="font-mono font-bold">{formatCurrency(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">Payment: {order.paymentMethod} ({order.paymentStatus})</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        Total: <span className="text-blue-700">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: DIRECT IN-DASHBOARD PRESCRIPTION UPLOAD */}
        {activeTab === 'upload_rx' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-700" />
                <span>Upload Doctor Prescription Slip</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your clinic card, doctor slip, or hospital prescription. Our clinical pharmacist will review the formulation and contact you for itemized delivery.
              </p>
            </div>

            {rxSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{rxSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRxUploadSubmit} className="space-y-4 max-w-xl text-xs">
              <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setRxFile(e.target.files[0]);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">
                  {rxFile ? rxFile.name : 'Click or Drag & Drop Prescription File'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or PDF (Max 15MB)</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescription Notes / Specific Brand Request</label>
                <textarea
                  rows={3}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="e.g. Please dispense 30 days of standard Glucophage and Coartem 80/480mg..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Dispatch Details on File:</p>
                <p>Patient: <span className="font-semibold text-slate-900">{user?.name}</span></p>
                <p>Phone: <span className="font-semibold text-slate-900">{user?.phone || 'On file'}</span></p>
                <p>Delivery: <span className="font-semibold text-slate-900">{user?.address || 'Lekki Phase 1'}</span></p>
              </div>

              <button
                type="submit"
                disabled={isSubmittingRx || !rxFile}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Submit Prescription for Pharmacist Review</span>
                <Check className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: DOCTOR CONSULTATIONS */}
        {activeTab === 'consultations' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-700" />
                <span>My Telehealth Sessions ({userConsultations.length})</span>
              </h3>
              {onOpenConsultation && (
                <button
                  onClick={onOpenConsultation}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  + Book Doctor Session
                </button>
              )}
            </div>

            {userConsultations.length === 0 ? (
              <div className="p-10 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">No scheduled doctor or pharmacist consultations.</p>
                <p className="text-xs text-slate-400">Speak with a clinical specialist for prescription audits or medical guidance.</p>
                {onOpenConsultation && (
                  <button
                    onClick={onOpenConsultation}
                    className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                  >
                    Book Doctor Appointment
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userConsultations.map(con => (
                  <div key={con.id} className="p-4 rounded-xl border border-slate-200 shadow-xs bg-white space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-900 text-sm">{con.specialistType}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                        {con.status}
                      </span>
                    </div>
                    <p className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-700" />
                      <span>{con.appointmentDate} · {con.appointmentTime}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 bg-blue-50/50 p-2.5 rounded-lg">
                      "{con.symptomsSummary}"
                    </p>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">Format: {con.consultationFormat}</span>
                      <span className="font-mono font-bold text-blue-950">{formatCurrency(con.fee)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: TRACK ORDER */}
        {activeTab === 'track_order' && (
          <div className="bg-slate-50 border-t border-slate-100">
            <TrackOrderPage />
          </div>
        )}

      </div>

      {/* DIRECT 1-CLICK ORDER MODAL */}
      {selectedDrugForDirectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="bg-blue-950 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-300" />
                <h3 className="font-bold text-sm">Direct Express Medicine Order</h3>
              </div>
              <button
                onClick={() => setSelectedDrugForDirectOrder(null)}
                className="text-blue-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectOrderSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-1">
                <span className="font-bold text-blue-950 text-sm block">{selectedDrugForDirectOrder.name}</span>
                <p className="text-slate-600">{selectedDrugForDirectOrder.genericName} · {selectedDrugForDirectOrder.strength}</p>
                <p className="font-mono font-bold text-blue-900">{formatCurrency(selectedDrugForDirectOrder.sellingPrice)} per pack</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDirectOrderQty(Math.max(1, directOrderQty - 1))}
                    className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="font-mono font-bold text-base text-slate-900">{directOrderQty}</span>
                  <button
                    type="button"
                    onClick={() => setDirectOrderQty(directOrderQty + 1)}
                    className="p-1.5 border border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-slate-500 font-mono ml-auto">
                    Subtotal: {formatCurrency(selectedDrugForDirectOrder.sellingPrice * directOrderQty)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={directPaymentMethod}
                  onChange={(e) => setDirectPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white text-xs"
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Debit Card">Debit Card (Mastercard / Visa / Verve)</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Destination</label>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-0.5">
                  <p className="font-bold">{user?.name} ({user?.phone || 'On file'})</p>
                  <p className="text-slate-600">{user?.address || 'Lekki Phase 1, Lagos'}</p>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Special instructions for dispensary"
                  value={directOrderNotes}
                  onChange={(e) => setDirectOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold">
                <span>Total Amount:</span>
                <span className="text-base text-blue-900 font-mono">
                  {formatCurrency(
                    selectedDrugForDirectOrder.sellingPrice * directOrderQty +
                    (selectedDrugForDirectOrder.sellingPrice * directOrderQty >= 30000 ? 0 : 1500)
                  )}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDrugForDirectOrder(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDirectOrder}
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingDirectOrder ? 'Placing Order...' : 'Confirm Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT OVERLAY MODAL */}
      {payingOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4" />
                Complete Payment
              </h3>
              <button 
                onClick={() => !isProcessingPayment && setPayingOrder(null)} 
                className="p-1 hover:bg-indigo-100 rounded-lg text-indigo-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5 text-sm">
              <div className="text-center space-y-1">
                <p className="text-slate-500 text-xs">Total Amount Due</p>
                <p className="text-3xl font-mono font-bold text-slate-900">₦{payingOrder.totalAmount.toLocaleString()}</p>
                <p className="text-xs text-slate-400 font-mono">Order #{payingOrder.orderNumber}</p>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 border-2 border-indigo-600 bg-indigo-50/50 rounded-xl flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-[5px] border-indigo-600 bg-white"></div>
                    <span className="font-bold text-slate-700">Pay with Card / Bank Transfer</span>
                  </div>
                  <span className="text-indigo-600 text-[10px] font-bold">DEFAULT</span>
                </div>
              </div>

              <div className="pt-2">
                {isProcessingPayment ? (
                  <button disabled className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md opacity-50 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </button>
                ) : (
                  <PaystackButton
                    email={user?.email || 'patient@example.com'}
                    amount={payingOrder.totalAmount * 100}
                    publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_e48975936fc1829d78c850123797ce6a59bf8774"}
                    text={`Securely Pay ₦${payingOrder.totalAmount.toLocaleString()}`}
                    onSuccess={handleConfirmPaymentSuccess}
                    onClose={() => console.log('Payment modal closed')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer shadow-md transition-colors flex items-center justify-center gap-2"
                  />
                )}
                <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Secured by Paystack / Flutterwave
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        initialOrderNumber={trackingOrderNumber}
      />
    </div>
  );
};
