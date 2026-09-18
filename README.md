# Placement Management System (PlacementOS)

A modern, responsive, and secure MERN-stack web application designed for universities, placement officers, corporate recruiters, and students. Featuring **Passwordless Gmail Email OTP + JWT Authentication**, a server-side **Authoritative Eligibility Engine**, a multi-stage **Applicant Tracking System (ATS)**, and **Interactive Analytics Dashboards**.

---

## 1. Problem Statement
Traditional college placement departments rely on fragmented spreadsheets, unverified form submissions, and manual email correspondence. This causes duplicate applications, mismatched student CGPAs, missed deadlines, and lack of transparency for candidates and recruiters.

---

## 2. Objectives
- Eliminate password storage vulnerabilities through a 100% passwordless **Gmail Email OTP + JWT** architecture.
- Enforce strict **server-side eligibility verification** for all candidate applications.
- Deliver an automated, multi-stage recruitment pipeline (`applied` → `shortlisted` → `test` → `interview` → `selected` / `rejected`).
- Provide institutional analytics and 1-click CSV report exports for placement audits and accreditation.

---

## 3. Key Features
- 🔑 **Passwordless OTP Authentication**: Cryptographic 6-digit one-time tokens delivered via Gmail SMTP, with bcrypt hashing, 5-minute TTL, and 60-second resend cooldowns.
- 🛡️ **Role-Based Access Control (RBAC)**: Independent, guarded portals for Students, Placement Officers (Admin), and Corporate Recruiters.
- ⚙️ **Backend Eligibility Engine**: Real-time evaluation of CGPA thresholds, active backlogs, department matching, and deadline status.
- ⚡ **1-Click Application Submission**: Compound unique indexing prevents duplicate applications at the database level.
- 📊 **Dynamic Analytics Dashboards**: Interactive charts powered by Recharts showing department placements, application funnels, and CTC package tiers.
- 📄 **Audited CSV Export**: 1-click download of student placement records for institutional reporting.
- 🔔 **In-App Notification Dispatcher**: Automatic alerts for new placement drives and stage progress updates.

---

## 4. User Roles & Capabilities

| Role | Default Access | Key Capabilities |
| :--- | :--- | :--- |
| **Student** | Public Signup / Login | Complete academic profile dossier, browse placement drives, inspect live eligibility verdicts, 1-click apply, track application progress timeline. |
| **Admin (Placement Officer)** | Seeded / Controlled | Master command center, manage student roster, create/edit companies, publish drives with custom criteria, move ATS candidate stages, publish notices, export CSV reports. |
| **Recruiter** | Seeded / Corporate | Company dashboard, manage drives for their company, review candidate dossiers, update round decisions with feedback remarks. |

---

## 5. Authentication & Security Architecture

### 5.1 Registration & Login Flow
```
User Enters Email
       ↓
POST /api/auth/request-[signup|login]-otp
       ↓
Backend generates 6-digit cryptographic OTP (crypto.randomInt)
       ↓
OTP hashed via bcrypt and saved to MongoDB (5-minute TTL, max 5 attempts)
       ↓
Nodemailer dispatches professional HTML email via Gmail SMTP
       ↓
User enters 6-digit OTP
       ↓
POST /api/auth/verify-[signup|login]-otp
       ↓
Backend verifies hash & expiry → Generates signed JWT (24h validity)
       ↓
JWT stored in HttpOnly cookie and Bearer token → Redirects to role dashboard
```

### 5.2 Real-Time OTP Generation & Verification
Every OTP is a real-time, 6-digit cryptographic integer (`crypto.randomInt(100000, 1000000)`):
- Hashed using **Bcrypt** prior to saving in MongoDB with a 5-minute TTL.
- Dispatched via **Live Gmail SMTP** (when configured in `server/.env`) or printed in the **Server Terminal Console** for local inspection.
- The hardcoded test bypass is completely disabled; only the actual real-time generated 6-digit code is accepted.

---

## 6. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios, Context API
- **Backend**: Node.js v24, Express.js, Mongoose ODM, Nodemailer, JSON Web Tokens (JWT), Bcrypt.js, Cookie-Parser, Morgan, json2csv
- **Database**: MongoDB (Local service or MongoDB Atlas)

---

## 7. Project Structure

```
placement-management-system/
├── client/                      # React 18 SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/          # Common UI, Auth guards, Recharts
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── layouts/             # DashboardLayout (Navbar + Sidebar)
│   │   ├── pages/               # Student, Admin, and Recruiter views
│   │   └── services/            # Axios API client modules
├── server/                      # Node.js Express REST API
│   ├── src/
│   │   ├── config/              # DB, Environment, Mail configuration
│   │   ├── controllers/         # Auth, Student, Company, Drive, Application
│   │   ├── middleware/          # JWT authentication, RBAC, Error handler
│   │   ├── models/              # Mongoose schemas & compound indexes
│   │   ├── routes/              # Express API routers
│   │   ├── seed/                # Seed script (13 users, 5 companies, 8 drives)
│   │   └── services/            # Email, OTP, Eligibility, Notification
│   └── test_api.js              # Automated Integration Test Suite (27 tests)
└── docs/                        # Complete technical and design documentation
```

