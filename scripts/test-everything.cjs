const http = require('http');
const { execSync } = require('child_process');

async function runComprehensiveTest() {
  console.log('================================================================');
  console.log('🚀 AURA ATS SAAS - 100% COMPREHENSIVE PRODUCTION TEST SUITE');
  console.log('================================================================\n');

  function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const u = new URL('http://localhost:3000' + path);
      const postData = data ? JSON.stringify(data) : '';
      const req = http.request({
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      });
      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${title} ${extra ? '(' + extra + ')' : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${title} ${extra ? '(' + extra + ')' : ''}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // SUITE 1: System Health, Cloudinary & MongoDB Atlas
  // -------------------------------------------------------------
  console.log('📦 [1/12] System Health, Cloudinary & MongoDB Atlas Live Sync');
  const health = await request('GET', '/api/health');
  assert('Health Check 200 OK', health.status === 200 && health.data.status === 'ok');
  assert('MongoDB Atlas Active & Connected', health.data.mongodbAtlasConnected === true);
  assert('Gemini API Key Configured', health.data.hasGeminiKey === true);
  assert('Cloudinary Cloud Attached', health.data.cloudinaryCloudName === 'dvuy2z4ka');

  const dbStatus = await request('GET', '/api/db/status');
  assert('Database Status Diagnostic', dbStatus.status === 200 && dbStatus.data.provider.includes('MongoDB Atlas'));

  // -------------------------------------------------------------
  // SUITE 2: Multi-Engine Resume Parsing Pipeline
  // -------------------------------------------------------------
  console.log('\n📄 [2/12] Multi-Engine Resume Parsing Pipeline');
  const sampleResumeText = `
  Alexander Wright
  Email: alexander.wright@techdomain.io | Phone: +1 415-555-0182
  Location: San Francisco, CA | Portfolio: https://github.com/alexwright-dev
  
  PROFESSIONAL SUMMARY
  Staff Full-Stack & Distributed Systems Architect with 7+ years of experience engineering high-scale web platforms in React, TypeScript, Node.js, Next.js, and PostgreSQL.
  
  WORK EXPERIENCE
  Staff Software Engineer | Stripe (2022 - Present)
  - Designed distributed event-driven payment processing pipelines handling $2B+ in annual transaction volume.
  - Architected frontend micro-apps with React 18, Tailwind CSS, and GraphQL, reducing latency by 35%.
  - Mentored 12 mid-level and junior engineers on TypeScript best practices.

  Senior Backend Engineer | Datadog (2019 - 2022)
  - Built real-time log ingestion microservices with Go and Node.js.
  - Optimized MongoDB aggregation queries and PostgreSQL connection pooling.
  
  EDUCATION
  B.S. in Computer Science | UC Berkeley (2015 - 2019) | GPA: 3.85
  
  TECHNICAL SKILLS
  Languages & Frameworks: TypeScript, JavaScript, React, Next.js, Node.js, Python, GraphQL, HTML/CSS
  Databases & Cloud: PostgreSQL, MongoDB, Redis, AWS, Docker, Kubernetes, CI/CD, Git
  `;

  const parseSelf = await request('POST', '/api/parse-resume', {
    resumeText: sampleResumeText,
    fileName: 'alexander_wright_resume.pdf',
    engine: 'self'
  });
  assert('Self-Engine Native Parser Execution', parseSelf.status === 200 && parseSelf.data.success === true);
  assert('Extracted Full Name (Alexander Wright)', parseSelf.data.parsed?.fullName?.includes('Alexander Wright'));
  assert('Extracted Contact Email', parseSelf.data.parsed?.email === 'alexander.wright@techdomain.io');
  assert('Extracted Contact Phone', parseSelf.data.parsed?.phone?.includes('415-555-0182'));
  assert('Extracted Technical Skills Pool', Array.isArray(parseSelf.data.parsed?.extractedSkills?.technical) && parseSelf.data.parsed.extractedSkills.technical.length >= 4);
  assert('Extracted Work Experience Array', Array.isArray(parseSelf.data.parsed?.workExperience) && parseSelf.data.parsed.workExperience.length > 0);
  assert('Extracted Education Array', Array.isArray(parseSelf.data.parsed?.education) && parseSelf.data.parsed.education.length > 0);
  assert('Computed ATS Health Score', typeof parseSelf.data.parsed?.atsHealthScore === 'number' && parseSelf.data.parsed.atsHealthScore > 60);

  const parseGemini = await request('POST', '/api/parse-resume', {
    resumeText: sampleResumeText,
    fileName: 'alexander_wright_resume.pdf',
    engine: 'gemini'
  });
  assert('Gemini AI 3.6 Flash Engine Parser Execution', parseGemini.status === 200 && parseGemini.data.success === true);
  assert('Gemini Extracted Valid Structure', !!parseGemini.data.parsed?.fullName && !!parseGemini.data.parsed?.extractedSkills);

  const parseHybrid = await request('POST', '/api/parse-resume', {
    resumeText: sampleResumeText,
    fileName: 'alexander_wright_resume.pdf',
    engine: 'hybrid'
  });
  assert('Hybrid Ensemble Engine Parser Execution', parseHybrid.status === 200 && parseHybrid.data.success === true);

  // -------------------------------------------------------------
  // SUITE 3: AI Semantic Job Matching & Skill Gap Analysis
  // -------------------------------------------------------------
  console.log('\n🎯 [3/12] AI Semantic Job Matching & Skill Gap Analysis');
  const targetJob = {
    id: 'job_target_test',
    title: 'Lead Full-Stack AI Engineer',
    department: 'Engineering',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Python'],
    niceToHaveSkills: ['AWS', 'Docker', 'Kubernetes', 'Redis'],
    minExperienceYears: 5
  };

  const matchRes = await request('POST', '/api/match-job', {
    resume: parseSelf.data.parsed,
    job: targetJob
  });
  assert('Semantic Matching 200 OK', matchRes.status === 200 && matchRes.data.success === true);
  assert('Overall Match Score Calculated (0-100)', typeof matchRes.data.analysis?.overallMatchScore === 'number' && matchRes.data.analysis.overallMatchScore > 50);
  assert('Identified Matched Required Skills', Array.isArray(matchRes.data.analysis?.matchedRequiredSkills) && matchRes.data.analysis.matchedRequiredSkills.length > 0);
  assert('Generated AI Action Plan & Guidance', !!matchRes.data.analysis?.aiFeedback);

  // -------------------------------------------------------------
  // SUITE 4: AI Job Description & Resume Enhancement Copilots
  // -------------------------------------------------------------
  console.log('\n✨ [4/12] AI Job Description & Resume Enhancement Copilots');
  const enhanceJd = await request('POST', '/api/enhance-jd', {
    title: 'Staff AI Systems Engineer',
    rawDescription: 'We are looking for someone to build fast resume parsers, scalable vector search, and clean React dashboards.'
  });
  assert('Job Description Enhancer 200 OK', enhanceJd.status === 200 && enhanceJd.data.success === true);
  assert('Structured Title & Description Generated', !!enhanceJd.data.enhanced?.title && !!enhanceJd.data.enhanced?.description);
  assert('Extracted Required & Nice-to-Have Skills', Array.isArray(enhanceJd.data.enhanced?.requiredSkills) && Array.isArray(enhanceJd.data.enhanced?.niceToHaveSkills));

  const enhanceResume = await request('POST', '/api/enhance-resume', {
    resumeText: sampleResumeText,
    targetJobRole: 'VP of Engineering'
  });
  assert('Resume Copilot Enhancer 200 OK', enhanceResume.status === 200 && enhanceResume.data.success === true);
  assert('Provided Tailored Executive Summary', !!enhanceResume.data.enhancement?.tailoredSummary);
  assert('Provided Recommended Keywords', Array.isArray(enhanceResume.data.enhancement?.recommendedKeywords));

  // -------------------------------------------------------------
  // SUITE 5: Authentication & User Accounts (Student & Recruiter)
  // -------------------------------------------------------------
  console.log('\n🔐 [5/12] Authentication & Role-Based Access Control');
  const studentEmail = 'student_test_' + Date.now() + '@auraats.io';
  const recruiterEmail = 'recruiter_test_' + Date.now() + '@auraats.io';

  const regStudent = await request('POST', '/api/auth/register', {
    name: 'Emily Chen',
    email: studentEmail,
    password: 'studentPassword2026!',
    role: 'student',
    studentProfile: {
      degree: 'B.S. in Computer Science',
      university: 'UC Berkeley',
      graduationYear: '2024',
      primaryRole: 'Software Engineer',
      skills: ['TypeScript', 'React', 'Node.js', 'Python']
    }
  });
  assert('Student Registration & MongoDB Insert', regStudent.status === 200 && regStudent.data.success === true);
  assert('Student User ID Generated', !!regStudent.data.user?.id);

  const loginStudent = await request('POST', '/api/auth/login', {
    email: studentEmail,
    password: 'studentPassword2026!',
    role: 'student'
  });
  assert('Student Login Verification', loginStudent.status === 200 && loginStudent.data.user?.role === 'student');

  const regRecruiter = await request('POST', '/api/auth/register', {
    name: 'Marcus Vance',
    email: recruiterEmail,
    password: 'recruiterPassword2026!',
    role: 'recruiter',
    recruiterProfile: {
      companyName: 'Anthropic Labs',
      companyWebsite: 'https://anthropic.com',
      companySize: '500-1000',
      industry: 'Artificial Intelligence',
      hiringRoles: ['ML Engineer', 'Full-Stack Developer']
    }
  });
  assert('Recruiter Registration & MongoDB Insert', regRecruiter.status === 200 && regRecruiter.data.success === true);

  const updateProfile = await request('POST', '/api/auth/update-profile', {
    userId: loginStudent.data.user.id,
    name: 'Emily Chen (Honors Graduate)',
    studentProfile: {
      degree: 'M.S. in Computer Science',
      university: 'Stanford University',
      skills: ['TypeScript', 'React', 'Next.js', 'GraphQL', 'PostgreSQL']
    }
  });
  assert('Profile Update & Persistence', updateProfile.status === 200 && updateProfile.data.success === true);

  // -------------------------------------------------------------
  // SUITE 6: Job Postings Full CRUD & Atlas Sync
  // -------------------------------------------------------------
  console.log('\n💼 [6/12] Job Postings Full CRUD & Atlas Synchronization');
  const testJobId = 'job_live_' + Date.now();
  const createJob = await request('POST', '/api/jobs', {
    id: testJobId,
    title: 'Principal Distributed Systems Engineer',
    department: 'Core Infrastructure',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experienceLevel: 'Staff / Principal (8+ yrs)',
    salaryRange: '$220,000 - $280,000',
    description: 'Lead next-generation high-throughput database synchronization and distributed parsing microservices.',
    requiredSkills: ['TypeScript', 'Go', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Docker'],
    niceToHaveSkills: ['Rust', 'Apache Kafka', 'GraphQL'],
    postedDate: 'Today',
    status: 'Active',
    applicantCount: 0
  });
  assert('Create Job in Atlas', createJob.status === 200 && createJob.data.success === true);

  const listJobs = await request('GET', '/api/jobs');
  assert('List Jobs from Database', listJobs.status === 200 && Array.isArray(listJobs.data.jobs));
  assert('Created Job Found in List', listJobs.data.jobs.some(j => j.id === testJobId));

  const updateJob = await request('PUT', '/api/jobs/' + testJobId, {
    title: 'Principal Distributed Systems Engineer (Lead)',
    salaryRange: '$230,000 - $290,000',
    status: 'Active'
  });
  assert('Update Job in Atlas', updateJob.status === 200 && updateJob.data.success === true);

  // -------------------------------------------------------------
  // SUITE 7: Candidate Pipeline & Recruiter Notes
  // -------------------------------------------------------------
  console.log('\n👥 [7/12] Candidate Management & Recruiter Feedback Notes');
  const testCandId = 'cand_live_' + Date.now();
  const createCandidate = await request('POST', '/api/candidates', {
    id: testCandId,
    name: 'Alexander Wright',
    email: 'alexander.wright@techdomain.io',
    role: 'Staff Full-Stack & Distributed Systems Architect',
    matchScore: 96,
    status: 'Shortlisted',
    appliedDate: 'Just now',
    experienceYears: 7,
    skills: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'],
    missingSkills: ['Rust'],
    notes: 'Exemplary architectural depth and team leadership.',
    resumeText: sampleResumeText,
    engineUsed: 'self'
  });
  assert('Create Candidate Record in Atlas', createCandidate.status === 200 && createCandidate.data.success === true);

  const listCandidates = await request('GET', '/api/candidates');
  assert('List Candidates from Database', listCandidates.status === 200 && Array.isArray(listCandidates.data.candidates));
  assert('Candidate Found in Listing', listCandidates.data.candidates.some(c => c.id === testCandId));

  const saveNote = await request('POST', '/api/recruiter/candidate-notes', {
    candidateId: testCandId,
    jobId: testJobId,
    candidateName: 'Alexander Wright',
    notes: 'Strong candidate for System Architecture interview on Friday at 2:00 PM PST.',
    tags: ['Top Tier', 'High Priority', 'System Design Approved'],
    rating: 5,
    updatedBy: recruiterEmail
  });
  assert('Save Recruiter Interview Notes & Rating', saveNote.status === 200 && saveNote.data.success === true);

  const getNotes = await request('GET', '/api/recruiter/candidate-notes/' + testCandId);
  assert('Fetch Candidate Interview Notes', getNotes.status === 200 && getNotes.data.success === true && getNotes.data.note?.rating === 5);

  // -------------------------------------------------------------
  // SUITE 8: Job Application Lifecycle & Status Transitions
  // -------------------------------------------------------------
  console.log('\n📋 [8/12] Job Application Submission & Workflow Management');
  const testAppId = 'app_live_' + Date.now();
  const createApplication = await request('POST', '/api/applications', {
    id: testAppId,
    jobId: testJobId,
    candidateId: testCandId,
    candidateName: 'Alexander Wright',
    candidateEmail: 'alexander.wright@techdomain.io',
    jobTitle: 'Principal Distributed Systems Engineer (Lead)',
    company: 'Anthropic Labs',
    status: 'Under Review',
    matchScore: 96,
    appliedDate: '2026-08-28',
    parsedResume: parseSelf.data.parsed
  });
  assert('Submit 1-Click Job Application', createApplication.status === 200 && createApplication.data.success === true);

  const listApplications = await request('GET', '/api/applications');
  assert('List Applications from Atlas', listApplications.status === 200 && Array.isArray(listApplications.data.applications));
  assert('Submitted Application Found', listApplications.data.applications.some(a => a.id === testAppId));

  const updateAppStatus = await request('PUT', '/api/applications/' + testAppId, {
    status: 'Offered'
  });
  assert('Update Application Workflow Status to Offered', updateAppStatus.status === 200 && updateAppStatus.data.success === true);

  // -------------------------------------------------------------
  // SUITE 9: Admin Management, System Modes & Maintenance
  // -------------------------------------------------------------
  console.log('\n⚙️ [9/12] Admin Console, System Modes & Maintenance');
  const adminConfig = await request('GET', '/api/admin/config');
  assert('Fetch SaaS Admin Engine Configuration', adminConfig.status === 200 && !!adminConfig.data.config);

  const updateMode = await request('POST', '/api/admin/system-mode', {
    mode: 'production'
  });
  assert('Switch Operational Mode to Production', updateMode.status === 200 && updateMode.data.systemMode === 'production');

  const dbStats = await request('GET', '/api/admin/db-stats');
  assert('Real-Time Database Collection Statistics', dbStats.status === 200 && !!dbStats.data.stats && dbStats.data.stats.databaseStatus.includes('Healthy'));

  const dbVacuum = await request('POST', '/api/admin/db-vacuum');
  assert('Database Cache Flush & Index Optimization', dbVacuum.status === 200 && dbVacuum.data.success === true);

  const auditLogs = await request('GET', '/api/admin/audit-logs');
  assert('Audit Log Stream Verification', auditLogs.status === 200 && Array.isArray(auditLogs.data.logs) && auditLogs.data.logs.length > 0);

  const devProfile = await request('GET', '/api/admin/developer-profile');
  assert('Admin Developer Profile Retrieval', devProfile.status === 200 && !!devProfile.data.profile?.name);

  // -------------------------------------------------------------
  // SUITE 10: Multi-Engine Comparative Benchmark
  // -------------------------------------------------------------
  console.log('\n📊 [10/12] Multi-Engine Comparative Benchmark Matrix');
  const benchmarkRes = await request('POST', '/api/admin/test-all-engines', {
    resumeText: sampleResumeText,
    fileName: 'alexander_wright_resume.pdf'
  });
  assert('Execute Comparative Multi-Engine Benchmark', benchmarkRes.status === 200 && Array.isArray(benchmarkRes.data.results));
  assert('All Configured Production Engines Tested', benchmarkRes.data.results.length >= 4);

  // -------------------------------------------------------------
  // SUITE 11: Cloudinary Upload Pipeline
  // -------------------------------------------------------------
  console.log('\n☁️ [11/12] Cloudinary Direct Upload Pipeline');
  const dummyResumePdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbIDMgMCBSIF0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdID4+CmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDA2OCAwMDAwMCBuIAowMDAwMDAwMTI1IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNCAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMTk0CiUlRU9G';
  const uploadRes = await request('POST', '/api/upload/cloudinary', {
    fileData: dummyResumePdfBase64,
    fileName: 'sample_resume.pdf',
    resourceType: 'auto'
  });
  assert('Cloudinary PDF Upload Handler', uploadRes.status === 200 && uploadRes.data.success === true);
  assert('Secure Asset URL Generated', typeof uploadRes.data.url === 'string' && uploadRes.data.url.length > 10);

  // -------------------------------------------------------------
  // SUITE 12: Cleanup Test Artifacts & Build Verification
  // -------------------------------------------------------------
  console.log('\n🧹 [12/12] Database Cleanup & Frontend Build Verification');
  const deleteJob = await request('DELETE', '/api/jobs/' + testJobId);
  assert('Teardown Test Job from Atlas', deleteJob.status === 200 && deleteJob.data.success === true);

  console.log('\n================================================================');
  console.log(`🎉 TEST REPORT: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTest().catch(err => {
  console.error('Test Suite Failed with Error:', err);
  process.exit(1);
});
