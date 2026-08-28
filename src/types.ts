export type UserRole = 'student' | 'recruiter' | 'admin';

export type ParserEngineType = 'self' | 'gemini' | 'grok' | 'hybrid';

export interface ParserEngineConfig {
  activeEngine: ParserEngineType;
  selfEngineVersion: string;
  autoFallbackEnabled: boolean;
  minMatchThreshold: number;
  totalParsedResumes: number;
  engineStats: {
    selfCount: number;
    geminiCount: number;
    grokCount: number;
    hybridCount: number;
    avgLatencyMs: number;
  };
}

export interface EngineBenchmarkResult {
  engine: ParserEngineType;
  engineName: string;
  latencyMs: number;
  atsHealthScore: number;
  skillsCount: number;
  extractedSkills: string[];
  parsed: ParsedResume;
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface ParsedResume {
  id: string;
  fileName: string;
  uploadedAt: string;
  rawText: string;
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
  workExperience: WorkExperience[];
  education: Education[];
  atsHealthScore: number; // 0-100
  formattingIssues: string[];
  strengths: string[];
  improvements: string[];
  keywordVector: string[];
}

export interface StudentProfile {
  headline: string;
  phone: string;
  location: string;
  bio: string;
  experienceYears: number;
  desiredRole: string;
  desiredMinSalary?: number;
  privacyMode?: 'public' | 'private';
  emailAlerts?: boolean;
  savedJobIds?: string[];
  portfolioUrl?: string;
  skills: string[];
  education: Education[];
  workHistory: WorkExperience[];
  resume: ParsedResume | null;
}

export interface RecruiterProfile {
  companyName: string;
  companyLogo: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  description: string;
  atsMinMatchThreshold?: number; // e.g., 80
  autoResponseTemplates?: {
    interview: string;
    rejection: string;
    shortlist: string;
  };
}

export interface DeveloperProfile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  githubUrl: string;
  huggingfaceUrl: string;
  email: string;
  location?: string;
  skills?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentProfile?: StudentProfile;
  recruiterProfile?: RecruiterProfile;
}

export interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  companyLogo: string;
  title: string;
  department: string;
  location: string;
  locationType: 'Remote' | 'Hybrid' | 'Onsite';
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead';
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  mustHaveSkills?: string[];
  skillWeights?: Record<string, number>;
  minExperienceYears: number;
  postedDate: string;
  expiryDays?: number;
  expiresAt?: string;
  status: 'Active' | 'Closed';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: string;
  category: string;
  userEmail?: string;
  details: string;
  status: 'Success' | 'Warning' | 'Error';
}

export interface CandidateInterviewNote {
  candidateId: string;
  jobId?: string;
  rating: number;
  notes: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface BridgeActionItem {
  missingSkill: string;
  importance: 'Critical' | 'Recommended' | 'Bonus';
  learningAction: string;
  estimatedHours: number;
}

export interface SkillGapAnalysis {
  jobId: string;
  candidateId: string;
  overallMatchScore: number; // 0-100
  keywordMatchScore: number; // 0-100
  semanticMatchScore: number; // 0-100
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedNiceSkills: string[];
  missingNiceSkills: string[];
  experienceMatch: {
    requiredYears: number;
    candidateYears: number;
    isMet: boolean;
  };
  skillGapSeverity: 'Low' | 'Moderate' | 'High';
  aiFeedback: string;
  bridgeActionPlan: BridgeActionItem[];
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Offered'
  | 'Pass';

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  appliedAt: string;
  matchScoreAtApplication: number;
  status: ApplicationStatus;
  coverNote?: string;
  recruiterFeedback?: string;
  interviewDate?: string;
  interviewNote?: string;
  meetingLink?: string;
  candidateResponseStatus?: 'Accepted' | 'Declined' | 'Reschedule Requested' | 'Pending';
  candidateResponseNote?: string;
  candidateRescheduleTime?: string;
}

export interface NotificationReply {
  id: string;
  senderRole: UserRole;
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
}

export interface NotificationMessage {
  id: string;
  recipientRole: UserRole;
  recipientEmail?: string;
  senderRole: UserRole;
  senderName: string;
  senderAvatar?: string;
  subject: string;
  content: string;
  type: 'INVITATION' | 'STATUS_UPDATE' | 'INQUIRY' | 'SYSTEM';
  jobId?: string;
  jobTitle?: string;
  candidateId?: string;
  candidateName?: string;
  interviewDate?: string;
  meetingLink?: string;
  timestamp: string;
  read: boolean;
  replies?: NotificationReply[];
}

