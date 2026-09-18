# Project Specification: Placement Management System

**Document Version**: 1.0.0  
**Project Type**: College Full-Stack Project (MERN)  
**Authentication**: Gmail Email OTP + JWT (Passwordless)  
**Target Roles**: Student, Admin (Placement Officer), Recruiter (Company Representative)  

---

## 1. Executive Summary & Objective

The **Placement Management System** is a unified, automated, and secure university recruitment platform designed to digitize and manage the entire lifecycle of on-campus and off-campus placements. It eliminates manual spreadsheet tracking, prevents duplicate or ineligible applications, verifies candidate eligibility in real time on the server, and provides comprehensive analytics for college placement officers and corporate recruiters.

### Primary Goals:
1. **Passwordless Security**: Zero stored passwords; end-to-end authentication powered exclusively by 6-digit Gmail Email OTPs and JSON Web Tokens (JWT).
2. **Backend-Enforced Eligibility**: Automatic validation of CGPA, backlogs, department, semester, and deadline before any application is accepted.
3. **Multi-Stage ATS Application Tracking**: Transparent student application status flow (`applied` → `shortlisted` → `test` → `interview` → `selected` / `rejected`).
4. **Role Isolation**: Strict Role-Based Access Control (RBAC) ensuring students, placement officers, and recruiters only access authorized resources.
5. **Real-time Analytics & Export**: Live dynamic statistics and charts for institutional reporting and CSV export.

---

## 2. User Roles & Permissions

| Role | Description | Key Capabilities |
| :--- | :--- | :--- |
| **Student** | Registered university student seeking placement opportunities. | - OTP signup & login<br>- Maintain student profile & skills<br>- Discover placement drives with eligibility status<br>- 1-click application submission<br>- Live tracking of application stages<br>- View college announcements & notifications |
| **Admin** *(Placement Officer)* | Institutional coordinator managing campus recruitment operations. | - OTP login<br>- Manage student roster & verify profiles<br>- Manage company listings (CRUD)<br>- Create & publish placement drives with custom criteria<br>- Oversee ATS candidate pipeline & advance stages<br>- Publish notices & broadcast announcements<br>- View executive analytics charts & export placement reports |
| **Recruiter** | Corporate partner recruiting talent for designated company. | - OTP login<br>- View company profile & assigned drives<br>- Review student applicants & academic dossiers<br>- Update candidate selection round statuses with interview remarks |

---

## 3. Core Business Workflows

### 3.1 Authentication Workflow (Email OTP + JWT)
```
User Enters Email
       ↓
POST /api/auth/request-[signup|login]-otp
       ↓
Backend creates 6-digit cryptographic OTP, hashes with bcrypt, sets 5m TTL
       ↓
Nodemailer dispatches email via Gmail SMTP (or DEV_OTP fallback)
       ↓
User enters 6-digit OTP
       ↓
POST /api/auth/verify-[signup|login]-otp
       ↓
Backend validates OTP & attempt counts, generates JWT (24h validity)
       ↓
JWT stored in HttpOnly Cookie & response payload → Redirects to role dashboard
```

### 3.2 Placement Drive & Application Lifecycle Workflow
```
Admin / Recruiter creates Placement Drive (Sets min CGPA, max backlogs, allowed departments, deadline)
       ↓
Student visits /student/drives
       ↓
Backend evaluates eligibility rules for student
       ↓
Student submits application (POST /api/applications/:driveId)
       ↓
Server checks: Active account? Profile complete? Eligible? Drive Open? Before Deadline? Duplicate?
       ↓
Application recorded with compound unique index { driveId, studentId }
       ↓
Admin / Recruiter reviews application & updates status:
[Applied] ──► [Shortlisted] ──► [Test / Assessment] ──► [Interview] ──► [Selected]
       │               │                      │               │
       └───────────────┴──────────────────────┴───────────────┴──► [Rejected]
       ↓
Student receives notification & live timeline updates
```

---

## 4. Technical Constraints & Out-of-Scope Items

- **Technology Stack**: React.js (Vite + Tailwind CSS + Recharts), Node.js, Express.js, MongoDB (Mongoose).
- **Authentication**: Gmail Email OTP + JWT only. No passwords, no social logins, no third-party Firebase.
- **Out of Scope (By Master Prompt Design)**:
  - No AI / LLM / chatbot integrations
  - No payment gateways
  - No blockchain
  - No microservices or WebRTC video calling
  - No unnecessary third-party paid subscriptions
