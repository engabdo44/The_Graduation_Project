-- =========================================
-- Somali National Gateway Portal (Full)
-- =========================================

CREATE DATABASE IF NOT EXISTS somali_national_gateway
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE somali_national_gateway;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS family_members;
DROP TABLE IF EXISTS families;
DROP TABLE IF EXISTS travel_restrictions;
DROP TABLE IF EXISTS criminal_records;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS passports;
DROP TABLE IF EXISTS id_cards;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS residents;
DROP TABLE IF EXISTS citizens;

-- =========================================
-- 1) Citizens
-- =========================================
CREATE TABLE citizens (
    citizen_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    national_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male','female') NOT NULL,
    nationality VARCHAR(80) DEFAULT 'Somali',
    marital_status ENUM('single','married','divorced','widowed') DEFAULT 'single',
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(120),
    status ENUM('active','inactive','deceased') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- 2) Residents (المقيمين)
-- =========================================
CREATE TABLE residents (
    resident_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    residence_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    dob DATE NOT NULL,
    gender ENUM('male','female') NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50),
    visa_type VARCHAR(100),
    sponsor_name VARCHAR(200),
    address TEXT,
    phone VARCHAR(30),
    email VARCHAR(120),
    status ENUM('active','expired','cancelled') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- 3) Employees
-- =========================================
CREATE TABLE employees (
    employee_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(60) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(30),
    email VARCHAR(120),
    status ENUM('active','inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- 4) Users (Login Accounts)
-- =========================================
CREATE TABLE users (
    user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    citizen_id BIGINT UNSIGNED NULL,
    resident_id BIGINT UNSIGNED NULL,
    employee_id BIGINT UNSIGNED NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    account_type ENUM('citizen','resident','employee') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id) ON DELETE CASCADE,
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- 5) ID Cards (هوية مواطن أو مقيم)
-- =========================================
CREATE TABLE id_cards (
    id_card_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    citizen_id BIGINT UNSIGNED NULL,
    resident_id BIGINT UNSIGNED NULL,
    id_type ENUM('citizen','resident') NOT NULL,
    issue_number INT UNSIGNED NOT NULL DEFAULT 1,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('active','expired','cancelled') DEFAULT 'active',
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id),
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
) ENGINE=InnoDB;

-- =========================================
-- 6) Passports
-- =========================================
CREATE TABLE passports (
    passport_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    citizen_id BIGINT UNSIGNED NOT NULL,
    passport_number VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('regular','diplomatic','service') NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status ENUM('active','expired','cancelled') DEFAULT 'active',
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id)
) ENGINE=InnoDB;

-- =========================================
-- 7) Applications
-- =========================================
CREATE TABLE applications (
    application_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    applicant_type ENUM('citizen','resident') NOT NULL,
    citizen_id BIGINT UNSIGNED NULL,
    resident_id BIGINT UNSIGNED NULL,
    service_type VARCHAR(100) NOT NULL,
    status ENUM('submitted','under_review','approved','rejected','printing_queue','printed','completed') DEFAULT 'submitted',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    approval_date DATETIME NULL,
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id),
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
) ENGINE=InnoDB;

-- =========================================
-- 8) Criminal Records
-- =========================================
CREATE TABLE criminal_records (
    record_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    citizen_id BIGINT UNSIGNED NOT NULL,
    crime_type VARCHAR(150) NOT NULL,
    incident_date DATE,
    court_decision TEXT,
    status ENUM('open','closed') DEFAULT 'open',
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id)
) ENGINE=InnoDB;

-- =========================================
-- 9) Travel Restrictions
-- =========================================
CREATE TABLE travel_restrictions (
    restriction_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    citizen_id BIGINT UNSIGNED,
    resident_id BIGINT UNSIGNED,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('active','expired') DEFAULT 'active',
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id),
    FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
) ENGINE=InnoDB;

-- =========================================
-- 10) Families
-- =========================================
CREATE TABLE families (
    family_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    head_citizen_id BIGINT UNSIGNED NOT NULL,
    FOREIGN KEY (head_citizen_id) REFERENCES citizens(citizen_id)
) ENGINE=InnoDB;

CREATE TABLE family_members (
    member_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    family_id BIGINT UNSIGNED NOT NULL,
    citizen_id BIGINT UNSIGNED NOT NULL,
    relation VARCHAR(60),
    FOREIGN KEY (family_id) REFERENCES families(family_id) ON DELETE CASCADE,
    FOREIGN KEY (citizen_id) REFERENCES citizens(citizen_id)
) ENGINE=InnoDB;

-- =========================================
-- 11) Appointments
-- =========================================
CREATE TABLE appointments (
    appointment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED,
    service_type VARCHAR(100),
    date_time DATETIME NOT NULL,
    status ENUM('booked','completed','cancelled') DEFAULT 'booked',
    FOREIGN KEY (application_id) REFERENCES applications(application_id)
) ENGINE=InnoDB;

-- =========================================
-- 12) Payments
-- =========================================
CREATE TABLE payments (
    payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT UNSIGNED,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash','card','mobile_money') NOT NULL,
    status ENUM('paid','pending','failed') DEFAULT 'paid',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(application_id)
) ENGINE=InnoDB;

-- =========================================
-- 13) Notifications
-- =========================================
CREATE TABLE notifications (
    notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    message TEXT NOT NULL,
    date_sent DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent','read') DEFAULT 'sent',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

-- =========================================
-- 14) System Logs
-- =========================================
CREATE TABLE system_logs (
    log_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED,
    action VARCHAR(255) NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
) ENGINE=InnoDB;

-- =========================================
-- 15) Print Queue
-- =========================================
CREATE TABLE print_queue (
    print_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    applicant_name VARCHAR(200) NOT NULL,
    request_number VARCHAR(50),
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'printed') DEFAULT 'pending',
    printed_by VARCHAR(200),
    print_date DATE,
    print_time VARCHAR(50)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
