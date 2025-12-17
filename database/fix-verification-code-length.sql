-- Fix verification code length for bcrypt hashes (60 characters)
-- This script updates the stored procedures to accept hashed verification codes

USE lifelink_db;

-- Drop existing procedures
DROP PROCEDURE IF EXISTS sp_create_email_verification;
DROP PROCEDURE IF EXISTS sp_resend_verification_code;

-- Recreate sp_create_email_verification with VARCHAR(60) for verification code
DELIMITER //

CREATE PROCEDURE sp_create_email_verification(
    IN p_id VARCHAR(36),
    IN p_email VARCHAR(255),
    IN p_verification_code VARCHAR(60),  -- Changed from VARCHAR(6) to VARCHAR(60)
    IN p_name VARCHAR(255),
    IN p_phone VARCHAR(20),
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
            id, email, verification_code, name, phone, expires_at
        ) VALUES (
            p_id, p_email, p_verification_code, p_name, p_phone, p_expires_at
        );

        SET p_success = TRUE;
        SET p_message = 'Verification code created successfully';
        COMMIT;
    END IF;
END //

-- Recreate sp_resend_verification_code with VARCHAR(60) for verification code
CREATE PROCEDURE sp_resend_verification_code(
    IN p_email VARCHAR(255),
    IN p_new_code VARCHAR(60),  -- Changed from VARCHAR(6) to VARCHAR(60)
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

    -- Find the most recent unverified record
    SELECT id INTO v_id
    FROM email_verifications
    WHERE email = p_email COLLATE utf8mb4_unicode_ci
        AND is_verified = FALSE
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
            expires_at = p_new_expires_at
        WHERE id = v_id;

        SET p_success = TRUE;
        SET p_message = 'Verification code updated successfully';
        COMMIT;
    END IF;
END //

DELIMITER ;

-- Verify the changes
SHOW CREATE PROCEDURE sp_create_email_verification;
SHOW CREATE PROCEDURE sp_resend_verification_code;

SELECT 'Migration completed successfully!' AS status;
