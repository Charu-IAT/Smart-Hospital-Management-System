-- Schema for Smart Hospital Management System (SHMS)

CREATE DATABASE IF NOT EXISTS smart_hospital_db;
USE smart_hospital_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    address TEXT,
    phone VARCHAR(20),
    allergies TEXT,
    medical_history TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id BIGINT,
    schedule TEXT,
    availability BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    doctor_id BIGINT,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, COMPLETED, CANCELLED
    consultation_type VARCHAR(20) DEFAULT 'IN_PERSON', -- IN_PERSON, VIDEO
    payment_status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PAID
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 6. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id BIGINT,
    doctor_id BIGINT,
    patient_id BIGINT,
    diagnosis TEXT,
    medicines TEXT, -- JSON or comma-separated details of medicines prescribed
    dosage VARCHAR(255),
    instructions TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 7. Medical History Table
CREATE TABLE IF NOT EXISTS medical_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    date_record TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 8. Laboratory Reports Table
CREATE TABLE IF NOT EXISTS laboratory_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    test_name VARCHAR(100) NOT NULL,
    test_date DATE NOT NULL,
    result_summary TEXT,
    file_url VARCHAR(255),
    uploaded_by VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, COMPLETED
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- 9. Billing Table
CREATE TABLE IF NOT EXISTS billing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT,
    appointment_id BIGINT,
    consultation_fee DECIMAL(10,2) DEFAULT 0.00,
    lab_fee DECIMAL(10,2) DEFAULT 0.00,
    pharmacy_fee DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PAID, CLAIMED
    billing_date DATE NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    billing_id BIGINT,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, FAILED
    FOREIGN KEY (billing_id) REFERENCES billing(id) ON DELETE CASCADE
);

-- 11. Medicines Table
CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stock_quantity INT NOT NULL,
    expiry_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    generic_name VARCHAR(100)
);

-- 12. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    threshold INT NOT NULL DEFAULT 10,
    status VARCHAR(20) DEFAULT 'IN_STOCK' -- IN_STOCK, LOW_STOCK, OUT_OF_STOCK
);

-- 13. Insurance Table
CREATE TABLE IF NOT EXISTS insurance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT UNIQUE,
    policy_number VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    coverage_details TEXT,
    status VARCHAR(20) DEFAULT 'VERIFIED', -- VERIFIED, EXPIRED, PENDING
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
