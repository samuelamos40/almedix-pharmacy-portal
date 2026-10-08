-- ====================================================================
-- ALMEDIX PHARMACY & HEALTHCARE ANALYTICS DATABASE DUMP
-- Generated for Data Analyst Power BI / SQL / PostgreSQL / MySQL ingest
-- Date: 2026-10-07T01:06:01.799Z
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

-- 3. INSERT SUPPLIERS
INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES ('sup-1', 'SUP-FIDSON', 'Fidson Healthcare Plc', 'Mr. Babatunde Alabi', '+234 803 445 1290', 'babatunde.alabi@fidsonhealthcare.ng', '268 Ikorodu Road, Obanikoro', 'Lagos', 30, 'Zenith Bank', '1012384792', 'Fidson Healthcare Distribution', 4850000, 3600000, 1250000);
INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES ('sup-2', 'SUP-EMZOR', 'Emzor Pharmaceutical Industries Ltd', 'Pharm. Ngozi Okeke', '+234 802 312 9845', 'n.okeke@emzorpharma.com', 'Plot 3C, Block A, Ajao Estate', 'Lagos', 21, 'Access Bank', '0039281745', 'Emzor Pharma Distribution Ltd', 3420000, 2570000, 850000);
INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES ('sup-3', 'SUP-CHI', 'Chi Pharmaceuticals Ltd', 'Alhaji Musa Danjuma', '+234 814 887 6321', 'musa.d@chipharm.ng', '14 Chivita Avenue, Ajao Estate', 'Lagos', 45, 'First Bank of Nigeria', '2023948512', 'Chi Pharmaceuticals Ltd', 6100000, 4300000, 1800000);
INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES ('sup-4', 'SUP-MAYBAKER', 'May & Baker Nigeria Plc', 'Mrs. Folake Adeyemi', '+234 805 776 5432', 'f.adeyemi@may-baker.com', '1 May & Baker Avenue, Ikeja', 'Lagos', 30, 'Guaranty Trust Bank (GTB)', '0112938461', 'May & Baker Nig Sales', 2900000, 2900000, 0);
INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES ('sup-5', 'SUP-SWIPHA', 'Swiss Pharma Nigeria Ltd (Swipha)', 'Dr. Chukwudi Eze', '+234 809 112 3344', 'c.eze@swiphanigeria.com', '5 Dopemu Road, Agege Industrial Area', 'Lagos', 14, 'Stanbic IBTC', '0029384756', 'Swiss Pharma Nig Commercial', 3750000, 3050000, 700000);
INSERT INTO suppliers (supplier_id, supplier_code, name, contact_person, phone, email, address, city, payment_terms_days, bank_name, account_number, account_name, total_purchased, total_paid, outstanding_balance) VALUES ('sup-6', 'SUP-EVANS', 'Evans Therapeutics Ltd', 'Pharm. Kemi Olatunji', '+234 803 998 7765', 'kemi.o@evanstherapeutics.com', 'Motorways Complex, 1 Commercial Avenue, Alausa', 'Lagos', 30, 'United Bank for Africa (UBA)', '1092837465', 'Evans Therapeutics Ltd', 1850000, 1400000, 450000);

