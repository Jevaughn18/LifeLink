"use server";

import { query, queryOne, generateId } from "../database/mysql.config";
import { generateVerificationCode, sendVerificationEmail } from "../email/email-service";
import bcrypt from 'bcryptjs';

// CREATE VERIFICATION AND SEND EMAIL (Using Stored Procedure)
export const createEmailVerification = async ({
  name,
  email,
  phone,
  password,
}: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) => {
  try {
    // Generate 6-digit code
    const verificationCode = generateVerificationCode();
    const verificationId = generateId();

    // Hash both the verification code and password before storing
    const hashedCode = await bcrypt.hash(verificationCode, 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set expiration to 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const formattedExpiresAt = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    // Call stored procedure with phone parameter (use null if not provided)
    const result = await query(
      `CALL sp_create_email_verification(?, ?, ?, ?, ?, ?, ?, @p_success, @p_message)`,
      [verificationId, email, hashedCode, name, phone || null, hashedPassword, formattedExpiresAt]
    );

    // Get output parameters
    const output = await queryOne<any>(
      'SELECT @p_success as success, @p_message as message',
      []
    );

    if (!output?.success) {
      throw new Error(output?.message || 'Failed to create verification');
    }

    // Send verification email (use plain code for email)
    const emailSent = await sendVerificationEmail(email, name, verificationCode);

    if (!emailSent) {
      // Rollback by deleting the verification
      await query('DELETE FROM email_verifications WHERE id = ?', [verificationId]);
      throw new Error('Failed to send verification email. Please try again.');
    }

    return {
      success: true,
      verificationId,
      message: 'Verification code sent to your email.',
    };
  } catch (error: any) {
    console.error("Error creating email verification:", error);
    throw new Error(error.message || 'Failed to create verification');
  }
};

// VERIFY EMAIL WITH CODE (with bcrypt comparison)
export const verifyEmailCode = async ({
  email,
  code,
}: {
  email: string;
  code: string;
}) => {
  try {
    // Get the verification record with hashed code
    const verification = await queryOne<any>(
      `SELECT id, verification_code, expires_at, name, password_hash, is_verified
       FROM email_verifications
       WHERE email = ? AND is_verified = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    if (!verification) {
      return {
        success: false,
        message: 'Invalid verification code.',
      };
    }

    // Check if code has expired
    const now = new Date();
    const expiresAt = new Date(verification.expires_at);

    if (now > expiresAt) {
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      };
    }

    // Compare hashed code with provided code
    const isValidCode = await bcrypt.compare(code, verification.verification_code);

    if (!isValidCode) {
      return {
        success: false,
        message: 'Invalid verification code.',
      };
    }

    // Mark as verified
    await query(
      `UPDATE email_verifications
       SET is_verified = TRUE, verified_at = NOW()
       WHERE id = ?`,
      [verification.id]
    );

    return {
      success: true,
      message: 'Email verified successfully!',
      verificationData: {
        name: verification.name,
        email: email,
        passwordHash: verification.password_hash,
      },
    };
  } catch (error) {
    console.error("Error verifying email code:", error);
    return {
      success: false,
      message: 'Failed to verify code. Please try again.',
    };
  }
};

// RESEND VERIFICATION CODE (Using Stored Procedure)
export const resendVerificationCode = async (email: string) => {
  try {
    console.log('🔄 Resending verification code for:', email);

    // Check if email is already verified
    const verifiedCheck = await queryOne<any>(
      `SELECT id FROM email_verifications
       WHERE email = ? AND is_verified = TRUE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    console.log('✅ Verified check result:', verifiedCheck);

    if (verifiedCheck) {
      console.log('⚠️ Email already verified');
      return {
        success: false,
        message: 'Email already verified. Please proceed to login.',
      };
    }

    // Get verification data first for email sending
    const verification = await queryOne<any>(
      `SELECT name FROM email_verifications
       WHERE email = ? AND is_verified = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [email]
    );

    console.log('📧 Verification record:', verification);

    if (!verification) {
      console.log('❌ No pending verification found');
      return {
        success: false,
        message: 'No pending verification found for this email.',
      };
    }

    // Generate new code
    const newCode = generateVerificationCode();
    console.log('🔢 Generated new verification code');

    // Hash the new code
    const hashedCode = await bcrypt.hash(newCode, 10);
    console.log('🔐 Hashed new code');

    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const formattedExpiresAt = newExpiresAt.toISOString().slice(0, 19).replace('T', ' ');
    console.log('⏰ New expiration time:', formattedExpiresAt);

    // Update verification code directly (bypassing stored procedure)
    console.log('📝 Updating verification code directly in database');
    const updateResult = await query(
      `UPDATE email_verifications
       SET verification_code = ?, expires_at = ?
       WHERE email = ? AND is_verified = FALSE`,
      [hashedCode, formattedExpiresAt, email]
    );

    console.log('📤 Update result:', updateResult);

    // Check if any rows were updated
    const affectedRows = (updateResult as any).affectedRows;
    if (affectedRows === 0) {
      console.log('❌ No rows updated - verification not found');
      return {
        success: false,
        message: 'No pending verification found for this email.',
      };
    }

    console.log('✅ Verification code updated successfully');

    // Send new verification email
    console.log('📨 Sending verification email to:', email);
    const emailSent = await sendVerificationEmail(
      email,
      verification.name,
      newCode
    );

    console.log('📧 Email sent result:', emailSent);

    if (!emailSent) {
      console.log('❌ Failed to send email');
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.',
      };
    }

    console.log('✅ Resend verification code successful');
    return {
      success: true,
      message: 'New verification code sent to your email.',
    };
  } catch (error) {
    console.error("❌ Error resending verification code:", error);
    return {
      success: false,
      message: 'Failed to resend code. Please try again.',
    };
  }
};

// CHECK EMAIL VERIFICATION STATUS (Using Stored Procedure)
export const checkEmailVerificationStatus = async (email: string) => {
  try {
    console.log('🔍 Checking verification status for:', email);

    // Call stored procedure to check verification status
    await query(
      `CALL sp_check_email_verification_status(?, @p_is_verified, @p_message, @p_name, @p_phone, @p_password_hash)`,
      [email]
    );

    // Get output parameters
    const output = await queryOne<any>(
      'SELECT @p_is_verified as isVerified, @p_message as message, @p_name as name, @p_phone as phone, @p_password_hash as passwordHash',
      []
    );

    console.log('📊 Verification status output:', output);

    if (!output?.isVerified) {
      console.log('⚠️ Email not verified yet');
      return {
        isVerified: false,
        message: output?.message || 'Email not verified yet',
      };
    }

    console.log('✅ Email is verified');
    return {
      isVerified: true,
      message: output.message,
      verificationData: {
        name: output.name,
        email: email,
        phone: output.phone,
        passwordHash: output.passwordHash,
      },
    };
  } catch (error) {
    console.error("❌ Error checking verification status:", error);
    return {
      isVerified: false,
      message: 'Failed to check verification status.',
    };
  }
};