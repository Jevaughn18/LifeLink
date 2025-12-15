/**
 * Gemini AI Service for LifeLink Healthcare
 *
 * This service integrates Google's Gemini 2.5 Flash model via OpenRouter
 * to convert unstructured patient data into structured, actionable insights.
 *
 * Key Features:
 * - Symptom analysis and categorization
 * - Medical history structuring
 * - Urgency level classification
 * - Insurance data anonymization
 */

export interface SymptomAnalysisResult {
  symptom_category: string;
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  keywords: string[];
  recommended_specialty: string;
  requires_human_review: boolean;
  confidence_score: number;
  reasoning: string;
}

export interface MedicalHistoryAnalysis {
  chronic_conditions: string[];
  risk_category: 'Low' | 'Medium' | 'High';
  preventive_care_recommended: boolean;
  follow_up_needed: boolean;
}

export interface InsuranceInsight {
  insurance_plan: string;
  risk_category: 'Low' | 'Medium' | 'High' | 'Chronic';
  urgency_level: 'Low' | 'Medium' | 'High' | 'Critical';
  region: string;
  visit_type: 'Acute' | 'Chronic' | 'Preventive' | 'Emergency';
  anonymized: boolean;
}

/**
 * Analyzes patient symptom descriptions using Gemini AI
 * Converts unstructured text into structured medical data
 */
export async function analyzeSymptoms(
  symptomText: string
): Promise<SymptomAnalysisResult> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY_GEMINI}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_ENDPOINT || 'http://localhost:3000',
        'X-Title': 'LifeLink Healthcare',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite-preview-09-2025',
        messages: [
          {
            role: 'system',
            content: `You are a healthcare triage assistant for LifeLink, a patient management system.
Your job is to analyze patient symptom descriptions and provide structured output for healthcare professionals.

IMPORTANT RULES:
- DO NOT diagnose diseases or medical conditions
- DO NOT provide medical advice or treatment recommendations
- ONLY categorize symptoms and assess urgency for triage purposes
- When in doubt, mark for human review
- Be conservative with urgency levels - better to over-flag than under-flag

Respond ONLY with valid JSON. No explanatory text before or after.`,
          },
          {
            role: 'user',
            content: `Analyze this patient symptom description:

"${symptomText}"

Provide structured output in this EXACT JSON format:
{
  "symptom_category": "one of: Cardiovascular, Respiratory, Gastrointestinal, Neurological, Musculoskeletal, Dermatological, Mental Health, General/Other",
  "urgency_level": "Low/Medium/High/Critical",
  "keywords": ["keyword1", "keyword2"],
  "recommended_specialty": "specialty name or General Practice",
  "requires_human_review": true/false,
  "confidence_score": 0.0-1.0,
  "reasoning": "brief explanation of your assessment"
}`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent medical outputs
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI service');
    }

    // Parse JSON response
    const result = JSON.parse(content);

    // Validate response structure
    if (!result.symptom_category || !result.urgency_level) {
      throw new Error('Invalid AI response structure');
    }

    return result as SymptomAnalysisResult;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);

    // Return safe fallback that requires human review
    return {
      symptom_category: 'General/Other',
      urgency_level: 'Medium',
      keywords: [],
      recommended_specialty: 'General Practice',
      requires_human_review: true,
      confidence_score: 0,
      reasoning: 'AI analysis failed - requires manual review',
    };
  }
}

/**
 * Analyzes patient medical history to identify patterns and risks
 */
export async function analyzeMedicalHistory(
  allergies?: string,
  currentMedication?: string,
  familyHistory?: string,
  pastHistory?: string
): Promise<MedicalHistoryAnalysis> {
  try {
    const medicalData = `
Allergies: ${allergies || 'None reported'}
Current Medications: ${currentMedication || 'None reported'}
Family Medical History: ${familyHistory || 'None reported'}
Past Medical History: ${pastHistory || 'None reported'}
    `.trim();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY_GEMINI}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_ENDPOINT || 'http://localhost:3000',
        'X-Title': 'LifeLink Healthcare',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite-preview-09-2025',
        messages: [
          {
            role: 'system',
            content: `You are analyzing patient medical history for risk assessment purposes only.
DO NOT diagnose. ONLY identify patterns and categorize risk levels.

Respond ONLY with valid JSON.`,
          },
          {
            role: 'user',
            content: `Analyze this medical history:

${medicalData}

Provide structured output in this EXACT JSON format:
{
  "chronic_conditions": ["condition1", "condition2"],
  "risk_category": "Low/Medium/High",
  "preventive_care_recommended": true/false,
  "follow_up_needed": true/false
}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI service');
    }

    const result = JSON.parse(content);
    return result as MedicalHistoryAnalysis;
  } catch (error) {
    console.error('Error analyzing medical history:', error);

    return {
      chronic_conditions: [],
      risk_category: 'Medium',
      preventive_care_recommended: false,
      follow_up_needed: true,
    };
  }
}

/**
 * Creates anonymized insurance insights from patient data
 * This is what gets shared with Sagicor (with patient consent)
 */
export async function createInsuranceInsight(
  insurancePlan: string,
  region: string,
  symptomAnalysis?: SymptomAnalysisResult,
  medicalHistoryAnalysis?: MedicalHistoryAnalysis
): Promise<InsuranceInsight> {
  // Determine visit type based on urgency and medical history
  let visitType: InsuranceInsight['visit_type'] = 'Acute';

  if (symptomAnalysis?.urgency_level === 'Critical') {
    visitType = 'Emergency';
  } else if (medicalHistoryAnalysis?.chronic_conditions.length && medicalHistoryAnalysis.chronic_conditions.length > 0) {
    visitType = 'Chronic';
  } else if (medicalHistoryAnalysis?.preventive_care_recommended) {
    visitType = 'Preventive';
  }

  return {
    insurance_plan: insurancePlan,
    risk_category: medicalHistoryAnalysis?.risk_category || 'Medium',
    urgency_level: symptomAnalysis?.urgency_level || 'Medium',
    region: region,
    visit_type: visitType,
    anonymized: true, // Always true - no patient identifiers
  };
}

/**
 * Validates that AI analysis meets quality thresholds
 */
export function shouldRequireHumanReview(analysis: SymptomAnalysisResult): boolean {
  return (
    analysis.requires_human_review ||
    analysis.confidence_score < 0.7 ||
    analysis.urgency_level === 'Critical' ||
    analysis.urgency_level === 'High'
  );
}
