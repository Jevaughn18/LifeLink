# Sagicor Intelligence Platform - Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FACING                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   LifeLink App       │         │  Sagicor Platform    │     │
│  │   (Next.js)          │         │  (Vite + React)      │     │
│  │                      │         │                      │     │
│  │  • Patient Portal    │         │  • Analytics         │     │
│  │  • Appointments      │         │  • Reports           │     │
│  │  • Admin Dashboard   │         │  • Insights          │     │
│  │                      │         │  • Data Export       │     │
│  │  Port: 3000          │         │  Port: 8081          │     │
│  └──────────┬───────────┘         └─────────┬────────────┘     │
│             │                               │                   │
└─────────────┼───────────────────────────────┼───────────────────┘
              │                               │
              │                               │ HTTP GET
              │                               │ x-api-key: ***
              │                               │
              ▼                               │
┌─────────────────────────────────────────────┼───────────────────┐
│                      BACKEND                │                   │
├─────────────────────────────────────────────┼───────────────────┤
│                                             │                   │
│  ┌──────────────────────────────────────────▼────────────────┐ │
│  │  /api/sagicor/health-insights (Next.js API Route)        │ │
│  │                                                           │ │
│  │  • Validates API key                                     │ │
│  │  • Queries anonymized patient data                       │ │
│  │  • Only patients with sagicor_consent = TRUE             │ │
│  │  • Aggregates statistics                                 │ │
│  │  • Returns JSON response                                 │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           MySQL Database (lifelink_db)                  │   │
│  │                                                          │   │
│  │  • patients (with sagicor_consent field)                │   │
│  │  • appointments (with ai_symptom_analysis)              │   │
│  │  • doctors                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Patient Registration (LifeLink)
```
Patient fills form
      ↓
Consent checkbox: "Share data with Sagicor"
      ↓
Saved to database:
  - sagicor_data_sharing_consent: TRUE
  - sagicor_consent_date: 2025-12-16
```

### 2. Data Request (Sagicor Platform)
```
Analyst clicks "Load Data"
      ↓
fetchHealthInsights({ startDate: '2025-01-01' })
      ↓
HTTP GET http://localhost:3000/api/sagicor/health-insights
Headers: x-api-key: sagicor_***
      ↓
API validates key
      ↓
Query database (WHERE sagicor_consent = TRUE)
      ↓
Anonymize data (age groups, no names)
      ↓
Return JSON response
      ↓
Display charts and tables
```

## Security Model

### Authentication
- **API Key-based authentication** (not user-based)
- Key stored in environment variables (never in code)
- Key must match on both sides:
  - LifeLink: `SAGICOR_API_KEY`
  - Sagicor: `VITE_SAGICOR_API_KEY`

### Data Privacy
1. **Consent-based**: Only patients who opt-in
2. **Anonymization**:
   - No patient IDs exposed
   - No patient names
   - Age ranges instead of exact ages
3. **No PHI**: Protected Health Information stays in LifeLink

### Rate Limiting (Future)
- Implement rate limiting on API endpoint
- Monitor API usage
- Alerts for suspicious activity

## Component Breakdown

### LifeLink Responsibilities
| Component | Purpose |
|-----------|---------|
| Patient registration | Collect consent |
| Database | Store all data |
| API endpoint | Serve anonymized data |
| Admin dashboard | Manage appointments |

### Sagicor Platform Responsibilities
| Component | Purpose |
|-----------|---------|
| Dashboard UI | Display insights |
| Charts/Graphs | Visualize trends |
| Filters | Date, region selection |
| Export | CSV/JSON downloads |

## API Endpoint Specification

### Request
```http
GET /api/sagicor/health-insights HTTP/1.1
Host: localhost:3000
x-api-key: sagicor_lifelink_2025_secure_api_key_prod
Content-Type: application/json
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string | No | Filter start date (YYYY-MM-DD) |
| endDate | string | No | Filter end date (YYYY-MM-DD) |
| region | string | No | Filter by parish/region |

### Response Schema
```typescript
{
  success: boolean;
  summary: {
    total_consented_patients: number;
    total_appointments: number;
    age_distribution: { [ageGroup: string]: number };
    gender_distribution: { [gender: string]: number };
    top_symptoms: { symptom: string; count: number }[];
    insurance_providers: { [provider: string]: number };
  };
  data: Array<{
    age_group: string;
    gender: string;
    insurance_provider: string;
    symptom_description: string;
    ai_symptom_analysis: object;
    appointment_status: string;
    appointment_date: string;
    primary_physician: string;
    allergies: string | null;
    current_medication: string | null;
    family_medical_history: string | null;
    patient_registered_at: string;
    sagicor_consent_date: string;
  }>;
  metadata: {
    generated_at: string;
    filters: {
      startDate: string;
      endDate: string;
      region: string;
    };
    count: number;
  };
}
```

## Technology Stack

### LifeLink (Backend)
- **Framework**: Next.js 14 (App Router)
- **Database**: MySQL 8.0
- **ORM**: Custom query functions
- **Email**: Nodemailer + Gmail
- **AI**: Google Gemini (via OpenRouter)

### Sagicor Platform (Frontend)
- **Framework**: Vite + React 18
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query (React Query)
- **Routing**: React Router v6

## Deployment Considerations

### Development
- LifeLink: `localhost:3000`
- Sagicor: `localhost:8081`
- MySQL: `localhost:3306`

### Production (Future)
```
LifeLink:
  - Deploy to Vercel/Railway
  - URL: https://lifelink.app
  - Database: Railway MySQL

Sagicor Platform:
  - Deploy to Netlify/Vercel
  - URL: https://insights.sagicor.com
  - Environment: VITE_LIFELINK_API_URL=https://lifelink.app
```

### CORS Configuration
When deploying to different domains, configure CORS in LifeLink API:

```typescript
// app/api/sagicor/health-insights/route.ts
const headers = {
  'Access-Control-Allow-Origin': 'https://insights.sagicor.com',
  'Access-Control-Allow-Methods': 'GET',
  'Access-Control-Allow-Headers': 'x-api-key',
};
```

## Future Enhancements

### Phase 1 (MVP) - Current
✅ Basic API endpoint
✅ API key authentication
✅ Anonymized data export
✅ Date filtering

### Phase 2 - Enhanced
- [ ] Regional comparison
- [ ] Advanced filtering (multiple parishes)
- [ ] Trend analysis over time
- [ ] PDF report generation

### Phase 3 - Advanced
- [ ] Predictive analytics (AI/ML models)
- [ ] WHO data integration
- [ ] Real-time alerts
- [ ] Role-based access control

### Phase 4 - Enterprise
- [ ] Multi-insurance provider support
- [ ] Custom report builder
- [ ] API versioning
- [ ] Webhooks for real-time updates

## Performance Optimization

### Database
- Indexes on `sagicor_data_sharing_consent`
- Indexes on `appointment.schedule` for date filtering
- Query result caching (Redis in future)

### Frontend
- Lazy loading for charts
- Virtualized lists for large datasets
- Progressive data loading
- Service Worker for offline access

## Monitoring & Analytics

### API Monitoring (Future)
- Request count
- Response times
- Error rates
- API key usage

### Dashboard Analytics (Future)
- User sessions
- Most viewed reports
- Export frequency
- Filter patterns

---

**Architecture Version**: 1.0
**Last Updated**: 2025-12-16
**Status**: Development Ready
