import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

/**
 * Sagicor Health Insights API
 *
 * This endpoint provides anonymized health data for patients who have
 * consented to share their data with Sagicor.
 *
 * Security: Requires API key authentication
 */

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey || apiKey !== process.env.SAGICOR_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        {
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'x-api-key, Content-Type',
          }
        }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const region = searchParams.get('region'); // Can be used for parish filtering

    // Build query with filters
    let queryStr = `
      SELECT
        -- Anonymized patient info
        CASE
          WHEN YEAR(CURDATE()) - YEAR(p.birth_date) < 18 THEN 'Under 18'
          WHEN YEAR(CURDATE()) - YEAR(p.birth_date) BETWEEN 18 AND 30 THEN '18-30'
          WHEN YEAR(CURDATE()) - YEAR(p.birth_date) BETWEEN 31 AND 45 THEN '31-45'
          WHEN YEAR(CURDATE()) - YEAR(p.birth_date) BETWEEN 46 AND 60 THEN '46-60'
          ELSE '60+'
        END as age_group,
        p.gender,
        p.insurance_provider,
        p.address,

        -- Appointment data
        a.reason as symptom_description,
        a.ai_symptom_analysis,
        a.status as appointment_status,
        a.schedule as appointment_date,
        a.primary_physician,

        -- Medical history (anonymized)
        p.allergies,
        p.current_medication,
        p.family_medical_history,

        -- Timestamps
        p.created_at as patient_registered_at,
        p.sagicor_consent_date

      FROM patients p
      LEFT JOIN appointments a ON p.id = a.patient_id
      WHERE p.sagicor_data_sharing_consent = TRUE
    `;

    const params: any[] = [];

    // Add date filters if provided
    if (startDate) {
      queryStr += ` AND a.schedule >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      queryStr += ` AND a.schedule <= ?`;
      params.push(endDate);
    }

    // Add region filter if provided (assumes address contains parish name)
    if (region) {
      queryStr += ` AND p.address LIKE ?`;
      params.push(`%${region}%`);
    }

    queryStr += ` ORDER BY a.schedule DESC`;

    // Execute query
    const results = await query<any>(queryStr, params);

    // Parse AI symptom analysis JSON
    const processedResults = results.map((row: any) => {
      let aiAnalysis = null;
      if (row.ai_symptom_analysis) {
        try {
          aiAnalysis = typeof row.ai_symptom_analysis === 'string'
            ? JSON.parse(row.ai_symptom_analysis)
            : row.ai_symptom_analysis;
        } catch (e) {
          console.error('Failed to parse AI analysis:', e);
        }
      }

      return {
        ...row,
        ai_symptom_analysis: aiAnalysis,
      };
    });

    // Generate summary statistics
    const summary = {
      total_consented_patients: new Set(results.map((r: any) => r.patient_registered_at)).size,
      total_appointments: results.length,
      age_distribution: calculateAgeDistribution(results),
      gender_distribution: calculateGenderDistribution(results),
      top_symptoms: extractTopSymptoms(results),
      insurance_providers: calculateInsuranceDistribution(results),
      monthly_growth: calculateMonthlyGrowth(results),
      parish_distribution: calculateParishDistribution(results),
    };

    return NextResponse.json({
      success: true,
      summary,
      data: processedResults,
      metadata: {
        generated_at: new Date().toISOString(),
        filters: {
          startDate: startDate || 'all',
          endDate: endDate || 'all',
          region: region || 'all',
        },
        count: processedResults.length,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'x-api-key, Content-Type',
      }
    });

  } catch (error) {
    console.error('Error fetching Sagicor health insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health insights' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'x-api-key, Content-Type',
        }
      }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'x-api-key, Content-Type',
    },
  });
}

// Helper function: Calculate age distribution
function calculateAgeDistribution(data: any[]) {
  const distribution: Record<string, number> = {};
  data.forEach((row) => {
    const ageGroup = row.age_group || 'Unknown';
    distribution[ageGroup] = (distribution[ageGroup] || 0) + 1;
  });
  return distribution;
}

// Helper function: Calculate gender distribution
function calculateGenderDistribution(data: any[]) {
  const distribution: Record<string, number> = {};
  data.forEach((row) => {
    const gender = row.gender || 'Unknown';
    distribution[gender] = (distribution[gender] || 0) + 1;
  });
  return distribution;
}

// Helper function: Extract top symptoms from AI analysis
function extractTopSymptoms(data: any[]) {
  const symptomCounts: Record<string, number> = {};

  data.forEach((row) => {
    if (row.ai_symptom_analysis) {
      const analysis = typeof row.ai_symptom_analysis === 'string'
        ? JSON.parse(row.ai_symptom_analysis)
        : row.ai_symptom_analysis;

      const category = analysis.symptom_category || analysis.category || analysis.symptom_group || 'Unknown';
      symptomCounts[category] = (symptomCounts[category] || 0) + 1;
    }
  });

  // Sort and return top 10
  return Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([symptom, count]) => ({ symptom, count }));
}

// Helper function: Calculate insurance provider distribution
function calculateInsuranceDistribution(data: any[]) {
  const distribution: Record<string, number> = {};
  data.forEach((row) => {
    const provider = row.insurance_provider || 'Unknown';
    distribution[provider] = (distribution[provider] || 0) + 1;
  });
  return distribution;
}

// Helper function: Calculate monthly growth (patients and appointments per month)
function calculateMonthlyGrowth(data: any[]) {
  const monthlyData: Record<string, { patients: Set<string>, appointments: number }> = {};

  data.forEach((row) => {
    if (row.patient_registered_at) {
      const date = new Date(row.patient_registered_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { patients: new Set(), appointments: 0 };
      }

      monthlyData[monthKey].patients.add(row.patient_registered_at);
      if (row.appointment_date) {
        monthlyData[monthKey].appointments++;
      }
    }
  });

  // Convert to array and sort by month
  return Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, stats]) => ({
      month,
      patients: stats.patients.size,
      appointments: stats.appointments,
    }));
}

// Helper function: Extract parish from address
function extractParish(address: string): string {
  const parishes = [
    'Kingston', 'St. Andrew', 'St. Thomas', 'Portland', 'St. Mary',
    'St. Ann', 'Trelawny', 'St. James', 'Hanover', 'Westmoreland',
    'St. Elizabeth', 'Manchester', 'Clarendon', 'St. Catherine'
  ];

  const addressUpper = address.toUpperCase();
  for (const parish of parishes) {
    if (addressUpper.includes(parish.toUpperCase())) {
      return parish;
    }
  }
  return 'Unknown';
}

// Helper function: Calculate parish distribution with risk metrics
function calculateParishDistribution(data: any[]) {
  const parishData: Record<string, {
    patients: Set<string>,
    appointments: number,
    age60Plus: number,
    cardiovascular: number,
  }> = {};

  data.forEach((row) => {
    const parish = extractParish(row.address || '');

    if (!parishData[parish]) {
      parishData[parish] = {
        patients: new Set(),
        appointments: 0,
        age60Plus: 0,
        cardiovascular: 0,
      };
    }

    parishData[parish].patients.add(row.patient_registered_at);
    if (row.appointment_date) {
      parishData[parish].appointments++;
    }
    if (row.age_group === '60+') {
      parishData[parish].age60Plus++;
    }

    // Check for cardiovascular symptoms
    if (row.ai_symptom_analysis) {
      const analysis = typeof row.ai_symptom_analysis === 'string'
        ? JSON.parse(row.ai_symptom_analysis)
        : row.ai_symptom_analysis;

      const category = analysis.symptom_category || analysis.category || '';
      if (category.toLowerCase().includes('cardiovascular') || category.toLowerCase().includes('cardiac')) {
        parishData[parish].cardiovascular++;
      }
    }
  });

  // Calculate risk scores
  return Object.entries(parishData)
    .filter(([parish]) => parish !== 'Unknown')
    .map(([parish, stats]) => {
      const totalPatients = stats.patients.size;
      const riskScore = totalPatients > 0
        ? Math.round(((stats.age60Plus + stats.cardiovascular) / totalPatients) * 100)
        : 0;

      return {
        parish,
        patients: totalPatients,
        appointments: stats.appointments,
        avgRiskScore: (riskScore / 10).toFixed(1),
        highRiskPercent: riskScore,
        riskLevel: riskScore > 60 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
      };
    })
    .sort((a, b) => b.highRiskPercent - a.highRiskPercent);
}
