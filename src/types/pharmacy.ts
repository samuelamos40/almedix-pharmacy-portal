export type DrugCategory = 
  | 'Prescription'
  | 'Over-the-Counter'
  | 'Chronic Care'
  | 'Mother & Child'
  | 'Vitamins & Supplements'
  | 'Medical Devices'
  | 'First Aid & Wound Care';

export type DosageForm = 
  | 'Tablets'
  | 'Capsules'
  | 'Syrup'
  | 'Suspension'
  | 'Inhaler'
  | 'Injectable'
  | 'Ointment / Cream'
  | 'Drops'
  | 'Medical Device';

export interface DrugItem {
  id: string;
  sku: string;
  name: string;
  genericName: string;
  brand: string;
  category: DrugCategory;
  dosageForm: DosageForm;
  strength: string;
  packSize: string;
  costPrice: number;       // What the pharmacy buys it for (in NGN ₦)
  sellingPrice: number;    // What the pharmacy sells it for (in NGN ₦)
  stockLevel: number;      // Current units in store
  minStockLevel: number;   // Reorder threshold
  maxStockLevel: number;
  batchNumber: string;
  expiryDate: string;      // YYYY-MM-DD
  supplierId: string;
  supplierName: string;
  requiresPrescription: boolean;
  nafdacRegNo: string;
  description: string;
  usageInstructions: string;
  storageCondition: string;
  sideEffects?: string;
  imageUrl?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentTermsDays: number; // e.g. 14, 30, 45, 60 days
  bankName: string;
  accountNumber: string;
  accountName: string;
  totalPurchased: number;
  totalPaid: number;
  outstandingBalance: number;
  notes?: string;
}

export type InvoicePaymentStatus = 'PAID' | 'PARTIAL' | 'DUE_SOON' | 'OVERDUE';

export interface InvoiceItem {
  drugId: string;
  drugName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Cash';
  reference: string;
  notes?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;   // YYYY-MM-DD
  dueDate: string;        // YYYY-MM-DD
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoicePaymentStatus;
  items: InvoiceItem[];
  payments: PaymentRecord[];
  notes?: string;
}

export interface OrderItem {
  drugId: string;
  drugName: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  requiresPrescription: boolean;
}

export type OrderStatus = 'Pending' | 'Awaiting Payment' | 'Dispensed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Pending Cash on Delivery' | 'Pending Bank Transfer';
export type PaymentMethod = 'Debit Card' | 'Direct Bank Transfer' | 'Cash on Delivery' | 'HMO Insurance';

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  prescriptionUploaded?: boolean;
  prescriptionFileName?: string;
  prescriptionNotes?: string;
  trackingNumber: string;
  notes?: string;
}

export type SpecialistType = string;

export interface ConsultationTypeConfig {
  id: string;
  type: string;
  title: string;
  fee: number;
  desc: string;
}

export type ConsultationFormat = 'Video Call' | 'Voice Call' | 'In-Clinic Physical' | 'WhatsApp Tele-Chat';
export type ConsultationStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Consultation {
  id: string;
  referenceNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  patientEmail: string;
  specialistType: SpecialistType;
  consultationFormat: ConsultationFormat;
  appointmentDate: string;
  appointmentTime: string;
  symptomsSummary: string;
  status: ConsultationStatus;
  fee: number;
  paymentStatus: 'Paid' | 'Pending';
  pharmacistNotes?: string;
  prescriptionRecommendation?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
}

export interface CartItem {
  drug: DrugItem;
  quantity: number;
}

