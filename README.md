# PLACEMENT360 🎓🏢

**PLACEMENT360** is a comprehensive, enterprise-grade university **Student Placement Management Information System (MIS)**. It bridges operational transactions, tactical management reporting, and strategic decision support across students, training & placement officers (TPOs), and corporate recruiters.

---

## 🏛️ System & Management Architecture

PLACEMENT360 is engineered across four core information system paradigms:

1. **Transaction Processing Systems (TPS)**:
   - Real-time student drive applications and instant eligibility validation.
   - Slot booking for technical tests and interviews.
   - Offer letter release, acceptance, and revocation workflows.
   - Instant notifications across in-app channels.

2. **Management Information Systems (MIS Reporting)**:
   - Department-wise, batch-wise, and gender-wise placement status reports.
   - Recruiter participation trends, compensation bracket distributions (LPA).
   - Scheduled summary reports for university leadership and academic deans.

3. **Decision Support Systems (DSS)**:
   - What-if eligibility modeling (e.g., simulating candidate pool size when adjusting CGPA or backlog criteria).
   - Skill gap diagnostics comparing recruiter requirements against student profile proficiencies.
   - Predictive recruiter tiering and package benchmark recommendations.

4. **Exception Reporting & KPI Monitoring**:
   - Automated flagging of unplaced students nearing graduation.
   - Low interview attendance and repeated round failure anomalies.
   - Live KPI monitoring: Placement Velocity, Offer-to-Acceptance Ratio, Average CTC vs Target CTC, Recruiter Conversion Rate.

---

## 👥 User Roles

- **TPO Administrator (Placement Cell)**: Oversees all drives, defines eligibility policies, manages student records, verifies company profiles, generates MIS reports, and accesses DSS analytics.
- **Student**: Manages academic profile and resumes, checks drive eligibility in real-time, submits applications, tracks interview schedules, and accepts/rejects placement offers.
- **Company Recruiter**: Posts job drives, reviews shortlisted candidate pools, schedules assessment/interview rounds, and rolls out digital placement offers.

---

## 📦 Core Modules

1. **Admin Dashboard**: Executive KPI widgets, live drive counters, unplaced alerts, and trend charts.
2. **Student Management**: Student directory, academic history, backlogs, skills, resume uploads, and verification status.
3. **Company Management**: Recruiter directory, industry domains, past hiring history, and point-of-contact (POC) management.
4. **Placement Drives**: Job postings, CTC/stipend details, round structures, eligibility criteria, and deadlines.
5. **Automated Eligibility Checking**: Rule engine checking CGPA cutoffs, active backlogs, department restrictions, and maximum allowed offers.
6. **Application Tracking**: Multi-stage application lifecycle tracking (`Applied` → `Shortlisted` → `Technical Round` → `HR Round` → `Selected` / `Rejected`).
7. **Interview Management**: Slot scheduling, panel assignments, meeting links, and candidate feedback capture.
8. **Placement Offers**: CTC breakdowns, offer letters, student acceptance/rejection logging, and university placement policy enforcement.
9. **Notifications**: Real-time alerts for drive deadlines, interview call-ups, and offer announcements.
10. **Reports & Analytics**: Tabular and chart-based MIS reports exportable for accreditation (NAAC, NIRF).
11. **Management Insights**: Strategic dashboards analyzing long-term hiring trends and industry alignment.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + Vite (Fast HMR & Optimized Bundles)
  - JavaScript (ESNext)
  - Tailwind CSS (Utility-First Responsive Styling)
  - Lucide React (Enterprise Iconography)
  - Recharts (MIS Dashboards & DSS Data Visualizations)
- **Backend**:
  - FastAPI (High-performance Python Web Framework)
  - Python 3.12+
  - Uvicorn (ASGI Server)
  - Pydantic v2 & Pydantic-Settings (Strict Data Validation & Settings Management)
- **Database & Persistence**:
  - Supabase PostgreSQL (Managed Relational Database)
  - SQLAlchemy 2.0 (ORM)
  - Alembic (Database Schema Migrations)
- **Security**:
  - JWT (JSON Web Tokens) with HS256 algorithm
  - Passlib & Bcrypt (Password Hashing)
  - Role-Based Access Control (RBAC)

---

## 📁 Repository Structure

```text
PLACEMENT360/
├── backend/
│   ├── alembic/              # Database migration environments & versions
│   ├── app/
│   │   ├── api/              # API router declarations & dependencies
│   │   │   └── v1/
│   │   │       └── endpoints/ # Route handlers (auth, students, drives, etc.)
│   │   ├── core/             # Configuration, settings, security & JWT utilities
│   │   ├── db/               # Database engine, session, & base declarations
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic validation DTOs
│   │   ├── services/         # Business logic, eligibility engine, DSS services
│   │   └── main.py           # FastAPI application entrypoint & middleware
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment template
├── frontend/
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Media & icons
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Buttons, modals, inputs, badges
│   │   │   └── layout/       # Sidebars, navbars, headers
│   │   ├── context/          # React contexts (AuthContext, ThemeContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Application views (admin, student, company, auth)
│   │   ├── services/         # API integration client functions
│   │   ├── utils/            # Helper utilities and formatters
│   │   ├── App.jsx           # Root layout and routing component
│   │   ├── index.css         # Tailwind CSS directives
│   │   └── main.jsx          # React DOM entrypoint
│   ├── package.json          # Node dependencies & scripts
│   ├── vite.config.js        # Vite + Tailwind CSS configuration
│   └── .env.example          # Frontend environment template
├── .env.example              # Consolidated environment configuration template
├── .gitignore                # Git ignore rules for Python, Node, Vite, & OS files
├── PLAN.md                   # Comprehensive development roadmap & milestones
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24+ recommended)
- **Python**: v3.10 or higher (v3.12 recommended)
- **Git**

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at: `http://localhost:5173`

To build the frontend for production:
```bash
npm run build
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs (Swagger UI): `http://127.0.0.1:8000/api/v1/docs`
- ReDoc Docs: `http://127.0.0.1:8000/api/v1/redoc`
- Health Endpoint: `http://127.0.0.1:8000/api/v1/health`

---

## 📌 Development Roadmap

See [PLAN.md](file:///c:/Users/minkr/OneDrive/Desktop/PLACEMENT360/PLAN.md) for the detailed step-by-step development roadmap, module specifications, and execution phases.
