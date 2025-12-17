# Troubleshooting: Still Seeing Dummy Data?

## ✅ Step 1: Make Sure You're on the Right Page

The **only page connected to real data** is:
- **URL**: http://localhost:8081/dashboard
- **Page Title**: "Executive Overview"

### Pages Still Using Dummy Data (Not Connected Yet):
- ❌ Regional Health Map (`/regional-map`)
- ❌ Disease Trends (`/disease-trends`)
- ❌ Risk Scoring (`/risk-scoring`)
- ❌ Product Optimizer (`/product-optimizer`)
- ❌ Claims Prediction (`/claims-prediction`)
- ❌ Preventive Care (`/preventive-care`)
- ❌ Fraud Detection (`/fraud-detection`)

**Solution**: Navigate to http://localhost:8081/dashboard to see real data.

---

## ✅ Step 2: Restart the Dev Server

If you're on `/dashboard` but still see dummy data:

```bash
# Stop the Sagicor dev server (Ctrl+C in Terminal 2)
# Then restart it:
cd /Users/jevaughnstewart/LifeLink/lifelink-insights
npm run dev
```

Wait for it to say: `Local: http://localhost:8081/`

Then refresh your browser: http://localhost:8081/dashboard

---

## ✅ Step 3: Clear Browser Cache

Sometimes the browser caches old JavaScript:

**Option 1: Hard Refresh**
- Chrome/Edge: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

**Option 2: Clear Cache Manually**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

## ✅ Step 4: Check What Data You Should See

### If You Have NO Patients with Sagicor Consent:

**Metrics Cards:**
- Total Consented Patients: `0`
- Active Appointments: `0`
- High-Risk Patients: `0`
- Average Risk Score: `0.0`

**Charts:**
- Age Distribution: "No age distribution data available"
- Top Symptoms: "No symptom data available"

This is **correct behavior** - you need to add test data!

### If You Have Patients with Sagicor Consent:

**Metrics Cards:**
- Total Consented Patients: **Actual number**
- Active Appointments: **Actual number**
- High-Risk Patients: **Calculated number**
- Average Risk Score: **Calculated score**

**Charts:**
- Age Distribution: **Real pie chart with data**
- Top Symptoms: **Real bar chart with data**

---

## ✅ Step 5: Add Test Data

If you see `0` everywhere, you need patients with Sagicor consent:

1. Go to http://localhost:3000
2. Register a NEW patient
3. **✅ IMPORTANT: Check "Share data with Sagicor" checkbox**
4. Create an appointment for that patient
5. Go to admin panel and approve the appointment
6. Refresh Sagicor dashboard

---

## ✅ Step 6: Verify API is Working

Open browser console on Sagicor dashboard (F12) and run:

```javascript
fetch('http://localhost:3000/api/sagicor/health-insights', {
  headers: { 'x-api-key': 'sagicor_lifelink_2025_secure_api_key_prod' }
})
.then(res => res.json())
.then(data => {
  console.log('API Response:', data);
  if (data.success) {
    console.log('✅ API Working!');
    console.log('Total Patients:', data.summary.total_consented_patients);
    console.log('Total Appointments:', data.summary.total_appointments);
  } else {
    console.error('❌ API Error:', data);
  }
})
.catch(err => console.error('❌ Fetch Error:', err));
```

**Expected Output:**
```
API Response: {success: true, summary: {...}, data: [...]}
✅ API Working!
Total Patients: 5
Total Appointments: 12
```

---

## ✅ Step 7: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for request named: `health-insights`

**If you see it:**
- Click on it
- Check Status: Should be `200 OK`
- Check Response tab: Should have patient data
- ✅ API is working!

**If you DON'T see it:**
- The component might not be loading
- Check Console tab for errors
- Make sure you're on `/dashboard` page

---

## ✅ Step 8: Check for Errors

Open browser console (F12) and look for:

### Common Errors:

**1. "Unauthorized - Invalid API key"**
```
Solution: API keys don't match
- Check: /Users/jevaughnstewart/LifeLink/.env
- Check: /Users/jevaughnstewart/LifeLink/lifelink-insights/.env
- Both should have: sagicor_lifelink_2025_secure_api_key_prod
```

**2. "Failed to fetch" or "Network Error"**
```
Solution: LifeLink not running
- cd /Users/jevaughnstewart/LifeLink
- npm run dev
- Wait for "Ready on http://localhost:3000"
```

**3. "Cannot read property of undefined"**
```
Solution: Data format mismatch
- This shouldn't happen, but if it does:
- Check browser console for the exact error
- Share the error message
```

---

## 🔍 Diagnostic Checklist

Run through this checklist:

- [ ] I'm on http://localhost:8081/dashboard (not a different page)
- [ ] I restarted the Sagicor dev server
- [ ] I did a hard refresh in the browser (Cmd+Shift+R)
- [ ] LifeLink is running on port 3000
- [ ] I registered at least 1 patient with Sagicor consent checkbox
- [ ] The API test in console returns `success: true`
- [ ] Network tab shows `health-insights` request with 200 OK
- [ ] No errors in browser console

---

## 🎯 Quick Reset

If nothing works, try a complete reset:

```bash
# Terminal 1: Stop LifeLink (Ctrl+C)
# Terminal 2: Stop Sagicor (Ctrl+C)

# Clear any cache
cd /Users/jevaughnstewart/LifeLink/lifelink-insights
rm -rf node_modules/.vite
rm -rf dist

# Restart everything
cd /Users/jevaughnstewart/LifeLink
npm run dev

# In another terminal
cd /Users/jevaughnstewart/LifeLink/lifelink-insights
npm run dev
```

Then:
1. Open http://localhost:8081/dashboard
2. Hard refresh (Cmd+Shift+R)
3. Check if data loads

---

## 📸 What You Should See

### Main Dashboard Page (http://localhost:8081/dashboard)

```
┌──────────────────────────────────────────────────────────┐
│  Executive Overview                    🟢 All systems OK │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────┐│
│  │ Total      │  │ Active     │  │ High-Risk  │  │ Avg││
│  │ Consented  │  │ Appts      │  │ Patients   │  │Risk││
│  │ Patients   │  │            │  │            │  │    ││
│  │            │  │            │  │            │  │    ││
│  │    5 ← REAL│  │   12 ← REAL│  │    2 ← REAL│  │ 4.2││
│  └────────────┘  └────────────┘  └────────────┘  └────┘│
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │ Patient Growth       │  │ Age Distribution (REAL)  │ │
│  │ (Still dummy)        │  │ [Pie Chart with data]    │ │
│  └──────────────────────┘  └──────────────────────────┘ │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐│
│  │ Top Symptoms │  │ Regional     │  │ Alerts         ││
│  │ (REAL DATA)  │  │ (Dummy)      │  │ (Dummy)        ││
│  │ [Bar Chart]  │  │              │  │                ││
│  └──────────────┘  └──────────────┘  └────────────────┘│
└──────────────────────────────────────────────────────────┘
```

The **metrics cards at top** and **Age Distribution + Top Symptoms charts** should show REAL data.

---

## ❓ Still Not Working?

Tell me:
1. **What URL are you on?** (Full URL from browser)
2. **What do you see in the metric cards?** (The 4 numbers at top)
3. **Any errors in browser console?** (F12 → Console tab)
4. **What does the API test return?** (Run the fetch test from Step 6)

I'll help you debug further!
