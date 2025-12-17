/**
 * Test Email Verification System
 * Quick test to verify Gmail SMTP is working
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function testEmailSystem() {
  console.log('📧 Testing Email Verification System...\n');

  // Dynamic import after dotenv is loaded
  const { sendVerificationEmail, generateVerificationCode } = await import('../lib/email/email-service.js');

  try {
    // Generate a test code
    const testCode = generateVerificationCode();
    console.log('✅ Generated verification code:', testCode);

    // Test sending email (using the configured Gmail account)
    console.log('\n📨 Sending test email to:', process.env.GMAIL_USER);

    const emailSent = await sendVerificationEmail(
      process.env.GMAIL_USER!,
      'Test User',
      testCode
    );

    if (emailSent) {
      console.log('\n✅ SUCCESS! Email sent successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Check your inbox at:', process.env.GMAIL_USER);
      console.log('2. Look for an email from "LifeLink Healthcare"');
      console.log('3. Verify the 6-digit code is:', testCode);
      console.log('\n🎉 Email verification system is working!\n');
    } else {
      console.log('\n❌ ERROR: Failed to send email');
      console.log('Please check your Gmail credentials in .env file\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Verify GMAIL_USER is set correctly in .env');
    console.log('2. Verify GMAIL_APP_PASSWORD is correct (16 characters, no spaces)');
    console.log('3. Ensure 2-Step Verification is enabled on your Google Account');
    console.log('4. Make sure you generated an App Password (not regular password)\n');
    process.exit(1);
  }
}

testEmailSystem();
