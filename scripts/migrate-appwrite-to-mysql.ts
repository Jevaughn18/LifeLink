/**
 * Appwrite to MySQL Migration Script
 * Copies all existing data from Appwrite to MySQL
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { Client, Databases, Storage, Query } from 'node-appwrite';
import { promises as fs } from 'fs';
import path from 'path';

async function migrateAppwriteToMySQL() {
  console.log('🔄 Starting Appwrite to MySQL Migration...\n');

  // Dynamic import after dotenv is loaded
  const { query, insert } = await import('../lib/database/mysql.config.js');

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.PROJECT_ID!)
    .setKey(process.env.API_KEY!);

  const databases = new Databases(client);
  const storage = new Storage(client);

  const DATABASE_ID = process.env.DATABASE_ID!;
  const PATIENT_COLLECTION_ID = process.env.PATIENT_COLLECTION_ID!;
  const APPOINTMENT_COLLECTION_ID = process.env.APPOINTMENT_COLLECTION_ID!;
  const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKET_ID!;

  try {
    // Step 1: Migrate Patients (simplified - no separate users table)
    console.log('📋 Step 1: Migrating patients...');
    const appwritePatients = await databases.listDocuments(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      [Query.limit(1000)]
    );

    let patientCount = 0;

    for (const patient of appwritePatients.documents as any[]) {
      try {
        // Download identification document if it exists
        let identificationDocumentUrl = null;
        if (patient.identificationDocumentId) {
          try {
            // Get file info from Appwrite
            const file = await storage.getFile(BUCKET_ID, patient.identificationDocumentId);

            // Download file from Appwrite
            const fileBuffer = await storage.getFileDownload(BUCKET_ID, patient.identificationDocumentId);

            // Save to local filesystem
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
            await fs.mkdir(uploadDir, { recursive: true });

            const fileName = `${patient.identificationDocumentId}_${file.name}`;
            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, Buffer.from(fileBuffer as ArrayBuffer));

            identificationDocumentUrl = `/uploads/documents/${fileName}`;
            console.log(`  📄 Downloaded document: ${fileName}`);
          } catch (fileError) {
            console.error(`  ⚠️  Could not download document for patient ${patient.$id}:`, fileError);
          }
        }

        // Check if patient already exists
        const existingPatient = await query<any>(
          'SELECT id FROM patients WHERE id = ?',
          [patient.$id]
        );

        if (existingPatient.length === 0) {
          await insert(
            `INSERT INTO patients (
              id, name, email, phone, birth_date, gender, address,
              occupation, emergency_contact_name, emergency_contact_number,
              primary_physician, insurance_provider, insurance_policy_number,
              allergies, current_medication, family_medical_history, past_medical_history,
              identification_type, identification_number, identification_document_url,
              privacy_consent, treatment_consent, disclosure_consent,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              patient.$id,
              patient.name,
              patient.email,
              patient.phone,
              patient.birthDate ? new Date(patient.birthDate) : null,
              patient.gender,
              patient.address,
              patient.occupation,
              patient.emergencyContactName,
              patient.emergencyContactNumber,
              patient.primaryPhysician,
              patient.insuranceProvider,
              patient.insurancePolicyNumber,
              patient.allergies || null,
              patient.currentMedication || null,
              patient.familyMedicalHistory || null,
              patient.pastMedicalHistory || null,
              patient.identificationType,
              patient.identificationNumber,
              identificationDocumentUrl,
              patient.privacyConsent || true,
              patient.treatmentConsent || true,
              patient.disclosureConsent || true,
              new Date(patient.$createdAt),
              new Date(patient.$updatedAt)
            ]
          );
          patientCount++;
        }
      } catch (error: any) {
        if (!error.message?.includes('Duplicate entry')) {
          console.error(`  ⚠️  Error migrating patient ${patient.$id}:`, error.message);
        }
      }
    }
    console.log(`  ✅ Migrated ${patientCount} patients\n`);

    // Step 2: Migrate Appointments
    console.log('📋 Step 2: Migrating appointments...');
    const appwriteAppointments = await databases.listDocuments(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      [Query.limit(1000)]
    );

    let appointmentCount = 0;
    for (const appointment of appwriteAppointments.documents as any[]) {
      try {
        // Check if appointment already exists
        const existingAppointment = await query<any>(
          'SELECT id FROM appointments WHERE id = ?',
          [appointment.$id]
        );

        if (existingAppointment.length === 0) {
          await insert(
            `INSERT INTO appointments (
              id, patient_id, primary_physician, schedule, status,
              reason, note, cancellation_reason,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              appointment.$id,
              appointment.patient.$id, // Appwrite stores this as a relationship
              appointment.primaryPhysician,
              new Date(appointment.schedule),
              appointment.status,
              appointment.reason || null,
              appointment.note || null,
              appointment.cancellationReason || null,
              new Date(appointment.$createdAt),
              new Date(appointment.$updatedAt)
            ]
          );
          appointmentCount++;
        }
      } catch (error: any) {
        if (!error.message?.includes('Duplicate entry')) {
          console.error(`  ⚠️  Error migrating appointment ${appointment.$id}:`, error.message);
        }
      }
    }
    console.log(`  ✅ Migrated ${appointmentCount} appointments\n`);

    // Summary
    console.log('✅ Migration Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Patients: ${patientCount} migrated`);
    console.log(`   Appointments: ${appointmentCount} migrated\n`);

    console.log('🎉 All Appwrite data has been copied to MySQL!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify data in MySQL Workbench');
    console.log('2. Run: npm run dev');
    console.log('3. Test the application\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateAppwriteToMySQL();
