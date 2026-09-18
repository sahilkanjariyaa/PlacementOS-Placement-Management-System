# API Documentation: Placement Management System

Base URL: `http://localhost:5000/api`

All protected routes accept authentication via:
1. `Authorization: Bearer <JWT_TOKEN>` header, OR
2. HttpOnly cookie named `token`.

---

## 1. Authentication Routes (`/api/auth`)

### 1.1 Request Signup OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/request-signup-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@gmail.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to your email.",
    "data": { "email": "aarav.sharma@gmail.com", "expiresIn": "5 minutes" }
  }
  ```

### 1.2 Verify Signup OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/verify-signup-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav.sharma@gmail.com",
    "otp": "123456"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registration successful! Welcome to PlacementOS.",
    "data": {
      "user": { "_id": "...", "name": "Aarav Sharma", "email": "aarav.sharma@gmail.com", "role": "student" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 1.3 Request Login OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/request-login-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "aarav.sharma@gmail.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login OTP dispatched to your email."
  }
  ```

### 1.4 Verify Login OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/verify-login-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "aarav.sharma@gmail.com",
    "otp": "123456"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "user": { "_id": "...", "name": "Aarav Sharma", "email": "aarav.sharma@gmail.com", "role": "student" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### 1.5 Resend OTP
- **Method**: `POST`
- **Endpoint**: `/api/auth/resend-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "aarav.sharma@gmail.com",
    "purpose": "login"
  }
  ```

### 1.6 Get Current User Identity
- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Access**: Authenticated (Any Role)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "_id": "...", "name": "Aarav Sharma", "email": "aarav.sharma@gmail.com", "role": "student", "isActive": true },
      "profile": { "enrollmentNo": "CS202301", "department": "Computer Science", "cgpa": 8.5 }
    }
  }
  ```

### 1.7 Logout
- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Access**: Authenticated (Any Role)

---

## 2. Student Routes (`/api/students`)

- `GET /api/students/profile` (Student): Retrieve student profile.
- `PUT /api/students/profile` (Student): Update profile information, skills, and resume link.
- `GET /api/students` (Admin): List and search all students with filter criteria (department, min CGPA, status).
- `PUT /api/students/:id/status` (Admin): Activate/deactivate student or update placement status.

---

## 3. Company Routes (`/api/companies`)

- `GET /api/companies` (Authenticated): List all partner companies with search and filters.
- `GET /api/companies/:id` (Authenticated): Retrieve company details with drive history.
- `POST /api/companies` (Admin): Create new corporate partner record.
- `PUT /api/companies/:id` (Admin): Update company details.
- `DELETE /api/companies/:id` (Admin): Deactivate company.

---

## 4. Placement Drive Routes (`/api/drives`)

- `GET /api/drives` (Authenticated): List all drives with search (keyword, location, jobType, minPackage).
- `GET /api/drives/eligible` (Student): Return only placement drives where the requesting student satisfies all backend eligibility criteria.
- `GET /api/drives/:id` (Authenticated): Retrieve single drive details, including dynamic eligibility verdict and missing prerequisites for students.
- `POST /api/drives` (Admin, Recruiter): Create new placement drive.
- `PUT /api/drives/:id` (Admin, Recruiter): Update placement drive parameters.
- `DELETE /api/drives/:id` (Admin): Close or remove drive.

---

## 5. Applications Routes (`/api/applications`)

- `POST /api/applications/:driveId` (Student): Submit 1-click application. Automatically verifies backend eligibility and blocks duplicates.
- `GET /api/applications/my` (Student): View personal applications and stage history.
- `GET /api/applications` (Admin, Recruiter): Master application tracker with filters (`driveId`, `status`, `department`).
- `GET /api/applications/:id` (Authenticated): Single application detail with candidate profile dossier.
- `PUT /api/applications/:id/status` (Admin, Recruiter): Advance application stage (`shortlisted`, `test`, `interview`, `selected`, `rejected`) with evaluation remarks.

---

## 6. Announcement & Notification Routes

- `GET /api/announcements` (Authenticated): Fetch active announcements.
- `POST /api/announcements` (Admin): Create and broadcast announcement.
- `PUT /api/announcements/:id` (Admin): Update announcement.
- `DELETE /api/announcements/:id` (Admin): Delete announcement.
- `GET /api/notifications` (Authenticated): List user notifications.
- `PUT /api/notifications/:id/read` (Authenticated): Mark single alert as read.
- `PUT /api/notifications/read-all` (Authenticated): Mark all alerts as read.

---

## 7. Dashboard & Analytics Routes

- `GET /api/dashboard/stats` (Authenticated): Role-tailored dynamic counters and KPI metrics.
- `GET /api/reports/analytics` (Admin): Aggregated chart statistics (Placements by Department, Applications by Stage, CTC Distributions).
- `GET /api/reports/export` (Admin): Download placement summary dataset in CSV format.
