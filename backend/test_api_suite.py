"""
PLACEMENT360 Phase 4 - Comprehensive Backend API Test Suite
Tests:
- Database connectivity
- Authentication & JWT RBAC (Admin, Student, Recruiter)
- Department management CRUD
- Student management & profile CRUD
- Company & recruiter onboarding
- Placement drives & automated eligibility checking engine
- Application submission & duplicate prevention
- Interview rounds, scheduling & candidate evaluation
- Placement offer release & student acceptance workflow
- In-app notification generation & read status
- MIS reports & analytics (Department-wise, Company-wise, Packages, Funnel, Unplaced)
"""

import sys
import uuid
import asyncio
import functools
import httpx
from datetime import datetime, timedelta, timezone

print = functools.partial(print, flush=True)

from app.main import app
from app.db.session import engine
from sqlalchemy import text


async def run_test_suite():
    print("==================================================================")
    print("          PLACEMENT360 - BACKEND API TEST SUITE                   ")
    print("==================================================================")

    # 1. Database Connectivity Test
    print("\n[STEP 1] Database Connectivity Check...")
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1;")).scalar()
        assert res == 1, "Database SELECT 1 failed"
    print(" Database connection confirmed active.")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # 2. System Health Check
        print("\n[STEP 2] System Health Endpoint...")
        r = await client.get("/api/v1/health")
        assert r.status_code == 200, f"Health check failed: {r.text}"
        data = r.json()
        assert data["status"] == "healthy"
        print(f" Health verified: status='{data['status']}', service='{data['service']}'")

        # Generate unique test email identifiers to ensure idempotent runs
        run_id = uuid.uuid4().hex[:6]
        admin_email = f"admin_{run_id}@placement360.edu"
        student1_email = f"alice_{run_id}@placement360.edu"
        student2_email = f"bob_{run_id}@placement360.edu"
        recruiter_email = f"recruiter_{run_id}@starlight.com"
        dept_code = f"CS{run_id[:4].upper()}"

        # 3. Authentication & RBAC Tests
        print("\n[STEP 3] Authentication & Account Registration...")
        
        # 3.1 Register TPO Admin
        r = await client.post("/api/v1/auth/register/admin", json={
            "email": admin_email,
            "password": "AdminPassword123!"
        })
        assert r.status_code == 201, f"Admin registration failed: {r.text}"
        admin_auth = r.json()
        admin_token = admin_auth["access_token"]
        assert admin_auth["role"] == "TPO_ADMIN"
        print(f" Admin registered: {admin_email} (Role: {admin_auth['role']})")

        # 3.2 Login with invalid credentials test
        r_bad = await client.post("/api/v1/auth/login", data={
            "username": admin_email,
            "password": "WrongPassword!"
        })
        assert r_bad.status_code == 401, "Bad password should return 401 Unauthorized"
        print(" Invalid password rejected with 401 Unauthorized.")

        # 3.3 Login with valid credentials test
        r_login = await client.post("/api/v1/auth/login", data={
            "username": admin_email,
            "password": "AdminPassword123!"
        })
        assert r_login.status_code == 200
        assert "access_token" in r_login.json()
        print(" OAuth2 Password Login verified.")

        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # 4. Department Management CRUD
        print("\n[STEP 4] Academic Department Management...")
        r_dept = await client.post("/api/v1/departments", headers=admin_headers, json={
            "code": dept_code,
            "name": f"Computer Science & Engineering {dept_code}",
            "is_active": True
        })
        assert r_dept.status_code == 201, f"Department create failed: {r_dept.text}"
        dept_id = r_dept.json()["id"]
        print(f" Department created: {dept_code} (ID: {dept_id})")

        # 5. Student Management & Profiles
        print("\n[STEP 5] Student Registration & Profiles...")
        
        # 5.1 Register Student 1 (High CGPA, 0 backlogs -> Eligible)
        r_s1 = await client.post("/api/v1/auth/register/student", json={
            "email": student1_email,
            "password": "StudentPassword123!",
            "roll_number": f"22{dept_code}01",
            "first_name": "Alice",
            "last_name": "Chen",
            "department_id": dept_id,
            "batch_year": 2026,
            "gender": "FEMALE",
            "cgpa": 8.75,
            "tenth_percentage": 92.5,
            "twelfth_percentage": 89.0,
            "active_backlogs": 0,
            "history_backlogs": 0,
            "phone": "+91-9876500001",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL"]
        })
        assert r_s1.status_code == 201, f"Student 1 register failed: {r_s1.text}"
        s1_token = r_s1.json()["access_token"]
        s1_headers = {"Authorization": f"Bearer {s1_token}"}
        print(f" Student 1 registered: Alice Chen (CGPA: 8.75, Backlogs: 0)")

        # 5.2 Register Student 2 (Low CGPA, 2 active backlogs -> Ineligible)
        r_s2 = await client.post("/api/v1/auth/register/student", json={
            "email": student2_email,
            "password": "StudentPassword123!",
            "roll_number": f"22{dept_code}02",
            "first_name": "Bob",
            "last_name": "Taylor",
            "department_id": dept_id,
            "batch_year": 2026,
            "gender": "MALE",
            "cgpa": 6.20,
            "tenth_percentage": 78.0,
            "twelfth_percentage": 72.0,
            "active_backlogs": 2,
            "history_backlogs": 2,
            "phone": "+91-9876500002",
            "skills": ["Java"]
        })
        assert r_s2.status_code == 201, f"Student 2 register failed: {r_s2.text}"
        s2_token = r_s2.json()["access_token"]
        s2_headers = {"Authorization": f"Bearer {s2_token}"}
        print(f" Student 2 registered: Bob Taylor (CGPA: 6.20, Backlogs: 2)")

        # 5.3 Student 1 reads and updates own profile
        r_s1_me = await client.get("/api/v1/students/me", headers=s1_headers)
        assert r_s1_me.status_code == 200
        s1_id = r_s1_me.json()["id"]

        r_s1_update = await client.put("/api/v1/students/me", headers=s1_headers, json={
            "phone": "+91-9999988888",
            "resume_url": "https://storage.placement360.edu/resumes/alice_chen.pdf",
            "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"]
        })
        assert r_s1_update.status_code == 200
        assert len(r_s1_update.json()["skills"]) == 5
        print(" Student profile update verified.")

        # 5.4 RBAC Check: Student attempting Admin action is denied
        r_forbidden = await client.post("/api/v1/departments", headers=s1_headers, json={
            "code": "ILLEGAL", "name": "Illegal Dept"
        })
        assert r_forbidden.status_code == 403, "Student must not be allowed to create departments"
        print(" RBAC Enforcement confirmed: Student forbidden from admin actions (403).")

        # 6. Company & Recruiter Management
        print("\n[STEP 6] Company & Recruiter Onboarding...")
        company_name = f"Starlight Cloud Systems {run_id}"
        r_comp = await client.post("/api/v1/companies", headers=admin_headers, json={
            "name": company_name,
            "industry": "Cloud Infrastructure & DevOps",
            "tier": "TIER_1",
            "website": "https://starlightcloud.example.com",
            "address": "Silicon Valley Tech Corridor"
        })
        assert r_comp.status_code == 201, f"Company create failed: {r_comp.text}"
        company_id = r_comp.json()["id"]
        print(f" Company created: {company_name} (ID: {company_id})")

        # Register Recruiter for company
        r_rec = await client.post("/api/v1/auth/register/recruiter", json={
            "email": recruiter_email,
            "password": "RecruiterPass123!",
            "company_id": company_id,
            "designation": "Head of University Hiring",
            "phone": "+1-415-555-0199",
            "is_primary_contact": True
        })
        assert r_rec.status_code == 201, f"Recruiter register failed: {r_rec.text}"
        recruiter_token = r_rec.json()["access_token"]
        recruiter_headers = {"Authorization": f"Bearer {recruiter_token}"}
        print(f" Recruiter registered: {recruiter_email} (Role: {r_rec.json()['role']})")

        # 7. Placement Drive & Automated Eligibility Engine
        print("\n[STEP 7] Placement Drive Creation & Automated Eligibility Engine...")
        r_drive = await client.post("/api/v1/drives", headers=recruiter_headers, json={
            "company_id": company_id,
            "title": f"Cloud Solutions Engineer Campus Hiring {run_id}",
            "job_role": "Cloud Solutions Engineer",
            "job_description": "Architect and deploy scalable microservices on Kubernetes.",
            "job_location": "Bengaluru / Hybrid",
            "package_lpa": 14.50,
            "ctc_breakdown": {"base": 11.5, "joining_bonus": 1.5, "stock_units": 1.5},
            "drive_type": "FULL_TIME",
            "status": "REGISTRATION_OPEN",
            "batch_year": 2026,
            "registration_end_date": (datetime.now(timezone.utc) + timedelta(days=14)).isoformat(),
            "allowed_department_ids": [dept_id],
            "eligibility_criteria": {
                "min_cgpa": 7.50,
                "max_active_backlogs": 0,
                "max_history_backlogs": 1,
                "min_tenth_percentage": 70.0,
                "min_twelfth_percentage": 70.0,
                "gender_allowed": "ALL",
                "allow_already_placed": False,
                "allowed_batch_years": [2026],
                "required_skills": ["Python", "Cloud"]
            }
        })
        assert r_drive.status_code == 201, f"Drive creation failed: {r_drive.text}"
        drive_id = r_drive.json()["id"]
        print(f" Placement Drive created: ID {drive_id} (Cutoff: CGPA >= 7.50, Backlogs <= 0)")

        # 7.1 Evaluate Student 1 (Expected: ELIGIBLE)
        r_el_s1 = await client.get(f"/api/v1/drives/{drive_id}/check-eligibility", headers=s1_headers)
        assert r_el_s1.status_code == 200
        el_s1 = r_el_s1.json()
        assert el_s1["is_eligible"] is True
        print(f" Eligibility Check (Student 1 - Alice): {el_s1['is_eligible']} (Eligible)")

        # 7.2 Evaluate Student 2 (Expected: INELIGIBLE with clear breakdown)
        r_el_s2 = await client.get(f"/api/v1/drives/{drive_id}/check-eligibility", headers=s2_headers)
        assert r_el_s2.status_code == 200
        el_s2 = r_el_s2.json()
        assert el_s2["is_eligible"] is False
        assert len(el_s2["reasons"]) >= 2
        print(f" Eligibility Check (Student 2 - Bob): {el_s2['is_eligible']} (Ineligible)")
        print(f"   Ineligibility Reasons: {el_s2['reasons']}")

        # 8. Application Management & Duplicate Prevention
        print("\n[STEP 8] Application Submission & Duplicate Prevention...")
        
        # 8.1 Ineligible Student 2 attempts to apply -> Expect 400 Bad Request
        r_app_s2 = await client.post("/api/v1/applications", headers=s2_headers, json={"drive_id": drive_id})
        assert r_app_s2.status_code == 400, "Ineligible student application must be rejected"
        print(" Ineligible student application successfully blocked (400 Bad Request).")

        # 8.2 Eligible Student 1 applies -> Expect 201 Created
        r_app_s1 = await client.post("/api/v1/applications", headers=s1_headers, json={"drive_id": drive_id})
        assert r_app_s1.status_code == 201, f"Application failed: {r_app_s1.text}"
        app_id = r_app_s1.json()["id"]
        print(f" Eligible student application accepted (Application ID: {app_id}).")

        # 8.3 Duplicate Application Prevention Test -> Expect 409 Conflict
        r_app_dup = await client.post("/api/v1/applications", headers=s1_headers, json={"drive_id": drive_id})
        assert r_app_dup.status_code == 409, "Duplicate application must be rejected with 409 Conflict"
        print(" Duplicate application successfully blocked (409 Conflict).")

        # 9. Interview Management Pipeline
        print("\n[STEP 9] Interview Management Workflow...")
        
        # 9.1 Create Interview Round 1
        r_rnd = await client.post(f"/api/v1/interviews/rounds?drive_id={drive_id}", headers=recruiter_headers, json={
            "round_order": 1,
            "name": "Technical & Coding Assessment",
            "round_type": "TECHNICAL_INTERVIEW",
            "description": "DSA & Microservice Architecture Round",
            "is_elimination": True
        })
        assert r_rnd.status_code == 201, f"Round create failed: {r_rnd.text}"
        round_id = r_rnd.json()["id"]
        print(f" Interview Round created: #{r_rnd.json()['round_order']} {r_rnd.json()['name']}")

        # 9.2 Schedule Interview for candidate
        interview_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
        r_int = await client.post("/api/v1/interviews", headers=recruiter_headers, json={
            "application_id": app_id,
            "round_id": round_id,
            "scheduled_time": interview_time,
            "location_or_link": "https://meet.google.com/placement360-interview",
            "status": "SCHEDULED"
        })
        assert r_int.status_code == 201, f"Interview schedule failed: {r_int.text}"
        interview_id = r_int.json()["id"]
        print(f" Interview scheduled: ID {interview_id} at {interview_time}")

        # 9.3 Submit Interview Result (Candidate passes with score 94.5)
        r_eval = await client.patch(f"/api/v1/interviews/{interview_id}/result", headers=recruiter_headers, json={
            "status": "PASSED",
            "score": 94.5,
            "feedback": "Strong algorithmic optimization skills and clean code practices."
        })
        assert r_eval.status_code == 200
        assert r_eval.json()["status"] == "PASSED"
        print(f" Interview evaluation submitted: Score 94.5 -> Candidate PASSED.")

        # 10. Placement Offers & Acceptance
        print("\n[STEP 10] Placement Offer Release & Student Acceptance...")
        
        # 10.1 Issue Offer
        r_off = await client.post("/api/v1/offers", headers=recruiter_headers, json={
            "application_id": app_id,
            "designation": "Associate Cloud Engineer",
            "package_lpa": 14.50,
            "ctc_breakdown": {"base": 11.5, "bonus": 1.5, "esops": 1.5},
            "offer_letter_url": "https://storage.placement360.edu/offers/starlight_alice.pdf",
            "valid_until": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        })
        assert r_off.status_code == 201, f"Offer release failed: {r_off.text}"
        offer_id = r_off.json()["id"]
        print(f" Placement Offer issued: ID {offer_id} (14.50 LPA, Status: PENDING)")

        # 10.2 Student 1 accepts the offer
        r_resp = await client.post(f"/api/v1/offers/{offer_id}/respond", headers=s1_headers, json={
            "status": "ACCEPTED",
            "student_remarks": "Excited to join the Starlight Cloud Systems team!"
        })
        assert r_resp.status_code == 200
        assert r_resp.json()["status"] == "ACCEPTED"
        print(" Offer accepted by Student 1.")

        # Verify Student 1 profile was automatically updated to placed
        r_s1_chk = await client.get("/api/v1/students/me", headers=s1_headers)
        s1_data = r_s1_chk.json()
        assert s1_data["is_placed"] is True
        assert s1_data["placement_status"] == "PLACED"
        assert float(s1_data["current_package_lpa"]) == 14.50
        print(f" Student profile updated: is_placed={s1_data['is_placed']}, package={s1_data['current_package_lpa']} LPA")

        # 11. In-App Notifications
        print("\n[STEP 11] In-App Notifications Verification...")
        r_notif = await client.get("/api/v1/notifications", headers=s1_headers)
        assert r_notif.status_code == 200
        notifs = r_notif.json()
        print(f" Student received {len(notifs['items'])} notifications (Unread: {notifs['unread_count']})")
        assert notifs["unread_count"] > 0

        # Mark all notifications read
        r_read_all = await client.post("/api/v1/notifications/read-all", headers=s1_headers)
        assert r_read_all.status_code == 200

        r_notif_after = await client.get("/api/v1/notifications", headers=s1_headers)
        assert r_notif_after.json()["unread_count"] == 0
        print(" Notifications successfully marked as read.")

        # 12. MIS Reporting & Analytics
        print("\n[STEP 12] MIS Reports & Strategic Analytics...")
        
        # 12.1 Executive KPI Summary
        r_kpi = await client.get("/api/v1/reports/summary", headers=admin_headers)
        assert r_kpi.status_code == 200
        kpi = r_kpi.json()
        print(f" MIS Summary: Total Students: {kpi['total_students']}, Placed: {kpi['placed_students']}, Placement %: {kpi['placement_percentage']}%, Avg CTC: {kpi['avg_package_lpa']} LPA")

        # 12.2 Department-Wise Statistics
        r_dept_rep = await client.get("/api/v1/reports/departments", headers=admin_headers)
        assert r_dept_rep.status_code == 200
        dept_stats = [d for d in r_dept_rep.json() if d["department_id"] == dept_id]
        assert len(dept_stats) == 1
        print(f" Department MIS ({dept_code}): Total: {dept_stats[0]['total_students']}, Placed: {dept_stats[0]['placed_students']}, Placement %: {dept_stats[0]['placement_percentage']}%")

        # 12.3 Company-Wise Recruitment Statistics
        r_comp_rep = await client.get("/api/v1/reports/companies", headers=admin_headers)
        assert r_comp_rep.status_code == 200
        comp_stat = [c for c in r_comp_rep.json() if c["company_id"] == company_id][0]
        print(f" Company MIS ({comp_stat['company_name']}): Drives: {comp_stat['total_drives']}, Offers Accepted: {comp_stat['total_offers_accepted']}")

        # 12.4 Package Distribution Analytics
        r_pkg = await client.get("/api/v1/reports/packages", headers=admin_headers)
        assert r_pkg.status_code == 200
        pkg = r_pkg.json()
        print(f" Package Distribution: Average: {pkg['average_package_lpa']} LPA, Median: {pkg['median_package_lpa']} LPA, Highest: {pkg['highest_package_lpa']} LPA")

        # 12.5 Selection Funnel
        r_funnel = await client.get(f"/api/v1/reports/funnel?drive_id={drive_id}", headers=admin_headers)
        assert r_funnel.status_code == 200
        funnel = r_funnel.json()
        print(f" Application Funnel: Total Applications: {funnel['total_applications']}")
        for st in funnel["stages"]:
            if st["count"] > 0:
                print(f"   Stage {st['stage']}: {st['count']} ({st['percentage_of_total']}%)")

        # 12.6 Unplaced Students Exception Report
        r_unplaced = await client.get("/api/v1/reports/unplaced", headers=admin_headers)
        assert r_unplaced.status_code == 200
        unplaced_list = r_unplaced.json()
        unplaced_bobs = [u for u in unplaced_list if u["roll_number"] == f"22{dept_code}02"]
        assert len(unplaced_bobs) == 1
        print(f" Unplaced Student Exception Report: {unplaced_bobs[0]['name']} ({unplaced_bobs[0]['roll_number']}) flagged for placement training.")

    print("\n==================================================================")
    print(" ALL 12 TEST SUITE SECTIONS PASSED WITH 100% SUCCESS!          ")
    print("==================================================================")
    return True


import pytest


@pytest.mark.asyncio
async def test_placement360_api_workflow():
    success = await run_test_suite()
    assert success is True


if __name__ == "__main__":
    success = asyncio.run(run_test_suite())
    sys.exit(0 if success else 1)
