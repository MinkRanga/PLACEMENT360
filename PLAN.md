# PLACEMENT360: University Student Placement MIS - Master Development Roadmap

## 1. Executive Summary & Architectural Vision

**PLACEMENT360** is an enterprise-grade university Student Placement Management Information System (MIS) designed to streamline, automate, and strategically enhance campus placement operations. 

The platform supports three primary user personas:
1. **TPO Administrator (Training & Placement Officer)**: Operational controller, policy administrator, and executive strategist.
2. **Student**: Candidate managing credentials, tracking drive eligibility, participating in interviews, and securing offers.
3. **Company Recruiter**: Corporate partner posting requisitions, screening candidates, coordinating interview stages, and issuing offers.

### Information Systems Classification

| Level | IS Type | PLACEMENT360 Functional Capabilities |
| :--- | :--- | :--- |
| **Operational** | **TPS (Transaction Processing Systems)** | Drive applications, real-time eligibility evaluation, interview slot booking, offer status transitions (`Accepted`, `Rejected`, `Pending`), and in-app alerts. |
| **Tactical** | **MIS (Management Information Systems)** | Department-wise placement rate summaries, salary band distributions (LPA), drive participation metrics, and accreditation (NIRF/NAAC) data exports. |
| **Tactical / Strategic** | **DSS (Decision Support Systems)** | "What-if" candidate pool modeling (relaxing CGPA or backlog constraints), skill demand vs. supply diagnostics, and recruiter tier ranking. |
| **Control** | **Exception Reporting** | Unplaced student alerts, high-backlog candidate intervention lists, low interview turnout flags, and multiple-offer policy violations. |
| **Strategic** | **KPI & Executive Insights** | Multi-year recruitment velocity, company retention rates, median package trajectories, and industry domain alignment. |

---

## 2. Technology Stack & Specifications

### Frontend
- **Framework**: React 19 + Vite (JavaScript / ESNext)
- **Styling**: Tailwind CSS v4 (Modern utility-first styling)
- **Iconography**: Lucide React
- **Data Visualization & Analytics**: Recharts
- **HTTP Client**: Fetch API / Axios

### Backend
- **Framework**: FastAPI (Python 3.12+)
- **ASGI Server**: Uvicorn
- **Data Validation & Settings**: Pydantic v2 & Pydantic-Settings
- **ORM**: SQLAlchemy 2.0
- **Database Migrations**: Alembic
- **Database**: Supabase PostgreSQL (Managed cloud instance)
- **Authentication**: JWT (JSON Web Tokens) with HS256, Password hashing via Bcrypt

---

## 3. Phased Development Roadmap

### Phase 1: Project Scaffolding & Initial Architecture Setup 🏁 [COMPLETED]
- [x] Workspace inspection and structural planning.
- [x] Frontend scaffold with Vite, React 19, Tailwind CSS, and Lucide React.
- [x] Backend scaffold with FastAPI, modular architecture (`core`, `api`, `models`, `schemas`, `services`, `db`), and healthcheck endpoint.
- [x] Dependency management (`requirements.txt`, `package.json`).
- [x] Root configuration files: `.gitignore`, `.env.example`, `README.md`, `PLAN.md`.
- [x] Build and execution verification.

---

