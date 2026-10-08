import { DrugItem, Supplier, SupplierInvoice, Order, Consultation } from '../types/pharmacy';
import { calculateMargin, getDaysRemaining } from './formatters';

// Helper to escape CSV cell values
const escapeCsvCell = (val: unknown): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Generic CSV builder
export const buildCsvString = (headers: string[], rows: (string | number | boolean)[][]): string => {
  const headerLine = headers.map(h => escapeCsvCell(h)).join(',');
  const rowLines = rows.map(row => row.map(cell => escapeCsvCell(cell)).join(','));
  return [headerLine, ...rowLines].join('\r\n');
};

// Download file trigger
export const triggerDownload = (content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 1. Export Inventory Stock for Excel / Power BI
export const generateInventoryCsv = (drugs: DrugItem[]): string => {
  const headers = [
    'drug_id',
    'sku',
    'drug_name',
    'generic_name',
    'brand',
    'category',
    'dosage_form',
    'strength',
    'pack_size',
    'cost_price_ngn',
    'selling_price_ngn',
    'gross_margin_pct',
    'stock_level',
    'min_reorder_level',
    'stock_status',
    'batch_number',
    'expiry_date',
    'supplier_name',
    'nafdac_reg_no',
    'requires_prescription'
  ];

  const rows = drugs.map(d => {
    let stockStatus = 'In Stock';
    if (d.stockLevel === 0) stockStatus = 'Out of Stock';
    else if (d.stockLevel <= d.minStockLevel) stockStatus = 'Low Stock';

    return [
      d.id,
      d.sku,
      d.name,
      d.genericName,
      d.brand,
      d.category,
      d.dosageForm,
      d.strength,
      d.packSize,
      d.costPrice,
      d.sellingPrice,
      calculateMargin(d.costPrice, d.sellingPrice),
      d.stockLevel,
      d.minStockLevel,
      stockStatus,
      d.batchNumber,
      d.expiryDate,
      d.supplierName,
      d.nafdacRegNo,
      d.requiresPrescription ? 'Yes' : 'No'
    ];
  });

  return buildCsvString(headers, rows);
};

// 2. Export Supplier Payables & Debt for Excel / Power BI
export const generateSupplierPayablesCsv = (invoices: SupplierInvoice[], suppliers: Supplier[]): string => {
  const headers = [
    'invoice_id',
    'invoice_number',
    'supplier_id',
    'supplier_name',
    'purchase_date',
    'due_date',
    'total_amount_ngn',
    'amount_paid_ngn',
    'balance_due_ngn',
    'payment_status',
    'is_overdue',
    'days_due_or_overdue',
    'aging_bucket',
    'supplier_contact',
    'supplier_phone',
    'bank_name',
    'account_number'
  ];

  const supplierMap = new Map(suppliers.map(s => [s.id, s]));

  const rows = invoices.map(inv => {
    const sup = supplierMap.get(inv.supplierId);
    const { days, isOverdue } = getDaysRemaining(inv.dueDate);
    
    let agingBucket = 'Paid in Full';
    if (inv.balanceDue > 0) {
      if (!isOverdue) agingBucket = 'Current (Not Due)';
      else if (days <= 30) agingBucket = '1 - 30 Days Overdue';
      else if (days <= 60) agingBucket = '31 - 60 Days Overdue';
      else agingBucket = '60+ Days Overdue';
    }

    return [
      inv.id,
      inv.invoiceNumber,
      inv.supplierId,
      inv.supplierName,
      inv.purchaseDate,
      inv.dueDate,
      inv.totalAmount,
      inv.amountPaid,
      inv.balanceDue,
      inv.status,
      isOverdue ? 'Yes' : 'No',
      isOverdue ? -days : days,
      agingBucket,
      sup?.contactPerson || '',
      sup?.phone || '',
      sup?.bankName || '',
      sup?.accountNumber || ''
    ];
  });

  return buildCsvString(headers, rows);
};

// 3. Export Sales Orders
export const generateOrdersCsv = (orders: Order[]): string => {
  const headers = [
    'order_id',
    'order_number',
    'order_date',
    'customer_name',
    'customer_phone',
    'customer_email',
    'delivery_address',
    'delivery_city',
    'order_status',
    'payment_status',
    'payment_method',
    'items_count',
    'subtotal_ngn',
    'delivery_fee_ngn',
    'total_amount_ngn',
    'tracking_number',
    'prescription_uploaded'
  ];

  const rows = orders.map(o => [
    o.id,
    o.orderNumber,
    o.orderDate,
    o.customerName,
    o.customerPhone,
    o.customerEmail,
    o.deliveryAddress,
    o.deliveryCity,
    o.orderStatus,
    o.paymentStatus,
    o.paymentMethod,
    o.items.reduce((acc, i) => acc + i.quantity, 0),
    o.subtotal,
    o.deliveryFee,
    o.totalAmount,
    o.trackingNumber,
    o.prescriptionUploaded ? 'Yes' : 'No'
  ]);

  return buildCsvString(headers, rows);
};

// 4. Export Granular Order Line Items (for basket & revenue analysis)
export const generateOrderLineItemsCsv = (orders: Order[]): string => {
  const headers = [
    'order_number',
    'order_date',
    'drug_id',
    'drug_name',
    'dosage_form',
    'strength',
    'unit_price_ngn',
    'quantity',
    'line_total_ngn',
    'customer_name',
    'payment_status'
  ];

  const rows: (string | number | boolean)[][] = [];
  orders.forEach(order => {
    order.items.forEach(item => {
      rows.push([
        order.orderNumber,
        order.orderDate,
        item.drugId,
        item.drugName,
        item.dosageForm,
        item.strength,
        item.unitPrice,
        item.quantity,
        item.lineTotal,
        order.customerName,
        order.paymentStatus
      ]);
    });
  });

  return buildCsvString(headers, rows);
};

// 5. Export Consultations Schedule
export const generateConsultationsCsv = (consultations: Consultation[]): string => {
  const headers = [
    'consultation_id',
    'reference_number',
    'appointment_date',
    'appointment_time',
    'patient_name',
    'patient_age',
    'patient_gender',
    'patient_phone',
    'specialist_type',
    'consultation_format',
    'status',
    'consultation_fee_ngn',
    'payment_status',
    'symptoms_summary',
    'pharmacist_notes',
    'created_at'
  ];

  const rows = consultations.map(c => [
    c.id,
    c.referenceNumber,
    c.appointmentDate,
    c.appointmentTime,
    c.patientName,
    c.patientAge,
    c.patientGender,
    c.patientPhone,
    c.specialistType,
    c.consultationFormat,
    c.status,
    c.fee,
    c.paymentStatus,
    c.symptomsSummary,
    c.pharmacistNotes || '',
    c.createdAt
  ]);

  return buildCsvString(headers, rows);
};

// 6. Generate Complete SQL Schema and INSERT script for SQL / PostgreSQL / MySQL
export const generateCompleteSqlDump = (
  drugs: DrugItem[],
  suppliers: Supplier[],
  invoices: SupplierInvoice[],
  orders: Order[],
  consultations: Consultation[]
): string => {
  const escapeSql = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return `${val}`;
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  const sqlBlocks: string[] = [];

  sqlBlocks.push(`-- ====================================================================
-- ALMEDIX PHARMACY & HEALTHCARE ANALYTICS DATABASE DUMP
-- Generated for Data Analyst Power BI / SQL / PostgreSQL / MySQL ingest
-- Date: ${new Date().toISOString()}
-- ====================================================================

-- 1. DROP EXISTING TABLES (IF ANY)
DROP TABLE IF EXISTS order_line_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS supplier_invoice_items CASCADE;
DROP TABLE IF EXISTS supplier_invoice_payments CASCADE;
DROP TABLE IF EXISTS supplier_invoices CASCADE;
DROP TABLE IF EXISTS drugs CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;

-- 2. CREATE SCHEMAS & TABLES

CREATE TABLE suppliers (
    supplier_id VARCHAR(50) PRIMARY KEY,
    supplier_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    payment_terms_days INT DEFAULT 30,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(150),
    total_purchased DECIMAL(14, 2) DEFAULT 0,
    total_paid DECIMAL(14, 2) DEFAULT 0,
    outstanding_balance DECIMAL(14, 2) DEFAULT 0
);

CREATE TABLE drugs (
    drug_id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    brand VARCHAR(150),
    category VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    pack_size VARCHAR(100),
    cost_price DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    stock_level INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 10,
    max_stock_level INT NOT NULL DEFAULT 100,
    batch_number VARCHAR(100),
    expiry_date DATE,
    supplier_id VARCHAR(50) REFERENCES suppliers(supplier_id),
    requires_prescription BOOLEAN DEFAULT FALSE,
    nafdac_reg_no VARCHAR(100)
);

CREATE TABLE supplier_invoices (
    invoice_id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(supplier_id),
    supplier_name VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(14, 2) NOT NULL,
    amount_paid DECIMAL(14, 2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(14, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    notes TEXT
);

CREATE TABLE supplier_invoice_payments (
    payment_id VARCHAR(50) PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES supplier_invoices(invoice_id),
    payment_date DATE NOT NULL,
    amount DECIMAL(14, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference VARCHAR(100)
);

CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(100) NOT NULL UNIQUE,
    order_date TIMESTAMP NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50),
    customer_email VARCHAR(150),
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    order_status VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    delivery_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    tracking_number VARCHAR(100)
);

CREATE TABLE order_line_items (
    line_item_id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(order_id),
    drug_id VARCHAR(50) NOT NULL REFERENCES drugs(drug_id),
    drug_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    line_total DECIMAL(12, 2) NOT NULL
);

CREATE TABLE consultations (
    consultation_id VARCHAR(50) PRIMARY KEY,
    reference_number VARCHAR(100) NOT NULL UNIQUE,
    patient_name VARCHAR(150) NOT NULL,
    patient_age INT,
    patient_gender VARCHAR(20),
    patient_phone VARCHAR(50),
    specialist_type VARCHAR(100) NOT NULL,
    consultation_format VARCHAR(50) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(50),
    symptoms_summary TEXT,
    status VARCHAR(50) NOT NULL,
    fee DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    pharmacist_notes TEXT,
    created_at TIMESTAMP
);
`);

  // Suppliers Inserts
  sqlBlocks.push(`-- 3. INSERT SUPPLIERS`);
  suppliers.forEach(s => {
    sqlBlocks.push(`INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES (${escapeSql(s.id)}, ${escapeSql(s.code)}, ${escapeSql(s.name)}, ${escapeSql(s.contactPerson)}, ${escapeSql(s.phone)}, ${escapeSql(s.email)}, ${escapeSql(s.address)}, ${escapeSql(s.city)}, ${s.paymentTermsDays}, ${escapeSql(s.bankName)}, ${escapeSql(s.accountNumber)}, ${escapeSql(s.accountName)}, ${s.totalPurchased}, ${s.totalPaid}, ${s.outstandingBalance});`);
  });

  // Drugs Inserts
  sqlBlocks.push(`\n-- 4. INSERT DRUGS INVENTORY`);
  drugs.forEach(d => {
    sqlBlocks.push(`INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES (${escapeSql(d.id)}, ${escapeSql(d.sku)}, ${escapeSql(d.name)}, ${escapeSql(d.genericName)}, ${escapeSql(d.brand)}, ${escapeSql(d.category)}, ${escapeSql(d.dosageForm)}, ${escapeSql(d.strength)}, ${escapeSql(d.packSize)}, ${d.costPrice}, ${d.sellingPrice}, ${d.stockLevel}, ${d.minStockLevel}, ${d.maxStockLevel}, ${escapeSql(d.batchNumber)}, ${escapeSql(d.expiryDate)}, ${escapeSql(d.supplierId)}, ${d.requiresPrescription}, ${escapeSql(d.nafdacRegNo)});`);
  });

  // Invoices Inserts
  sqlBlocks.push(`\n-- 5. INSERT SUPPLIER INVOICES`);
  invoices.forEach(inv => {
    sqlBlocks.push(`INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES (${escapeSql(inv.id)}, ${escapeSql(inv.invoiceNumber)}, ${escapeSql(inv.supplierId)}, ${escapeSql(inv.supplierName)}, ${escapeSql(inv.purchaseDate)}, ${escapeSql(inv.dueDate)}, ${inv.totalAmount}, ${inv.amountPaid}, ${inv.balanceDue}, ${escapeSql(inv.status)}, ${escapeSql(inv.notes)});`);
    
    inv.payments.forEach(p => {
      sqlBlocks.push(`INSERT INTO supplier_invoice_payments (payment_id, invoice_id, payment_date, amount, payment_method, reference) VALUES (${escapeSql(p.id)}, ${escapeSql(inv.id)}, ${escapeSql(p.date)}, ${p.amount}, ${escapeSql(p.paymentMethod)}, ${escapeSql(p.reference)});`);
    });
  });

  // Orders Inserts
  sqlBlocks.push(`\n-- 6. INSERT ORDERS & LINE ITEMS`);
  orders.forEach(o => {
    sqlBlocks.push(`INSERT INTO orders (order_id, order_number, order_date, customer_name, customer_phone, customer_email, delivery_address, delivery_city, order_status, payment_status, payment_method, subtotal, delivery_fee, total_amount, tracking_number) VALUES (${escapeSql(o.id)}, ${escapeSql(o.orderNumber)}, ${escapeSql(o.orderDate)}, ${escapeSql(o.customerName)}, ${escapeSql(o.customerPhone)}, ${escapeSql(o.customerEmail)}, ${escapeSql(o.deliveryAddress)}, ${escapeSql(o.deliveryCity)}, ${escapeSql(o.orderStatus)}, ${escapeSql(o.paymentStatus)}, ${escapeSql(o.paymentMethod)}, ${o.subtotal}, ${o.deliveryFee}, ${o.totalAmount}, ${escapeSql(o.trackingNumber)});`);

    o.items.forEach((item, idx) => {
      sqlBlocks.push(`INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES (${escapeSql(`${o.id}-item-${idx}`)}, ${escapeSql(o.id)}, ${escapeSql(item.drugId)}, ${escapeSql(item.drugName)}, ${item.quantity}, ${item.unitPrice}, ${item.lineTotal});`);
    });
  });

  // Consultations Inserts
  sqlBlocks.push(`\n-- 7. INSERT CONSULTATIONS`);
  consultations.forEach(c => {
    sqlBlocks.push(`INSERT INTO consultations (consultation_id, reference_number, patient_name, patient_age, patient_gender, patient_phone, specialist_type, consultation_format, appointment_date, appointment_time, symptoms_summary, status, fee, payment_status, pharmacist_notes, created_at) VALUES (${escapeSql(c.id)}, ${escapeSql(c.referenceNumber)}, ${escapeSql(c.patientName)}, ${c.patientAge}, ${escapeSql(c.patientGender)}, ${escapeSql(c.patientPhone)}, ${escapeSql(c.specialistType)}, ${escapeSql(c.consultationFormat)}, ${escapeSql(c.appointmentDate)}, ${escapeSql(c.appointmentTime)}, ${escapeSql(c.symptomsSummary)}, ${escapeSql(c.status)}, ${c.fee}, ${escapeSql(c.paymentStatus)}, ${escapeSql(c.pharmacistNotes)}, ${escapeSql(c.createdAt)});`);
  });

  sqlBlocks.push(`\n-- ====================================================================
-- ANALYTICAL QUERIES FOR DATA ANALYST / POWER BI IMPORT
-- ====================================================================

-- Query A: Supplier Accounts Payable Aging Report
-- SELECT 
--     supplier_name,
--     invoice_number,
--     due_date,
--     balance_due,
--     CASE 
--         WHEN CURRENT_DATE > due_date THEN (CURRENT_DATE - due_date)
--         ELSE 0 
--     END AS days_overdue
-- FROM supplier_invoices
-- WHERE balance_due > 0
-- ORDER BY due_date ASC;

-- Query B: Pharmacy Inventory Valuation & Margin
-- SELECT 
--     category,
--     COUNT(drug_id) AS total_items,
--     SUM(stock_level * cost_price) AS total_cost_value,
--     SUM(stock_level * selling_price) AS potential_retail_value,
--     ROUND(AVG(((selling_price - cost_price) / selling_price) * 100), 2) AS avg_margin_pct
-- FROM drugs
-- GROUP BY category;
`);

  return sqlBlocks.join('\n');
};
