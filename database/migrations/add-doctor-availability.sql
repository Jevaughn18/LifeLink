-- Migration: Add Doctor Availability Schedules
-- This allows admins to set specific time slots when doctors are available

USE lifelink_db;

-- ============================================
-- DOCTOR AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_availability (
    id VARCHAR(36) PRIMARY KEY,
    doctor_name VARCHAR(255) NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_doctor_name (doctor_name),
    INDEX idx_day_of_week (day_of_week),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DEFAULT SCHEDULES FOR EXISTING DOCTORS
-- ============================================
-- Dr. John Green - Monday to Friday, 9 AM - 5 PM
INSERT INTO doctor_availability (id, doctor_name, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
(UUID(), 'John Green', 'Monday', '09:00:00', '17:00:00', 30, TRUE),
(UUID(), 'John Green', 'Tuesday', '09:00:00', '17:00:00', 30, TRUE),
(UUID(), 'John Green', 'Wednesday', '09:00:00', '17:00:00', 30, TRUE),
(UUID(), 'John Green', 'Thursday', '09:00:00', '17:00:00', 30, TRUE),
(UUID(), 'John Green', 'Friday', '09:00:00', '17:00:00', 30, TRUE);

-- Dr. Leila Cameron - Monday to Friday, 10 AM - 6 PM
INSERT INTO doctor_availability (id, doctor_name, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
(UUID(), 'Leila Cameron', 'Monday', '10:00:00', '18:00:00', 30, TRUE),
(UUID(), 'Leila Cameron', 'Tuesday', '10:00:00', '18:00:00', 30, TRUE),
(UUID(), 'Leila Cameron', 'Wednesday', '10:00:00', '18:00:00', 30, TRUE),
(UUID(), 'Leila Cameron', 'Thursday', '10:00:00', '18:00:00', 30, TRUE),
(UUID(), 'Leila Cameron', 'Friday', '10:00:00', '18:00:00', 30, TRUE);

-- Dr. Jasmine Lee - Monday, Wednesday, Friday, 9 AM - 5 PM
INSERT INTO doctor_availability (id, doctor_name, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
(UUID(), 'Jasmine Lee', 'Monday', '09:00:00', '17:00:00', 30, TRUE),
(UUID(), 'Jasmine Lee', 'Wednesday', '09:00:00', '17:00:00', 30, TRUE),
(UUID(), 'Jasmine Lee', 'Friday', '09:00:00', '17:00:00', 30, TRUE);

-- Dr. David Livingston - Tuesday to Saturday, 8 AM - 4 PM
INSERT INTO doctor_availability (id, doctor_name, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
(UUID(), 'David Livingston', 'Tuesday', '08:00:00', '16:00:00', 30, TRUE),
(UUID(), 'David Livingston', 'Wednesday', '08:00:00', '16:00:00', 30, TRUE),
(UUID(), 'David Livingston', 'Thursday', '08:00:00', '16:00:00', 30, TRUE),
(UUID(), 'David Livingston', 'Friday', '08:00:00', '16:00:00', 30, TRUE),
(UUID(), 'David Livingston', 'Saturday', '08:00:00', '16:00:00', 30, TRUE);

-- Add more doctors as needed...

SELECT 'Doctor availability table created and seeded successfully!' AS Status;