### Phase 2: Database Modeling, Supabase Connection & Alembic Migrations 🏁 [COMPLETED]
- [x] Connect Supabase PostgreSQL instance via SQLAlchemy connection string in `.env`.
- [x] Design and implement SQLAlchemy models:
  - `User` (`id`, `email`, `hashed_password`, `role`, `is_active`, `created_at`, `updated_at`)
  - `Student` (`id`, `user_id`, `roll_number`, `first_name`, `last_name`, `department`, `batch_year`, `cgpa`, `active_backlogs`, `history_backlogs`, `resume_url`, `phone`, `skills`, `is_placed`)
  - `Company` (`id`, `user_id`, `name`, `industry`, `website`, `tier`, `contact_person`, `contact_email`, `contact_phone`, `is_verified`)
  - `PlacementDrive` (`id`, `company_id`, `title`, `job_role`, `job_description`, `package_lpa`, `min_cgpa`, `max_active_backlogs`, `allowed_departments`, `allowed_batch_years`, `drive_date`, `deadline`, `status`)
  - `Application` (`id`, `drive_id`, `student_id`, `status`, `stage`, `applied_at`, `rejection_reason`)
  - `Interview` (`id`, `application_id`, `round_name`, `scheduled_at`, `meeting_link`, `location`, `status`, `feedback`, `evaluator_notes`)
  - `PlacementOffer` (`id`, `application_id`, `student_id`, `company_id`, `package_lpa`, `designation`, `offer_letter_url`, `status`, `released_at`, `responded_at`)
  - `Notification` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`)
- [x] Configure Alembic migrations (`alembic.ini`, `alembic/env.py` with SQLAlchemy Base metadata).
- [x] Generate and apply the initial migration (`20261116_ce8443d28cab_initial_schema.py`).
- [x] Database verification test scripts (`test_db.py`, `verify_database.py`).

---

### Phase 3 & 4: Backend API & Service Pipeline 🏁 [COMPLETED]
- [x] Implement password hashing utilities using direct salted `bcrypt`.
- [x] Implement JWT token generator and decoder in `app/core/security.py`.
- [x] Build Authentication Endpoints (`/api/v1/auth`):
  - `POST /login`: OAuth2 password flow & JSON token generation.
  - `POST /register/student`: Student registration + profile creation.
  - `POST /register/recruiter`: Recruiter registration linked to company.
  - `POST /register/admin`: TPO Administrator onboarding.
  - `GET /me`: Current user context.
  - `POST /change-password`: Secure password updating.
- [x] Build FastAPI dependency injection (`get_current_user`, `get_current_active_user`, `RoleChecker` for `TPO_ADMIN`, `STUDENT`, `RECRUITER`).
- [x] Build Academic Department Management (`/api/v1/departments`): CRUD, unique codes.
- [x] Build Student Management (`/api/v1/students`): List, search, filters (department, batch, CGPA, backlogs, placement status), `/students/me`, admin update, deactivation.
- [x] Build Company & Recruiter Management (`/api/v1/companies`): Directory, registration, update, recruiter associations, drive history.
- [x] Build Placement Drive Management (`/api/v1/drives`): Drive creation, allowed departments mapping, eligibility criteria configuration, status transitions.
- [x] Build Automated Eligibility Checking Engine (`app/services/eligibility.py`): Real-time CGPA, backlogs, department, batch year, gender, and already-placed package ceilings evaluation with detailed diagnostic feedback.
- [x] Build Application Management (`/api/v1/applications`): Eligibility validation, duplicate prevention (`uq_student_drive_application`), application listing, status updating, and student withdrawal.
- [x] Build Interview Pipeline (`/api/v1/interviews`): Elimination round configuration, slot scheduling, candidate evaluation with scores and feedback, and multi-round advancement.
- [x] Build Placement Offer Workflow (`/api/v1/offers`): Offer release with CTC breakdown, student acceptance/rejection logging, automated placement status lock (`is_placed = True`, package updating).
- [x] Build In-App Notification System (`/api/v1/notifications`): Event-driven alerts for application submission, interview scheduling, and offer releases, with unread counters and read status toggles.
- [x] Build MIS Reporting & Analytics Center (`/api/v1/reports`):
  - Executive KPI summary (placement rate, placed count, avg CTC, active drives).
  - Department-wise placement performance statistics.
  - Company-wise recruitment conversion statistics.
  - Statistical salary distribution metrics (average, median, highest, lowest).
  - Recruitment selection funnel analytics.
  - Unplaced student actionable exception reports.
  - Pending interview schedules and offer decision reports.
- [x] Build comprehensive automated test suite (`backend/test_api_suite.py`) verifying all 12 operational modules end-to-end with 100% test pass rate.

---

### Phase 5: Automated Eligibility Engine & TPS Application Pipeline
- [ ] **Automated Eligibility Engine (`services/eligibility.py`)**:
  - CGPA validation: `student.cgpa >= drive.min_cgpa`.
  - Backlog check: `student.active_backlogs <= drive.max_active_backlogs`.
  - Department matching: `student.department in drive.allowed_departments`.
  - Batch year matching: `student.batch_year in drive.allowed_batch_years`.
  - University placement policy check: maximum allowed offers (e.g., student placed in Tier-1 cannot apply to Tier-2, or maximum 1 dream offer).
- [ ] **TPS Application Submission**:
  - Single-click application submission with instant eligibility verification.
  - Prevention of duplicate applications.
  - Status management (`Applied`, `Eligible`, `Ineligible`, `Withdrawn`).
- [ ] **Frontend Student Drive Portal**:
  - Live drive catalog with visual eligibility badges (Green "Eligible" / Amber "Criteria Mismatch" with specific breakdown).
  - Immediate application action with real-time feedback.

---

### Phase 6: Interview Management & Placement Offer Processing
- [ ] **Interview Workflow**:
  - Round scheduling (Aptitude, Technical, GD, HR).
  - Candidate status transition per round (`Shortlisted`, `Selected`, `Rejected`).
  - Scheduling notifications and interview calendar view.
- [ ] **Offer Processing Module**:
  - Offer creation with CTC breakdown (Base, Bonus, Variable, Benefits).
  - Offer status lifecycle (`Offered`, `Accepted`, `Declined`, `Revoked`).
  - Automatic student placement lock upon accepting an offer based on college policy.
- [ ] **Frontend Interfaces**:
  - Recruiter Interview Coordination Console.
  - Student Offer Review & Acceptance dialog.

---

### Phase 7: Real-Time Notifications & Activity Auditing
- [ ] Notification service (`services/notifications.py`) for system events.
- [ ] In-app notification center (read/unread toggles, filter by type).
- [ ] Activity audit logs for sensitive operations (policy adjustments, offer status overrides).

---

### Phase 8: MIS Reporting Engine & Accreditation Exports
- [ ] **Tactical Management Information System (MIS) Reports**:
  - Departmental Placement Summary (Total students, placed count, placement %, avg package).
  - Batch Performance Report (Median package, top recruiters, hiring timeline).
  - Recruiter Engagement Report (Offers rolled out vs accepted, conversion velocity).
- [ ] **Accreditation Export Formats**:
  - Standardized tabular exports for NIRF and NAAC accreditation tables.
  - CSV / Excel formatted download endpoints.
- [ ] **Frontend MIS Reporting Center**:
  - Dynamic filterable reports by Department, Academic Year, Tier, and Company.

---

### Phase 9: Decision Support Systems (DSS) & Exception Reporting
- [ ] **Decision Support Engine (`services/dss.py`)**:
  - **What-If Pool Simulator**: Interactive tool for TPO to simulate applicant pool sizes by tweaking eligibility parameters (e.g., "If CGPA drops from 7.5 to 7.0, eligible candidates increase by +42 students").
  - **Skill Gap Diagnostic**: Analyzes keywords and competencies demanded by incoming recruiters vs student skill declarations.
  - **Recruiter Tier Recommendation**: Evaluates past hiring conversion and CTC to recommend recruiter priority tiering.
- [ ] **Automated Exception Reports**:
  - Critical list of unplaced final-year students with filter by CGPA quartile.
  - Attendance shortfall exceptions in scheduled drive tests/interviews.
  - Students with pending offer decisions past deadline.
- [ ] **Frontend DSS & Exception Views**:
  - What-If simulation slider dashboard.
  - Actionable Exception Center with one-click reminder alerts.

---

### Phase 10: Executive Management Insights & Advanced KPI Dashboards
- [ ] **TPO Executive Dashboard**:
  - Live KPI Tiles: Total Placement Rate, Average CTC, Highest CTC, Active Drives, Offers Pending.
  - Recharts Visualizations:
    - Departmental placement progress bar charts.
    - Package distribution histogram (LPA ranges).
    - Recruitment stage conversion funnel.
    - Monthly placement trend line charts.
- [ ] **Student Dashboard**:
  - Profile readiness gauge.
  - Upcoming interview timeline.
  - Active applications status tracker.
- [ ] **Recruiter Dashboard**:
  - Drive pipeline tracker.
  - Shortlisted candidate counter and interview progress.

---

### Phase 11: End-to-End Testing, Security Hardening & Deployment
- [ ] Integration testing of eligibility rules and transaction workflows.
- [ ] Frontend performance profiling and bundle optimization.
- [ ] Backend rate limiting, CORS tightening, and error logging.
- [ ] Deployment guides (Vercel/Netlify for Frontend, Render/Railway/Fly.io for Backend, Supabase for Database).

---

## 4. Immediate Next Steps (Phase 2 Preparation)
When the user authorizes Phase 2:
1. Obtain Supabase PostgreSQL database connection credentials.
2. Configure `DATABASE_URL` in backend `.env`.
3. Implement SQLAlchemy models in `backend/app/models/`.
4. Configure Alembic migration environment and generate the initial schema migration.
