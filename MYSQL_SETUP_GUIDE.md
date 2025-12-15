# MySQL Setup Guide for LifeLink

## 🎯 Quick Start

### Step 1: Run the SQL Schema in MySQL Workbench

1. **Open MySQL Workbench**
2. **Connect to your MySQL Server:**
   - Hostname: `127.0.0.1`
   - Port: `3306`
   - Username: `root`
   - Password: (leave blank if no password)

3. **Open the schema file:**
   - File → Open SQL Script
   - Navigate to: `/Users/jevaughnstewart/LifeLink/database/schema.sql`
   - Click "Open"

4. **Execute the script:**
   - Click the lightning bolt icon ⚡ (or press Ctrl/Cmd + Shift + Enter)
   - Wait for execution to complete
   - You should see: "Database schema created successfully!"

### Step 2: Verify Database Creation

Run this query to verify:
```sql
USE lifelink_db;
SHOW TABLES;
```

You should see:
- `users`
- `doctors`
- `patients`
- `appointments`
- `sagicor_insights`
- `audit_logs`

### Step 3: Verify Sample Data

Check that doctors were inserted:
```sql
SELECT * FROM doctors;
```

You should see 9 doctors.

---

## 📊 Database Schema Overview

### Tables Created

#### 1. **users**
- Basic user authentication data
- `id`, `name`, `email`, `phone`

#### 2. **doctors**
- Pre-populated with sample doctors
- Used for appointment assignments

#### 3. **patients** ⭐ (with AI fields)
- Full patient registration data
- Medical history
- Insurance information
- **NEW:** `ai_medical_analysis` (JSON)
- **NEW:** `sagicor_data_sharing_consent` (BOOLEAN)
- **NEW:** `sagicor_consent_date` (TIMESTAMP)

#### 4. **appointments** ⭐ (with AI fields)
- Appointment scheduling
- Symptom descriptions
- **NEW:** `ai_symptom_analysis` (JSON)
- **NEW:** `ai_reviewed_by` (VARCHAR)
- **NEW:** `ai_reviewed_at` (TIMESTAMP)
- **NEW:** `ai_human_approved` (BOOLEAN)
- **NEW:** `ai_human_notes` (TEXT)

#### 5. **sagicor_insights**
- Cached anonymized insurance data
- Regional health trends
- Risk categorization

#### 6. **audit_logs**
- Track all important actions
- AI review approvals
- Data modifications

---

## 🔧 Environment Variables

Already configured in `.env.local`:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=lifelink_db
```

**If you have a MySQL password**, update `MYSQL_PASSWORD` in `.env.local`.

---

## 🚀 Testing the Connection

### Option 1: Using Node.js Script

Create a test file:
```bash
node -e "const { testConnection } = require('./lib/database/mysql.config.ts'); testConnection();"
```

### Option 2: In MySQL Workbench

Run:
```sql
USE lifelink_db;
SELECT 'Connection successful!' AS status;
```

---

## 📝 Important SQL Features

### 1. **Views** (for easy queries)

**v_active_appointments** - All non-cancelled appointments with patient info
```sql
SELECT * FROM v_active_appointments LIMIT 10;
```

**v_sagicor_consented_patients** - Patients who consented to data sharing
```sql
SELECT * FROM v_sagicor_consented_patients;
```

**v_ai_review_queue** - Appointments needing AI review
```sql
SELECT * FROM v_ai_review_queue;
```

### 2. **Stored Procedures**

**Create Appointment with AI:**
```sql
CALL sp_create_appointment_with_ai(
  UUID(),                    -- id
  'user_id_here',           -- user_id
  'patient_id_here',        -- patient_id
  'Dr. John Green',         -- primary_physician
  NOW() + INTERVAL 1 DAY,   -- schedule
  'I have a headache',      -- reason
  'Prefer morning',         -- note
  '{"urgency": "Medium"}'   -- ai_analysis (JSON)
);
```

**Approve AI Analysis:**
```sql
CALL sp_approve_ai_analysis(
  'appointment_id_here',    -- appointment_id
  'Admin Name',             -- reviewed_by
  TRUE,                     -- approved
  'Looks good',             -- notes
  NULL                      -- updated_analysis (optional)
);
```

---

## 🔍 Useful Queries

### Check AI Analysis Status
```sql
SELECT
  a.id,
  p.name AS patient,
  a.reason,
  a.ai_symptom_analysis IS NOT NULL AS has_ai_data,
  a.ai_human_approved
FROM appointments a
JOIN patients p ON a.patient_id = p.id
ORDER BY a.created_at DESC
LIMIT 10;
```

### Sagicor Consent Statistics
```sql
SELECT
  COUNT(*) AS total_patients,
  SUM(sagicor_data_sharing_consent) AS consented,
  ROUND(SUM(sagicor_data_sharing_consent) / COUNT(*) * 100, 2) AS consent_percentage
FROM patients;
```

### Regional Health Trends
```sql
SELECT
  region,
  risk_category,
  COUNT(*) AS count
FROM sagicor_insights
GROUP BY region, risk_category
ORDER BY region, count DESC;
```

---

## 🛠 Troubleshooting

### Error: "Can't connect to MySQL server"
**Solution:**
1. Make sure MySQL is running
2. Check connection details in `.env.local`
3. Verify root user has no password (or update MYSQL_PASSWORD)

### Error: "Access denied for user 'root'@'localhost'"
**Solution:**
```sql
-- In MySQL Workbench, run:
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
```

### Error: "Unknown database 'lifelink_db'"
**Solution:**
Re-run the schema.sql file - it will create the database.

### Error: "Table doesn't exist"
**Solution:**
```sql
USE lifelink_db;
SHOW TABLES;
-- If empty, re-run schema.sql
```

---

## 📦 Migration from Appwrite

### What Changed:
- ✅ All Appwrite collections → MySQL tables
- ✅ Document IDs → UUIDs
- ✅ Appwrite queries → SQL queries
- ✅ All AI fields preserved
- ✅ Better performance with indexes
- ✅ SQL views for analytics
- ✅ Stored procedures for complex operations

### Benefits of MySQL:
1. **Faster queries** - Proper indexing
2. **Better joins** - Relational data handled efficiently
3. **Stored procedures** - Complex logic in database
4. **Views** - Simplified queries
5. **Full control** - No cloud service dependencies
6. **Cost** - Free, no usage limits

---

## 🎓 Next Steps

### 1. Verify Schema
```sql
USE lifelink_db;
SHOW TABLES;
SELECT * FROM doctors;
```

### 2. Test with Sample Data
```sql
-- Insert a test user
INSERT INTO users (id, name, email, phone)
VALUES (UUID(), 'Test User', 'test@example.com', '+18761234567');

-- Verify
SELECT * FROM users;
```

### 3. Update Application Code
The migration scripts will be created next to update all Appwrite calls to MySQL.

---

## 📞 Support

If you encounter issues:
1. Check MySQL is running: `sudo systemctl status mysql` (Linux) or check System Preferences (Mac)
2. Verify connection in MySQL Workbench
3. Check `.env.local` has correct credentials
4. Review error logs in terminal

---

**Database Ready! ✅**

Your MySQL database is now set up and ready for LifeLink with all AI features intact!
