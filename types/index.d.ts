/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = "Male" | "Female" | "Other";
declare type Status = "pending" | "scheduled" | "cancelled";

declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}

declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
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
}

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  timeZone: string;
  appointment: Appointment;
  type: string;
};

// AI Analysis Types
declare interface SymptomAnalysisResult {
  symptom_category: string;
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  keywords: string[];
  recommended_specialty: string;
  requires_human_review: boolean;
  confidence_score: number;
  reasoning: string;
}

declare interface MedicalHistoryAnalysis {
  chronic_conditions: string[];
  risk_category: 'Low' | 'Medium' | 'High';
  preventive_care_recommended: boolean;
  follow_up_needed: boolean;
}

declare interface AIAnalysisData {
  symptom_analysis?: SymptomAnalysisResult;
  medical_history_analysis?: MedicalHistoryAnalysis;
  reviewed_by?: string;
  reviewed_at?: Date;
  human_approved: boolean;
  human_notes?: string;
}

// Updated appointment params to include AI analysis
declare type CreateAppointmentParamsWithAI = CreateAppointmentParams & {
  ai_analysis?: SymptomAnalysisResult;
};

// Insurance consent and insights
declare interface InsuranceConsent {
  sagicor_data_sharing: boolean;
  consent_date?: Date;
}

declare interface InsuranceInsight {
  insurance_plan: string;
  risk_category: 'Low' | 'Medium' | 'High' | 'Chronic';
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  region: string;
  visit_type: 'Acute' | 'Chronic' | 'Preventive' | 'Emergency';
  anonymized: boolean;
}

// Extended RegisterUserParams with insurance consent
declare interface RegisterUserParamsExtended extends RegisterUserParams {
  sagicorDataSharingConsent?: boolean;
  ai_medical_analysis?: MedicalHistoryAnalysis;
}
