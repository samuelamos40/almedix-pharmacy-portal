import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { X, ShoppingBag, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Truck, CreditCard, Banknote, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { usePharmacy } from '../../context/PharmacyContext';
import { useAuth } from '../../context/AuthContext';
import { NIGERIA_STATES } from '../../utils/constants';
import { PaymentMethod, Order } from '../../types/pharmacy';
import { formatCurrency } from '../../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrescriptionUpload: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenPrescriptionUpload,
  onOrderCompleted,
}) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, placeOrder } = usePharmacy();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryCity, setDeliveryCity] = useState('Lagos');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Direct Bank Transfer');
  const [notes, setNotes] = useState('');
  const [rxConfirmed, setRxConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!deliveryAddress && user.address) setDeliveryAddress(user.address);
    }
  }, [user]);

  if (!isOpen) return null;

  const requiresPrescription = cart.some(item => item.drug.requiresPrescription);
  const deliveryFee = cartTotal >= 30000 || cartTotal === 0 ? 0 : 1500;
  const finalTotal = cartTotal + deliveryFee;

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: customerEmail || 'customer@example.com',
    amount: finalTotal * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_e48975936fc1829d78c850123797ce6a59bf8774',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePlaceOrder = async (e?: React.FormEvent, isPaid: boolean = false) => {
    if (e) e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Please fill in your name, phone number, and delivery address.');
      return;
    }

    if (requiresPrescription && !rxConfirmed) {
      setErrorMessage('Please confirm that you have a valid doctor prescription for the POM items.');
      return;
    }

    if (paymentMethod !== 'Cash on Delivery' && !isPaid) {
      initializePayment({
        onSuccess: () => {
          handlePlaceOrder(undefined, true);
        },
        onClose: () => {
          console.log('Payment modal closed');
        }
      });
      return;
    }

    const orderItems = cart.map(item => ({
      drugId: item.drug.id,
      drugName: item.drug.name,
      dosageForm: item.drug.dosageForm,
      strength: item.drug.strength,
      unitPrice: item.drug.sellingPrice,
      quantity: item.quantity,
      lineTotal: item.drug.sellingPrice * item.quantity,
      requiresPrescription: item.drug.requiresPrescription,
    }));

    const newOrder = await placeOrder({
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      orderStatus: 'Pending',
      paymentStatus: (paymentMethod === 'Cash on Delivery' || !isPaid) ? 'Pending Cash on Delivery' : 'Paid',
      paymentMethod,
      items: orderItems,
      subtotal: cartTotal,
      deliveryFee,
      totalAmount: finalTotal,
      prescriptionUploaded: rxConfirmed,
      notes,
    });

    setIsCheckingOut(false);
    onClose();
    onOrderCompleted(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-blue-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-300" />
            <h2 className="font-bold text-base">
              {isCheckingOut ? 'Prescription Checkout' : 'Your Medication Bag'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View */}
        {cart.length === 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-400 mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-bold text-slate-800 text-base">Your medication bag is empty</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
              Browse our verified dispensary catalog to add prescription or over-the-counter health items.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : !isCheckingOut ? (
          /* Item List View */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {requiresPrescription && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Prescription Required for one or more items:</span>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Items marked with (Rx) require a verified prescription before courier dispatch.
                  </p>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {cart.map(item => (
                <div key={item.drug.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{item.drug.name}</span>
                      {item.drug.requiresPrescription && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded">
                          Rx
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 italic">{item.drug.brand} · {item.drug.strength}</p>
                    <p className="text-xs font-bold text-blue-950 font-mono mt-1">
                      {formatCurrency(item.drug.sellingPrice)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.drug.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold font-mono text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.drug.id, item.quantity + 1)}
                        disabled={item.quantity >= item.drug.stockLevel}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.drug.id)}
                      className="text-slate-400 hover:text-rose-600 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Checkout Form View */
          <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {errorMessage && (
              <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Babatunde Johnson"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="patient@mail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Address *</label>
              <textarea
                rows={2}
                required
                placeholder="House number, Street name, landmark..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
              <select
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                {NIGERIA_STATES.map(state => (
                  <option key={state} value={state}>
                    {state} State {state === 'Lagos' ? '(Same-day dispatch)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Payment Method *</label>
              <div className="space-y-1.5">
                {[
                  { id: 'Direct Bank Transfer', label: 'Direct Bank Transfer (Instant Confirmation)', sub: 'Pay to Almedix Pharmacy Zenith Bank: 101-238-4792' },
                  { id: 'Debit Card', label: 'Debit Card (Paystack / Flutterwave Secured)', sub: 'Instant card processing' },
                  { id: 'Cash on Delivery', label: 'Pay on Delivery (Cash or POS with Rider)', sub: 'Available within Lagos State' },
                  { id: 'HMO Insurance', label: 'Health Insurance (HMO Direct Billing)', sub: 'Subject to policy verification' }
                ].map(method => (
                  <label
                    key={method.id}
                    className={`block p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id as PaymentMethod)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{method.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-5 mt-0.5">{method.sub}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Prescription Confirmation check if POM */}
            {requiresPrescription && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rxConfirmed}
                    onChange={(e) => setRxConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-blue-950 font-medium">
                    I confirm that I have an authentic doctor's prescription for the POM medications ordered, and agree to present it upon delivery or via WhatsApp upload.
                  </span>
                </label>
              </div>
            )}
          </form>
        )}

        {/* Footer Summary & Action Bar */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-700" />
                  <span>Express Delivery</span>
                </span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? 'FREE (Orders > ₦30k)' : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-blue-950 text-base">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>

            {!isCheckingOut ? (
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <span>Proceed to Delivery & Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => handlePlaceOrder(undefined, false)}
                  className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Order · {formatCurrency(finalTotal)}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
