import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Disable mongoose query buffering so offline/disconnected queries fail fast and trigger resilient memory fallbacks immediately
mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', false);

// MongoDB Connection String
const MONGODB_URI =
  process.env.MONGODB_URI?.trim() ||
  'mongodb+srv://Sanaullah:parsing@parsing.2vevtmz.mongodb.net/ats_parsing_db?retryWrites=true&w=majority&appName=Parsing';

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectToMongoDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (!MONGODB_URI) {
    console.log('ℹ️ [MongoDB] MONGODB_URI environment variable not set. Running in resilient in-memory mode.');
    console.log('ℹ️ [MongoDB] Set MONGODB_URI in your environment / Render dashboard to enable persistent MongoDB Atlas synchronization.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ [MongoDB] Successfully connected to MongoDB Atlas Cluster!');
  } catch (error: any) {
    isConnected = false;
    console.warn('⚠️ [MongoDB Atlas] Connection notice:', error.message || error);
    console.warn('ℹ️ [MongoDB] Operating in resilient database mode with local fallback sync. If using MongoDB Atlas, check your DB user credentials and IP whitelist in Atlas.');
  }
}

// 1. Developer Profile Schema
const DeveloperProfileSchema = new mongoose.Schema({
  name: { type: String, default: 'Sanaullah Shah' },
  title: { type: String, default: 'AI Systems Architect & Full-Stack Developer' },
  bio: { type: String, default: 'Specialized in modern AI application architecture, deterministic NLP taxonomies, Google Gemini LLM integrations, and scalable full-stack React systems.' },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  githubUrl: { type: String, default: 'https://github.com/sanaullah-ai' },
  huggingfaceUrl: { type: String, default: 'https://huggingface.co/sanaullah7964' },
  email: { type: String, default: 'sanaullah786shah92@gmail.com' },
  location: { type: String, default: 'Global / Remote' },
  skills: [{ type: String }],
}, { timestamps: true });

// 2. Job Schema
const JobSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  minExperienceYears: { type: Number, default: 2 },
  salaryRange: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  niceToHaveSkills: [{ type: String }],
  postedDate: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Draft', 'Closed'], default: 'Active' },
  applicantCount: { type: Number, default: 0 },
}, { timestamps: true });

// 3. Candidate Schema
const CandidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  title: { type: String },
  location: { type: String },
  avatarUrl: { type: String },
  resumeUrl: { type: String },
  atsHealthScore: { type: Number, default: 0 },
  parsedResume: { type: mongoose.Schema.Types.Mixed },
  uploadedAt: { type: String, default: () => new Date().toISOString() },
}, { timestamps: true });

// 4. Job Application Schema
const ApplicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  jobId: { type: String, required: true },
  candidateId: { type: String, required: true },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  appliedDate: { type: String, required: true },
  matchScore: { type: Number, default: 0 },
  keywordScore: { type: Number, default: 0 },
  semanticScore: { type: Number, default: 0 },
  status: { type: String, enum: ['New', 'Screening', 'Interviewing', 'Offered', 'Rejected'], default: 'New' },
  resumeUrl: { type: String },
}, { timestamps: true });

// 5. System Configuration Schema
const SaaSConfigSchema = new mongoose.Schema({
  activeEngine: { type: String, default: 'self' },
  selfEngineVersion: { type: String, default: 'v3.2.0-native-nlp' },
  autoFallbackEnabled: { type: Boolean, default: true },
  minMatchThreshold: { type: Number, default: 80 },
  totalParsedResumes: { type: Number, default: 142 },
  engineStats: {
    selfCount: { type: Number, default: 88 },
    geminiCount: { type: Number, default: 34 },
    grokCount: { type: Number, default: 12 },
    hybridCount: { type: Number, default: 8 },
    avgLatencyMs: { type: Number, default: 145 },
  }
}, { timestamps: true });

// 6. User Account Schema for Students & Recruiters
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'recruiter', 'admin'], default: 'student' },
  avatar: { type: String },
  studentProfile: { type: mongoose.Schema.Types.Mixed },
  recruiterProfile: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// 7. Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  action: { type: String, required: true },
  category: { type: String, default: 'System' },
  userEmail: { type: String },
  details: { type: String },
  status: { type: String, enum: ['Success', 'Warning', 'Error'], default: 'Success' },
}, { timestamps: true });

// 8. Candidate Interview Note Schema
const CandidateNoteSchema = new mongoose.Schema({
  candidateId: { type: String, required: true },
  jobId: { type: String },
  rating: { type: Number, default: 5 },
  notes: { type: String, default: '' },
  updatedBy: { type: String },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export const DeveloperProfileModel = mongoose.models.DeveloperProfile || mongoose.model('DeveloperProfile', DeveloperProfileSchema);
export const JobModel = mongoose.models.Job || mongoose.model('Job', JobSchema);
export const CandidateModel = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
export const ApplicationModel = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
export const SaaSConfigModel = mongoose.models.SaaSConfig || mongoose.model('SaaSConfig', SaaSConfigSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
export const CandidateNoteModel = mongoose.models.CandidateNote || mongoose.model('CandidateNote', CandidateNoteSchema);
