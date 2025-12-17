"use server";

import { query, queryOne, generateId } from "../database/mysql.config";
import { analyzeMedicalHistory } from "../ai/gemini-service";
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';

// File storage directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'documents');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
}

// CREATE USER (simplified - just check if patient exists by email)
export const createUser = async (user: CreateUserParams) => {
  try {
    // Check if patient already exists by email
    const existingPatient = await queryOne<any>(
      'SELECT * FROM patients WHERE email = ?',
      [user.email]
    );

    if (existingPatient) {
      return { $id: existingPatient.id, ...existingPatient };
    }

    // Return user data for registration form
    // Actual patient creation happens in registerPatient
    const tempId = generateId();
    return {
      $id: tempId,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error("An error occurred while creating a new user:", error);
    throw error;
  }
};

// GET USER (simplified - get patient by ID or from email verification)
export const getUser = async (userId: string) => {
  try {
    // First check if patient exists
    const patient = await queryOne<any>(
      'SELECT * FROM patients WHERE id = ?',
      [userId]
    );

    if (patient) {
      return { $id: patient.id, ...patient };
    }

    // If not, check if there's a verified email with this temp user ID
    const verification = await queryOne<any>(
      `SELECT * FROM email_verifications
       WHERE temp_user_id = ? AND is_verified = TRUE
       ORDER BY verified_at DESC
       LIMIT 1`,
      [userId]
    );

    if (verification) {
      // Return user data from verification
      return {
        $id: userId,
        id: userId,
        name: verification.name,
        email: verification.email,
      };
    }

    // Return basic user object with just the ID if nothing found
    return { $id: userId, id: userId };
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error);
    // Return basic user object instead of throwing
    return { $id: userId, id: userId };
  }
};

// REGISTER PATIENT
export const registerPatient = async ({
  identificationDocument,
  ...patient
}: RegisterUserParams) => {
  try {
    // Run AI analysis on medical history
    let medicalAnalysis = null;
    if (patient.allergies || patient.currentMedication || patient.familyMedicalHistory || patient.pastMedicalHistory) {
      try {
        medicalAnalysis = await analyzeMedicalHistory(
          patient.allergies,
          patient.currentMedication,
          patient.familyMedicalHistory,
          patient.pastMedicalHistory
        );
        console.log('AI Medical History Analysis completed:', medicalAnalysis);
      } catch (aiError) {
        console.error('AI medical analysis failed, continuing without it:', aiError);
      }
    }

    // Handle file upload
    let fileId = null;
    let fileUrl = null;

    if (identificationDocument) {
      try {
        await ensureUploadDir();

        const blobFile = identificationDocument.get("blobFile") as Blob;
        const fileName = identificationDocument.get("fileName") as string;

        if (blobFile && fileName) {
          // Generate unique file ID
          fileId = generateId();
          const fileExtension = path.extname(fileName);
          const uniqueFileName = `${fileId}${fileExtension}`;
          const filePath = path.join(UPLOAD_DIR, uniqueFileName);

          // Convert Blob to Buffer and save
          const arrayBuffer = await blobFile.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await fs.writeFile(filePath, new Uint8Array(buffer));

          fileUrl = `/uploads/documents/${uniqueFileName}`;
        }
      } catch (fileError) {
        console.error('File upload error:', fileError);
        // Continue without file if upload fails
      }
    }

    // Create new patient (userId is now just the patient ID)
    const userId = generateId();
    const patientId = generateId();

    // Hash password if provided
    const hashedPassword = (patient as any).password
      ? await bcrypt.hash((patient as any).password, 10)
      : null;

    // Create user record first
    await query(
      `INSERT INTO users (id, name, email, phone, password)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, patient.name, patient.email, patient.phone, hashedPassword]
    );

    // Then create patient record
    await query(
      `INSERT INTO patients (
        id, user_id, name, email, phone, birth_date, gender, address, occupation,
        emergency_contact_name, emergency_contact_number, primary_physician,
        insurance_provider, insurance_policy_number,
        allergies, current_medication, family_medical_history, past_medical_history,
        identification_type, identification_number, identification_document_id, identification_document_url,
        privacy_consent, treatment_consent, disclosure_consent,
        ai_medical_analysis, sagicor_data_sharing_consent, sagicor_consent_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        userId,
        patient.name,
        patient.email,
        patient.phone,
        patient.birthDate,
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
        patient.identificationType || null,
        patient.identificationNumber || null,
        fileId,
        fileUrl,
        patient.privacyConsent,
        (patient as any).treatmentConsent || false,
        (patient as any).disclosureConsent || false,
        medicalAnalysis ? JSON.stringify(medicalAnalysis) : null,
        (patient as any).sagicorDataSharingConsent || false,
        (patient as any).sagicorDataSharingConsent ? new Date() : null,
      ]
    );

    const newPatient = await queryOne<any>(
      'SELECT * FROM patients WHERE id = ?',
      [patientId]
    );

    // Clean up temp_user_id from email_verifications after successful registration
    await query(
      `UPDATE email_verifications
       SET temp_user_id = NULL
       WHERE email = ? AND is_verified = TRUE`,
      [patient.email]
    );

    // Parse JSON fields
    if (newPatient.ai_medical_analysis) {
      newPatient.aiMedicalAnalysis = newPatient.ai_medical_analysis;
      delete newPatient.ai_medical_analysis;
    }

    return {
      $id: newPatient.id,
      ...newPatient,
      identificationDocumentId: newPatient.identification_document_id,
      identificationDocumentUrl: newPatient.identification_document_url,
    };
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error);
    throw error;
  }
};

// GET PATIENT (now by patient ID directly)
export const getPatient = async (userId: string) => {
  try {
    const patient = await queryOne<any>(
      'SELECT * FROM patients WHERE id = ?',
      [userId]
    );

    if (!patient) {
      return null;
    }

    // Parse JSON fields
    if (patient.ai_medical_analysis) {
      patient.aiMedicalAnalysis = patient.ai_medical_analysis;
    }

    return {
      $id: patient.id,
      ...patient,
      userId: patient.id, // userId is now the same as patient id
      birthDate: patient.birth_date,
      emergencyContactName: patient.emergency_contact_name,
      emergencyContactNumber: patient.emergency_contact_number,
      primaryPhysician: patient.primary_physician,
      insuranceProvider: patient.insurance_provider,
      insurancePolicyNumber: patient.insurance_policy_number,
      currentMedication: patient.current_medication,
      familyMedicalHistory: patient.family_medical_history,
      pastMedicalHistory: patient.past_medical_history,
      identificationType: patient.identification_type,
      identificationNumber: patient.identification_number,
      identificationDocumentId: patient.identification_document_id,
      identificationDocumentUrl: patient.identification_document_url,
      privacyConsent: patient.privacy_consent,
      treatmentConsent: patient.treatment_consent,
      disclosureConsent: patient.disclosure_consent,
      sagicorDataSharingConsent: patient.sagicor_data_sharing_consent,
      sagicorConsentDate: patient.sagicor_consent_date,
    };
  } catch (error) {
    console.error("An error occurred while retrieving the patient details:", error);
    throw error;
  }
};
