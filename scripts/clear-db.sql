-- Script to clear all users from the database
-- Run with: mysql -u root -p lifelink_db < scripts/clear-db.sql

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM appointments;
DELETE FROM patients;
DELETE FROM email_verifications;
DELETE FROM audit_logs;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Database cleared successfully!' as message;
