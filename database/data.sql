-- Seed data for Smart Hospital Management System (SHMS)

-- 1. Insert Departments
INSERT INTO departments (id, name, description) VALUES
(1, 'Cardiology', 'Heart health and treatment'),
(2, 'Neurology', 'Brain and nervous system disorders'),
(3, 'Pediatrics', 'Infant and child healthcare'),
(4, 'Dermatology', 'Skin, hair, and nail treatments'),
(5, 'Orthopedics', 'Bone, joint, and muscle care'),
(6, 'General Medicine', 'Common ailments, routine checkups');

-- 2. Insert Medicines
INSERT INTO medicines (name, category, stock_quantity, expiry_date, price, generic_name) VALUES
('Amoxicillin 500mg', 'Antibiotic', 250, '2027-08-31', 8.50, 'Amoxicillin'),
('Atorvastatin 20mg', 'Cardiovascular', 150, '2028-02-28', 12.00, 'Lipitor'),
('Metformin 850mg', 'Antidiabetic', 300, '2027-11-30', 6.00, 'Glucophage'),
('Lisinopril 10mg', 'Antihypertensive', 180, '2027-06-30', 9.50, 'Zestril'),
('Ibuprofen 400mg', 'Analgesic', 400, '2028-04-30', 4.20, 'Advil'),
('Cetirizine 10mg', 'Antihistamine', 220, '2027-12-31', 3.80, 'Zyrtec'),
('Paracetamol 650mg', 'Antipyretic', 500, '2028-01-31', 2.50, 'Acetaminophen'),
('Omeprazole 20mg', 'Gastrointestinal', 160, '2027-09-30', 7.40, 'Prilosec');

-- 3. Insert Inventory Items
INSERT INTO inventory (item_name, category, quantity, threshold, status) VALUES
('Disposable Syringes 5ml', 'Consumables', 80, 50, 'IN_STOCK'),
('Surgical Face Masks (Box of 50)', 'PPE', 40, 20, 'IN_STOCK'),
('Surgical Gloves Size 7.5 (Box of 50)', 'PPE', 15, 20, 'LOW_STOCK'),
('Normal Saline IV Fluid 500ml', 'Fluids', 120, 30, 'IN_STOCK'),
('Adhesive Bandages 1 Inch', 'Consumables', 200, 100, 'IN_STOCK'),
('Oxygen Masks (Adult)', 'Equipments', 8, 10, 'LOW_STOCK'),
('Sterile Gauze Pads 4x4', 'Consumables', 300, 100, 'IN_STOCK'),
('Digital Thermometer', 'Devices', 5, 10, 'LOW_STOCK');
