# Sagicor Intelligence Platform - Setup Guide

## Overview
This is a **separate** React application (Vite + TypeScript) that connects to the LifeLink API to fetch anonymized health data for Sagicor insurance analysis.

## Project Structure
```
lifelink-insights/               # Sagicor Platform (Vite + React)
├── src/
│   ├── services/
│   │   └── lifelink-api.ts     # API service to connect to LifeLink
│   ├── pages/                  # Page components
│   ├── components/             # UI components (shadcn/ui)
│   └── ...
├── .env                        # Environment variables (NOT committed)
├── .env.example                # Environment template
├── package.json                # Separate dependencies
└── vite.config.ts              # Vite configuration (port 8081)

../LifeLink/                     # Main LifeLink App (Next.js)
├── app/api/sagicor/
│   └── health-insights/
│       └── route.ts            # API endpoint for Sagicor
└── ...
```

## Initial Setup

### 1. Install Dependencies
```bash
cd lifelink-insights
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_LIFELINK_API_URL=http://localhost:3000
VITE_SAGICOR_API_KEY=your-sagicor-api-key-here  # ⚠️ UPDATE THIS
```

### 3. Add API Key to LifeLink `.env`
Go to the LifeLink project and add the Sagicor API key:

```bash
cd ../
```

Edit `/LifeLink/.env` and add:
```env
SAGICOR_API_KEY=your-sagicor-api-key-here  # ⚠️ Must match the key above
```

### 4. Run Both Applications

**Terminal 1 - LifeLink (Next.js on port 3000):**
```bash
cd /Users/jevaughnstewart/LifeLink
npm run dev
```

**Terminal 2 - Sagicor Platform (Vite on port 8081):**
```bash
cd /Users/jevaughnstewart/LifeLink/lifelink-insights
npm run dev
```

### 5. Access the Applications
- **LifeLink (Patient App):** http://localhost:3000
- **Sagicor Platform:** http://localhost:8081

## API Connection

The Sagicor platform connects to LifeLink via:
```
GET http://localhost:3000/api/sagicor/health-insights
Headers: x-api-key: <SAGICOR_API_KEY>
Query Params: ?startDate=&endDate=&region=
```

## Using the API Service

```typescript
import { fetchHealthInsights } from '@/services/lifelink-api';

// Fetch all data
const data = await fetchHealthInsights();

// Fetch with filters
const filteredData = await fetchHealthInsights({
  startDate: '2025-01-01',
  endDate: '2025-12-31',
  region: 'Kingston'
});

// Export to CSV
import { exportToCSV } from '@/services/lifelink-api';
exportToCSV(data.data, 'health-insights.csv');
```

## Tech Stack
- **Framework:** Vite + React 18
- **Language:** TypeScript
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6

## Development Scripts

```bash
npm run dev          # Start development server (port 8081)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run clear-cache  # Clear Vite cache
```

## Important Notes

1. **Separate Application:** This is NOT part of LifeLink. It has its own package.json, node_modules, and dependencies.

2. **Different Ports:**
   - LifeLink runs on port **3000** (Next.js)
   - Sagicor Platform runs on port **8081** (Vite)

3. **Git:** Both apps can share the same git repository, but have separate commits if needed.

4. **Environment Variables:**
   - **LifeLink** uses `.env` in root: `SAGICOR_API_KEY=xxx`
   - **Sagicor** uses `.env` in lifelink-insights: `VITE_SAGICOR_API_KEY=xxx`
   - These must match!

5. **Data Privacy:** The API only returns data from patients who have consented (`sagicor_data_sharing_consent = TRUE`).

## Next Steps

1. ✅ Environment setup complete
2. ⏳ Build dashboard UI
3. ⏳ Implement data visualization
4. ⏳ Add filtering and export features
5. ⏳ Deploy to production

## Troubleshooting

### "Unauthorized - Invalid API key"
- Check that `VITE_SAGICOR_API_KEY` in Sagicor `.env` matches `SAGICOR_API_KEY` in LifeLink `.env`
- Restart both dev servers after changing environment variables

### "Failed to fetch"
- Ensure LifeLink is running on port 3000
- Check CORS settings if deploying to different domains

### Port already in use
- LifeLink: Change port in `package.json` scripts or kill process on port 3000
- Sagicor: Change port in `vite.config.ts` (currently 8081)
