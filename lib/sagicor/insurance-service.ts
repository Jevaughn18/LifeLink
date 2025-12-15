/**
 * Sagicor Insurance Integration Service
 *
 * This service generates anonymized health insights for Sagicor insurance
 * to help them with:
 * - Predictive claims modeling
 * - Regional health trend analysis
 * - Risk assessment and pricing
 * - Preventive care program planning
 *
 * IMPORTANT: NO patient identifiable information is ever shared
 */

"use server";

import { Query } from "node-appwrite";
import { databases, DATABASE_ID, PATIENT_COLLECTION_ID, APPOINTMENT_COLLECTION_ID } from "../appwrite.config";
import { createInsuranceInsight } from "../ai/gemini-service";
import { Appointment, Patient } from "@/types/appwrite.types";

export interface SagicorInsightData {
  timestamp: Date;
  insurance_plan: string;
  risk_category: 'Low' | 'Medium' | 'High' | 'Chronic';
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  region: string;
  visit_type: 'Acute' | 'Chronic' | 'Preventive' | 'Emergency';
  symptom_category?: string;
  patient_count: number;
}

export interface SagicorDashboardStats {
  totalPatients: number;
  totalAppointments: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    chronic: number;
  };
  visitTypeDistribution: {
    acute: number;
    chronic: number;
    preventive: number;
    emergency: number;
  };
  urgencyDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  regionalData: {
    region: string;
    count: number;
    averageRisk: string;
  }[];
  trendData: SagicorInsightData[];
}

/**
 * Generates anonymized insurance insights for approved appointments
 * Only includes data from patients who have given consent
 */
export async function generateSagicorInsights(): Promise<SagicorInsightData[]> {
  try {
    // Get all patients who have consented to data sharing
    const consentedPatients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("sagicorDataSharingConsent", [true])]
    );

    if (consentedPatients.documents.length === 0) {
      return [];
    }

    const patientIds = consentedPatients.documents.map((p) => p.$id);

    // Get appointments for consented patients with AI analysis
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("patient", patientIds),
        Query.notEqual("aiSymptomAnalysis", [null]),
      ]
    );

    const insights: SagicorInsightData[] = [];

    for (const apt of appointments.documents as Appointment[]) {
      const patient = consentedPatients.documents.find(
        (p) => p.$id === apt.patient.$id
      ) as Patient | undefined;

      if (!patient) continue;

      // Parse AI analyses
      let symptomAnalysis: SymptomAnalysisResult | null = null;
      let medicalAnalysis: MedicalHistoryAnalysis | null = null;

      if (apt.aiSymptomAnalysis) {
        try {
          symptomAnalysis = JSON.parse(apt.aiSymptomAnalysis);
        } catch (e) {
          console.error("Failed to parse symptom analysis", e);
        }
      }

      if (patient.aiMedicalAnalysis) {
        try {
          medicalAnalysis = JSON.parse(patient.aiMedicalAnalysis);
        } catch (e) {
          console.error("Failed to parse medical analysis", e);
        }
      }

      // Extract region from address (simple implementation)
      const region = extractRegion(patient.address);

      // Create anonymized insight
      const insight = await createInsuranceInsight(
        patient.insuranceProvider || "Unknown",
        region,
        symptomAnalysis || undefined,
        medicalAnalysis || undefined
      );

      insights.push({
        timestamp: new Date(apt.$createdAt),
        insurance_plan: insight.insurance_plan,
        risk_category: insight.risk_category,
        urgency_level: insight.urgency_level,
        region: insight.region,
        visit_type: insight.visit_type,
        symptom_category: symptomAnalysis?.symptom_category,
        patient_count: 1, // Each insight represents one patient visit
      });
    }

    return insights;
  } catch (error) {
    console.error("Error generating Sagicor insights:", error);
    return [];
  }
}

/**
 * Extracts region from address string
 * In production, this would use proper address parsing
 */
function extractRegion(address: string): string {
  // Simple implementation - extract last part of address as region
  const parts = address.split(",");
  if (parts.length > 0) {
    return parts[parts.length - 1].trim();
  }
  return "Unknown";
}

/**
 * Generates comprehensive dashboard statistics for Sagicor
 */
export async function getSagicorDashboardStats(): Promise<SagicorDashboardStats> {
  const insights = await generateSagicorInsights();

  const stats: SagicorDashboardStats = {
    totalPatients: new Set(insights.map(i => i.timestamp.toDateString())).size,
    totalAppointments: insights.length,
    riskDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      chronic: 0,
    },
    visitTypeDistribution: {
      acute: 0,
      chronic: 0,
      preventive: 0,
      emergency: 0,
    },
    urgencyDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    regionalData: [],
    trendData: insights,
  };

  // Calculate distributions
  const regionalMap = new Map<string, { count: number; riskScores: number[] }>();

  insights.forEach((insight) => {
    // Risk distribution
    stats.riskDistribution[insight.risk_category.toLowerCase() as keyof typeof stats.riskDistribution]++;

    // Visit type distribution
    stats.visitTypeDistribution[insight.visit_type.toLowerCase() as keyof typeof stats.visitTypeDistribution]++;

    // Urgency distribution
    stats.urgencyDistribution[insight.urgency_level.toLowerCase() as keyof typeof stats.urgencyDistribution]++;

    // Regional data
    if (!regionalMap.has(insight.region)) {
      regionalMap.set(insight.region, { count: 0, riskScores: [] });
    }
    const regionData = regionalMap.get(insight.region)!;
    regionData.count++;

    // Convert risk category to score for averaging
    const riskScore =
      insight.risk_category === 'Low' ? 1 :
      insight.risk_category === 'Medium' ? 2 :
      insight.risk_category === 'High' ? 3 : 4;
    regionData.riskScores.push(riskScore);
  });

  // Convert regional map to array
  regionalMap.forEach((data, region) => {
    const avgScore = data.riskScores.reduce((a, b) => a + b, 0) / data.riskScores.length;
    const avgRisk =
      avgScore < 1.5 ? 'Low' :
      avgScore < 2.5 ? 'Medium' :
      avgScore < 3.5 ? 'High' : 'Chronic';

    stats.regionalData.push({
      region,
      count: data.count,
      averageRisk: avgRisk,
    });
  });

  // Sort by count
  stats.regionalData.sort((a, b) => b.count - a.count);

  return stats;
}

/**
 * Exports Sagicor insights as CSV for integration
 */
export async function exportSagicorInsightsCSV(): Promise<string> {
  const insights = await generateSagicorInsights();

  const headers = [
    'Timestamp',
    'Insurance Plan',
    'Risk Category',
    'Urgency Level',
    'Region',
    'Visit Type',
    'Symptom Category',
  ];

  const rows = insights.map(insight => [
    insight.timestamp.toISOString(),
    insight.insurance_plan,
    insight.risk_category,
    insight.urgency_level,
    insight.region,
    insight.visit_type,
    insight.symptom_category || 'N/A',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csv;
}
