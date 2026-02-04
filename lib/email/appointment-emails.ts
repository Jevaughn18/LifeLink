import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Create reusable transporter using Gmail SMTP
let transporter: Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

// Send appointment scheduled email
export async function sendAppointmentScheduledEmail(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  specialty: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<boolean> {
  "use server";
  try {
    const mailOptions = {
      from: `"LifeLink Healthcare" <${process.env.GMAIL_USER}>`,
      to: patientEmail,
      subject: 'Appointment Scheduled - LifeLink Healthcare',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 10px; }
            .header { background: linear-gradient(135deg, #24AE7C 0%, #0D2A1F 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #24AE7C; }
            .details-row { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #eee; }
            .details-label { font-weight: 600; color: #555; min-width: 120px; }
            .details-value { color: #111; flex: 1; }
            .status-badge { background: #24AE7C; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 15px; font-size: 14px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            @media only screen and (max-width: 600px) {
              .container { padding: 5px; }
              .header { padding: 15px; }
              .header h1 { font-size: 18px; }
              .content { padding: 15px; }
              .appointment-card { padding: 15px; }
              .details-row { padding: 10px 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Scheduled Successfully</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>Your appointment has been successfully scheduled.</p>

              <div class="appointment-card">
                <div class="status-badge">Approved</div>
                <div class="details-row"><span class="details-label">Patient:</span><span class="details-value">${patientName}</span></div>
                <div class="details-row"><span class="details-label">Doctor:</span><span class="details-value">${doctorName}</span></div>
                <div class="details-row"><span class="details-label">Specialty:</span><span class="details-value">${specialty}</span></div>
                <div class="details-row"><span class="details-label">Date & Time:</span><span class="details-value">${appointmentDate} at ${appointmentTime}</span></div>
              </div>

              <p><strong>What to do next:</strong></p>
              <ul>
                <li>Arrive 15 minutes before your scheduled time</li>
                <li>Bring your insurance card and ID</li>
                <li>Bring any relevant medical records or test results</li>
                <li>Prepare a list of current medications you're taking</li>
              </ul>

              <p>If you need to cancel or reschedule, please contact us as soon as possible.</p>

              <p>Best regards,<br><strong>The LifeLink Healthcare Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LifeLink Healthcare</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
      `,
      text: `Appointment Scheduled Successfully

Dear ${patientName},

Your appointment has been successfully scheduled.

Patient: ${patientName}
Doctor: ${doctorName}
Specialty: ${specialty}
Date & Time: ${appointmentDate} at ${appointmentTime}
Status: Approved

What to do next:
- Arrive 15 minutes before your scheduled time
- Bring your insurance card and ID
- Bring any relevant medical records or test results
- Prepare a list of current medications you're taking

If you need to cancel or reschedule, please contact us as soon as possible.

Best regards,
The LifeLink Healthcare Team`,
    };

    const mailer = getTransporter();
    await mailer.sendMail(mailOptions);
    console.log('Appointment scheduled email sent successfully to:', patientEmail);
    return true;
  } catch (error) {
    console.error('Error sending appointment scheduled email:', error);
    return false;
  }
}

// Send appointment cancelled email
export async function sendAppointmentCancelledEmail(
  patientEmail: string,
  patientName: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  cancellationReason: string
): Promise<boolean> {
  "use server";
  try {
    const mailOptions = {
      from: `"LifeLink Healthcare" <${process.env.GMAIL_USER}>`,
      to: patientEmail,
      subject: 'Appointment Cancelled - LifeLink Healthcare',
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 10px; }
            .header { background: linear-gradient(135deg, #DC2626 0%, #7F1D1D 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .appointment-card { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #DC2626; }
            .details-row { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px solid #eee; }
            .details-label { font-weight: 600; color: #555; min-width: 120px; }
            .details-value { color: #111; flex: 1; }
            .status-badge { background: #DC2626; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 15px; font-size: 14px; }
            .reason-box { background: #FEF2F2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #DC2626; word-wrap: break-word; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; }
            @media only screen and (max-width: 600px) {
              .container { padding: 5px; }
              .header { padding: 15px; }
              .header h1 { font-size: 18px; }
              .content { padding: 15px; }
              .appointment-card { padding: 15px; }
              .details-row { padding: 10px 0; }
              .reason-box { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancelled</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>We regret to inform you that your appointment has been cancelled.</p>

              <div class="appointment-card">
                <div class="status-badge">Cancelled</div>
                <div class="details-row"><span class="details-label">Patient:</span><span class="details-value">${patientName}</span></div>
                <div class="details-row"><span class="details-label">Doctor:</span><span class="details-value">${doctorName}</span></div>
                <div class="details-row"><span class="details-label">Date & Time:</span><span class="details-value">${appointmentDate} at ${appointmentTime}</span></div>
              </div>

              <div class="reason-box">
                <strong>Reason for cancellation:</strong>
                <p>${cancellationReason}</p>
              </div>

              <p><strong>What to do next:</strong></p>
              <ul>
                <li>You can schedule a new appointment at your convenience</li>
                <li>Contact us if you have any questions or concerns</li>
                <li>Check your email for alternative appointment options (if applicable)</li>
              </ul>

              <p>We apologize for any inconvenience this may cause.</p>

              <p>Best regards,<br><strong>The LifeLink Healthcare Team</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 LifeLink Healthcare</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
      `,
      text: `Appointment Cancelled

Dear ${patientName},

We regret to inform you that your appointment has been cancelled.

Patient: ${patientName}
Doctor: ${doctorName}
Date & Time: ${appointmentDate} at ${appointmentTime}
Status: Cancelled

Reason for cancellation:
${cancellationReason}

What to do next:
- You can schedule a new appointment at your convenience
- Contact us if you have any questions or concerns
- Check your email for alternative appointment options (if applicable)

We apologize for any inconvenience this may cause.

Best regards,
The LifeLink Healthcare Team`,
    };

    const mailer = getTransporter();
    await mailer.sendMail(mailOptions);
    console.log('Appointment cancelled email sent successfully to:', patientEmail);
    return true;
  } catch (error) {
    console.error('Error sending appointment cancelled email:', error);
    return false;
  }
}
