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

// Sanitizes user-supplied text before it is interpolated into AI prompts.
// Strips HTML/XML tags, collapses whitespace, enforces a character limit,
// and removes lines that look like prompt-injection attempts.
function sanitizeForPrompt(input: string, maxLength = 500): string {
  if (!input) return '';
  // Strip HTML / XML tags
  let s = input.replace(/<[^>]*>/g, '');
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  // Remove lines starting with common injection prefixes
  const injectionPrefixes = [
    'ignore previous', 'ignore all', 'disregard', 'forget everything',
    'you are now', 'act as', 'pretend', 'new instruction', 'system:',
    '[system]', '###', '<<<', 'prompt:', 'jailbreak',
  ];
  s = s
    .split(/[.\n]/)
    .filter((line) => {
      const lower = line.trim().toLowerCase();
      return !injectionPrefixes.some((prefix) => lower.startsWith(prefix));
    })
    .join(' ')
    .trim();
  // Enforce length cap
  return s.slice(0, maxLength);
}

export interface SymptomAnalysisResult {
  symptom_category: string;
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
  region: string;
  visit_type: 'Acute' | 'Chronic' | 'Preventive' | 'Emergency';
  anonymized: boolean;
}

async function parseAndRepairJson(text: string): Promise<any> {
  console.log('[DEBUG] Entering parseAndRepairJson with text:', text);

  try {
    // First attempt: standard JSON parsing
    const result = JSON.parse(text);
    console.log('[DEBUG] Initial JSON.parse successful.');
    return result;
  } catch (e) {
    console.log('[DEBUG] Initial JSON.parse failed. Trying regex extraction.');
    // Second attempt: try to extract JSON from a messy string
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        console.log('[DEBUG] Regex extraction and parse successful.');
        return result;
      } catch (e2) {
        console.log('[DEBUG] Regex extraction failed. Proceeding to AI repair.');
      }
    }

    console.warn("[DEBUG] Initial JSON parsing failed, attempting AI repair...");

    // Third attempt: AI-powered repair
    try {
      const repairResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY_GEMINI}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_ENDPOINT || 'http://localhost:3000',
          'X-Title': 'LifeLink Healthcare - JSON Repair',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite-preview-09-2025',
          messages: [
            {
              role: 'system',
              content: `You are a JSON repair utility. The user will provide a string that failed to parse as JSON.
                        Your task is to correct any syntax errors and return ONLY the valid JSON object.
                        Do not include any explanatory text, markdown, or anything other than the raw, corrected JSON.`,
            },
            {
              role: 'user',
              content: `Please repair the following text to make it valid JSON:\n\n${text}`,
            },
          ],
          temperature: 0.0, // Zero temperature for deterministic repair
          max_tokens: 500,
        }),
      });

      if (!repairResponse.ok) {
        const errorBody = await repairResponse.text();
        console.error('[DEBUG] AI repair API error response:', errorBody);
        throw new Error(`AI repair API error: ${repairResponse.statusText}`);
      }

      const repairData = await repairResponse.json();
      const repairedContent = repairData.choices[0]?.message?.content;
      console.log('[DEBUG] AI repair response content:', repairedContent);


      if (!repairedContent) {
        throw new Error('AI repair service returned no content.');
      }

      // Final attempt to parse the repaired JSON
      const finalResult = JSON.parse(repairedContent);
      console.log('[DEBUG] AI repair and parse successful.');
      return finalResult;
    } catch (repairError) {
      console.error('[DEBUG] AI JSON repair failed:', repairError);
      throw new Error('Failed to parse and repair JSON from AI response.');
    }
  }
}

/**
 * Analyzes patient symptom descriptions using Gemini AI
 * Converts unstructured text into structured medical data
 */
export async function analyzeSymptoms(
  symptomText: string
): Promise<SymptomAnalysisResult> {
  const sanitized = sanitizeForPrompt(symptomText);
  console.log('[DEBUG] Starting analyzeSymptoms for text:', sanitized);
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

"${sanitized}"

Provide structured output in this EXACT JSON format:
{
  "symptom_category": "one of: Cardiovascular, Respiratory, Gastrointestinal, Neurological, Musculoskeletal, Dermatological, Mental Health, General/Other",
  "keywords": ["keyword1", "keyword2"],
  "recommended_specialty": "specialty name or General Practice",
  "requires_human_review": true/false,
  "confidence_score": 0.0-1.0,
  "reasoning": "brief explanation of your categorization"
}`,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent medical outputs
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[DEBUG] OpenRouter API error response:', errorBody);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    console.log('[DEBUG] Raw AI response content:', content);

    if (!content) {
      throw new Error('No response from AI service');
    }

    // Use the robust parsing and repair function
    const result = await parseAndRepairJson(content);
    console.log('[DEBUG] Successfully parsed and repaired JSON:', result);

    // Validate response structure
    if (!result.symptom_category) {
      throw new Error('Invalid AI response structure: missing symptom_category');
    }

    return result as SymptomAnalysisResult;
  } catch (error) {
    console.error('[DEBUG] Final error in analyzeSymptoms:', error);

    // Return safe fallback that requires human review
    return {
      symptom_category: 'General/Other',
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
Allergies: ${sanitizeForPrompt(allergies || '', 200) || 'None reported'}
Current Medications: ${sanitizeForPrompt(currentMedication || '', 200) || 'None reported'}
Family Medical History: ${sanitizeForPrompt(familyHistory || '', 300) || 'None reported'}
Past Medical History: ${sanitizeForPrompt(pastHistory || '', 300) || 'None reported'}
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

    const result = await parseAndRepairJson(content);
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
  // Determine visit type based on medical history
  let visitType: InsuranceInsight['visit_type'] = 'Acute';

  if (medicalHistoryAnalysis?.chronic_conditions.length && medicalHistoryAnalysis.chronic_conditions.length > 0) {
    visitType = 'Chronic';
  } else if (medicalHistoryAnalysis?.preventive_care_recommended) {
    visitType = 'Preventive';
  }

  return {
    insurance_plan: insurancePlan,
    risk_category: medicalHistoryAnalysis?.risk_category || 'Medium',
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
    analysis.confidence_score < 0.7
  );
}
