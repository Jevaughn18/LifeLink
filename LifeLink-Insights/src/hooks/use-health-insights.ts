import { useQuery } from '@tanstack/react-query';
import { fetchHealthInsights, type HealthInsightsFilters, type HealthInsightsResponse } from '@/services/lifelink-api';

/**
 * Custom hook to fetch health insights data from LifeLink API
 * Uses React Query for caching, loading states, and error handling
 */
export function useHealthInsights(filters?: HealthInsightsFilters) {
  return useQuery<HealthInsightsResponse, Error>({
    queryKey: ['health-insights', filters],
    queryFn: () => fetchHealthInsights(filters),
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Transform API data for Age Distribution Chart
 */
export function transformAgeDistribution(data: HealthInsightsResponse | undefined) {
  if (!data?.summary?.age_distribution) return [];

  const colorMap: Record<string, string> = {
    'Under 18': 'hsl(210, 100%, 50%)',
    '18-30': 'hsl(43, 100%, 55%)',
    '31-45': 'hsl(155, 100%, 40%)',
    '46-60': 'hsl(280, 70%, 60%)',
    '60+': 'hsl(17, 100%, 60%)',
  };

  return Object.entries(data.summary.age_distribution).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name] || 'hsl(210, 100%, 50%)',
  }));
}

/**
 * Transform API data for Symptom Categories Chart
 */
export function transformSymptomCategories(data: HealthInsightsResponse | undefined) {
  if (!data?.summary?.top_symptoms) return [];

  const colorMap = [
    'hsl(0, 84%, 50%)',
    'hsl(210, 100%, 50%)',
    'hsl(43, 100%, 55%)',
    'hsl(280, 70%, 60%)',
    'hsl(155, 100%, 40%)',
  ];

  return data.summary.top_symptoms.slice(0, 5).map((item, index) => ({
    category: item.symptom,
    count: item.count,
    fill: colorMap[index] || 'hsl(210, 100%, 50%)',
  }));
}

/**
 * Transform API data for Gender Distribution
 */
export function transformGenderDistribution(data: HealthInsightsResponse | undefined) {
  if (!data?.summary?.gender_distribution) return [];

  const colorMap: Record<string, string> = {
    'Male': 'hsl(210, 100%, 50%)',
    'Female': 'hsl(280, 70%, 60%)',
    'Other': 'hsl(43, 100%, 55%)',
  };

  return Object.entries(data.summary.gender_distribution).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name] || 'hsl(210, 100%, 50%)',
  }));
}

/**
 * Extract key metrics for dashboard cards
 */
export function extractMetrics(data: HealthInsightsResponse | undefined) {
  if (!data?.summary) {
    return {
      totalPatients: 0,
      totalAppointments: 0,
      highRiskPatients: 0,
      averageRiskScore: 0,
    };
  }

  // Calculate high-risk patients (age 60+ or cardiovascular issues as a rough estimate)
  const age60Plus = data.summary.age_distribution['60+'] || 0;
  const cardiovascularCases = data.summary.top_symptoms.find(
    s => s.symptom.toLowerCase().includes('cardiovascular') ||
         s.symptom.toLowerCase().includes('cardiac') ||
         s.symptom.toLowerCase().includes('heart')
  )?.count || 0;

  const highRiskPatients = Math.floor((age60Plus + cardiovascularCases) / 2);

  // Average risk score (mock calculation based on age distribution)
  const totalPatients = data.summary.total_consented_patients || 0;
  const averageRiskScore = totalPatients > 0
    ? ((age60Plus / totalPatients) * 10).toFixed(1)
    : '0.0';

  return {
    totalPatients: data.summary.total_consented_patients,
    totalAppointments: data.summary.total_appointments,
    highRiskPatients,
    averageRiskScore: parseFloat(averageRiskScore),
  };
}

/**
 * Transform API data for Patient Growth Chart
 */
export function transformMonthlyGrowth(data: HealthInsightsResponse | undefined) {
  if (!data?.summary?.monthly_growth || data.summary.monthly_growth.length === 0) {
    return [];
  }

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return data.summary.monthly_growth.map((item) => {
    const [year, month] = item.month.split('-');
    const monthName = monthNames[parseInt(month) - 1];

    return {
      month: monthName,
      patients: item.patients,
      appointments: item.appointments,
    };
  });
}

/**
 * Transform API data for Parish/Regional data
 */
export function transformParishData(data: HealthInsightsResponse | undefined) {
  if (!data?.summary?.parish_distribution) {
    return [];
  }

  return data.summary.parish_distribution;
}
