# 🎓 PlacementOS — Placement Management System

> A modern, secure, and responsive web-based placement management platform for students, placement officers, and corporate recruiters.

PlacementOS is a full-stack **MERN-based Placement Management System** designed to digitize and simplify the complete college placement lifecycle — from student registration and eligibility verification to job applications, recruitment stages, notifications, analytics, and placement reports.

---

## ✨ Features

### 🔐 Authentication & Security

* Passwordless Email OTP authentication
* 6-digit OTP generation
* OTP hashing with bcrypt
* OTP expiry and verification limits
* JWT-based authentication
* HttpOnly cookie support
* Role-Based Access Control (RBAC)
* Protected routes for different user roles
* Rate limiting and authentication middleware

### 🎓 Student Portal

Students can:

* Register and verify their email using OTP
* Complete and manage their academic profile
* View available placement drives
* Check real-time eligibility
* Apply for eligible placement opportunities
* Prevent duplicate applications
* Track application status
* View recruitment-stage updates
* Receive announcements and notifications

### 👨‍💼 Admin / Placement Officer Portal

Placement officers can:

* View placement analytics
* Manage students
* Manage companies
* Create and manage placement drives
* Configure eligibility criteria
* Manage applications
* Move candidates through recruitment stages
* Publish announcements
* Export placement reports as CSV
* Monitor overall placement activity

### 🏢 Recruiter Portal

Corporate recruiters can:

* Manage company information
* Manage recruitment drives
* View candidate applications
* Review student profiles
* Update candidate recruitment stages
* Add recruitment feedback and remarks

### ⚙️ Eligibility Engine

The backend validates student eligibility using configurable criteria such as:

* Minimum CGPA
* Active backlogs
* Department / branch
* Application deadline
* Placement drive requirements

Eligibility is evaluated on the **server side** to prevent client-side manipulation.

### 📊 Analytics Dashboard

Interactive dashboards provide insights into:

* Placement statistics
* Department-wise placements
* Application funnel
* Candidate recruitment stages
* CTC / package information

Charts are implemented using **Recharts**.

### 📄 Reports

* Placement report generation
* CSV export
* Institutional reporting support
* Application and placement data management

### 🔔 Notifications

The application supports notifications for:

* New placement drives
* Application updates
* Recruitment-stage changes
* Announcements

---

# 🏗️ Technology Stack

## Frontend

| Technology      | Purpose              |
| --------------- | -------------------- |
| React 18        | User interface       |
| Vite            | Frontend build tool  |
| React Router v6 | Client-side routing  |
| Tailwind CSS    | UI styling           |
| Axios           | API communication    |
| Recharts        | Analytics and charts |
| Lucide React    | Icons                |

## Backend

| Technology         | Purpose               |
| ------------------ | --------------------- |
| Node.js            | Runtime               |
| Express.js         | REST API              |
| Mongoose           | MongoDB ODM           |
| MongoDB            | Database              |
| JWT                | Authentication        |
| Bcrypt.js          | Password/OTP hashing  |
| Nodemailer         | Email delivery        |
| Cookie Parser      | Cookie handling       |
| Express Rate Limit | API protection        |
| Morgan             | HTTP logging          |
| JSON2CSV           | CSV report generation |
| Multer             | File upload handling  |

---

# 👥 User Roles

| Role         | Main Responsibilities                                         |
| ------------ | ------------------------------------------------------------- |
| 🎓 Student   | Profile, eligibility, drives, applications, status tracking   |
| 👨‍💼 Admin  | Students, companies, drives, applications, analytics, reports |
| 🏢 Recruiter | Company, drives, candidates, recruitment stages               |

---

# 🔄 Application Workflow

```text
Student Registration
        ↓
Email OTP Verification
        ↓
Student Profile
        ↓
Placement Drive
        ↓
Eligibility Verification
        ↓
Application Submission
        ↓
Applied
        ↓
Shortlisted
        ↓
Test
        ↓
Interview
        ↓
Selected / Rejected
        ↓
Placement Report
```

---

# 📁 Project Structure

