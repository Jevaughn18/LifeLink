/**
 * Database Initialization Script
 * Run this after setting up MySQL schema
 */

// IMPORTANT: Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function initDatabase() {
  console.log('🚀 Initializing LifeLink Database...\n');

  // Dynamic import after dotenv is loaded
  const { testConnection } = await import('../lib/database/mysql.config.js');

  console.log('Step 1: Testing MySQL connection...');
  const connected = await testConnection();

  if (!connected) {
    console.error('\n❌ Database connection failed!');
    console.error('\nPlease ensure:');
    console.error('1. MySQL is running');
    console.error('2. Database "lifelink_db" exists');
    console.error('3. You ran the schema.sql file in MySQL Workbench');
    console.error('4. Environment variables in .env are correct\n');
    process.exit(1);
  }

  console.log('\n✅ Database connection successful!');
  console.log('\n📋 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000');
  console.log('3. Test patient registration with AI features');
  console.log('4. Check admin dashboard for AI reviews\n');

  console.log('🎉 Database is ready!\n');
  process.exit(0);
}

initDatabase().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
