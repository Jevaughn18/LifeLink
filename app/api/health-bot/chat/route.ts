import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_GEMINI;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and user ID are required' },
        { status: 400 }
      );
    }

    let contextInfo = '';

    // Always fetch context on first message to personalize the experience
    if (conversationHistory.length === 0) {
      // Fetch all upcoming appointments (limit to 3 to save tokens)
      const appointments = await query<any>(
        `SELECT reason, primary_physician, schedule, ai_symptom_analysis
         FROM appointments
         WHERE patient_id = ? AND schedule >= NOW()
         ORDER BY schedule ASC
         LIMIT 3`,
        [userId]
      );

      const patient = await query<any>(
        `SELECT name FROM patients WHERE id = ?`,
        [userId]
      );

      if (patient.length > 0) {
        contextInfo += `Patient: ${patient[0].name}\n`;
      }

      if (appointments.length > 0) {
        contextInfo += `\nUpcoming Appointments (${appointments.length}):\n`;

        appointments.forEach((apt: any, index: number) => {
          const aptDate = new Date(apt.schedule);
          const dateStr = aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const timeStr = aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

          contextInfo += `\n${index + 1}. ${dateStr} at ${timeStr}\n`;
          contextInfo += `   Reason: ${apt.reason}\n`;
          contextInfo += `   Doctor: ${apt.primary_physician}\n`;

          // Add AI symptom analysis if available
          if (apt.ai_symptom_analysis) {
            try {
              const aiData = typeof apt.ai_symptom_analysis === 'string'
                ? JSON.parse(apt.ai_symptom_analysis)
                : apt.ai_symptom_analysis;

              if (aiData.symptom_category) {
                contextInfo += `   Category: ${aiData.symptom_category}\n`;
              }
            } catch (e) {
              // Skip if parsing fails
            }
          }
        });
      } else {
        contextInfo += `\nNo upcoming appointments scheduled.\n`;
      }
    }

    // Build focused system prompt with clear instructions
    const systemPrompt = contextInfo
      ? `You are Lia, a Health & Benefits Assistant for LifeLink healthcare platform.

STRICT INSTRUCTIONS:
- Stay focused ONLY on health, medical topics, appointments, and wellness
- DO NOT discuss unrelated topics (sports, politics, entertainment, etc.)
- Be concise and direct - avoid lengthy explanations unless asked
- Use the patient context below to personalize responses
- Remind users you provide information, not medical diagnoses
- Encourage discussing serious concerns with their doctor

PATIENT CONTEXT:
${contextInfo}

When discussing their appointment or symptoms, reference this context naturally to show you're aware of their situation.`
      : `You are Lia, a Health & Benefits Assistant for LifeLink healthcare platform.

STRICT INSTRUCTIONS:
- Stay focused ONLY on health, medical topics, appointments, and wellness
- DO NOT discuss unrelated topics (sports, politics, entertainment, etc.)
- Be concise and direct - avoid lengthy explanations unless asked
- Provide general health information only
- Remind users you provide information, not medical diagnoses
- Encourage discussing serious concerns with their doctor

Answer health questions helpfully while staying within your role as a health information assistant.`;

    // Build conversation for OpenRouter (OpenAI-compatible format)
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history (limit to last 6 messages to save tokens)
    const recentHistory = conversationHistory.slice(-6);
    recentHistory.forEach((msg: any) => {
      if (msg.role !== 'assistant' && msg.role !== 'user') return;

      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lifelink.app',
        'X-Title': 'LifeLink Health Bot'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from AI');
    }

    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error: any) {
    console.error('Error in health bot chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
