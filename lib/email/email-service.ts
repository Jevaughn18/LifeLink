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

// Generate 6-digit verification code (not a server action)
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
): Promise<boolean> {
  "use server";

  try {
    const mailOptions = {
      from: `"LifeLink Healthcare" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'LifeLink - Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #24AE7C 0%, #1a8c5f 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .code-box {
                background: white;
                border: 2px solid #24AE7C;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #24AE7C;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
              .warning {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 12px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>LifeLink</h1>
                <p>Email Verification</p>
              </div>
              <div class="content">
                <h2>Hello ${name},</h2>
                <p>Thank you for registering with LifeLink Healthcare. To complete your registration, please verify your email address using the code below:</p>

                <div class="code-box">
                  <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
                  <div class="code">${code}</div>
                </div>

                <p>Enter this code on the verification page to activate your account.</p>

                <div class="warning">
                  <strong>⚠️ Important:</strong> This code will expire in <strong>15 minutes</strong>. If you didn't request this verification, please ignore this email.
                </div>

                <p>If you have any questions or need assistance, please contact our support team.</p>

                <p>Best regards,<br><strong>The LifeLink Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2025 LifeLink Healthcare - Lifelink Healthcare</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Hello ${name},

Thank you for registering with LifeLink Healthcare.

Your verification code is: ${code}

This code will expire in 15 minutes.

If you didn't request this verification, please ignore this email.

Best regards,
The LifeLink Team
      `,
    };

    const mailer = getTransporter();
    await mailer.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}
