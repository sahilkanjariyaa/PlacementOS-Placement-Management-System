# Implementation Plan & Engineering Design

## 1. System Architecture Overview
The Placement Management System is built using a decoupled Client-Server architecture:
- **Client**: Single-Page Application (SPA) powered by React 18, React Router v6, Tailwind CSS, Lucide icons, and Recharts.
- **Server**: REST API backend powered by Node.js and Express.js, featuring modular routing, schema validation, rate-limiting, and middleware chains.
- **Database**: Document-oriented storage with MongoDB and Mongoose, enforcing schema validation, object references, and unique compound indexing.
- **Security**: Passwordless Gmail SMTP OTP authentication with bcrypt hashing, time-limited verification tokens, and stateless signed JSON Web Tokens (JWT).

## 2. Seven-Day Implementation Roadmap
- **Day 1**: Requirements extraction, technical architecture specification, environment configuration, database connection, and directory structuring.
- **Day 2**: Passwordless Gmail OTP authentication engine, Nodemailer transporter, JWT issuance, auth middleware, and RBAC guards.
- **Day 3**: Student dossier profile management, Company listings CRUD, and Placement Drive creation engine.
- **Day 4**: Server-side Eligibility Verification Engine, 1-Click Application processor, compound duplicate protection, and multi-stage status workflow.
- **Day 5**: Dynamic Dashboards for Student, Placement Officer (Admin), and Recruiter; Announcement and Notification dispatchers.
- **Day 6**: Placement analytics aggregation pipeline, Recharts data visualization, CSV report exporter, and responsive UI hardening.
- **Day 7**: End-to-end automated testing, regression testing, demo script verification, viva documentation, and final build validation.

## 3. Team Responsibilities Breakdown (3-Person Simulation)
1. **Developer 1 (Frontend Lead)**: React component hierarchy, Tailwind UI layout, state management, form validation, role-based page guards, and chart integrations.
2. **Developer 2 (Backend & Security Lead)**: Express routing, Nodemailer SMTP service, OTP generation/verification, JWT lifecycle, RBAC middleware, and eligibility logic.
3. **Developer 3 (Database & QA Lead)**: Mongoose schemas, compound indexes, mock seed data generation, end-to-end API testing, documentation, and build verification.
