-- LifeLink MySQL Database Schema (SIMPLIFIED)
-- Sagicor Innovation Challenge 2026
-- Created: 2025-12-15

-- Create database
CREATE DATABASE IF NOT EXISTS lifelink_db;
USE lifelink_db;

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS sagicor_insights;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;

-- Drop views
DROP VIEW IF EXISTS v_ai_review_queue;
DROP VIEW IF EXISTS v_sagicor_consented_patients;
DROP VIEW IF EXISTS v_active_appointments;

-- Drop procedures
DROP PROCEDURE IF EXISTS sp_approve_ai_analysis;
DROP PROCEDURE IF EXISTS sp_create_appointment_with_ai;

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
-- EMAIL VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_verifications (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    temp_user_id VARCHAR(36) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_code (verification_code),
    INDEX idx_expires (expires_at),
    INDEX idx_temp_user_id (temp_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PATIENTS TABLE (Simplified - No users table)
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,

    -- Basic Information (previously in users table)
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,

    -- Personal Details
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

    -- AI Analysis Fields
    ai_medical_analysis JSON,
    sagicor_data_sharing_consent BOOLEAN DEFAULT FALSE,
    sagicor_consent_date TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_insurance (insurance_provider),
    INDEX idx_sagicor_consent (sagicor_data_sharing_consent)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- APPOINTMENTS TABLE (Simplified - No user_id)
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    primary_physician VARCHAR(255) NOT NULL,

    -- Appointment Details
    schedule DATETIME NOT NULL,
    status ENUM('pending', 'scheduled', 'cancelled') NOT NULL DEFAULT 'pending',
    reason TEXT,
    note TEXT,
    cancellation_reason TEXT,

    -- AI Analysis Fields
    ai_symptom_analysis JSON,
    ai_reviewed_by VARCHAR(255),
    ai_reviewed_at TIMESTAMP NULL,
    ai_human_approved BOOLEAN DEFAULT FALSE,
    ai_human_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient_id (patient_id),
    INDEX idx_schedule (schedule),
    INDEX idx_status (status),
    INDEX idx_ai_review (ai_human_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAGICOR INSIGHTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sagicor_insights (
    id VARCHAR(36) PRIMARY KEY,
    region VARCHAR(100),
    risk_category ENUM('Low', 'Medium', 'High', 'Critical'),
    visit_type VARCHAR(100),
    anonymized_age_group VARCHAR(20),
    symptom_category VARCHAR(100),
    insight_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_region (region),
    INDEX idx_risk (risk_category),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    performed_by VARCHAR(255),
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS
-- ============================================

-- Active Appointments View
CREATE VIEW v_active_appointments AS
SELECT
    a.*,
    p.name AS patient_name,
    p.email AS patient_email,
    p.phone AS patient_phone
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.status != 'cancelled';

-- Sagicor Consented Patients View
CREATE VIEW v_sagicor_consented_patients AS
SELECT
    id,
    name,
    email,
    birth_date,
    gender,
    insurance_provider,
    sagicor_consent_date
FROM patients
WHERE sagicor_data_sharing_consent = TRUE;

-- AI Review Queue View
CREATE VIEW v_ai_review_queue AS
SELECT
    a.id AS appointment_id,
    a.schedule,
    a.reason,
    a.ai_symptom_analysis,
    a.ai_human_approved,
    p.name AS patient_name,
    p.email AS patient_email
FROM appointments a
JOIN patients p ON a.patient_id = p.id
WHERE a.ai_symptom_analysis IS NOT NULL
  AND (a.ai_human_approved = FALSE OR a.ai_human_approved IS NULL)
ORDER BY a.schedule ASC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Create Appointment with AI Analysis
CREATE PROCEDURE sp_create_appointment_with_ai(
    IN p_id VARCHAR(36),
    IN p_patient_id VARCHAR(36),
    IN p_primary_physician VARCHAR(255),
    IN p_schedule DATETIME,
    IN p_reason TEXT,
    IN p_note TEXT,
    IN p_ai_analysis JSON
)
BEGIN
    INSERT INTO appointments (
        id, patient_id, primary_physician, schedule,
        status, reason, note, ai_symptom_analysis
    ) VALUES (
        p_id, p_patient_id, p_primary_physician, p_schedule,
        'pending', p_reason, p_note, p_ai_analysis
    );
END //

-- Approve AI Analysis
CREATE PROCEDURE sp_approve_ai_analysis(
    IN p_appointment_id VARCHAR(36),
    IN p_reviewed_by VARCHAR(255),
    IN p_approved BOOLEAN,
    IN p_notes TEXT,
    IN p_updated_analysis JSON
)
BEGIN
    UPDATE appointments
    SET ai_reviewed_by = p_reviewed_by,
        ai_reviewed_at = NOW(),
        ai_human_approved = p_approved,
        ai_human_notes = p_notes,
        ai_symptom_analysis = IFNULL(p_updated_analysis, ai_symptom_analysis)
    WHERE id = p_appointment_id;

    -- Log the review
    INSERT INTO audit_logs (id, action, entity_type, entity_id, performed_by, details)
    VALUES (
        UUID(),
        'AI_REVIEW',
        'appointment',
        p_appointment_id,
        p_reviewed_by,
        JSON_OBJECT('approved', p_approved, 'notes', p_notes)
    );
END //

-- ============================================
-- EMAIL VERIFICATION STORED PROCEDURES
-- ============================================

-- Create Email Verification
CREATE PROCEDURE sp_create_email_verification(
    IN p_id VARCHAR(36),
    IN p_email VARCHAR(255),
    IN p_verification_code VARCHAR(6),
    IN p_name VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_expires_at TIMESTAMP,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE existing_patient INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Check if email already exists in patients table
    SELECT COUNT(*) INTO existing_patient
    FROM patients
    WHERE email = p_email COLLATE utf8mb4_unicode_ci;

    IF existing_patient > 0 THEN
        SET p_success = FALSE;
        SET p_message = 'This email is already registered';
        ROLLBACK;
    ELSE
        -- Delete any existing pending verifications for this email
        DELETE FROM email_verifications
        WHERE email = p_email COLLATE utf8mb4_unicode_ci AND is_verified = FALSE;

        -- Create new verification record
        INSERT INTO email_verifications (
            id, email, verification_code, name, password_hash, expires_at
        ) VALUES (
            p_id, p_email, p_verification_code, p_name, p_password_hash, p_expires_at
        );

        SET p_success = TRUE;
        SET p_message = 'Verification code created successfully';
        COMMIT;
    END IF;
END //

-- Verify Email Code
CREATE PROCEDURE sp_verify_email_code(
    IN p_email VARCHAR(255),
    IN p_code VARCHAR(6),
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255),
    OUT p_name VARCHAR(255),
    OUT p_password_hash VARCHAR(255)
)
BEGIN
    DECLARE v_id VARCHAR(36);
    DECLARE v_expires_at TIMESTAMP;
    DECLARE v_name VARCHAR(255);
    DECLARE v_password_hash VARCHAR(255);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Find the verification record
    SELECT id, expires_at, name, password_hash
    INTO v_id, v_expires_at, v_name, v_password_hash
    FROM email_verifications
    WHERE email = p_email COLLATE utf8mb4_unicode_ci
      AND verification_code = p_code COLLATE utf8mb4_unicode_ci
      AND is_verified = FALSE
    ORDER BY created_at DESC
    LIMIT 1;

    -- Check if record was found
    IF v_id IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'Invalid verification code';
        ROLLBACK;
    -- Check if code has expired
    ELSEIF NOW() > v_expires_at THEN
        SET p_success = FALSE;
        SET p_message = 'Verification code has expired. Please request a new one';
        ROLLBACK;
    ELSE
        -- Mark as verified
        UPDATE email_verifications
        SET is_verified = TRUE, verified_at = NOW()
        WHERE id = v_id;

        SET p_success = TRUE;
        SET p_message = 'Email verified successfully';
        SET p_name = v_name;
        SET p_password_hash = v_password_hash;
        COMMIT;
    END IF;
END //

-- Check Email Verification Status
CREATE PROCEDURE sp_check_email_verification_status(
    IN p_email VARCHAR(255),
    OUT p_is_verified BOOLEAN,
    OUT p_message VARCHAR(255),
    OUT p_name VARCHAR(255),
    OUT p_password_hash VARCHAR(255)
)
BEGIN
    DECLARE v_name VARCHAR(255);
    DECLARE v_password_hash VARCHAR(255);
    DECLARE v_verified BOOLEAN DEFAULT FALSE;

    -- Check if email has been verified
    SELECT name, password_hash, is_verified
    INTO v_name, v_password_hash, v_verified
    FROM email_verifications
    WHERE email = p_email COLLATE utf8mb4_unicode_ci AND is_verified = TRUE
    ORDER BY verified_at DESC
    LIMIT 1;

    -- Return results
    IF v_verified = TRUE THEN
        SET p_is_verified = TRUE;
        SET p_message = 'Email already verified';
        SET p_name = v_name;
        SET p_password_hash = v_password_hash;
    ELSE
        SET p_is_verified = FALSE;
        SET p_message = 'Email not verified yet';
        SET p_name = NULL;
        SET p_password_hash = NULL;
    END IF;
END //

-- Resend Verification Code
CREATE PROCEDURE sp_resend_verification_code(
    IN p_email VARCHAR(255),
    IN p_new_code VARCHAR(6),
    IN p_new_expires_at TIMESTAMP,
    OUT p_success BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_id VARCHAR(36);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_success = FALSE;
        SET p_message = 'Database error occurred';
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Get the latest pending verification
    SELECT id INTO v_id
    FROM email_verifications
    WHERE email = p_email COLLATE utf8mb4_unicode_ci AND is_verified = FALSE
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_id IS NULL THEN
        SET p_success = FALSE;
        SET p_message = 'No pending verification found for this email';
        ROLLBACK;
    ELSE
        -- Update the verification record with new code and expiration
        UPDATE email_verifications
        SET verification_code = p_new_code,
            expires_at = p_new_expires_at,
            created_at = NOW()
        WHERE id = v_id;

        SET p_success = TRUE;
        SET p_message = 'New verification code generated';
        COMMIT;
    END IF;
END //

DELIMITER ;

-- ============================================
-- SEED DATA - Sample Doctors
-- ============================================
INSERT INTO doctors (id, name, image_url, specialty) VALUES
(UUID(), 'Dr. John Green', '/assets/images/dr-green.png', 'General Practitioner'),
(UUID(), 'Dr. Leila Cameron', '/assets/images/dr-cameron.png', 'Cardiologist'),
(UUID(), 'Dr. David Livingston', '/assets/images/dr-livingston.png', 'Pediatrician'),
(UUID(), 'Dr. Evan Peter', '/assets/images/dr-peter.png', 'Orthopedic Surgeon'),
(UUID(), 'Dr. Jane Powell', '/assets/images/dr-powell.png', 'Dermatologist'),
(UUID(), 'Dr. Alex Ramirez', '/assets/images/dr-ramirez.png', 'Neurologist'),
(UUID(), 'Dr. Jasmine Lee', '/assets/images/dr-lee.png', 'Gynecologist'),
(UUID(), 'Dr. Alyana Cruz', '/assets/images/dr-cruz.png', 'Psychiatrist'),
(UUID(), 'Dr. Hardik Sharma', '/assets/images/dr-sharma.png', 'Ophthalmologist');

SELECT 'Database schema created successfully!' AS message;
