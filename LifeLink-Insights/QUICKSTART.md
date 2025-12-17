my dashboard is built already but it has dummy data connect my lifelink to my lifelink insights# Quick Start Guide - Sagicor Intelligence Platform

## ✅ Setup Complete!

Your Sagicor Intelligence Platform is now configured and ready to run!

## 🚀 How to Run Both Applications

### Option 1: Two Terminal Windows

**Terminal 1 - LifeLink Backend (Port 3000)**
```bash
cd /Users/jevaughnstewart/LifeLink
npm run dev
```

**Terminal 2 - Sagicor Platform (Port 8081)**
```bash
cd /Users/jevaughnstewart/LifeLink/lifelink-insights
npm run dev
```

### Option 2: Single Terminal with Background Process

```bash
# Start LifeLink in background
cd /Users/jevaughnstewart/LifeLink
npm run dev &

# Start Sagicor Platform
cd lifelink-insights
npm run dev
```

## 🌐 Access URLs

Once both are running, open your browser:

- **LifeLink (Patient App):** http://localhost:3000
- **Sagicor Intelligence Platform:** http://localhost:8081

## 🔑 API Key Configuration

✅ **Already configured!** The API keys match:

- **LifeLink** `.env`: `SAGICOR_API_KEY=sagicor_lifelink_2025_secure_api_key_prod`
- **Sagicor** `.env`: `VITE_SAGICOR_API_KEY=sagicor_lifelink_2025_secure_api_key_prod`

## 📊 Testing the API Connection

1. Start both applications (see above)
2. Open browser console on Sagicor platform (http://localhost:8081)
3. Run this test:

```javascript
// Test API connection
fetch('http://localhost:3000/api/sagicor/health-insights', {
  headers: {
    'x-api-key': 'sagicor_lifelink_2025_secure_api_key_prod'
  }
})
.then(res => res.json())
.then(data => console.log('✅ API Connected!', data))
.catch(err => console.error('❌ API Error:', err));
```

## 📁 Project Structure

```
LifeLink/
├── lifelink-insights/              ← Sagicor Platform (you're here)
│   ├── src/
│   │   ├── services/
│   │   │   └── lifelink-api.ts    ← API service ready to use
│   │   ├── pages/                  ← Build your dashboard pages here
│   │   └── components/             ← shadcn/ui components
│   ├── .env                        ← Configured ✅
│   ├── package.json                ← Separate dependencies
│   └── vite.config.ts              ← Port 8081
│
├── app/api/sagicor/
│   └── health-insights/route.ts    ← Backend API endpoint ✅
└── .env                            ← Configured ✅
```

## 🎨 Using the API Service

```typescript
// In your Sagicor React components:
import { fetchHealthInsights, exportToCSV } from '@/services/lifelink-api';

// Fetch all data
const { data, summary } = await fetchHealthInsights();

// Fetch with filters
const filtered = await fetchHealthInsights({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  region: 'Kingston'
});

// Export data
exportToCSV(data, 'sagicor-insights.csv');
```

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

## ✨ Next Steps

1. **Start building the dashboard UI** in `src/pages/`
2. **Create data visualization components** using Recharts
3. **Implement filters** for date range and regions
4. **Add export functionality** using the built-in CSV/JSON exporters

## 📖 Need More Info?

- See [SETUP.md](./SETUP.md) for detailed configuration
- Check [/app/api/sagicor/health-insights/route.ts](../app/api/sagicor/health-insights/route.ts) for API docs

---

**Ready to build! 🎉**
