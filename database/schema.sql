-- LifeLink MySQL Database Schema
-- Sagicor Innovation Challenge 2026
-- Created: 2025-12-15

-- Create database
CREATE DATABASE IF NOT EXISTS lifelink_db;
USE lifelink_db;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    specialty VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PATIENTS TABLE (with AI fields)
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    address TEXT NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    emergency_contact_name VARCHAR(255) NOT NULL,
    emergency_contact_number VARCHAR(20) NOT NULL,
    primary_physician VARCHAR(255) NOT NULL,

    -- Insurance Information
    insurance_provider VARCHAR(255) NOT NULL,
    insurance_policy_number VARCHAR(100) NOT NULL,

    -- Medical Information
    allergies TEXT,
    current_medication TEXT,
    family_medical_history TEXT,
    past_medical_history TEXT,

    -- Identification
    identification_type VARCHAR(100),
    identification_number VARCHAR(100),
    identification_document_id VARCHAR(100),
    identification_document_url TEXT,

    -- Consent
    privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
    treatment_consent BOOLEAN DEFAULT FALSE,
    disclosure_consent BOOLEAN DEFAULT FALSE,

    -- AI Analysis Fields (NEW)
    ai_medical_analysis JSON,
    sagicor_data_sharing_consent BOOLEAN DEFAULT FALSE,
    sagicor_consent_date TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_insurance (insurance_provider),
    INDEX idx_sagicor_consent (sagicor_data_sharing_consent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- APPOINTMENTS TABLE (with AI fields)
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    primary_physician VARCHAR(255) NOT NULL,

    -- Appointment Details
    schedule DATETIME NOT NULL,
    status ENUM('pending', 'scheduled', 'cancelled') NOT NULL DEFAULT 'pending',
    reason TEXT NOT NULL,
    note TEXT,
    cancellation_reason TEXT,

    -- AI Analysis Fields (NEW)
    ai_symptom_analysis JSON,
    ai_reviewed_by VARCHAR(255),
    ai_reviewed_at TIMESTAMP NULL,
    ai_human_approved BOOLEAN DEFAULT FALSE,
    ai_human_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_status (status),
    INDEX idx_schedule (schedule),
    INDEX idx_ai_approved (ai_human_approved),
    INDEX idx_primary_physician (primary_physician)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAGICOR INSIGHTS TABLE (for caching)
-- ============================================
CREATE TABLE IF NOT EXISTS sagicor_insights (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,

    -- Anonymized Data
    insurance_plan VARCHAR(255) NOT NULL,
    risk_category ENUM('Low', 'Medium', 'High', 'Chronic') NOT NULL,
    urgency_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    region VARCHAR(255) NOT NULL,
    visit_type ENUM('Acute', 'Chronic', 'Preventive', 'Emergency') NOT NULL,
    symptom_category VARCHAR(100),

    -- Metadata
    is_anonymized BOOLEAN DEFAULT TRUE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_insurance_plan (insurance_plan),
    INDEX idx_risk_category (risk_category),
    INDEX idx_region (region),
    INDEX idx_generated_at (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOG TABLE (for tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    entity_type ENUM('user', 'patient', 'appointment', 'ai_review') NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(255),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT SAMPLE DOCTORS
-- ============================================
INSERT INTO doctors (id, name, image_url, specialty) VALUES
('doc-001', 'John Green', '/assets/images/dr-green.png', 'General Practice'),
('doc-002', 'Leila Cameron', '/assets/images/dr-cameron.png', 'Cardiology'),
('doc-003', 'David Livingston', '/assets/images/dr-livingston.png', 'Pediatrics'),
('doc-004', 'Evan Peter', '/assets/images/dr-peter.png', 'Orthopedics'),
('doc-005', 'Jane Powell', '/assets/images/dr-powell.png', 'Dermatology'),
('doc-006', 'Alex Ramirez', '/assets/images/dr-ramirez.png', 'Neurology'),
('doc-007', 'Jasmine Lee', '/assets/images/dr-lee.png', 'Gynecology'),
('doc-008', 'Alyana Cruz', '/assets/images/dr-cruz.png', 'Internal Medicine'),
('doc-009', 'Hardik Sharma', '/assets/images/dr-sharma.png', 'Psychiatry')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Active Appointments with Patient Info
CREATE OR REPLACE VIEW v_active_appointments AS
SELECT
    a.id,
    a.schedule,
    a.status,
    a.reason,
    a.primary_physician,
    a.ai_symptom_analysis,
    a.ai_human_approved,
    p.name AS patient_name,
    p.email AS patient_email,
    p.insurance_provider,
    a.created_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.status != 'cancelled';

-- View: Sagicor Consented Patients
CREATE OR REPLACE VIEW v_sagicor_consented_patients AS
SELECT
    p.id,
    p.insurance_provider,
    p.address,
    p.ai_medical_analysis,
    p.sagicor_consent_date,
    COUNT(a.id) AS appointment_count
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
WHERE p.sagicor_data_sharing_consent = TRUE
GROUP BY p.id;

-- View: AI Review Queue
CREATE OR REPLACE VIEW v_ai_review_queue AS
SELECT
    a.id,
    a.schedule,
    a.reason,
    a.ai_symptom_analysis,
    p.name AS patient_name,
    p.email AS patient_email,
    a.created_at
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.ai_symptom_analysis IS NOT NULL
  AND a.ai_human_approved = FALSE;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Create Appointment with AI Analysis
CREATE PROCEDURE sp_create_appointment_with_ai(
    IN p_id VARCHAR(36),
    IN p_user_id VARCHAR(36),
    IN p_patient_id VARCHAR(36),
    IN p_primary_physician VARCHAR(255),
    IN p_schedule DATETIME,
    IN p_reason TEXT,
    IN p_note TEXT,
    IN p_ai_analysis JSON
)
BEGIN
    INSERT INTO appointments (
        id, user_id, patient_id, primary_physician,
        schedule, reason, note, ai_symptom_analysis,
        status, ai_human_approved
    ) VALUES (
        p_id, p_user_id, p_patient_id, p_primary_physician,
        p_schedule, p_reason, p_note, p_ai_analysis,
        'pending', FALSE
    );

    -- Log the action
    INSERT INTO audit_logs (id, entity_type, entity_id, action, details)
    VALUES (UUID(), 'appointment', p_id, 'created', JSON_OBJECT('has_ai_analysis', p_ai_analysis IS NOT NULL));
END //

-- Procedure: Approve AI Analysis
CREATE PROCEDURE sp_approve_ai_analysis(
    IN p_appointment_id VARCHAR(36),
    IN p_reviewed_by VARCHAR(255),
    IN p_approved BOOLEAN,
    IN p_notes TEXT,
    IN p_updated_analysis JSON
)
BEGIN
    UPDATE appointments
    SET
        ai_human_approved = p_approved,
        ai_reviewed_by = p_reviewed_by,
        ai_reviewed_at = CURRENT_TIMESTAMP,
        ai_human_notes = p_notes,
        ai_symptom_analysis = COALESCE(p_updated_analysis, ai_symptom_analysis)
    WHERE id = p_appointment_id;

    -- Log the review
    INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, details)
    VALUES (UUID(), 'ai_review', p_appointment_id, 'reviewed', p_reviewed_by,
            JSON_OBJECT('approved', p_approved, 'has_notes', p_notes IS NOT NULL));
END //

DELIMITER ;

-- ============================================
-- GRANTS (adjust as needed)
-- ============================================
-- GRANT ALL PRIVILEGES ON lifelink_db.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Additional composite indexes for common queries
CREATE INDEX idx_appointments_status_schedule ON appointments(status, schedule);
CREATE INDEX idx_patients_insurance_consent ON patients(insurance_provider, sagicor_data_sharing_consent);
CREATE INDEX idx_appointments_ai_pending ON appointments(ai_human_approved, ai_symptom_analysis(1));

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Database schema created successfully!' AS status;
