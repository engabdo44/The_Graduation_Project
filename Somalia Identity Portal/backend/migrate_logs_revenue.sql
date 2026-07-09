-- Migration: Create system_logs and revenue tables
-- Run this in your MySQL database to add the new tables

CREATE TABLE IF NOT EXISTS `system_logs` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(100) NOT NULL,
  `module_name` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `user_id` VARCHAR(50) DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `account_type` VARCHAR(80) DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT NULL,
  `metadata` TEXT DEFAULT NULL,
  `employee_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_module` (`module_name`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_username` (`username`),
  KEY `fk_system_logs_employee` (`employee_id`),
  CONSTRAINT `fk_system_logs_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `revenue` (
  `revenue_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_type` VARCHAR(100) NOT NULL,
  `service_name` VARCHAR(200) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `applicant_name` VARCHAR(200) DEFAULT NULL,
  `id_number` VARCHAR(50) DEFAULT NULL,
  `application_id` VARCHAR(50) DEFAULT NULL,
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'completed',
  `created_at` DATETIME(0) DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`revenue_id`),
  KEY `idx_transaction_type` (`transaction_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
