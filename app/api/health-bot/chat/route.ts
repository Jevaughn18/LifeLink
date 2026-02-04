import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database/mysql.config';
import { Doctors } from '@/constants';
import { analyzeSymptoms } from '@/lib/ai/gemini-service';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY_GEMINI;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Define available functions for the AI
const availableFunctions = [
  {
    type: 'function',
    function: {
      name: 'check_doctor_availability',
      description: 'REQUIRED FIRST STEP in appointment booking. Retrieves and displays ALL available doctors as interactive cards for the user to select from. Call this whenever user wants to book an appointment or when they need to choose a different doctor. NEVER list doctor names in text - this function shows them as clickable cards.',
      parameters: {
        type: 'object',
        properties: {
          specialty: {
            type: 'string',
            description: 'Medical specialty (optional, e.g., cardiologist, general, pediatrics)'
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_available_dates',
      description: 'REQUIRED SECOND STEP after doctor selection. Retrieves and displays available appointment dates as an interactive calendar grid. Call this immediately after user selects a doctor. NEVER list dates in text - this function shows them as clickable date buttons organized by week.',
      parameters: {
        type: 'object',
        properties: {
          doctor_name: {
            type: 'string',
            description: 'Full name of the doctor (e.g., "John Green", "Leila Cameron")'
          }
        },
        required: ['doctor_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_available_slots',
      description: 'REQUIRED THIRD STEP after date selection. Retrieves and displays available appointment time slots as an interactive grid organized by Morning/Afternoon/Evening. Call this immediately after user selects a date. NEVER list times in text like "9:00, 9:30, 10:00" - this function shows them as clickable time slot buttons.',
      parameters: {
        type: 'object',
        properties: {
          doctor_name: {
            type: 'string',
            description: 'Full name of the doctor (e.g., "John Green", "Leila Cameron")'
          },
          date: {
            type: 'string',
            description: 'Date to check availability in YYYY-MM-DD format'
          }
        },
        required: ['doctor_name', 'date']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description: 'Book a medical appointment for the patient. This creates a pending appointment request. Always check available slots first before booking.',
      parameters: {
        type: 'object',
        properties: {
          doctor_name: {
            type: 'string',
            description: 'Full name of the doctor (e.g., "John Green", "Leila Cameron")'
          },
          date: {
            type: 'string',
            description: 'Preferred appointment date in YYYY-MM-DD format'
          },
          time: {
            type: 'string',
            description: 'Preferred time in HH:MM format (24-hour)'
          },
          reason: {
            type: 'string',
            description: 'Reason for the visit/appointment'
          }
        },
        required: ['doctor_name', 'date', 'time', 'reason']
      }
    }
  }
];

// Function handlers
async function executeFunctionCall(functionName: string, args: any, userId: string) {
  if (functionName === 'check_doctor_availability') {
    // Return list of available doctors
    // IMPORTANT: Do NOT include doctor names in the message text!
    // The frontend will display them as interactive cards
    return {
      available_doctors: Doctors.map(d => d.name),
      message: `I've retrieved the available doctors. Please select one from the cards above.`
    };
  }

  if (functionName === 'get_available_dates') {
    try {
      const { doctor_name } = args;

      // Get all days doctor is available
      const availability = await query<any>(
        `SELECT DISTINCT day_of_week, start_time, end_time, slot_duration_minutes
         FROM doctor_availability
         WHERE doctor_name = ? AND is_active = TRUE
         ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
        [doctor_name]
      );

      if (availability.length === 0) {
        return {
          success: false,
          dates: [],
          message: `Dr. ${doctor_name} has no availability scheduled.`
        };
      }

      // Get available days as a Set
      const availableDays = new Set(availability.map((a: any) => a.day_of_week));

      // Generate next 30 days
      const dates = [];
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = checkDate.toISOString().split('T')[0]; // YYYY-MM-DD

        // Check if doctor works on this day
        if (availableDays.has(dayOfWeek)) {
          // Get the schedule for this day
          const schedule = availability.find((a: any) => a.day_of_week === dayOfWeek);

          // Count available slots (not booked)
          const startTime = schedule.start_time;
          const endTime = schedule.end_time;
          const slotDuration = schedule.slot_duration_minutes;

          // Generate all possible slots for this day
          const allSlots = [];
          let currentTime = new Date(`${dateStr}T${startTime}`);
          const endDateTime = new Date(`${dateStr}T${endTime}`);

          while (currentTime < endDateTime) {
            allSlots.push(currentTime.toTimeString().slice(0, 5));
            currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
          }

          // Check how many are booked
          const bookedSlots = await query<any>(
            `SELECT TIME(schedule) as time FROM appointments
             WHERE primary_physician = ?
             AND DATE(schedule) = ?
             AND status IN ('pending', 'scheduled')`,
            [doctor_name, dateStr]
          );

          const bookedTimes = new Set(bookedSlots.map((b: any) => b.time));
          const availableSlots = allSlots.filter(slot => !bookedTimes.has(slot));

          if (availableSlots.length > 0) {
            dates.push({
              date: dateStr,
              dayOfWeek,
              availableSlots: availableSlots.length
            });
          }
        }
      }

      return {
        success: true,
        dates,
        doctor: doctor_name,
        message: dates.length > 0
          ? `Dr. ${doctor_name} has ${dates.length} available dates in the next 30 days.`
          : `Dr. ${doctor_name} has no available dates in the next 30 days. All slots are booked.`
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get available dates: ${error.message}`
      };
    }
  }

  if (functionName === 'get_available_slots') {
    try {
      const { doctor_name, date } = args;

      // Get day of week from the date
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Get doctor's availability for that day
      const availability = await query<any>(
        `SELECT start_time, end_time, slot_duration_minutes
         FROM doctor_availability
         WHERE doctor_name = ? AND day_of_week = ? AND is_active = TRUE`,
        [doctor_name, dayOfWeek]
      );

      if (availability.length === 0) {
        return {
          success: false,
          slots: [],
          message: `Dr. ${doctor_name} is not available on ${dayOfWeek}s.`
        };
      }

      const schedule = availability[0];
      const startTime = schedule.start_time;
      const endTime = schedule.end_time;
      const slotDuration = schedule.slot_duration_minutes;

      // Generate time slots
      const slots = [];
      let currentTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      while (currentTime < endDateTime) {
        const slotTime = currentTime.toTimeString().slice(0, 5); // HH:MM format

        // Check if this slot is already booked
        const isBooked = await query<any>(
          `SELECT id FROM appointments
           WHERE primary_physician = ?
           AND DATE(schedule) = ?
           AND TIME(schedule) = ?
           AND status IN ('pending', 'scheduled')`,
          [doctor_name, date, slotTime]
        );

        if (isBooked.length === 0) {
          slots.push({
            time: slotTime,
            formatted: currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })
          });
        }

        // Move to next slot
        currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
      }

      return {
        success: true,
        slots,
        doctor: doctor_name,
        date,
        dayOfWeek,
        message: slots.length > 0
          ? `Please select a time slot from the options shown above.`
          : `Dr. ${doctor_name} has no available slots on ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Please try selecting a different date.`
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get available slots: ${error.message}`
      };
    }
  }

  if (functionName === 'book_appointment') {
    try {
      const { doctor_name, date, time, reason } = args;

      // Validate doctor exists
      const doctorExists = Doctors.some(d => d.name.toLowerCase() === doctor_name.toLowerCase());
      if (!doctorExists) {
        return {
          success: false,
          error: `Doctor "${doctor_name}" not found. Please select a doctor from the available list.`
        };
      }

      // Check if the requested time slot is available
      const selectedDate = new Date(date);
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Get doctor's availability for that day
      const availability = await query<any>(
        `SELECT start_time, end_time, slot_duration_minutes
         FROM doctor_availability
         WHERE doctor_name = ? AND day_of_week = ? AND is_active = TRUE`,
        [doctor_name, dayOfWeek]
      );

      if (availability.length === 0) {
        return {
          success: false,
          error: `Dr. ${doctor_name} is not available on ${dayOfWeek}s. Please choose a different day.`
        };
      }

      // Check if the requested time is already booked
      const isBooked = await query<any>(
        `SELECT id FROM appointments
         WHERE primary_physician = ?
         AND DATE(schedule) = ?
         AND TIME(schedule) = ?
         AND status IN ('pending', 'scheduled')`,
        [doctor_name, date, time]
      );

      if (isBooked.length > 0) {
        return {
          success: false,
          error: `The time slot ${time} on ${date} is already booked. Please choose a different time.`
        };
      }

      // Create datetime string
      const scheduleDateTime = new Date(`${date}T${time}`);

      // Generate UUID for appointment
      const appointmentId = crypto.randomUUID();

      // Generate AI symptom analysis
      let aiAnalysis = null;
      try {
        const symptomAnalysis = await analyzeSymptoms(reason);
        aiAnalysis = JSON.stringify(symptomAnalysis);
        console.log('AI symptom analysis generated:', symptomAnalysis);
      } catch (error) {
        console.error('Failed to generate AI analysis:', error);
        // Continue without AI analysis rather than failing the booking
      }

      // Insert appointment into database with AI analysis
      await query(
        `INSERT INTO appointments (id, patient_id, primary_physician, schedule, reason, status, ai_symptom_analysis)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [appointmentId, userId, doctor_name, scheduleDateTime, reason, aiAnalysis]
      );

      return {
        success: true,
        message: `Appointment successfully booked with Dr. ${doctor_name} on ${date} at ${time} for "${reason}". Status: Pending approval.`,
        appointment: {
          id: appointmentId,
          doctor: doctor_name,
          date,
          time,
          reason
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to book appointment: ${error.message}`
      };
    }
  }

  return { error: 'Unknown function' };
}

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

⚠️ CRITICAL: During appointment booking, you MUST ALWAYS call the designated functions (check_doctor_availability, get_available_dates, get_available_slots). NEVER list doctors, dates, or times in plain text. The user interface depends on these function calls to show interactive grids and cards. Listing information as text breaks the user experience.

STRICT INSTRUCTIONS:
- Stay focused ONLY on health, medical topics, appointments, and wellness
- DO NOT discuss unrelated topics (sports, politics, entertainment, etc.)
- Be concise and direct - avoid lengthy explanations unless asked
- Use the patient context below to personalize responses
- Remind users you provide information, not medical diagnoses
- Encourage discussing serious concerns with their doctor

APPOINTMENT BOOKING - CRITICAL RULES:

RULE #1: NEVER list doctor names in plain text. ALWAYS call check_doctor_availability to show interactive cards.

RULE #2: NEVER ask user to provide dates. ALWAYS call get_available_dates to show interactive grid.

RULE #3: NEVER list time slots in text. ALWAYS call get_available_slots to show interactive grid.

BOOKING FLOW (MANDATORY):
Step 1: User mentions booking → IMMEDIATELY call check_doctor_availability (shows interactive doctor cards)
Step 2: User selects doctor → IMMEDIATELY call get_available_dates (shows interactive date grid)
Step 3: User selects date → IMMEDIATELY call get_available_slots (shows interactive time grid)
Step 4: User selects time → Ask for reason
Step 5: User provides reason → call book_appointment

CRITICAL SCENARIOS:
- "book appointment" / "see doctor" → call check_doctor_availability
- Doctor has no availability, user says "yes"/"ok"/"another doctor" → call check_doctor_availability AGAIN
- User wants different doctor after seeing dates → call check_doctor_availability AGAIN
- User names a doctor directly → call get_available_dates with that doctor
- NEVER respond with text-only doctor lists - ALWAYS call the function

PATIENT CONTEXT:
${contextInfo}

When discussing their appointment or symptoms, reference this context naturally to show you're aware of their situation.`
      : `You are Lia, a Health & Benefits Assistant for LifeLink healthcare platform.

⚠️ CRITICAL: During appointment booking, you MUST ALWAYS call the designated functions (check_doctor_availability, get_available_dates, get_available_slots). NEVER list doctors, dates, or times in plain text. The user interface depends on these function calls to show interactive grids and cards. Listing information as text breaks the user experience.

STRICT INSTRUCTIONS:
- Stay focused ONLY on health, medical topics, appointments, and wellness
- DO NOT discuss unrelated topics (sports, politics, entertainment, etc.)
- Be concise and direct - avoid lengthy explanations unless asked
- Provide general health information only
- Remind users you provide information, not medical diagnoses
- Encourage discussing serious concerns with their doctor

APPOINTMENT BOOKING - CRITICAL RULES:

RULE #1: NEVER list doctor names in plain text. ALWAYS call check_doctor_availability to show interactive cards.

RULE #2: NEVER ask user to provide dates. ALWAYS call get_available_dates to show interactive grid.

RULE #3: NEVER list time slots in text. ALWAYS call get_available_slots to show interactive grid.

BOOKING FLOW (MANDATORY):
Step 1: User mentions booking → IMMEDIATELY call check_doctor_availability (shows interactive doctor cards)
Step 2: User selects doctor → IMMEDIATELY call get_available_dates (shows interactive date grid)
Step 3: User selects date → IMMEDIATELY call get_available_slots (shows interactive time grid)
Step 4: User selects time → Ask for reason
Step 5: User provides reason → call book_appointment

CRITICAL SCENARIOS:
- "book appointment" / "see doctor" → call check_doctor_availability
- Doctor has no availability, user says "yes"/"ok"/"another doctor" → call check_doctor_availability AGAIN
- User wants different doctor after seeing dates → call check_doctor_availability AGAIN
- User names a doctor directly → call get_available_dates with that doctor
- NEVER respond with text-only doctor lists - ALWAYS call the function

Answer health questions helpfully while staying within your role as a health information assistant.`;

    // Build conversation for OpenRouter (OpenAI-compatible format)
    const messages: any[] = [
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

    // Call OpenRouter API with function calling enabled
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
        temperature: 0.3, // Lower temperature for more deterministic function calling
        max_tokens: 1024,
        tools: availableFunctions,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error('Failed to get response from AI');
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from AI');
    }

    const assistantMessage = data.choices[0].message;

    // Check if AI wants to call a function
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      // Execute the function
      const functionResult = await executeFunctionCall(functionName, functionArgs, userId);

      // Add assistant message with tool call to conversation
      messages.push(assistantMessage);

      // Add function result to conversation
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: functionName,
        content: JSON.stringify(functionResult)
      });

      // Make second API call with function result
      const secondResponse = await fetch(OPENROUTER_API_URL, {
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
          temperature: 0.3, // Lower temperature for more deterministic function calling
          max_tokens: 1024,
          tools: availableFunctions,
        }),
      });

      if (!secondResponse.ok) {
        const errorData = await secondResponse.text();
        console.error('OpenRouter API error (second call):', errorData);
        throw new Error('Failed to get response from AI');
      }

      const secondData = await secondResponse.json();
      const finalResponse = secondData.choices[0]?.message?.content;

      return NextResponse.json({
        success: true,
        response: finalResponse || 'I was able to process that, but had trouble formulating a response.',
        functionCalled: functionName,
        functionResult
      });
    }

    // No function call - return normal response
    const aiResponse = assistantMessage.content;

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
