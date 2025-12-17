# Test Your LifeLink → Sagicor Connection

## Quick Test Checklist

### ✅ Step 1: Start Both Applications

**Terminal 1:**
```bash
cd /Users/jevaughnstewart/LifeLink
npm run dev
```
Wait for: `Ready on http://localhost:3000`

**Terminal 2:**
```bash
cd /Users/jevaughnstewart/LifeLink/lifelink-insights
npm run dev
```
Wait for: `Local: http://localhost:8081/`

---

### ✅ Step 2: Test API Endpoint Directly

Open a **third terminal** and run:

```bash
curl -X GET "http://localhost:3000/api/sagicor/health-insights" \
  -H "x-api-key: sagicor_lifelink_2025_secure_api_key_prod" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "total_consented_patients": 0,
    "total_appointments": 0,
    "age_distribution": {},
    "gender_distribution": {},
    "top_symptoms": [],
    "insurance_providers": {}
  },
  "data": [],
  "metadata": {
    "generated_at": "2025-12-16T...",
    "filters": { "startDate": "all", "endDate": "all", "region": "all" },
    "count": 0
  }
}
```

If you see this, **API is working!** ✅

If you see `"error": "Unauthorized"`, check API keys match in both `.env` files.

---

### ✅ Step 3: Add Test Patient Data

1. Open http://localhost:3000
2. Click "Get Started"
3. Fill out the form:
   - **Name**: John Doe
   - **Email**: john@test.com
   - **Phone**: 876-555-1234

4. Verify email (check terminal for verification code)
5. Complete registration form:
   - **Birth Date**: 1990-01-01
   - **Gender**: Male
   - **Address**: 123 Main St, Kingston, Jamaica
   - **Occupation**: Engineer
   - **Primary Physician**: Dr. John Green
   - **Insurance Provider**: Sagicor
   - **✅ IMPORTANT: Check "Share data with Sagicor" checkbox**

6. Submit form
7. Create an appointment:
   - **Reason**: Fever and cough
   - **Date**: Tomorrow
   - **Doctor**: Any doctor

8. As admin, approve the appointment (password: 111111)

---

### ✅ Step 4: View Data in Sagicor Dashboard

1. Open http://localhost:8081/login
2. Login (any credentials work in dev mode)
3. Navigate to Dashboard
4. **You should see:**
   - Total Consented Patients: **1**
   - Active Appointments: **1**
   - Age Distribution chart with data
   - Symptoms chart if AI analyzed the appointment

---

### ✅ Step 5: Browser Console Test

1. Open http://localhost:8081/dashboard
2. Open browser DevTools (F12)
3. Go to Console tab
4. Paste and run:

```javascript
// Test API fetch
fetch('http://localhost:3000/api/sagicor/health-insights', {
  headers: {
    'x-api-key': 'sagicor_lifelink_2025_secure_api_key_prod'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ API Response:', data);
  console.log('Total Patients:', data.summary.total_consented_patients);
  console.log('Total Appointments:', data.summary.total_appointments);
})
.catch(err => console.error('❌ Error:', err));
```

**Expected Output:**
```
✅ API Response: {success: true, summary: {...}, data: [...]}
Total Patients: 1
Total Appointments: 1
```

---

### ✅ Step 6: Check Network Tab

1. Still in DevTools, go to **Network** tab
2. Refresh the Sagicor dashboard
3. Look for request: `health-insights`
4. Click on it
5. **Check:**
   - Status: `200 OK` ✅
   - Response contains patient data ✅
   - Request Headers include `x-api-key` ✅

---

## 🔍 Debugging

### Problem: "Unauthorized - Invalid API key"

**Solution:**
```bash
# Check LifeLink .env
grep SAGICOR_API_KEY /Users/jevaughnstewart/LifeLink/.env

# Check Sagicor .env
grep SAGICOR_API_KEY /Users/jevaughnstewart/LifeLink/lifelink-insights/.env

# They should match!
# Both should be: sagicor_lifelink_2025_secure_api_key_prod
```

---

### Problem: "Failed to fetch" or "Network Error"

**Solution:**
```bash
# Make sure LifeLink is running on port 3000
lsof -i :3000

# You should see: node (some process ID)
# If not, start LifeLink: cd /Users/jevaughnstewart/LifeLink && npm run dev
```

---

### Problem: Dashboard shows "No data available"

**Checklist:**
- [ ] Did you check the "Share data with Sagicor" checkbox when registering?
- [ ] Did you create an appointment for the patient?
- [ ] Is the appointment approved in admin panel?
- [ ] Is LifeLink API running and accessible?

**Quick Check:**
```bash
# Test API directly
curl http://localhost:3000/api/sagicor/health-insights \
  -H "x-api-key: sagicor_lifelink_2025_secure_api_key_prod"

# If you see "total_consented_patients": 0, no patients have consented
# Register a new patient with consent checkbox checked
```

---

### Problem: Charts show "Loading..." forever

**Solution:**
1. Open browser console (F12)
2. Look for errors (should be red text)
3. Common issues:
   - CORS error → LifeLink not running
   - 401 Unauthorized → API key mismatch
   - Network error → Wrong port or URL

**Debug:**
```javascript
// Check if React Query is working
window.localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')

// Force refetch
window.location.reload()
```

---

## ✅ Success Criteria

You know it's working when:

- [ ] ✅ curl command returns valid JSON with `"success": true`
- [ ] ✅ Sagicor dashboard loads without errors
- [ ] ✅ Metric cards show actual numbers (not "0" if you added data)
- [ ] ✅ Age Distribution chart displays
- [ ] ✅ Symptom Categories chart displays
- [ ] ✅ Network tab shows 200 OK for API requests
- [ ] ✅ Browser console has no errors

---

## 📸 Visual Confirmation

### Expected Dashboard View:

```
┌─────────────────────────────────────────────────────────┐
│  Executive Overview                   🟢 All systems OK │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │ Total    │  │ Active   │  │ High-Risk│  │ Average ││
│  │ Patients │  │ Appts    │  │ Patients │  │ Risk    ││
│  │    5     │  │    12    │  │    2     │  │   4.2   ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Patient Growth      │  │ Age Distribution       │  │
│  │ (Chart with line)   │  │ (Pie chart with data)  │  │
│  └─────────────────────┘  └─────────────────────────┘  │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────┐  │
│  │ Top        │  │ Regional   │  │ Alerts          │  │
│  │ Symptoms   │  │ Risk       │  │ Panel           │  │
│  └────────────┘  └────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Final Test

Run this complete test:

```bash
# Terminal 1: Start LifeLink
cd /Users/jevaughnstewart/LifeLink && npm run dev

# Terminal 2: Start Sagicor
cd /Users/jevaughnstewart/LifeLink/lifelink-insights && npm run dev

# Terminal 3: Test API
curl -s http://localhost:3000/api/sagicor/health-insights \
  -H "x-api-key: sagicor_lifelink_2025_secure_api_key_prod" | jq

# Expected: JSON with "success": true
```

Then open http://localhost:8081/dashboard and confirm charts load!

---

**If all steps pass, you're ready to go!** 🚀

Need help? Check [DATA_CONNECTION_COMPLETE.md](./DATA_CONNECTION_COMPLETE.md) for more details.
