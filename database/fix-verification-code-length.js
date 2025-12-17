const mysql = require('mysql2/promise');

async function runMigration() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'kuroshitsuji577',
    database: 'lifelink_db',
    multipleStatements: false
  });

  try {
    console.log('🔄 Starting migration...');

    // Drop existing procedures
    await conn.query('DROP PROCEDURE IF EXISTS sp_create_email_verification');
    console.log('✅ Dropped sp_create_email_verification');

    await conn.query('DROP PROCEDURE IF EXISTS sp_resend_verification_code');
    console.log('✅ Dropped sp_resend_verification_code');

    // Recreate sp_create_email_verification with VARCHAR(60)
    await conn.query(`
      CREATE PROCEDURE sp_create_email_verification(
          IN p_id VARCHAR(36),
          IN p_email VARCHAR(255),
          IN p_verification_code VARCHAR(60),
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

          SELECT COUNT(*) INTO existing_patient
          FROM patients
          WHERE email = p_email COLLATE utf8mb4_unicode_ci;

          IF existing_patient > 0 THEN
              SET p_success = FALSE;
              SET p_message = 'This email is already registered';
              ROLLBACK;
          ELSE
              DELETE FROM email_verifications
              WHERE email = p_email COLLATE utf8mb4_unicode_ci AND is_verified = FALSE;

              INSERT INTO email_verifications (
                  id, email, verification_code, name, phone, expires_at
              ) VALUES (
                  p_id, p_email, p_verification_code, p_name, p_phone, p_expires_at
              );

              SET p_success = TRUE;
              SET p_message = 'Verification code created successfully';
              COMMIT;
          END IF;
      END
    `);
    console.log('✅ Created sp_create_email_verification (verification_code: VARCHAR(60))');

    // Recreate sp_resend_verification_code with VARCHAR(60)
    await conn.query(`
      CREATE PROCEDURE sp_resend_verification_code(
          IN p_email VARCHAR(255),
          IN p_new_code VARCHAR(60),
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
              UPDATE email_verifications
              SET verification_code = p_new_code,
                  expires_at = p_new_expires_at
              WHERE id = v_id;

              SET p_success = TRUE;
              SET p_message = 'Verification code updated successfully';
              COMMIT;
          END IF;
      END
    `);
    console.log('✅ Created sp_resend_verification_code (new_code: VARCHAR(60))');

    console.log('\n🎉 Migration completed successfully!');
    console.log('Both stored procedures now accept bcrypt hashes (60 characters)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await conn.end();
  }
}

runMigration().catch(console.error);
