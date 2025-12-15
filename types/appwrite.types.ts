import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
  // AI Analysis fields
  aiMedicalAnalysis?: string; // JSON stringified MedicalHistoryAnalysis
  sagicorDataSharingConsent?: boolean;
  sagicorConsentDate?: Date;
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
  // AI Analysis fields
  aiSymptomAnalysis?: string; // JSON stringified SymptomAnalysisResult
  aiReviewedBy?: string;
  aiReviewedAt?: Date;
  aiHumanApproved?: boolean;
  aiHumanNotes?: string;
}
