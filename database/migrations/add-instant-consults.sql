-- Migration: Add Instant Consults Table
-- Tracks real-time consult requests from patients so the admin
-- can see and join them from the dashboard.

USE lifelink_db;

CREATE TABLE IF NOT EXISTS instant_consults (
    id VARCHAR(36) PRIMARY KEY,
    patient_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    meeting_id VARCHAR(255) NOT NULL,
    status ENUM('waiting', 'joined', 'ended') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT 'instant_consults table created successfully!' AS Status;
