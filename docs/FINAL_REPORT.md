# Placement Management System — Final Engineering Report

**Project Title**: Placement Management System (PlacementOS)  
**Architecture**: Decoupled MERN Stack (MongoDB, Express.js, React.js, Node.js)  
**Security Model**: Passwordless Gmail Email OTP + JSON Web Tokens (JWT)  
**Target Stakeholders**: University Students, Placement Officers (Admin), Corporate Recruiters  
**Development Team Simulation**: 3 Full-Stack Software Engineers  
**Timeline**: 7-Day Agile Iteration  

---

## 1. Executive Summary

Traditional college placement operations are notoriously inefficient and vulnerable to data errors when managed via static spreadsheets or unverified forms. The **Placement Management System (PlacementOS)** completely modernizes and secures the campus recruitment lifecycle through:
1. **Zero-Password Authentication**: Elimination of credential vulnerabilities via cryptographic 6-digit Email OTPs and signed JWT sessions.
2. **Authoritative Server-Side Rule Evaluation**: An automated Eligibility Engine that prevents ineligible candidates from applying, validating CGPA thresholds, backlog limits, department alignment, and deadlines.
3. **End-to-End Applicant Tracking (ATS)**: Multi-stage candidate pipeline tracking (`applied` → `shortlisted` → `test` → `interview` → `selected` / `rejected`).
4. **Role Isolation & Governance**: Clear, strictly enforced RBAC boundaries between Students, Placement Officers, and Corporate Recruiters.
5. **Real-time Analytics & Audited Exports**: Dynamic dashboards with interactive Recharts charts and 1-click CSV report generation.

---

## 2. Implemented Modules & Architecture

### 2.1 Passwordless Authentication & Session Security
- **OTP Generation**: Cryptographically secure 6-digit integers generated via `crypto.randomInt(100000, 1000000)`.
- **Storage & Hashing**: Stored as one-way bcrypt hashes in MongoDB with a 5-minute TTL automatic expiration.
- **Attempt & Cooldown Throttling**: Enforces a maximum of 5 verification attempts per token and a 60-second resend cooldown.
- **Session Issuance**: Verified users receive a stateless signed JWT token (24-hour validity) transmitted via both HttpOnly cookies and JSON payloads.
- **Development Fallback**: When `DEV_OTP_MODE=true`, OTP `123456` or the generated OTP is logged and verified instantly for offline demonstration.

### 2.2 Student Portal
- **Academic Dossier Builder**: Enrollment roll number, department, semester, CGPA, backlogs, mobile number, skills tags, and resume cloud link.
- **Drives Discovery**: Real-time filtering by department, CTC package, and job type, featuring live **Eligibility Badges** and missing requirement breakdowns.
- **1-Click Application**: Automatic backend verification and compound duplicate submission prevention (`{ driveId: 1, studentId: 1 }`).
- **Application Pipeline Tracker**: Interactive visual stage progression timeline and interviewer remarks.

### 2.3 Placement Officer (Admin) Portal
- **Executive Command Center**: Live KPI cards (Students, Companies, Drives, Applications, Offers, Placement Rate %) and Recharts visualizations.
- **Student Roster**: Filterable directory with account activation toggles and full profile inspection.
- **Corporate Partners Directory**: CRUD manager for partner companies and HR points-of-contact.
- **Placement Drives Manager**: Custom eligibility criteria configuration (min CGPA, max backlogs, permitted departments, deadlines).
- **Master ATS Pipeline**: Multi-column candidate filter with an inline **Stage Decision Modal** (`shortlisted`, `test`, `interview`, `selected`, `rejected`) and feedback remarks.
- **Broadcast Bulletins**: Notice board dispatcher for college-wide announcements.
- **Reports Hub**: Institutional placement analytics and 1-click **Download Placements CSV Report**.

### 2.4 Corporate Recruiter Portal
- **Recruiter Dashboard**: Scoped view of company-specific drives and candidate applications.
- **Drive Manager**: Create and update job descriptions for their assigned corporate entity.
- **Applicant Review**: Review student dossiers and advance applicants through assessment and interview rounds.

---

## 3. Database Design & Integrity Constraints

- **Compound Unique Index**: `applications` collection enforces `{ driveId: 1, studentId: 1 }` with `{ unique: true }`, ensuring zero duplicate submissions at the database engine level.
- **Unique Fields**: `users.email`, `studentProfiles.enrollmentNo`, `studentProfiles.userId`, `companies.name`.
- **TTL Purging Index**: `otpVerifications.expiresAt` automatically purges expired tokens.

---

## 4. Verification & Testing Summary

- **Automated Integration Tests**: 27/27 test cases passed (100% pass rate) covering signup OTP, login OTP, invalid OTP, duplicate registration, role guards, eligibility checks, duplicate prevention, and stage transitions.
- **Frontend Production Bundle**: `vite build` completed cleanly in 6.97s with zero compilation warnings or errors.
- **Demo Seed Dataset**: Database populated with 13 users, 5 partner companies, 8 placement drives, 11 multi-stage applications, and 3 announcements.

---

## 5. Team Contribution Simulation (3 Developers)

| Developer | Role & Responsibilities | Deliverables |
| :--- | :--- | :--- |
| **Developer 1 (Frontend Lead)** | React 18 SPA, Tailwind CSS layout, responsive design, context state management, form validations, Recharts data visualization. | `client/src/components/*`, `client/src/pages/*`, `client/src/context/*` |
| **Developer 2 (Backend & Security Lead)** | Express REST API, Nodemailer Gmail SMTP, crypto OTP service, JWT middleware, RBAC guards, authoritative eligibility engine. | `server/src/services/*`, `server/src/controllers/*`, `server/src/middleware/*` |
| **Developer 3 (Database & QA Lead)** | Mongoose schemas, compound unique indexes, mock seed dataset, automated integration test suite, API docs, CSV exporter. | `server/src/models/*`, `server/src/seed/*`, `server/test_api.js`, `docs/*` |
