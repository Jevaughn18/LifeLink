import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const patientId = user.patientId;

    // Get patient's recent appointments with AI analysis
    const appointments = await query<any>(
      `SELECT id, reason, schedule, status, ai_symptom_analysis, primary_physician
       FROM appointments
       WHERE patient_id = ?
       ORDER BY schedule DESC
       LIMIT 5`,
      [patientId]
    );

    const insights = [];

    if (appointments.length === 0) {
      // No appointment history
      insights.push({
        id: 'welcome',
        title: 'Welcome to LifeLynk',
        description: 'Book your first appointment to start receiving personalized health insights based on AI analysis of your symptoms and medical history.',
        type: 'tip',
        priority: 'low'
      });
    } else {
      // Analyze AI symptom data
      for (const apt of appointments) {
        if (apt.ai_symptom_analysis) {
          try {
            const aiData = typeof apt.ai_symptom_analysis === 'string'
              ? JSON.parse(apt.ai_symptom_analysis)
              : apt.ai_symptom_analysis;

            // Check if requires human review (indicates critical case)
            if (aiData.requires_human_review) {
              insights.push({
                id: `review-${apt.id}`,
                title: 'Critical Symptoms Detected',
                description: `Your symptoms "${apt.reason.substring(0, 80)}..." require immediate medical attention. Please ensure you attend your appointment with ${apt.primary_physician}.`,
                type: 'urgent',
                priority: 'high'
              });
            }

            // Check for recommended specialty
            if (aiData.recommended_specialty && aiData.recommended_specialty !== 'General Practice') {
              const specialist = aiData.recommended_specialty;
              insights.push({
                id: `specialist-${apt.id}`,
                title: 'Specialist Consultation Recommended',
                description: `Based on AI analysis of your symptoms, consultation with a ${specialist} specialist is recommended for comprehensive evaluation and targeted treatment.`,
                type: 'tip',
                priority: 'medium'
              });
            }

            // Analyze symptom category
            if (aiData.symptom_category && aiData.symptom_category !== 'General/Other') {
              insights.push({
                id: `category-${apt.id}`,
                title: `${aiData.symptom_category} Symptoms Identified`,
                description: `AI has categorized your symptoms under ${aiData.symptom_category}. Your appointment with ${apt.primary_physician} will focus on addressing these specific health concerns.`,
                type: 'tip',
                priority: 'medium'
              });
            }

            // Low confidence score suggests need for detailed assessment
            if (aiData.confidence_score !== undefined && aiData.confidence_score < 0.3) {
              insights.push({
                id: `assessment-${apt.id}`,
                title: 'Comprehensive Assessment Needed',
                description: 'Your symptoms require detailed medical evaluation. The AI system recommends a thorough examination to determine the best course of treatment.',
                type: 'goal',
                priority: 'high'
              });
            }
          } catch (e) {
            console.error('Failed to parse AI analysis:', e);
          }
        }
      }

      // Check appointment frequency
      const recentAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.schedule);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return aptDate >= threeMonthsAgo;
      });

      if (recentAppointments.length >= 3) {
        insights.push({
          id: 'regular-checkups',
          title: 'Excellent Health Monitoring',
          description: `You've maintained regular appointments with ${recentAppointments.length} visits in the past 3 months. Consistent monitoring helps catch potential issues early.`,
          type: 'achievement',
          priority: 'low'
        });
      } else if (appointments.length > 0) {
        const lastAppointment = new Date(appointments[0].schedule);
        const daysSinceLastVisit = Math.floor((Date.now() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceLastVisit > 180) {
          insights.push({
            id: 'checkup-reminder',
            title: 'Schedule Regular Checkup',
            description: `It's been ${Math.floor(daysSinceLastVisit / 30)} months since your last appointment. Regular checkups help maintain optimal health and catch issues early.`,
            type: 'tip',
            priority: 'medium'
          });
        }
      }

      // If no specific insights, provide general health tip
      if (insights.length === 0) {
        insights.push({
          id: 'general-tip',
          title: 'Health Monitoring Active',
          description: 'Your appointments are being monitored by our AI system. Continue scheduling regular checkups to receive personalized health insights.',
          type: 'tip',
          priority: 'low'
        });
      }
    }

    // Sort by priority and limit to top 3
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    const sortedInsights = insights
      .sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      insights: sortedInsights,
    });
  } catch (error) {
    console.error('Error fetching health insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch health insights' },
      { status: 500 }
    );
  }
}
