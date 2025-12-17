-- This script corrects the schema for the email verification process.
-- It replaces the incorrect `phone` column with `password_hash` in the `email_verifications` table
-- and updates the corresponding stored procedure.

USE lifelink_db;

-- Step 1: Alter the email_verifications table
-- Drop the incorrect 'phone' column and add the 'password_hash' column.
-- We assume the 'phone' column exists as per the error logs.
-- We are also adding a 'password_hash' column which is missing.
-- We will ignore errors if the column does not exist, and just add the new one.
-- The user might have a different version of the schema.

-- Check if 'phone' column exists before dropping
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns
WHERE table_schema = 'lifelink_db' AND table_name = 'email_verifications' AND column_name = 'phone';

-- Drop column only if it exists
SET @sql = IF(@col_exists > 0, 'ALTER TABLE email_verifications DROP COLUMN phone;', 'SELECT "Column phone does not exist, skipping drop.";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if 'password_hash' column exists before adding
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns
WHERE table_schema = 'lifelink_db' AND table_name = 'email_verifications' AND column_name = 'password_hash';

-- Add column only if it does not exist
SET @sql = IF(@col_exists = 0, 'ALTER TABLE email_verifications ADD COLUMN password_hash VARCHAR(255) NULL;', 'SELECT "Column password_hash already exists, skipping add.";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- Step 2: Update the verification_code column to be able to store a hash
ALTER TABLE email_verifications MODIFY COLUMN verification_code VARCHAR(255) NOT NULL;


-- Step 3: Recreate the stored procedure with the correct parameters
DROP PROCEDURE IF EXISTS sp_create_email_verification;

DELIMITER //
CREATE PROCEDURE sp_create_email_verification(
    IN p_id VARCHAR(36),
    IN p_email VARCHAR(255),
    IN p_verification_code VARCHAR(255),
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
DELIMITER ;

SELECT 'Database schema for email verification has been fixed.' AS status;