```text
placement-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── charts/
│   │   │   └── common/
│   │   │
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── recruiter/
│   │   │   └── student/
│   │   │
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── test_api.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js 18+
* MongoDB or MongoDB Atlas
* Git
* npm

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 📥 Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git](https://github.com/sahilkanjariyaa/PlacementOS-Placement-Management-System.git
```

Navigate into the project:

```bash
cd placement-management-system
```

---

# 📦 Install Backend Dependencies

```bash
cd server
npm install
```

---

# 📦 Install Frontend Dependencies

Open another terminal or return to the project root:

```bash
cd ../client
npm install
```

---

# 🔧 Environment Configuration

## Backend `.env`

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/placement_management_system

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d

CLIENT_URL=http://localhost:5173

NODE_ENV=development

GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

> ⚠️ Never commit `.env` files or Gmail App Passwords to GitHub.

---

## Frontend `.env`

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=/api
```

---

# 🗄️ Database

The application uses:

```text
MongoDB
    ↓
Mongoose
    ↓
Express REST API
    ↓
React Frontend
```

You can use either:

* Local MongoDB
* MongoDB Atlas

---

# ▶️ Run the Backend

From the `server` directory:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

# ▶️ Run the Frontend

From the `client` directory:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🧪 Available Scripts

## Client

```bash
npm run dev
npm run build
npm run preview
```

## Server

```bash
npm start
npm run dev
npm run seed
npm run clean-db
npm run create-admin
npm run set-role
npm test
```

---

# 🔑 Authentication Flow

```text
User
 ↓
Enter Email
 ↓
Request OTP
 ↓
Backend Generates 6-Digit OTP
 ↓
OTP Hashed with Bcrypt
 ↓
OTP Stored in MongoDB
 ↓
Email Sent Through Nodemailer
 ↓
User Enters OTP
 ↓
OTP Verification
 ↓
JWT Generated
 ↓
Authenticated Dashboard
```

---

# 🛡️ Security

PlacementOS implements several security mechanisms:

* JWT authentication
* HttpOnly cookies
* Bcrypt hashing
* OTP expiration
* OTP verification attempt limits
* API rate limiting
* Role-based authorization
* Protected frontend routes
* Server-side eligibility verification
* Database-level duplicate application protection
* Environment variable configuration

---

# 📊 Recruitment Pipeline

Applications can progress through multiple recruitment stages:

```text
Applied
   ↓
Shortlisted
   ↓
Test
   ↓
Interview
   ↓
Selected
   │
   └── Rejected
```

Recruiters and administrators can update application stages and provide remarks.

---

# 📈 Dashboard Analytics

The admin dashboard provides visual analytics for placement operations, including:

* Department placement statistics
* Application pipeline
* Candidate status
* Placement/package information

Charts are powered by **Recharts**.

---

# 📋 Reports

Administrators can export placement information as CSV for:

* Placement records
* Student information
* Application data
* Institutional reporting

---

# 🎯 Project Objectives

The main objectives of PlacementOS are to:

1. Digitize the college placement process.
2. Reduce manual spreadsheet-based management.
3. Automate student eligibility checking.
4. Prevent duplicate job applications.
5. Provide separate portals for students, administrators, and recruiters.
6. Improve recruitment-stage transparency.
7. Provide centralized placement analytics.
8. Simplify placement reporting.

---

# 🔮 Future Enhancements

Possible future improvements include:

* 📱 Mobile application
* 📄 AI-powered resume parsing
* 🤖 AI-based candidate-job matching
* 📅 Interview scheduling
* 📧 Automated email notifications
* 📱 WhatsApp/SMS notifications
* 📊 Advanced placement analytics
* ☁️ Cloud deployment
* 📄 PDF report generation
* 🔔 Push notifications
* 🏢 Recruiter self-registration and verification

---

# 🎓 Academic Project

This project demonstrates practical implementation of:

* Full-stack web development
* REST API development
* Authentication and authorization
* Database design
* Role-based access control
* Recruitment workflow management
* Data visualization
* Reporting
* Security practices
* Responsive UI development

---

# 👨‍💻 Author

**Sahil Kanjariya**

Placement Management System — PlacementOS

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is intended for educational and academic purposes.
