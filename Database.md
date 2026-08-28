# AuraATS - Database Schema & Data Models

AuraATS uses **MongoDB Atlas** for persistent storage with a local state fallback mechanism to ensure maximum reliability across both live production environments and testing sandboxes.

---

## Mongo Collections & Data Models

### 1. `users` Collection
Stores registered candidate, recruiter, and administrator credentials and preferences.

```typescript
interface User {
  id: string; // e.g. "usr_101"
  email: string;
  name: string;
  role: 'student' | 'recruiter' | 'admin';
  avatarUrl?: string;
  headline?: string;
  companyName?: string; // For recruiters
  createdAt: string;
  lastLoginAt: string;
}
```

### 2. `candidate_profiles` Collection
Stores parsed candidate resume data, extracted skills, work history, and ATS health metrics.

```typescript
interface CandidateProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  extractedSkills: {
    technical: string[];
    soft: string[];
    tools: string[];
    certifications: string[];
  };
  workExperience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
  }>;
  atsHealthScore: number; // 0-100
  formattingIssues: string[];
  strengths: string[];
  improvements: string[];
  parsedWithEngine: 'self' | 'gemini' | 'grok' | 'hybrid';
  parsedAt: string;
}
```

### 3. `jobs` Collection
Stores posted job openings with required skill vectors, experience level, salary range, and candidate matching criteria.

```typescript
interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  salaryMin: number;
  salaryMax: number;
  status: 'active' | 'closed' | 'draft';
  postedAt: string;
}
```

### 4. `applications` Collection
Links candidates to posted jobs, storing match score calculations, status timeline, and recruiter feedback.

```typescript
interface Application {
  id: string;
  jobId: string;
  studentId: string;
  candidateName: string;
  matchScore: number; // 0 - 100%
  status: 'applied' | 'screening' | 'interview' | 'offered' | 'rejected';
  appliedAt: string;
  notes?: string;
}
```

### 5. `audit_logs` Collection
Tracks system security actions, administrative engine configuration updates, and environment mode switches.

```typescript
interface AuditLog {
  id: string;
  action: string;
  category: 'System Clean' | 'Deployment & Configuration' | 'User Security';
  userEmail: string;
  details: string;
  status: 'Success' | 'Failed';
  timestamp: string;
}
```

---

## REST API CRUD Endpoints & Synchronization

### Student & Candidate CRUD Operations
- `GET /api/candidates` - Retrieves all candidate resume profiles from MongoDB Atlas.
- `POST /api/candidates` - Creates or updates candidate details in MongoDB Atlas. Base64 profile images and resumes are auto-uploaded to Cloudinary.
- `POST /api/auth/update-profile` - Syncs student/recruiter profile changes directly to MongoDB Atlas.

### Job Management CRUD Operations
- `GET /api/jobs` - Retrieves all posted job listings from MongoDB Atlas.
- `POST /api/jobs` - Creates a new job posting with skill requirements, experience thresholds, and salary ranges.
- `PUT /api/jobs/:id` - Updates an existing job posting.
- `DELETE /api/jobs/:id` - Removes a job posting from MongoDB Atlas.

### Application & Matching CRUD Operations
- `GET /api/applications` - Fetches candidate applications across all jobs.
- `POST /api/applications` - Submits a student job application, parses candidate skill vectors against recruiter requirements, calculates the match score, stores the application in MongoDB Atlas, and increments job applicant counters.
- `PUT /api/applications/:id` - Recruiter updates application status (`screening`, `interview`, `offered`, `rejected`).

### User Account CRUD Operations
- `POST /api/auth/register` - Registers new student or recruiter account in MongoDB Atlas.
- `POST /api/auth/login` - Authenticates credentials from MongoDB Atlas.
- `GET /api/admin/users` - Admin view of all registered platform accounts.

---

## Media Storage Integration (Cloudinary)
- **Resume Uploads**: Resumes are uploaded to Cloudinary (`dvuy2z4ka`) and stored as secure PDF / DOCX assets.
- **Avatars**: User profile images are transformed and served via Cloudinary global CDN URLs.