-- 4. INSERT DRUGS INVENTORY
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-1', 'DRG-COA-01', 'Coartem 80/480mg Forte', 'Artemether 80mg + Lumefantrine 480mg', 'Novartis / Fidson', 'Prescription', 'Tablets', '80mg / 480mg', 'Pack of 6 Tablets', 3500, 4800, 142, 40, 300, 'BT-2026-COA9', '2028-06-30', 'sup-1', true, 'A4-0193');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-2', 'DRG-GLU-02', 'Glucophage 500mg', 'Metformin Hydrochloride', 'Merck / Chi Pharma', 'Chronic Care', 'Tablets', '500mg', 'Box of 100 Tablets (10 Blisters)', 4200, 5800, 68, 30, 150, 'BT-2025-GLU4', '2027-11-15', 'sup-3', true, '04-1844');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-3', 'DRG-NOR-03', 'Norvasc 5mg', 'Amlodipine Besylate', 'Pfizer / Chi Pharma', 'Chronic Care', 'Tablets', '5mg', 'Pack of 30 Tablets', 5500, 7500, 44, 25, 120, 'BT-2026-NOR1', '2027-09-30', 'sup-3', true, '04-0322');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-4', 'DRG-PCM-04', 'Emzor Paracetamol 500mg', 'Acetaminophen / Paracetamol', 'Emzor', 'Over-the-Counter', 'Tablets', '500mg', 'Pack of 96 Caplets (8x12)', 950, 1500, 230, 50, 500, 'BT-2026-EMZ8', '2028-04-30', 'sup-2', false, '04-0112');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-5', 'DRG-VTC-05', 'Redoxon Vitamin C 1000mg + Zinc', 'Ascorbic Acid 1000mg + Zinc 10mg', 'Bayer / Swipha', 'Vitamins & Supplements', 'Tablets', '1000mg / 10mg', 'Tube of 15 Effervescent Tablets (Orange Flavour)', 2800, 3900, 88, 30, 200, 'BT-2026-RED7', '2027-12-31', 'sup-5', false, 'A4-5120');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-6', 'DRG-CIP-06', 'Ciprotab 500mg', 'Ciprofloxacin Hydrochloride', 'Fidson Healthcare', 'Prescription', 'Tablets', '500mg', 'Pack of 14 Tablets (2x7)', 2800, 4200, 35, 30, 150, 'BT-2025-CIP3', '2027-08-30', 'sup-1', true, '04-0981');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-7', 'DRG-AUG-07', 'Augmentin 625mg', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'GSK / Fidson', 'Prescription', 'Tablets', '625mg', 'Pack of 14 Tablets', 6250, 8900, 18, 25, 100, 'BT-2026-AUG2', '2027-04-30', 'sup-1', true, '04-0019');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-8', 'DRG-VEN-08', 'Ventolin Evohaler 100mcg', 'Salbutamol Sulfate', 'GSK / Chi Pharma', 'Chronic Care', 'Inhaler', '100mcg/actuation', 'Pressurised Inhalation (200 actuations)', 4500, 6500, 52, 20, 120, 'BT-2026-VEN5', '2028-02-28', 'sup-3', true, '04-0231');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-9', 'DRG-OME-09', 'Omeprazole 20mg Capsules', 'Omeprazole', 'Swipha', 'Over-the-Counter', 'Capsules', '20mg', 'Box of 28 Gastro-Resistant Capsules', 2000, 3200, 75, 20, 160, 'BT-2026-OME1', '2027-10-31', 'sup-5', false, '04-3329');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-10', 'DRG-PED-10', 'Emzor Paracetamol Pediatric Drops 15ml', 'Paracetamol 100mg/ml', 'Emzor', 'Mother & Child', 'Drops', '100mg/ml', '15ml Dropper Bottle', 1350, 2100, 94, 25, 180, 'BT-2026-PD12', '2028-01-15', 'sup-2', false, '04-0115');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-11', 'DRG-VIT-11', 'Pregnacare Original Antenatal Care', '19 Essential Vitamins, Minerals & 400mcg Folic Acid', 'Vitabiotics / Evans', 'Mother & Child', 'Tablets', 'Comprehensive Multinutrient', 'Box of 30 Tablets (1 Month Supply)', 5800, 8500, 38, 20, 100, 'BT-2026-PRG4', '2027-11-30', 'sup-6', false, '04-7128');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-12', 'DRG-LON-12', 'Lonart DS (Double Strength)', 'Artemether 40mg + Lumefantrine 240mg', 'Bliss GVS / Chi Pharma', 'Prescription', 'Tablets', '40mg / 240mg', 'Pack of 12 Tablets', 3200, 4600, 62, 25, 150, 'BT-2026-LON9', '2028-03-31', 'sup-3', true, '04-2190');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-13', 'DEV-ACC-13', 'Accu-Chek Instant Blood Glucose Kit', 'Blood Glucose Monitoring System', 'Roche / Evans', 'Medical Devices', 'Medical Device', 'Instant Wireless Sync', 'Meter + 10 Test Strips + Lancing Device + 10 Lancets', 22000, 28500, 14, 15, 50, 'DEV-2026-ACC9', '2029-12-31', 'sup-6', false, '04-8931');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-14', 'DEV-OMR-14', 'Omron M2 Basic Blood Pressure Monitor', 'Automatic Upper Arm Digital BP Monitor', 'Omron / Evans', 'Medical Devices', 'Medical Device', 'Clinically Validated Intellisense', 'Device + Medium/Large Cuff (22-32cm) + Batteries', 26666, 34500, 11, 10, 40, 'DEV-2026-OMR3', '2030-12-31', 'sup-6', false, '04-9912');
INSERT INTO drugs (drug_id, sku, name, generic_name, brand, category, dosage_form, strength, pack_size, cost_price, selling_price, stock_level, min_stock_level, max_stock_level, batch_number, expiry_date, supplier_id, requires_prescription, nafdac_reg_no) VALUES ('drug-15', 'DRG-BET-15', 'Betadine Antiseptic Solution 60ml', 'Povidone Iodine 10% w/v', 'Mundipharma / May & Baker', 'First Aid & Wound Care', 'Drops', '10% w/v', '60ml Solution Bottle', 1800, 2800, 79, 25, 150, 'BT-2026-BET1', '2028-09-30', 'sup-4', false, '04-0199');

