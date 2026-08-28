# AuraATS - Security Architecture & Data Safeguards

AuraATS is engineered to protect candidate privacy, secure recruiter data, and prevent API key leaks.

---

## Security Principles & Control Layers

### 1. Zero Client-Side Secret Leakage
- **Server-Side Proxy Architecture**: API keys for **Gemini** (`GEMINI_API_KEY`) and **Grok** (`GROK_API_KEY`) reside exclusively in server-side environment variables.
- **Client Shield**: The browser front-end never receives raw third-party secret tokens or API credentials.

### 2. System Mode Security Controls (`/api/admin/system-mode`)
- **Mode Isolation**:
  - **Demo Sandbox Mode**: Serves simulated test data in isolated local memory/caches.
  - **Live Production Mode**: Connects directly to authenticated MongoDB Atlas sessions and live Cloudinary asset storage.
- **Admin Access Restrictions**: Changing system mode or purging database state requires Admin authority and logs actions directly into the immutable `audit_logs` collection.

### 3. Role-Based Access Control (RBAC)
- **Student Role**: Restricted to viewing job feeds, building resume profiles, submitting applications, and monitoring application status.
- **Recruiter Role**: Access to posting jobs, managing applicants, reviewing parsed candidate resumes, and scheduling interviews.
- **Admin Role**: Platform-wide monitoring, engine benchmarking, Grok API key status tracking, and environment converter control.

### 4. File Upload & Media Security
- **Type Whitelisting**: Only PDF, DOCX, and TXT files are accepted by the resume parser API.
- **Cloudinary Signed Storage**: Uploaded documents are converted to secure Cloudinary assets with sanitized filename headers to mitigate path traversal or script execution vulnerabilities.
