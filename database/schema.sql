-- ============================================================
-- Complaint Management System - Database Schema (MySQL 8.x)
-- ============================================================

CREATE DATABASE IF NOT EXISTS complaint_management_system;
USE complaint_management_system;

-- Disable foreign key checks to cleanly drop existing/legacy tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS attachments;
DROP TABLE IF EXISTS attachment;
DROP TABLE IF EXISTS complaint_updates;
DROP TABLE IF EXISTS complaint_update;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'EMPLOYEE', 'CITIZEN') NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Complaints Table
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    complainant_id BIGINT NOT NULL,
    assigned_employee_id BIGINT DEFAULT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME DEFAULT NULL,
    CONSTRAINT fk_complaints_complainant FOREIGN KEY (complainant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaints_assigned_employee FOREIGN KEY (assigned_employee_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_category (category),
    INDEX idx_complaints_complainant (complainant_id),
    INDEX idx_complaints_assigned_employee (assigned_employee_id),
    INDEX idx_complaints_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Complaint Updates / History Table
CREATE TABLE complaint_updates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT,
    status_change_from VARCHAR(255) DEFAULT NULL,
    status_change_to VARCHAR(255) DEFAULT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_updates_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_updates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_updates_complaint (complaint_id),
    INDEX idx_updates_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Attachments Table
CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) DEFAULT NULL,
    file_size BIGINT DEFAULT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachments_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_attachments_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    complaint_id BIGINT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
