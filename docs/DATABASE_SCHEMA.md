# Database Schema Documentation

The Placement Management System utilizes **MongoDB** with **Mongoose** to enforce structured schemas, referential integrity, and database-level constraints.

---

## 1. Collections & Schema Definitions

### 1.1 `users`
Represents core identity and authentication profiles.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | System generated unique identifier |
| `name` | String | Required, Trimmed | Full name of the user |
| `email` | String | Required, Unique, Lowercase | User's email address |
| `role` | String | Required, Enum | `student`, `admin`, `recruiter` |
| `isActive` | Boolean | Default: `true` | Account active state |
| `companyId` | ObjectId | Ref: `Company`, Optional | Company reference for recruiters |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 1.2 `studentProfiles`
Stores academic records, contact info, and skills for students.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Profile unique identifier |
| `userId` | ObjectId | Required, Unique, Ref: `User` | One-to-one link to User document |
| `enrollmentNo` | String | Required, Unique, Trimmed | University registration / Roll number |
| `department` | String | Required | e.g., `Computer Science`, `Information Technology` |
| `semester` | Number | Required, Min: 1, Max: 8 | Current semester |
| `cgpa` | Number | Required, Min: 0, Max: 10 | Cumulative Grade Point Average |
| `backlogs` | Number | Required, Min: 0 | Number of active backlogs |
| `phone` | String | Required, Length: 10 | 10-digit mobile number |
| `skills` | [String] | Array of Strings | Technical and soft skills |
| `resumeUrl` | String | Optional | URL or filepath to uploaded resume |
| `placementStatus` | String | Enum, Default: `unplaced` | `unplaced`, `placed`, `opted_out` |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 1.3 `companies`
Stores corporate partner information.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Company unique identifier |
| `name` | String | Required, Unique, Trimmed | Corporate name |
| `industry` | String | Required | Industry sector (e.g., Software, Fintech) |
| `website` | String | Required | Official company website URL |
| `location` | String | Required | Primary office / work location |
| `hrName` | String | Required | Contact HR representative name |
| `hrEmail` | String | Required, Lowercase | Contact HR email address |
| `isActive` | Boolean | Default: `true` | Partnership status |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 1.4 `drives` (Placement Drives)
Represents hiring opportunities published by companies or placement officers.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Drive unique identifier |
| `companyId` | ObjectId | Required, Ref: `Company` | Associated company |
| `title` | String | Required, Trimmed | Job role title (e.g., Full Stack Engineer) |
| `description` | String | Required | Detailed job role description |
| `package` | Number | Required, Min: 0 | Annual CTC in Lakhs Per Annum (LPA) |
| `location` | String | Required | Job location |
| `jobType` | String | Enum, Default: `full_time` | `full_time`, `internship` |
| `deadline` | Date | Required | Application deadline cutoff date |
| `minCgpa` | Number | Required, Min: 0, Max: 10 | Minimum CGPA threshold |
| `eligibleDepartments` | [String] | Required, Array | Allowed academic departments |
| `maxBacklogs` | Number | Required, Min: 0, Default: 0 | Maximum allowed active backlogs |
| `eligibleSemesters` | [Number] | Array of Numbers | Permitted semesters (e.g. `[7, 8]`) |
| `status` | String | Enum, Default: `open` | `open`, `closed`, `completed` |
| `createdBy` | ObjectId | Required, Ref: `User` | User who created the drive |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 1.5 `applications`
Tracks candidate applications and recruitment progress.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Application identifier |
| `driveId` | ObjectId | Required, Ref: `Drive` | Target placement drive |
| `studentId` | ObjectId | Required, Ref: `StudentProfile` | Applying student profile |
| `status` | String | Enum, Default: `applied` | `applied`, `shortlisted`, `test`, `interview`, `selected`, `rejected` |
| `appliedAt` | Date | Default: `Date.now` | Application submission time |
| `remarks` | String | Optional | Stage evaluation notes by Admin/Recruiter |
| `resultDate` | Date | Optional | Final decision date |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 1.6 `announcements`
College-wide or role-targeted placement circulars.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Announcement identifier |
| `title` | String | Required, Trimmed | Notice headline |
| `message` | String | Required | Detailed circular text |
| `audience` | String | Enum, Default: `all` | `all`, `student`, `recruiter` |
| `publishedBy` | ObjectId | Required, Ref: `User` | Publisher reference |
| `isPublished` | Boolean | Default: `true` | Visibility status |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

### 1.7 `notifications`
Direct in-app alerts sent to users for relevant lifecycle events.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Notification identifier |
| `userId` | ObjectId | Required, Ref: `User` | Recipient user |
| `title` | String | Required | Brief alert title |
| `message` | String | Required | Detailed notification body |
| `type` | String | Enum | `drive`, `application`, `announcement`, `system` |
| `isRead` | Boolean | Default: `false` | Read status |
| `createdAt` | Date | Timestamp | Creation timestamp |

### 1.8 `otpVerifications`
Temporary cryptographic tokens for passwordless OTP authentication.
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key | Token identifier |
| `email` | String | Required, Lowercase | User email address |
| `purpose` | String | Enum (`signup`, `login`) | Context of OTP generation |
| `otpHash` | String | Required | Bcrypt hashed 6-digit OTP |
| `expiresAt` | Date | Required | Expiration timestamp (5m TTL) |
| `attempts` | Number | Default: 0 | Number of verification attempts |
| `lastSentAt` | Date | Required | Cooldown timestamp tracking |
| `verified` | Boolean | Default: `false` | Verification state flag |
| `createdAt` | Date | Timestamp | Creation timestamp |

---

## 2. Database Indexes & Constraints

- **Compound Unique Index**: `applications` collection has `{ driveId: 1, studentId: 1 }` with `{ unique: true }` to guarantee zero duplicate submissions at the database engine level.
- **Unique Indexes**:
  - `users.email`
  - `studentProfiles.userId`
  - `studentProfiles.enrollmentNo`
  - `companies.name`
- **Lookup Indexes**:
  - `drives.status`, `drives.deadline`
  - `applications.status`, `applications.studentId`, `applications.driveId`
  - `notifications.userId`, `notifications.isRead`
  - `otpVerifications.email`, `otpVerifications.purpose`