-- 5. INSERT SUPPLIER INVOICES
INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES ('inv-101', 'INV-FID-2026-089', 'sup-1', 'Fidson Healthcare Plc', '2026-09-02', '2026-10-02', 1250000, 500000, 750000, 'OVERDUE', 'Stock for Q3 anti-malarial campaign. Balance is overdue by 2 days.');
INSERT INTO supplier_invoice_payments (payment_id, invoice_id, payment_date, amount, payment_method, reference) VALUES ('pay-1', 'inv-101', '2026-09-15', 500000, 'Bank Transfer', 'TRF-FID-9921');
INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES ('inv-102', 'INV-FID-2026-104', 'sup-1', 'Fidson Healthcare Plc', '2026-09-20', '2026-10-20', 500000, 0, 500000, 'PARTIAL', 'Prescription amoxicillin replenishment. Due in 16 days.');
INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES ('inv-103', 'INV-EMZ-2026-442', 'sup-2', 'Emzor Pharmaceutical Industries Ltd', '2026-09-18', '2026-10-09', 850000, 0, 850000, 'DUE_SOON', 'Pediatric care stock batch. Payment due on Friday.');
INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES ('inv-104', 'INV-CHI-2026-781', 'sup-3', 'Chi Pharmaceuticals Ltd', '2026-08-25', '2026-10-09', 2600000, 800000, 1800000, 'DUE_SOON', 'Chronic care supply. Remainder ₦1,800,000 due on Oct 9.');
INSERT INTO supplier_invoice_payments (payment_id, invoice_id, payment_date, amount, payment_method, reference) VALUES ('pay-2', 'inv-104', '2026-09-05', 800000, 'Bank Transfer', 'TRF-CHI-8812');
INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES ('inv-105', 'INV-SWI-2026-219', 'sup-5', 'Swiss Pharma Nigeria Ltd (Swipha)', '2026-09-12', '2026-09-26', 1100000, 400000, 700000, 'OVERDUE', 'Overdue by 8 days. Call Dr. Chukwudi to arrange installment payment.');
INSERT INTO supplier_invoice_payments (payment_id, invoice_id, payment_date, amount, payment_method, reference) VALUES ('pay-3', 'inv-105', '2026-09-22', 400000, 'Bank Transfer', 'TRF-SWI-3301');
INSERT INTO supplier_invoices (invoice_id, invoice_number, supplier_id, supplier_name, purchase_date, due_date, total_amount, amount_paid, balance_due, status, notes) VALUES ('inv-106', 'INV-EVA-2026-092', 'sup-6', 'Evans Therapeutics Ltd', '2026-09-28', '2026-10-28', 950000, 500000, 450000, 'PARTIAL', 'Diagnostic devices stock. Balance due Oct 28.');
INSERT INTO supplier_invoice_payments (payment_id, invoice_id, payment_date, amount, payment_method, reference) VALUES ('pay-4', 'inv-106', '2026-09-29', 500000, 'Bank Transfer', 'TRF-EVA-5510');

