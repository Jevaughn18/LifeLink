/**
 * LifeLink API Service
 *
 * This service handles all API calls to the LifeLink backend
 * to fetch anonymized health data for Sagicor analysis.
 */

const API_BASE_URL = import.meta.env.VITE_LIFELINK_API_URL || 'http://localhost:3000';
const API_KEY = import.meta.env.VITE_SAGICOR_API_KEY;

// Type definitions for API responses
export interface HealthInsightsFilters {
  startDate?: string;
  endDate?: string;
  region?: string;
}

export interface AgeDistribution {
  [ageGroup: string]: number;
}

export interface GenderDistribution {
  [gender: string]: number;
}

export interface TopSymptom {
  symptom: string;
  count: number;
}

export interface InsuranceDistribution {
  [provider: string]: number;
}

export interface MonthlyGrowthData {
  month: string;
  patients: number;
  appointments: number;
}

export interface ParishData {
  parish: string;
  patients: number;
  appointments: number;
  avgRiskScore: string;
  highRiskPercent: number;
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface HealthInsightsSummary {
  total_consented_patients: number;
  total_appointments: number;
  age_distribution: AgeDistribution;
  gender_distribution: GenderDistribution;
  top_symptoms: TopSymptom[];
  insurance_providers: InsuranceDistribution;
  monthly_growth: MonthlyGrowthData[];
  parish_distribution: ParishData[];
}

export interface PatientDataRecord {
  age_group: string;
  gender: string;
  insurance_provider: string;
  symptom_description: string;
  ai_symptom_analysis: any;
  appointment_status: string;
  appointment_date: string;
  primary_physician: string;
  allergies: string | null;
  current_medication: string | null;
  family_medical_history: string | null;
  patient_registered_at: string;
  sagicor_consent_date: string;
}

export interface HealthInsightsResponse {
  success: boolean;
  summary: HealthInsightsSummary;
  data: PatientDataRecord[];
  metadata: {
    generated_at: string;
    filters: {
      startDate: string;
      endDate: string;
      region: string;
    };
    count: number;
  };
}

/**
 * Fetch health insights data from LifeLink API
 */
export async function fetchHealthInsights(
  filters: HealthInsightsFilters = {}
): Promise<HealthInsightsResponse> {
  const params = new URLSearchParams();

  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.region) params.append('region', filters.region);

  const url = `${API_BASE_URL}/api/sagicor/health-insights?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY || '',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch health insights');
  }

  return response.json();
}

/**
 * Export health data as CSV
 */
export function exportToCSV(data: PatientDataRecord[], filename = 'health-insights.csv') {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  // CSV Headers
  const headers = [
    'Age Group',
    'Gender',
    'Insurance Provider',
    'Symptom Description',
    'Appointment Status',
    'Appointment Date',
    'Primary Physician',
    'Allergies',
    'Current Medication',
    'Family Medical History',
    'Patient Registered At',
    'Consent Date',
  ];

  // Convert data to CSV rows
  const csvRows = data.map(row => [
    row.age_group,
    row.gender,
    row.insurance_provider,
    `"${row.symptom_description?.replace(/"/g, '""') || ''}"`,
    row.appointment_status,
    row.appointment_date,
    row.primary_physician,
    `"${row.allergies?.replace(/"/g, '""') || 'None'}"`,
    `"${row.current_medication?.replace(/"/g, '""') || 'None'}"`,
    `"${row.family_medical_history?.replace(/"/g, '""') || 'None'}"`,
    row.patient_registered_at,
    row.sagicor_consent_date,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(',')),
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export summary statistics as JSON
 */
export function exportSummaryJSON(summary: HealthInsightsSummary, filename = 'health-summary.json') {
  const jsonContent = JSON.stringify(summary, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
