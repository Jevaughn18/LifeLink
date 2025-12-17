-- This script modifies the 'password_hash' column in the 'email_verifications' table to allow NULL values.
-- This is necessary for the new registration flow where the password is set after email verification.

USE lifelink_db;

ALTER TABLE email_verifications MODIFY COLUMN password_hash VARCHAR(255) NULL;

SELECT 'Column password_hash in email_verifications is now nullable.' AS status;