-- 6. INSERT ORDERS & LINE ITEMS
INSERT INTO orders (order_id, order_number, order_date, customer_name, customer_phone, customer_email, delivery_address, delivery_city, order_status, payment_status, payment_method, subtotal, delivery_fee, total_amount, tracking_number) VALUES ('ord-1001', 'HEX-2026-1001', '2026-10-04 09:30', 'Amina Bello', '+234 802 918 2736', 'amina.bello@example.com', '15 Admiralty Way, Lekki Phase 1', 'Lagos', 'Dispensed', 'Paid', 'Debit Card', 13500, 1500, 15000, 'TRK-HEX-982110');
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1001-item-0', 'ord-1001', 'drug-1', 'Coartem 80/480mg Forte', 2, 4800, 9600);
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1001-item-1', 'ord-1001', 'drug-5', 'Redoxon Vitamin C 1000mg + Zinc', 1, 3900, 3900);
INSERT INTO orders (order_id, order_number, order_date, customer_name, customer_phone, customer_email, delivery_address, delivery_city, order_status, payment_status, payment_method, subtotal, delivery_fee, total_amount, tracking_number) VALUES ('ord-1002', 'HEX-2026-1002', '2026-10-04 11:15', 'Chinedu Obi', '+234 813 554 9921', 'chinedu.obi@example.com', '42 Isaac John Street, GRA Ikeja', 'Lagos', 'Out for Delivery', 'Paid', 'Direct Bank Transfer', 19100, 1500, 20600, 'TRK-HEX-982111');
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1002-item-0', 'ord-1002', 'drug-2', 'Glucophage 500mg', 2, 5800, 11600);
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1002-item-1', 'ord-1002', 'drug-3', 'Norvasc 5mg', 1, 7500, 7500);
INSERT INTO orders (order_id, order_number, order_date, customer_name, customer_phone, customer_email, delivery_address, delivery_city, order_status, payment_status, payment_method, subtotal, delivery_fee, total_amount, tracking_number) VALUES ('ord-1003', 'HEX-2026-1003', '2026-10-03 16:40', 'Blessing Adekunle', '+234 809 332 1188', 'blessing.a@example.com', 'Plot 7, Bishop Aboyade Cole St, Victoria Island', 'Lagos', 'Delivered', 'Paid', 'Debit Card', 19100, 1500, 20600, 'TRK-HEX-982109');
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1003-item-0', 'ord-1003', 'drug-11', 'Pregnacare Original Antenatal Care', 2, 8500, 17000);
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1003-item-1', 'ord-1003', 'drug-10', 'Emzor Paracetamol Pediatric Drops 15ml', 1, 2100, 2100);
INSERT INTO orders (order_id, order_number, order_date, customer_name, customer_phone, customer_email, delivery_address, delivery_city, order_status, payment_status, payment_method, subtotal, delivery_fee, total_amount, tracking_number) VALUES ('ord-1004', 'HEX-2026-1004', '2026-10-04 14:10', 'Ibrahim Danladi', '+234 805 441 8722', 'i.danladi@example.com', '22 Bourdillon Road, Ikoyi', 'Lagos', 'Pending', 'Pending Cash on Delivery', 'Cash on Delivery', 37500, 2000, 39500, 'TRK-HEX-982112');
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1004-item-0', 'ord-1004', 'drug-14', 'Omron M2 Basic Blood Pressure Monitor', 1, 34500, 34500);
INSERT INTO order_line_items (line_item_id, order_id, drug_id, drug_name, quantity, unit_price, line_total) VALUES ('ord-1004-item-1', 'ord-1004', 'drug-4', 'Emzor Paracetamol 500mg', 2, 1500, 3000);

-- 7. INSERT CONSULTATIONS
INSERT INTO consultations (consultation_id, reference_number, patient_name, patient_age, patient_gender, patient_phone, specialist_type, consultation_format, appointment_date, appointment_time, symptoms_summary, status, fee, payment_status, pharmacist_notes, created_at) VALUES ('con-201', 'CON-HEX-2026-081', 'Tolulope Williams', 42, 'Female', '+234 802 771 9901', 'Cardiology & Chronic Care', 'Video Call', '2026-10-05', '10:00 AM - 10:30 AM', 'Persistent elevated blood pressure (145/95) over the past two weeks with morning headaches. Currently on Amlodipine 5mg.', 'Scheduled', 10000, 'Paid', 'Patient BP log received. Scheduled with Dr. Sanusi (Consultant Physician).', '2026-10-04 08:20');
INSERT INTO consultations (consultation_id, reference_number, patient_name, patient_age, patient_gender, patient_phone, specialist_type, consultation_format, appointment_date, appointment_time, symptoms_summary, status, fee, payment_status, pharmacist_notes, created_at) VALUES ('con-202', 'CON-HEX-2026-082', 'Emeka Nwosu', 35, 'Male', '+234 818 334 2210', 'Clinical Pharmacist', 'WhatsApp Tele-Chat', '2026-10-04', '02:00 PM - 02:30 PM', 'Inquiring about potential drug interactions between prescribed anti-malarials and daily asthma maintenance inhalers.', 'Scheduled', 5000, 'Paid', 'Assigned to Lead Pharmacist Pharm. Stella Okon.', '2026-10-04 10:45');
INSERT INTO consultations (consultation_id, reference_number, patient_name, patient_age, patient_gender, patient_phone, specialist_type, consultation_format, appointment_date, appointment_time, symptoms_summary, status, fee, payment_status, pharmacist_notes, created_at) VALUES ('con-203', 'CON-HEX-2026-079', 'Halima Suleiman', 29, 'Female', '+234 803 219 8844', 'Women Health & Antenatal', 'Voice Call', '2026-10-03', '11:00 AM - 11:30 AM', 'Second trimester nutrition advice and relief for severe morning sickness and acid reflux.', 'Completed', 8000, 'Paid', 'Recommended dietary adjustments and safe antacid suspension. Patient felt reassured.', '2026-10-02 14:15');

-- ====================================================================
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
