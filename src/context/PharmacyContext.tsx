import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  DrugItem, 
  Supplier, 
  SupplierInvoice, 
  Order, 
  Consultation, 
  CartItem, 
  OrderStatus, 
  ConsultationStatus, 
  PaymentRecord, 
  InvoicePaymentStatus,
  PaymentStatus
} from '../types/pharmacy';
import { 
  INITIAL_DRUGS, 
  INITIAL_ORDERS, 
  INITIAL_CONSULTATIONS, 
  INITIAL_SUPPLIERS, 
  INITIAL_INVOICES 
} from '../data/initialData';

import { useQuery, useQueryClient } from '@tanstack/react-query';

// Helper to convert snake_case DB objects to camelCase JS objects
const toCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    acc[camelKey] = toCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Helper to convert camelCase JS objects to snake_case DB objects
const toSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = toSnake(obj[key]);
    return acc;
  }, {} as any);
};

interface PharmacyContextType {
  drugs: DrugItem[];
  suppliers: Supplier[];
  invoices: SupplierInvoice[];
  orders: Order[];
  consultations: Consultation[];
  cart: CartItem[];
  isLoadingDb: boolean;
  
  // Cart Actions
  addToCart: (drug: DrugItem, quantity?: number) => void;
  removeFromCart: (drugId: string) => void;
  updateCartQuantity: (drugId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;

  // Order Actions
  placeOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'orderDate' | 'trackingNumber'>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  quotePrescriptionOrder: (orderId: string, newItems: any[], subtotal: number, deliveryFee: number, totalAmount: number, notes?: string) => Promise<void>;

  // Consultation Actions
  bookConsultation: (consultation: Omit<Consultation, 'id' | 'referenceNumber' | 'createdAt' | 'status'>) => Promise<Consultation>;
  updateConsultationStatus: (consultationId: string, status: ConsultationStatus, notes?: string, rx?: string, assignedStaffId?: string, assignedStaffName?: string) => Promise<void>;
  
  // Consultation Configs
  consultationConfigs: any[];
  updateConsultationConfig: (id: string, updates: any) => void;
  addConsultationConfig: (config: any) => void;
  removeConsultationConfig: (id: string) => void;
  consultationTimeSlots: string[];
  updateConsultationTimeSlots: (slots: string[]) => void;

  // Inventory Actions
  addDrug: (drug: Omit<DrugItem, 'id'>) => Promise<DrugItem>;
  updateDrug: (id: string, updates: Partial<DrugItem>) => Promise<void>;
  adjustDrugStock: (id: string, delta: number, reason: string) => Promise<void>;
  deleteDrug: (id: string) => Promise<void>;

  // Supplier & Debt Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingBalance'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  addSupplierInvoice: (invoice: Omit<SupplierInvoice, 'id' | 'status' | 'amountPaid' | 'balanceDue' | 'payments'>) => Promise<SupplierInvoice>;
  recordInvoicePayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id'>) => Promise<void>;
  deleteSupplierInvoice: (invoiceId: string) => Promise<void>;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  // Queries
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await supabase.from('suppliers').select('*');
      if (!data) return [];
      return data.map(s => {
        const c = toCamel(s);
        c.id = c.supplierId;
        c.code = c.supplierCode;
        delete c.supplierCode;
        return c as Supplier;
      });
    }
  });

  const { data: drugs = [], isLoading: isLoadingDrugs } = useQuery({
    queryKey: ['drugs'],
    queryFn: async () => {
      const { data } = await supabase.from('drugs').select('*, suppliers(name)');
      if (!data) return [];
      return data.map(d => {
        const c = toCamel(d);
        c.id = c.drugId;
        c.supplierName = c.suppliers?.name || '';
        return c as DrugItem;
      });
    }
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*, order_line_items(*)').order('order_date', { ascending: false });
      if (error) console.error("Error fetching orders:", error);
      if (!data) return [];
      return data.map(o => {
        const c = toCamel(o);
        c.id = c.orderId;
        c.items = c.orderLineItems || [];

        // Recover prescription status and notes piggybacked in delivery_address
        if (c.deliveryAddress) {
          if (c.deliveryAddress.includes('|||RX:true')) {
            c.prescriptionUploaded = true;
            c.deliveryAddress = c.deliveryAddress.replace('|||RX:true', '');
          }
          if (c.deliveryAddress.includes('|||QUOTE_NOTES:')) {
            const parts = c.deliveryAddress.split('|||QUOTE_NOTES:');
            c.deliveryAddress = parts[0];
            c.notes = parts[1];
          }
        }

        // If it's a prescription but has no valid items (due to FK constraints), inject a placeholder item
        if (c.prescriptionUploaded && c.items.length === 0) {
          c.items = [{
            drugId: `rx-placeholder-${c.id}`,
            drugName: c.orderStatus === 'Awaiting Payment' ? 'Quoted Prescription Fulfillment' : 'Uploaded Prescription Slip',
            dosageForm: 'Prescription',
            quantity: 1,
            unitPrice: c.totalAmount || 0,
            lineTotal: c.totalAmount || 0,
            requiresPrescription: true,
          }];
        }

        return c as Order;
      });
    }
  });

  const { data: consultations = [], isLoading: isLoadingConsultations } = useQuery({
    queryKey: ['consultations'],
    queryFn: async () => {
      const { data } = await supabase.from('consultations').select('*');
      if (!data) return [];
      return data.map(c => {
        const cam = toCamel(c);
        cam.id = cam.consultationId;
        return cam as Consultation;
      });
    }
  });

  const INITIAL_SPECIALISTS: any[] = [];

  // Try to load from local storage first (simulating a DB config for now to avoid breaking the DB schema immediately)
  const [consultationConfigs, setConsultationConfigs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('almedix_consultation_configs');
      return saved ? JSON.parse(saved) : INITIAL_SPECIALISTS;
    } catch {
      return INITIAL_SPECIALISTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('almedix_consultation_configs', JSON.stringify(consultationConfigs));
  }, [consultationConfigs]);

  const updateConsultationConfig = (id: string, updates: any) => {
    setConsultationConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  
  const addConsultationConfig = (config: any) => {
    setConsultationConfigs(prev => [...prev, { ...config, id: Date.now().toString() }]);
  };

  const removeConsultationConfig = (id: string) => {
    setConsultationConfigs(prev => prev.filter(c => c.id !== id));
  };

  const DEFAULT_TIME_SLOTS = [
    '09:00 AM - 09:30 AM',
    '10:30 AM - 11:00 AM',
    '01:00 PM - 01:30 PM',
    '03:00 PM - 03:30 PM',
    '05:00 PM - 05:30 PM',
    '07:00 PM - 07:30 PM'
  ];

  const [consultationTimeSlots, setConsultationTimeSlots] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('almedix_consultation_slots');
      return saved ? JSON.parse(saved) : DEFAULT_TIME_SLOTS;
    } catch {
      return DEFAULT_TIME_SLOTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('almedix_consultation_slots', JSON.stringify(consultationTimeSlots));
  }, [consultationTimeSlots]);

  const updateConsultationTimeSlots = (slots: string[]) => {
    setConsultationTimeSlots(slots);
  };

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await supabase.from('supplier_invoices').select('*, supplier_invoice_payments(*)');
      if (!data) return [];
      return data.map(i => {
        const c = toCamel(i);
        c.id = c.invoiceId;
        c.payments = c.supplierInvoicePayments || [];
        return c as SupplierInvoice;
      });
    }
  });

  const isLoadingDb = isLoadingSuppliers || isLoadingDrugs || isLoadingOrders || isLoadingConsultations || isLoadingInvoices;

  // Cart in local storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('almedix_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('almedix_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const addToCart = (drug: DrugItem, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.drug.id === drug.id);
      if (existing) {
        return prev.map(item =>
          item.drug.id === drug.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { drug, quantity }];
    });
  };

  const removeFromCart = (drugId: string) => {
    setCart(prev => prev.filter(item => item.drug.id !== drugId));
  };

  const updateCartQuantity = (drugId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(drugId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.drug.id === drugId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.drug.sellingPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Real Database Orders
  const placeOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'orderDate' | 'trackingNumber'>): Promise<Order> => {
    const timestamp = Date.now();
    const orderId = `ord-${timestamp}`;
    const orderNumber = `ALM-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `TRK-ALM-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderDate = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      orderNumber,
      orderDate,
      trackingNumber,
    };

    const snakeOrder = toSnake(newOrder);
    snakeOrder.order_id = orderId;
    delete snakeOrder.id;
    delete snakeOrder.items;
    
    // Remove fields not in Supabase schema
    delete snakeOrder.prescription_uploaded;
    delete snakeOrder.prescription_file_name;
    delete snakeOrder.prescription_notes;
    delete snakeOrder.notes;

    // Piggyback notes and prescription status if present
    if (newOrder.notes || newOrder.prescriptionUploaded) {
      const rxFlag = newOrder.prescriptionUploaded ? '|||RX:true' : '';
      const notesStr = newOrder.notes ? `|||QUOTE_NOTES:${newOrder.notes}` : '';
      snakeOrder.delivery_address = `${snakeOrder.delivery_address || ''}${rxFlag}${notesStr}`;
    }

    const { error: orderError } = await supabase.from('orders').insert([snakeOrder]);
    if (orderError) {
      console.error("Order Insert Error:", orderError);
      alert(`Failed to save order: ${orderError.message}`);
      return newOrder;
    }

    const validItems = newOrder.items.filter(item => !item.drugId.startsWith('rx-'));
    const lineItems = validItems.map((item, idx) => ({
      line_item_id: `${orderId}-item-${idx}`,
      order_id: orderId,
      drug_id: item.drugId,
      drug_name: item.drugName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal
    }));

    if (lineItems.length > 0) {
      const { error: itemsError } = await supabase.from('order_line_items').insert(lineItems);
      if (itemsError) {
        console.error("Line Items Insert Error:", itemsError);
      }
    }

    // Deduct stock in Supabase
    for (const item of newOrder.items) {
      const drug = drugs.find(d => d.id === item.drugId);
      if (drug) {
        const newStock = Math.max(0, drug.stockLevel - item.quantity);
        await supabase.from('drugs').update({ stock_level: newStock }).eq('drug_id', item.drugId);
      }
    }

    clearCart();
    await queryClient.invalidateQueries(); // refresh
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus): Promise<void> => {
    const payload: any = { order_status: status };
    if (paymentStatus) {
      payload.payment_status = paymentStatus;
    }
    await supabase.from('orders').update(payload).eq('order_id', orderId);
    await queryClient.invalidateQueries();
  };

  const deleteOrder = async (orderId: string): Promise<void> => {
    // Delete line items first to avoid foreign key violations, though Supabase might cascade
    await supabase.from('order_line_items').delete().eq('order_id', orderId);
    await supabase.from('orders').delete().eq('order_id', orderId);
    await queryClient.invalidateQueries();
  };

  const quotePrescriptionOrder = async (
    orderId: string, 
    newItems: any[], 
    subtotal: number, 
    deliveryFee: number, 
    totalAmount: number, 
    notes?: string
  ): Promise<void> => {
    // Fetch the current order to get its delivery address
    const existingOrder = orders.find(o => o.id === orderId);
    const baseAddress = existingOrder?.deliveryAddress?.split('|||QUOTE_NOTES:')[0] || '';
    
    // Piggyback the notes onto delivery_address since the schema doesn't have a notes column
    const appendedAddress = notes ? `${baseAddress}|||QUOTE_NOTES:${notes}` : baseAddress;

    // Update order amounts and status to 'Awaiting Payment'
    const payload: any = {
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      order_status: 'Awaiting Payment',
      delivery_address: appendedAddress
    };
    
    await supabase.from('orders').update(payload).eq('order_id', orderId);

    // Delete old dummy line items for this order
    await supabase.from('order_line_items').delete().eq('order_id', orderId);

    // Insert actual line items, filtering out dummy rx items that cause FK violations
    const validItems = newItems.filter(item => !item.drugId.startsWith('rx-'));
    const lineItems = validItems.map((item, idx) => ({
      line_item_id: `${orderId}-item-${Date.now()}-${idx}`,
      order_id: orderId,
      drug_id: item.drugId,
      drug_name: item.drugName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal
    }));
    
    if (lineItems.length > 0) {
      await supabase.from('order_line_items').insert(lineItems);
    }
    
    await queryClient.invalidateQueries();
  };

  // Consultations
  const bookConsultation = async (
    consultationData: Omit<Consultation, 'id' | 'referenceNumber' | 'createdAt' | 'status'>
  ): Promise<Consultation> => {
    const timestamp = Date.now();
    const id = `con-${timestamp}`;
    const referenceNumber = `REF-${Math.floor(10000 + Math.random() * 90000)}`;
    const createdAt = new Date().toISOString();

    const newConsultation: Consultation = {
      ...consultationData,
      id,
      referenceNumber,
      createdAt,
      status: 'Scheduled',
    };

    const snakeCon = toSnake(newConsultation);
    snakeCon.consultation_id = id;
    
    // Remove fields not in schema
    delete snakeCon.id;
    delete snakeCon.patient_email;
    delete snakeCon.prescription_recommendation;
    delete snakeCon.assigned_staff_id;
    delete snakeCon.assigned_staff_name;

    const { error } = await supabase.from('consultations').insert([snakeCon]);
    if (error) {
      console.error("Consultation Insert Error:", error);
      alert(`Failed to save consultation: ${error.message}`);
    }
    await queryClient.invalidateQueries();
    return newConsultation;
  };

  const updateConsultationStatus = async (
    consultationId: string, 
    status: ConsultationStatus, 
    notes?: string, 
    rx?: string,
    assignedStaffId?: string,
    assignedStaffName?: string
  ): Promise<void> => {
    const payload: any = { status };
    
    // Concatenate notes, rx, and staff assignment into pharmacist_notes since those columns don't exist
    let finalNotes = notes || '';
    if (rx) finalNotes += `\n\nPrescription Recommendation:\n${rx}`;
    if (assignedStaffName) finalNotes += `\n\nAssigned to: ${assignedStaffName}`;
    
    if (finalNotes) payload.pharmacist_notes = finalNotes.trim();
    
    try {
      const { error } = await supabase.from('consultations').update(payload).eq('consultation_id', consultationId);
      if (error) {
        console.error("Consultation Update Error:", error);
        alert(`Failed to update consultation: ${error.message}`);
      }
    } catch (e) {
      console.error("DB update exception:", e);
    }
    await queryClient.invalidateQueries();
  };

  // Inventory
  const addDrug = async (drugData: Omit<DrugItem, 'id'>): Promise<DrugItem> => {
    const id = `drug-${Date.now()}`;
    const newDrug: DrugItem = { ...drugData, id };
    
    const snakeDrug = toSnake(newDrug);
    snakeDrug.drug_id = id;
    delete snakeDrug.id;
    delete snakeDrug.supplier_name; // relation
    
    // Remove fields not in Supabase schema to prevent insert errors
    delete snakeDrug.description;
    delete snakeDrug.usage_instructions;
    delete snakeDrug.storage_condition;

    const { error } = await supabase.from('drugs').insert([snakeDrug]);
    if (error) {
      console.error("Error adding drug:", error);
      alert(`Failed to add medicine: ${error.message}`);
    } else {
      await queryClient.invalidateQueries();
    }
    return newDrug;
  };

  const updateDrug = async (id: string, updates: Partial<DrugItem>): Promise<void> => {
    const snakeUpdates = toSnake(updates);
    delete snakeUpdates.id;
    delete snakeUpdates.supplier_name;
    delete snakeUpdates.description;
    delete snakeUpdates.usage_instructions;
    delete snakeUpdates.storage_condition;

    await supabase.from('drugs').update(snakeUpdates).eq('drug_id', id);
    await queryClient.invalidateQueries();
  };

  const adjustDrugStock = async (id: string, delta: number, reason: string): Promise<void> => {
    const drug = drugs.find(d => d.id === id);
    if (!drug) return;
    const newLevel = Math.max(0, drug.stockLevel + delta);
    await supabase.from('drugs').update({ stock_level: newLevel }).eq('drug_id', id);
    await queryClient.invalidateQueries();
  };

  const deleteDrug = async (id: string): Promise<void> => {
    await supabase.from('drugs').delete().eq('drug_id', id);
    await queryClient.invalidateQueries();
  };

  // Suppliers & Invoices
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'totalPurchased' | 'totalPaid' | 'outstandingBalance'>): Promise<Supplier> => {
    const id = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id,
      totalPurchased: 0,
      totalPaid: 0,
      outstandingBalance: 0,
    };
    
    const snakeSup = toSnake(newSupplier);
    snakeSup.supplier_id = id;
    snakeSup.supplier_code = snakeSup.code;
    delete snakeSup.code;
    delete snakeSup.id;

    const { error } = await supabase.from('suppliers').insert([snakeSup]);
    if (error) {
      console.error("Error adding supplier:", error);
      alert(`Failed to add supplier: ${error.message}`);
    } else {
      await queryClient.invalidateQueries();
    }
    return newSupplier;
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>): Promise<void> => {
    const snakeUpdates = toSnake(updates);
    delete snakeUpdates.id;
    if (snakeUpdates.code) {
      snakeUpdates.supplier_code = snakeUpdates.code;
      delete snakeUpdates.code;
    }
    await supabase.from('suppliers').update(snakeUpdates).eq('supplier_id', id);
    await queryClient.invalidateQueries();
  };

  const addSupplierInvoice = async (
    invoiceData: Omit<SupplierInvoice, 'id' | 'status' | 'amountPaid' | 'balanceDue' | 'payments'>
  ): Promise<SupplierInvoice> => {
    const id = `inv-${Date.now()}`;
    const newInvoice: SupplierInvoice = {
      ...invoiceData,
      id,
      status: 'DUE_SOON',
      amountPaid: 0,
      balanceDue: invoiceData.totalAmount,
      payments: [],
    };
    
    const snakeInv = toSnake(newInvoice);
    snakeInv.invoice_id = id;
    delete snakeInv.id;
    delete snakeInv.payments;

    await supabase.from('supplier_invoices').insert([snakeInv]);
    await queryClient.invalidateQueries();
    return newInvoice;
  };

  const recordInvoicePayment = async (invoiceId: string, payment: Omit<PaymentRecord, 'id'>): Promise<void> => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const newPaymentRecord: PaymentRecord = {
      ...payment,
      id: `pay-${Date.now()}`,
    };

    const newAmountPaid = invoice.amountPaid + payment.amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newAmountPaid);
    let newStatus: InvoicePaymentStatus = 'DUE_SOON';
    if (newBalanceDue === 0) newStatus = 'PAID';
    else if (newAmountPaid > 0) newStatus = 'PARTIAL';

    const snakePayment = toSnake(newPaymentRecord);
    snakePayment.payment_id = newPaymentRecord.id;
    snakePayment.invoice_id = invoiceId;
    delete snakePayment.id;

    await supabase.from('supplier_invoice_payments').insert([snakePayment]);
    await supabase.from('supplier_invoices').update({
      amount_paid: newAmountPaid,
      balance_due: newBalanceDue,
      status: newStatus
    }).eq('invoice_id', invoiceId);
    
    await queryClient.invalidateQueries();
  };

  const deleteSupplierInvoice = async (invoiceId: string): Promise<void> => {
    await supabase.from('supplier_invoices').delete().eq('invoice_id', invoiceId);
    await queryClient.invalidateQueries();
  };

  return (
    <PharmacyContext.Provider
      value={{
        drugs,
        suppliers,
        invoices,
        orders,
        consultations,
        cart,
        isLoadingDb,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        quotePrescriptionOrder,
        bookConsultation,
        updateConsultationStatus,
        consultationConfigs,
        updateConsultationConfig,
        addConsultationConfig,
        removeConsultationConfig,
        consultationTimeSlots,
        updateConsultationTimeSlots,
        addDrug,
        updateDrug,
        adjustDrugStock,
        deleteDrug,
        addSupplier,
        updateSupplier,
        addSupplierInvoice,
        recordInvoicePayment,
        deleteSupplierInvoice,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