---

## 8. Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (Tested on v24.15.0)
- [MongoDB](https://www.mongodb.com/) (Local service on port 27017 or MongoDB Atlas URI)

### Step 1: Clone or Navigate to the Workspace
```bash
cd C:\Users\sahil\.gemini\antigravity\scratch\placement-management-system
```

### Step 2: Install Server Dependencies
```bash
cd server
npm install
```

### Step 3: Install Client Dependencies
```bash
cd ../client
npm install
```

---

## 9. Environment Variables Configuration

### Server (`server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/placement_management_system
JWT_SECRET=supersecret_jwt_key_placement_system_2026_secure
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Gmail SMTP Configuration (Optional for Dev, Required for Live Production Email)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Development OTP Bypass
DEV_OTP_MODE=true
DEV_OTP=123456
```

### Client (`client/.env`):
```env
VITE_API_URL=/api
```

---

## 10. Gmail App Password Setup (For Live Email Dispatch)

If you want to send live emails to actual Gmail accounts:
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned ON.
3. Search for **App Passwords** in the search bar.
4. Create an App Password with name `PlacementOS`.
5. Copy the 16-character password and paste it as `GMAIL_APP_PASSWORD` in `server/.env`.
6. Set `GMAIL_USER` to your Gmail address.

---

## 11. Database Initialization & Reset

### Option A: Clean Real Production Initialization (Zero Demo Data):
Wipes all mock/demo records and initializes ONLY your real Master Admin account (`sahilkanjariya15@gmail.com`):
```bash
cd server
npm run clean-db
```

### Option B: Demo Seeding (For Viva & Evaluation Mock Dataset):
```bash
cd server
npm run seed
```

### Pre-Seeded Demo Accounts (Zero Passwords — OTP: `123456`):
- **👨‍💼 Placement Officer (Admin)**: `admin@placement.local`
- **🏢 Corporate Recruiter (TechNova)**: `recruiter@placement.local`
- **🎓 Student (Aarav Sharma, CSE, CGPA 8.75)**: `student@placement.local`

---

## 12. Running the Application

### Start Backend API Server (Port 5000):
```bash
cd server
npm run dev
```

### Start Frontend Vite Dev Server (Port 5173):
```bash
cd client
npm run dev
```

Open your browser and navigate to: **`http://localhost:5173`**

---

## 13. Running Automated Integration Tests

Execute the 27-test automated test suite verifying OTP auth, JWT sessions, RBAC guards, eligibility calculations, duplicate prevention, and stage transitions:

```bash
cd server
npm test
```

Expected Output:
```
===============================================================
🏁 TEST RESULTS: 27 PASSED, 0 FAILED
===============================================================
```

---

## 14. Step-by-Step Viva / Demo Flow

1. **Open Application**: Navigate to `http://localhost:5173/login`.
2. **One-Click Demo Fill**: Click the `🎓 Student` quick-fill button (`student@placement.local`).
3. **Send OTP**: Click "Send Verification Code".
4. **Enter OTP**: Click "Fill 123456" (or enter code from console/email) and verify.
5. **Student Dashboard**: Inspect dynamic KPI cards and profile completion meter.
6. **Discover Drives**: Navigate to `/student/drives`. Switch between "All Drives" and "Eligible for Me".
7. **Inspect Eligibility**: Click a drive to view the live **Eligibility Checklist** (CGPA, backlogs, department).
8. **1-Click Apply**: Submit application. Verify instant state update to `Applied`.
9. **Duplicate Protection**: Attempt to apply again → Observe immediate block: *"Application already submitted"*.
10. **Admin Login**: Log out, click `👨‍💼 Admin` (`admin@placement.local`), and log in with OTP `123456`.
11. **Admin Analytics**: View live KPI cards, Department Placement BarChart, and Pipeline PieChart.
12. **Master ATS Progression**: Open `/admin/applications`, click "Move Stage" on an application, advance from `Applied` → `Shortlisted` → `Interview` → `Selected`, and enter remarks.
13. **CSV Export**: Click "Export Placements CSV" to download the audited placement report.
14. **Student Verification**: Log back in as student → Observe status updated to `Selected (Placed)` with interviewer remarks!

---

## 15. Team Roles Simulation (3-Person Agile Team)

- **Developer 1 (Frontend Lead)**: React component hierarchy, Tailwind design system, interactive Recharts visualizations, context state management, responsive layouts.
- **Developer 2 (Backend & Security Lead)**: Express REST API, Nodemailer Gmail SMTP integration, crypto OTP generator/verifier, JWT middleware, RBAC authorization guards, backend eligibility engine.
- **Developer 3 (Database & QA Lead)**: Mongoose schemas, compound unique indexes, mock seed data generation, 27-case automated test suite, documentation, and CSV exporter.

---

## 16. Future Scope
- Automated WhatsApp/SMS alerts for urgent interview slots.
- Direct PDF resume parser for automatic profile field population.
- Company interview slot scheduler with calendar integration.
