/**
 * Script to clear all users from the database
 * Run with: npx tsx scripts/clear-database.ts
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { query } from '../lib/database/mysql.config';

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...');

    // Delete all appointments first (foreign key constraint)
    const appointmentsDeleted = await query('DELETE FROM appointments');
    console.log(`✅ Deleted ${(appointmentsDeleted as any).affectedRows || 0} appointments`);

    // Delete all patients (foreign key constraint with users)
    const patientsDeleted = await query('DELETE FROM patients');
    console.log(`✅ Deleted ${(patientsDeleted as any).affectedRows || 0} patients`);

    // Delete all users
    const usersDeleted = await query('DELETE FROM users');
    console.log(`✅ Deleted ${(usersDeleted as any).affectedRows || 0} users`);

    // Delete all email verifications
    const verificationsDeleted = await query('DELETE FROM email_verifications');
    console.log(`✅ Deleted ${(verificationsDeleted as any).affectedRows || 0} email verifications`);

    console.log('✨ Database cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
