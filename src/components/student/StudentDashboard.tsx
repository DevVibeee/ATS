import React, { useState, useEffect, useMemo } from 'react';
import { User, Job, ParsedResume, JobApplication, SkillGapAnalysis, WorkExperience, Education, NotificationMessage } from '../../types';
import { ResumeUploader } from './ResumeUploader';
import { SkillGapView } from './SkillGapView';
import { NotificationCenter } from '../common/NotificationCenter';
import { CompanyDetailModal } from '../modals/CompanyDetailModal';
import { calculateInstantSkillGap } from '../../utils/matchingEngine';
import {
  Search,
  Filter,
  Briefcase,
  FileText,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Building2,
  MapPin,
  DollarSign,
  Lock,
  ShieldCheck,
  ArrowUpRight,
  UserCheck,
  Bookmark,
  BookmarkCheck,
  Settings,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Bell,
  Save,
  HelpCircle,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  Tag,
  GraduationCap,
  Globe,
  Calendar,
  Video,
  Send,
  XCircle,
  MessageSquare,
  SlidersHorizontal,
  Image,
  ExternalLink,
  Upload,
  Camera,
  Mail
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  jobs: Job[];
  applications: JobApplication[];
  onApplyJob: (jobId: string, coverNote: string) => void;
  onUpdateResume: (parsed: ParsedResume) => void;
  onUpdateProfile: (updatedProfile: any) => void;
  onSelectPresetUser?: (presetUser: User) => void;
  onCandidateApplicationResponse?: (appId: string, status: string, note?: string) => void;
  isParsing: boolean;
  setIsParsing: (loading: boolean) => void;
  notifications: NotificationMessage[];
  onMarkAsRead: (id: string) => void;
  onSendReply: (id: string, replyMessage: string) => void;
  onSendNewMessage: (msg: Partial<NotificationMessage>) => void;
  activeTab?: 'feed' | 'resume' | 'skillgap' | 'applications' | 'notifications' | 'settings';
  onTabChange?: (tab: 'feed' | 'resume' | 'skillgap' | 'applications' | 'notifications' | 'settings') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  jobs,
  applications,
  onApplyJob,
  onUpdateResume,
  onUpdateProfile,
  onSelectPresetUser,
  onCandidateApplicationResponse,
  isParsing,
  setIsParsing,
  notifications,
  onMarkAsRead,
  onSendReply,
  onSendNewMessage,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'resume' | 'skillgap' | 'applications' | 'notifications' | 'settings'>(
    controlledTab || 'feed'
  );

  useEffect(() => {
    if (controlledTab) {
      setActiveTab(controlledTab);
    }
  }, [controlledTab]);

  const handleTabSelect = (tab: 'feed' | 'resume' | 'skillgap' | 'applications' | 'notifications' | 'settings') => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);
  
  // Advanced Filter Controls
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<'all' | 'Full-Time' | 'Contract' | 'Remote'>('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(40);

  const [selectedJobForGap, setSelectedJobForGap] = useState<Job | null>(jobs[0] || null);
  const [selectedCompanyJob, setSelectedCompanyJob] = useState<Job | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(user.studentProfile?.savedJobIds || []);

  const studentProfile = user.studentProfile!;
  const currentResume = studentProfile.resume;

  // Candidate Settings Form state
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [portfolioUrl, setPortfolioUrl] = useState(studentProfile.portfolioUrl || '');
  const [headline, setHeadline] = useState(studentProfile.headline || '');
  const [bio, setBio] = useState(studentProfile.bio || '');
  const [desiredRole, setDesiredRole] = useState(studentProfile.desiredRole || 'Full Stack Engineer');
  const [location, setLocation] = useState(studentProfile.location || '');
  const [phone, setPhone] = useState(studentProfile.phone || '');
  const [expYears, setExpYears] = useState(studentProfile.experienceYears || 3);
  const [desiredMinSalary, setDesiredMinSalary] = useState(studentProfile.desiredMinSalary || 95000);
  const [privacyMode, setPrivacyMode] = useState<'public' | 'private'>(studentProfile.privacyMode || 'public');
  const [emailAlerts, setEmailAlerts] = useState<boolean>(studentProfile.emailAlerts ?? true);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Candidate Interview Reschedule State
  const [rescheduleNotes, setRescheduleNotes] = useState<Record<string, string>>({});

  // Profile Skills, Work History, Education Editing State
  const [skillsList, setSkillsList] = useState<string[]>(
    studentProfile.skills?.length ? studentProfile.skills : ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
  );
  const [newSkillInput, setNewSkillInput] = useState('');

  const [workHistory, setWorkHistory] = useState<WorkExperience[]>(studentProfile.workHistory || []);
  const [eduHistory, setEduHistory] = useState<Education[]>(studentProfile.education || []);

  // New Work Exp Form
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkCompany, setNewWorkCompany] = useState('');
  const [newWorkDuration, setNewWorkDuration] = useState('');
  const [newWorkDesc, setNewWorkDesc] = useState('');

  // New Edu Form
  const [newEduDegree, setNewEduDegree] = useState('');
  const [newEduInst, setNewEduInst] = useState('');
  const [newEduYear, setNewEduYear] = useState('2024');
  const [newEduGpa, setNewEduGpa] = useState('3.8');

  // Manual Refresh Animation State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  // Practice quiz answer tracker
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, boolean>>({});

  // INSTANT AUTOMATIC SKILL GAP MATCH CALCULATIONS
  // Re-evaluates whenever resume OR student profile/skills change!
  const activeAnalysisMap = useMemo(() => {
    const map: Record<string, SkillGapAnalysis> = {};
    const effectiveProfile = {
      ...studentProfile,
      headline,
      bio,
      desiredRole,
      skills: skillsList,
      experienceYears: Number(expYears),
      workHistory,
      education: eduHistory,
    };

    jobs.forEach((job) => {
      map[job.id] = calculateInstantSkillGap(currentResume, job, effectiveProfile);
    });
    return map;
  }, [currentResume, jobs, studentProfile, headline, bio, desiredRole, skillsList, expYears, workHistory, eduHistory]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshNotice(null);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice(`Successfully re-scanned all ${jobs.length} posted jobs against your current profile & resume!`);
      setTimeout(() => setRefreshNotice(null), 4000);
    }, 600);
  };

  // Skill Management
  const handleAddSkill = () => {
    if (!newSkillInput.trim()) return;
    const clean = newSkillInput.trim();
    if (!(skillsList || []).map((s) => (s || '').toLowerCase()).includes(clean.toLowerCase())) {
      const updated = [...(skillsList || []), clean];
      setSkillsList(updated);
      onUpdateProfile({ ...studentProfile, skills: updated });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skillsList.filter((s) => s !== skillToRemove);
    setSkillsList(updated);
    onUpdateProfile({ ...studentProfile, skills: updated });
  };

  // Work History Management
  const handleAddWorkHistory = () => {
    if (!newWorkTitle.trim() || !newWorkCompany.trim()) return;
    const newEntry: WorkExperience = {
      id: 'w_' + Date.now(),
      role: newWorkTitle,
      company: newWorkCompany,
      startDate: newWorkDuration || '2023',
      endDate: 'Present',
      current: true,
      highlights: [newWorkDesc || 'Developed software modules and collaborated on engineering deliverables.'],
    };
    const updated = [newEntry, ...workHistory];
    setWorkHistory(updated);
    onUpdateProfile({ ...studentProfile, workHistory: updated });
    setNewWorkTitle('');
    setNewWorkCompany('');
    setNewWorkDuration('');
    setNewWorkDesc('');
  };

  const handleRemoveWorkHistory = (id: string) => {
    const updated = workHistory.filter((w) => w.id !== id);
    setWorkHistory(updated);
    onUpdateProfile({ ...studentProfile, workHistory: updated });
  };

  // Education Management
  const handleAddEdu = () => {
    if (!newEduDegree.trim() || !newEduInst.trim()) return;
    const newEdu: Education = {
      id: 'e_' + Date.now(),
      degree: newEduDegree,
      institution: newEduInst,
      fieldOfStudy: 'Computer Science',
      startYear: '2020',
      endYear: newEduYear || '2024',
      grade: newEduGpa ? `${newEduGpa} GPA` : '3.8 GPA',
    };
    const updated = [newEdu, ...eduHistory];
    setEduHistory(updated);
    onUpdateProfile({ ...studentProfile, education: updated });
    setNewEduDegree('');
    setNewEduInst('');
  };

  const handleRemoveEdu = (id: string) => {
    const updated = eduHistory.filter((e) => e.id !== id);
    setEduHistory(updated);
    onUpdateProfile({ ...studentProfile, education: updated });
  };

  // Bookmark / Save Job Handler
  const toggleSaveJob = (jobId: string) => {
    let updated: string[];
    if (savedJobIds.includes(jobId)) {
      updated = savedJobIds.filter((id) => id !== jobId);
    } else {
      updated = [...savedJobIds, jobId];
    }
    setSavedJobIds(updated);
    onUpdateProfile({
      ...studentProfile,
      savedJobIds: updated,
    });
  };

  // Filter jobs safely
  const filteredJobs = jobs.filter((job) => {
    if (!job) return false;
    const q = (searchQuery || '').trim().toLowerCase();
    const jTitle = (job.title || '').toLowerCase();
    const jCompany = (job.companyName || job.department || '').toLowerCase();
    const jDesc = (job.description || '').toLowerCase();
    const skills = job.requiredSkills || [];

    const matchesQuery =
      !q ||
      jTitle.includes(q) ||
      jCompany.includes(q) ||
      skills.some((s) => (s || '').toLowerCase().includes(q)) ||
      jDesc.includes(q);

    const analysis = activeAnalysisMap[job.id];
    const score = analysis ? analysis.overallMatchScore : 0;
    const isEligible = score >= 80;
    const isSaved = savedJobIds.includes(job.id);

    // Dynamic Score Range Threshold (40% - 100%)
    if (score < minMatchScore) return false;

    // Date Posted Filter
    if (dateFilter !== 'all') {
      const postedTime = new Date(job.postedDate).getTime();
      const now = Date.now();
      const diffDays = (now - postedTime) / (1000 * 60 * 60 * 24);
      if (dateFilter === '24h' && diffDays > 1) return false;
      if (dateFilter === '7d' && diffDays > 7) return false;
      if (dateFilter === '30d' && diffDays > 30) return false;
    }

    // Employment / Remote Type Filter
    if (employmentTypeFilter !== 'all') {
      if (employmentTypeFilter === 'Remote' && job.locationType !== 'Remote') return false;
      if (employmentTypeFilter === 'Full-Time' && job.employmentType !== 'Full-Time') return false;
      if (employmentTypeFilter === 'Contract' && job.employmentType !== 'Contract') return false;
    }

    if (filterEligibleOnly && !isEligible) return false;
    if (filterSavedOnly && !isSaved) return false;
    return matchesQuery;
  });

  const appliedJobIds = new Set(applications.map((a) => a.jobId));

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProf = {
      ...studentProfile,
      headline,
      bio,
      desiredRole,
      location,
      phone,
      portfolioUrl,
      experienceYears: Number(expYears),
      desiredMinSalary: Number(desiredMinSalary),
      privacyMode,
      emailAlerts,
      skills: skillsList,
      workHistory,
      education: eduHistory,
      avatar: avatarUrl || user.avatar,
    };

    onUpdateProfile(updatedProf);

    // Sync to MongoDB Atlas
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          avatar: avatarUrl || user.avatar,
          studentProfile: updatedProf,
        }),
      });
      if (!res.ok) {
        console.warn('Sync notice from server:', res.statusText);
      }
    } catch (err) {
      console.warn('Profile updated in active session.');
    }

    setSavedSuccessAlert(true);
    setTimeout(() => setSavedSuccessAlert(false), 3000);
  };

  const interviewApps = applications.filter((a) => a.status === 'Interview Scheduled');

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Metrics Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-sm shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-sans truncate">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  Candidate Portal
                </span>
                {interviewApps.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white animate-pulse shrink-0">
                    🎉 {interviewApps.length} Interview Invitation{interviewApps.length > 1 ? 's' : ''}!
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 truncate">
                {studentProfile.headline} • {studentProfile.location}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
            <div className="text-center px-1 sm:px-2">
              <div className="text-[10px] text-slate-500 font-medium truncate">ATS Score</div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 font-mono">
                {currentResume ? `${currentResume.atsHealthScore}%` : 'N/A'}
              </div>
            </div>
            <div className="text-center px-1 sm:px-2 border-x border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium truncate">Eligible Jobs</div>
              <div className="text-sm sm:text-base font-bold text-indigo-600 font-mono">
                {Object.values(activeAnalysisMap).filter((a: SkillGapAnalysis) => a.overallMatchScore >= 80).length} / {jobs.length}
              </div>
            </div>
            <div className="text-center px-1 sm:px-2">
              <div className="text-[10px] text-slate-500 font-medium truncate">Applied</div>
              <div className="text-sm sm:text-base font-bold text-blue-600 font-mono">
                {applications.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Active Interview Invitations Notification Banner */}
      {interviewApps.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-5 rounded-2xl shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-white/20 pb-2">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <Video className="w-5 h-5 text-blue-200 animate-bounce" />
              <span>Direct Recruiter Interview Invitations Received ({interviewApps.length})</span>
            </div>
            <button
              onClick={() => setActiveTab('applications')}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold transition"
            >
              View All Applications
            </button>
          </div>

          <div className="space-y-3">
            {interviewApps.map((app) => {
              const job = jobs.find((j) => j.id === app.jobId);
              return (
                <div key={app.id} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-white">{job?.title || 'Job Opening'}</div>
                      <div className="text-blue-100 font-medium">{job?.companyName || 'Recruiter Team'}</div>
                    </div>
                    {app.candidateResponseStatus ? (
                      <span className="px-2.5 py-1 bg-white/20 text-white rounded-md font-bold font-mono text-[10px] self-start sm:self-auto">
                        Response: {app.candidateResponseStatus}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-400 text-slate-900 rounded-md font-extrabold font-mono text-[10px] self-start sm:self-auto">
                        Action Required: Respond Below
                      </span>
                    )}
                  </div>

                  {app.interviewDate && (
                    <div className="text-blue-50 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-blue-200" />
                      <span>Proposed Time: {new Date(app.interviewDate).toLocaleString()}</span>
                    </div>
                  )}

                  {app.meetingLink && (
                    <div className="text-blue-100 font-semibold flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-blue-200" />
                      <span>Meeting Link: </span>
                      <a href={app.meetingLink} target="_blank" rel="noreferrer" className="underline font-bold text-white hover:text-blue-200">
                        {app.meetingLink}
                      </a>
                    </div>
                  )}

                  {app.recruiterFeedback && (
                    <div className="p-2 bg-white/10 rounded-lg text-blue-100 font-sans">
                      <strong>Recruiter Note:</strong> {app.recruiterFeedback}
                    </div>
                  )}

                  <div className="pt-2 border-t border-white/20 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onCandidateApplicationResponse && onCandidateApplicationResponse(app.id, 'Accepted')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Interview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const note = prompt('Enter preferred date/time or note for reschedule:');
                        if (note && onCandidateApplicationResponse) {
                          onCandidateApplicationResponse(app.id, 'Reschedule Requested', note);
                        }
                      }}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Reschedule</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCandidateApplicationResponse && onCandidateApplicationResponse(app.id, 'Declined')}
                      className="px-3 py-1.5 bg-rose-500/80 hover:bg-rose-600 text-white font-bold rounded-lg transition"
                    >
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Student Navigation Tabs - Mobile Horizontally Scrollable */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <button
            id="student-tab-feed"
            onClick={() => handleTabSelect('feed')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jobs Feed ({jobs.length})</span>
          </button>

          <button
            id="student-tab-resume"
            onClick={() => handleTabSelect('resume')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'resume'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Resume & ATS Audit</span>
          </button>

          <button
            id="student-tab-skillgap"
            onClick={() => handleTabSelect('skillgap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'skillgap'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Skill Gap Analyzer</span>
          </button>

          <button
            id="student-tab-applications"
            onClick={() => handleTabSelect('applications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Applications ({applications.length})</span>
          </button>

          <button
            id="student-tab-notifications"
            onClick={() => handleTabSelect('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries & Notifications</span>
            {notifications.filter((n) => n.recipientRole === 'student' && !n.read).length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                {notifications.filter((n) => n.recipientRole === 'student' && !n.read).length}
              </span>
            )}
          </button>

          <button
            id="student-tab-settings"
            onClick={() => handleTabSelect('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Dashboard Manual Refresh Button */}
        <button
          type="button"
          id="student-refresh-ats-btn"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm shrink-0 w-full sm:w-auto"
          title="Force ATS engine re-scan against all active job postings"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh ATS Analysis</span>
        </button>
      </div>

      {refreshNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{refreshNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono uppercase">Live Match Engine Synced</span>
        </div>
      )}

      {/* TAB 1: JOBS & MATCH FEED */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search job title, required skills, company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end text-xs">
                {/* Date Posted Filter */}
                <select
                  id="filter-date-posted"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Upload/Posted Dates</option>
                  <option value="24h">Past 24 Hours</option>
                  <option value="7d">Past 7 Days</option>
                  <option value="30d">Past 30 Days</option>
                </select>

                {/* Job Type / Remote Filter */}
                <select
                  id="filter-employment-type"
                  value={employmentTypeFilter}
                  onChange={(e) => setEmploymentTypeFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Employment Types</option>
                  <option value="Full-Time">Full-Time Only</option>
                  <option value="Contract">Contract Only</option>
                  <option value="Remote">Remote Only</option>
                </select>

                {/* Saved Jobs Pill */}
                <label className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-bold">
                  <input
                    type="checkbox"
                    checked={filterSavedOnly}
                    onChange={(e) => setFilterSavedOnly(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span>Saved ({savedJobIds.length})</span>
                </label>
              </div>
            </div>

            {/* Dynamic ATS Match Score Range Slider */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800 shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Match Score Range:</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  step={5}
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="w-36 sm:w-48 accent-indigo-600 cursor-pointer"
                />
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono font-bold rounded-lg shrink-0">
                  ≥ {minMatchScore}% Match
                </span>
              </div>

              <div className="text-slate-500 text-[11px] font-medium">
                Showing <strong>{filteredJobs.length}</strong> of {jobs.length} jobs matching ATS criteria
              </div>
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                No jobs match your current search and filter criteria. Try toggling off filters or clearing search.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const analysis = activeAnalysisMap[job.id];
                const score = analysis ? analysis.overallMatchScore : 0;
                const isEligible = score >= 80;
                const hasApplied = appliedJobIds.has(job.id);
                const isSaved = savedJobIds.includes(job.id);

                return (
                  <div
                    key={job.id}
                    className={`bg-white border rounded-2xl p-5 space-y-4 transition-all hover:shadow-md flex flex-col justify-between ${
                      isEligible
                        ? 'border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top Row: Company Logo, Title, Bookmark, Score Badge */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={job.companyLogo}
                            alt={job.companyName}
                            onClick={() => setSelectedCompanyJob(job)}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition"
                            title="Click to view company profile & culture"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3
                                onClick={() => setSelectedCompanyJob(job)}
                                className="font-bold text-slate-900 text-base leading-snug hover:text-indigo-600 cursor-pointer transition"
                              >
                                {job.title}
                              </h3>
                              <button
                                type="button"
                                id={`bookmark-job-btn-${job.id}`}
                                onClick={() => toggleSaveJob(job.id)}
                                className="text-slate-400 hover:text-amber-500 transition"
                                title={isSaved ? 'Remove from Saved Jobs' : 'Save Job Bookmark'}
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedCompanyJob(job)}
                              className="text-xs text-slate-500 hover:text-indigo-600 hover:underline text-left font-medium flex items-center gap-1"
                            >
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{job.companyName}</span>
                              <span>•</span>
                              <span>{job.location}</span>
                            </button>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="text-right shrink-0">
                          <div
                            className={`px-3 py-1 rounded-xl font-mono text-xs font-bold border flex items-center gap-1 ${
                              score >= 80
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : score >= 60
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <Target className="w-3 h-3" />
                            <span>{score}% Match</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {isEligible ? 'Eligible' : '<80% Gap'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 my-3">
                        {job.description}
                      </p>

                      {/* Skills pills */}
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {job.requiredSkills.map((sk, i) => {
                          const isMatched = analysis?.matchedRequiredSkills.includes(sk);
                          return (
                            <span
                              key={i}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isMatched
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs gap-2">
                      <span className="text-slate-600 font-mono font-semibold">{job.salaryRange}</span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          id={`view-company-modal-btn-${job.id}`}
                          onClick={() => setSelectedCompanyJob(job)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-semibold flex items-center gap-1 transition"
                          title="View Company Culture, Specs, and Description"
                        >
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">Company Info</span>
                        </button>

                        <button
                          id={`view-skill-gap-btn-${job.id}`}
                          onClick={() => {
                            setSelectedJobForGap(job);
                            setActiveTab('skillgap');
                          }}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-700 border border-slate-200 rounded-lg font-semibold flex items-center gap-1 transition"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Skill Gap</span>
                        </button>

                        {hasApplied ? (
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Applied
                          </span>
                        ) : isEligible ? (
                          <button
                            id={`quick-apply-btn-${job.id}`}
                            onClick={() => onApplyJob(job.id, 'Standard candidate application submission.')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
                          >
                            <span>Apply Now</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span
                            title="Requires at least 80% match score to submit application"
                            className="px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg flex items-center gap-1 cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Locked (&lt;80%)</span>
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY RESUME & ATS AUDIT */}
      {activeTab === 'resume' && (
        <ResumeUploader
          currentResume={currentResume}
          onResumeParsed={onUpdateResume}
          onSelectPresetUser={onSelectPresetUser}
          isParsing={isParsing}
          setIsParsing={setIsParsing}
        />
      )}

      {/* TAB 3: SKILL GAP ANALYZER */}
      {activeTab === 'skillgap' && selectedJobForGap && (
        <div className="space-y-4">
          
          {/* Job Selection Switcher */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto shadow-sm">
            <span className="text-xs text-slate-600 shrink-0 font-bold">Select Job To Analyze:</span>
            {jobs.map((j) => (
              <button
                key={j.id}
                id={`select-gap-job-${j.id}`}
                onClick={() => setSelectedJobForGap(j)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                  selectedJobForGap.id === j.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {j.title}
              </button>
            ))}
          </div>

          <SkillGapView
            job={selectedJobForGap}
            resume={currentResume}
            analysis={activeAnalysisMap[selectedJobForGap.id] || null}
            onApplyClick={() => onApplyJob(selectedJobForGap.id, 'Standard candidate application.')}
            hasApplied={appliedJobIds.has(selectedJobForGap.id)}
          />
        </div>
      )}

      {/* TAB 4: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Applied Jobs & Application Status Tracker
          </h2>

          {applications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              You haven't applied to any jobs yet. Check the Job Feed for eligible jobs!
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => {
                const job = jobs.find((j) => j.id === app.jobId);
                if (!job) return null;

                return (
                  <div
                    key={app.id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-slate-900 text-sm">{job.title}</h3>
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyJob(job)}
                            className="text-xs text-indigo-600 hover:underline font-semibold"
                          >
                            View Specs
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {job.companyName} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 font-medium">ATS Match Score</div>
                          <div className="text-sm font-bold text-emerald-600 font-mono">
                            {app.matchScoreAtApplication}%
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            app.status === 'Shortlisted'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : app.status === 'Interview Scheduled'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : app.status === 'Offered'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {app.recruiterFeedback && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                        <span className="font-bold text-indigo-700">Recruiter Feedback:</span> {app.recruiterFeedback}
                      </div>
                    )}

                    {/* Interview Invitation Panel */}
                    {app.status === 'Interview Scheduled' && (
                      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>Interview Scheduled by Recruiter</span>
                          </div>
                          {app.candidateResponseStatus && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                                app.candidateResponseStatus === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : app.candidateResponseStatus === 'Reschedule Requested'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              My Response: {app.candidateResponseStatus}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {app.interviewDate && (
                            <div className="p-2.5 bg-white rounded-lg border border-blue-100 font-semibold text-slate-800">
                              <span className="text-slate-500 font-medium block text-[10px]">Date & Time:</span>
                              {new Date(app.interviewDate).toLocaleString()}
                            </div>
                          )}
                          {app.meetingLink && (
                            <div className="p-2.5 bg-white rounded-lg border border-blue-100 font-semibold text-slate-800">
                              <span className="text-slate-500 font-medium block text-[10px]">Video Link:</span>
                              <a
                                href={app.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 hover:underline flex items-center gap-1"
                              >
                                <Video className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{app.meetingLink}</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {app.interviewNote && (
                          <div className="text-xs text-blue-900 bg-white p-2.5 rounded-lg border border-blue-100">
                            <strong>Recruiter Note:</strong> {app.interviewNote}
                          </div>
                        )}

                        {/* Candidate Action Buttons */}
                        <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-600 font-medium">
                            Please respond to confirm your availability:
                          </div>

                          <div className="flex items-center space-x-2 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (onCandidateApplicationResponse) {
                                  onCandidateApplicationResponse(app.id, 'Accepted');
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept Interview</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const note = prompt('Enter your preferred date/time or note for reschedule:');
                                if (note && onCandidateApplicationResponse) {
                                  onCandidateApplicationResponse(app.id, 'Reschedule Requested', note);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold rounded-lg flex items-center gap-1 transition"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Request Reschedule</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (onCandidateApplicationResponse) {
                                  onCandidateApplicationResponse(app.id, 'Declined');
                                }
                              }}
                              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg flex items-center gap-1 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4 border-b: NOTIFICATIONS & MESSAGES */}
      {activeTab === 'notifications' && (
        <NotificationCenter
          currentRole="student"
          currentUserEmail={user.email}
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onSendReply={onSendReply}
          onSendNewMessage={onSendNewMessage}
          onCandidateApplicationResponse={onCandidateApplicationResponse}
          applications={applications}
          jobs={jobs}
          candidates={[]}
        />
      )}

      {/* TAB 5: CANDIDATE ACCOUNT SETTINGS & FULL PROFILE EDITOR */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Candidate Full Profile & ATS Match Settings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Updates to skills, work experience, or bio instantly re-index ATS match percentages and skill gap analyses across all jobs.
              </p>
            </div>
            {savedSuccessAlert && (
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Profile Updated & Synced!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Avatar & Portfolio Image Block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative group shrink-0">
                  <img
                    src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt="Candidate Profile Thumbnail"
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                  />
                  <label className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (!file.type.startsWith('image/')) {
                            alert('Please select a valid image file');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setAvatarUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-indigo-600" />
                      <span>Profile Picture Avatar</span>
                    </label>

                    {/* Direct Upload Button from Device */}
                    <label className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition w-fit">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (!file.type.startsWith('image/')) {
                              alert('Please select a valid image file');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              if (ev.target?.result) {
                                const base64Img = ev.target.result as string;
                                setAvatarUrl(base64Img);
                                try {
                                  const res = await fetch('/api/upload/cloudinary', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      fileData: base64Img,
                                      folder: 'candidate_avatars',
                                      resourceType: 'image',
                                    }),
                                  });
                                  const json = await res.json();
                                  if (json.url) {
                                    setAvatarUrl(json.url);
                                  }
                                } catch (cloudErr) {
                                  console.error('Cloudinary avatar upload error:', cloudErr);
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... or upload photo directly from device above"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    Upload an image file directly from your computer/device or paste an image URL.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-1">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  <span>Personal Portfolio / GitHub Website URL</span>
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://myportfolio.dev or https://github.com/username"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Professional Headline / Title
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Desired Role Target
                </label>
                <input
                  type="text"
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                  placeholder="e.g. Lead React/Node Developer"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Preferred Work Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Total Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={expYears}
                  onChange={(e) => setExpYears(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Minimum Desired Base Salary ($ / Year)
                </label>
                <input
                  type="number"
                  step={5000}
                  value={desiredMinSalary}
                  onChange={(e) => setDesiredMinSalary(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">
                Professional Bio & Career Objective Overview
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your technical background, core engineering strengths, and career goals..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* SKILLS TAXONOMY MANAGER */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Technical Skills & Tool Taxonomy ({skillsList.length})</span>
                </h3>
                <span className="text-[10px] text-slate-500">Adding skills instantly improves ATS match scores for jobs requiring them.</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {skillsList.map((sk) => (
                  <span
                    key={sk}
                    className="px-3 py-1 bg-white text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(sk)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. Docker, GraphQL, Kubernetes, Python)..."
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 w-full sm:w-72 font-medium"
                />
                <button
                  type="button"
                  id="add-candidate-skill-btn"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>
            </div>

            {/* WORK EXPERIENCE MANAGER */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Work Experience & Software Projects ({workHistory.length})</span>
              </h3>

              {workHistory.length > 0 && (
                <div className="space-y-2">
                  {workHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">
                          {item.role || 'Software Engineer'} <span className="text-slate-500 font-normal">at {item.company}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {item.startDate} — {item.current ? 'Present' : item.endDate}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {(item.highlights || []).join(' ')}
                        </p>
                      </div>
                      {item.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWorkHistory(item.id!)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Work Form */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-slate-800 text-[11px]">Add New Work Experience</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Job Title (e.g. Frontend Dev)"
                    value={newWorkTitle}
                    onChange={(e) => setNewWorkTitle(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={newWorkCompany}
                    onChange={(e) => setNewWorkCompany(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Duration (e.g. 2022 - Present)"
                    value={newWorkDuration}
                    onChange={(e) => setNewWorkDuration(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Key responsibilities and achievements..."
                  value={newWorkDesc}
                  onChange={(e) => setNewWorkDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddWorkHistory}
                  disabled={!newWorkTitle.trim() || !newWorkCompany.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Experience Entry</span>
                </button>
              </div>
            </div>

            {/* EDUCATION MANAGER */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Education & Credentials ({eduHistory.length})</span>
              </h3>

              {eduHistory.length > 0 && (
                <div className="space-y-2">
                  {eduHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.degree}</div>
                        <div className="text-[11px] text-slate-600">
                          {item.institution} • Graduation Year: {item.endYear} • {item.grade || '3.8 GPA'}
                        </div>
                      </div>
                      {item.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEdu(item.id!)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Edu Form */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-slate-800 text-[11px]">Add Education Record</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Degree (e.g. B.S. Computer Science)"
                    value={newEduDegree}
                    onChange={(e) => setNewEduDegree(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Institution / University"
                    value={newEduInst}
                    onChange={(e) => setNewEduInst(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Graduation Year (e.g. 2025)"
                    value={newEduYear}
                    onChange={(e) => setNewEduYear(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="GPA (e.g. 3.9)"
                    value={newEduGpa}
                    onChange={(e) => setNewEduGpa(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEdu}
                  disabled={!newEduDegree.trim() || !newEduInst.trim()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Education Record</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-600" />
                <span>Notifications & Visibility Settings</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Resume & Talent Pool Visibility
                  </label>
                  <select
                    value={privacyMode}
                    onChange={(e) => setPrivacyMode(e.target.value as 'public' | 'private')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="public">Public (Verified Recruiter Searchable)</option>
                    <option value="private">Private (Only visible when I explicitly apply)</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center text-xs text-slate-700 font-medium cursor-pointer mt-5">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0 mr-2"
                    />
                    Receive instant alerts when new posted jobs match &gt;80% with my profile.
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                id="save-student-settings-btn"
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Save & Sync Profile across ATS Jobs</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPANY SPECIFICATIONS & DETAILS MODAL */}
      {selectedCompanyJob && (
        <CompanyDetailModal
          job={selectedCompanyJob}
          onClose={() => setSelectedCompanyJob(null)}
          onApplyJob={(jobId) => {
            onApplyJob(jobId, 'Applied directly after viewing company specifications.');
            setSelectedCompanyJob(null);
          }}
          hasApplied={appliedJobIds.has(selectedCompanyJob.id)}
          isEligible={(activeAnalysisMap[selectedCompanyJob.id]?.overallMatchScore || 0) >= 80}
        />
      )}

    </div>
  );
};
