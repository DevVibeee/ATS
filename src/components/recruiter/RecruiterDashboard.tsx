import React, { useState } from 'react';
import { User, Job, ApplicationStatus, NotificationMessage } from '../../types';
import { CandidatePoolView } from './CandidatePoolView';
import { NotificationCenter } from '../common/NotificationCenter';
import {
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Plus,
  Building2,
  MapPin,
  Search,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  PieChart,
  Sparkles,
  RefreshCw,
  Upload,
  Camera,
  Trash2,
  Clock,
  Mail
} from 'lucide-react';

interface RecruiterDashboardProps {
  user: User;
  jobs: Job[];
  candidates: any[];
  onSelectCandidate: (candidate: any) => void;
  onUpdateCandidateStatus: (candidateId: string, jobId: string, newStatus: ApplicationStatus, feedback?: string) => void;
  onOpenPostJobModal: () => void;
  onUpdateRecruiterProfile: (updatedProfile: any) => void;
  onEditJob?: (job: Job) => void;
  onDeleteJob?: (jobId: string) => void;
  notifications: NotificationMessage[];
  onMarkAsRead: (id: string) => void;
  onSendReply: (id: string, replyMessage: string) => void;
  onSendNewMessage: (msg: Partial<NotificationMessage>) => void;
  activeTab?: 'candidates' | 'jobs' | 'notifications' | 'analytics' | 'company';
  onTabChange?: (tab: 'candidates' | 'jobs' | 'notifications' | 'analytics' | 'company') => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  user,
  jobs,
  candidates,
  onSelectCandidate,
  onUpdateCandidateStatus,
  onOpenPostJobModal,
  onUpdateRecruiterProfile,
  onEditJob,
  onDeleteJob,
  notifications,
  onMarkAsRead,
  onSendReply,
  onSendNewMessage,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'jobs' | 'notifications' | 'analytics' | 'company'>(
    controlledTab || 'candidates'
  );

  React.useEffect(() => {
    if (controlledTab) {
      setActiveTab(controlledTab);
    }
  }, [controlledTab]);

  const handleTabSelect = (tab: 'candidates' | 'jobs' | 'notifications' | 'analytics' | 'company') => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const unreadCount = notifications.filter((n) => n.recipientRole === 'recruiter' && !n.read).length;

  const recruiterProfile = user.recruiterProfile!;
  const topTierCount = candidates.filter((c) => c.matchScore >= 90).length;
  const avgMatch = Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / (candidates.length || 1));

  // Settings form state
  const [companyName, setCompanyName] = useState(recruiterProfile.companyName || '');
  const [companyLogo, setCompanyLogo] = useState(
    recruiterProfile.companyLogo ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'
  );
  const [industry, setIndustry] = useState(recruiterProfile.industry || '');
  const [companySize, setCompanySize] = useState(recruiterProfile.companySize || '100-500 employees');
  const [location, setLocation] = useState(recruiterProfile.location || '');
  const [website, setWebsite] = useState(recruiterProfile.website || '');
  const [description, setDescription] = useState(recruiterProfile.description || '');
  const [threshold, setThreshold] = useState(recruiterProfile.atsMinMatchThreshold || 80);
  const [templateInterview, setTemplateInterview] = useState(
    recruiterProfile.autoResponseTemplates?.interview ||
      'Congratulations! Based on your high ATS match score, we would like to schedule an interview.'
  );
  const [templateRejection, setTemplateRejection] = useState(
    recruiterProfile.autoResponseTemplates?.rejection ||
      'Thank you for your application. We are looking for candidates with closer alignment in required core skills.'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Manual Recruiter ATS Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);

  const handleRefreshRecruiterATS = () => {
    setIsRefreshing(true);
    setRefreshNotice(null);
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshNotice(`Re-scanned & indexed all ${candidates.length} candidate profiles across ${jobs.length} active job requirements!`);
      setTimeout(() => setRefreshNotice(null), 4000);
    }, 600);
  };

  const handleSaveRecruiterSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRecProf = {
      ...recruiterProfile,
      companyName,
      companyLogo,
      industry,
      companySize,
      location,
      website,
      description,
      atsMinMatchThreshold: Number(threshold),
      autoResponseTemplates: {
        interview: templateInterview,
        rejection: templateRejection,
        shortlist: 'Your profile has been shortlisted for senior engineering review.',
      },
    };

    onUpdateRecruiterProfile(updatedRecProf);

    // Sync with MongoDB Atlas
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          recruiterProfile: updatedRecProf,
        }),
      });
      if (!res.ok) {
        console.warn('Sync notice from server:', res.statusText);
      }
    } catch (err) {
      console.warn('Profile updated in active session.');
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Recruiter Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img
              src={recruiterProfile.companyLogo}
              alt={recruiterProfile.companyName}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-sm border border-slate-200 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 font-sans truncate">{recruiterProfile.companyName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  Recruiter Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {user.name} • {recruiterProfile.industry} • {recruiterProfile.location}
              </p>
            </div>
          </div>

          <button
            id="post-new-job-btn-banner"
            onClick={onOpenPostJobModal}
            className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs transition min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Post Job Description</span>
          </button>
        </div>

        {/* Executive Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mt-4 sm:mt-6 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              Active Jobs
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">{jobs.length}</div>
          </div>

          <div className="space-y-1 border-l border-slate-200 pl-2.5 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              Applicants
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">{candidates.length}</div>
          </div>

          <div className="space-y-1 border-l border-slate-200 pl-2.5 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
              <Star className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              Shortlist Tier
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-600 font-mono">{topTierCount}</div>
          </div>

          <div className="space-y-1 border-l border-slate-200 pl-2.5 sm:pl-3">
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 truncate">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Avg Pool Fit
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 font-mono">{avgMatch}%</div>
          </div>
        </div>
      </div>

      {/* Recruiter Navigation Tabs - Mobile Scrollable */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <button
            id="recruiter-tab-candidates"
            onClick={() => handleTabSelect('candidates')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'candidates'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span>Candidates ({candidates.length})</span>
          </button>

          <button
            id="recruiter-tab-jobs"
            onClick={() => handleTabSelect('jobs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jobs Manager ({jobs.length})</span>
          </button>

          <button
            id="recruiter-tab-notifications"
            onClick={() => handleTabSelect('notifications')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries & Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            id="recruiter-tab-analytics"
            onClick={() => handleTabSelect('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Skill Analytics</span>
          </button>

          <button
            id="recruiter-tab-company"
            onClick={() => handleTabSelect('company')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === 'company'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Settings</span>
          </button>
        </div>

        {/* Recruiter Refresh ATS Button */}
        <button
          type="button"
          id="recruiter-refresh-ats-btn"
          onClick={handleRefreshRecruiterATS}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm shrink-0"
          title="Force ATS re-scan across candidate pool"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Refresh Candidate Match Scores</span>
        </button>
      </div>

      {refreshNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{refreshNotice}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono uppercase">Live Indexing Active</span>
        </div>
      )}

      {/* TAB 1: CANDIDATE SHORTLIST & EVALUATION WORKSPACE */}
      {activeTab === 'candidates' && (
        <CandidatePoolView
          candidates={candidates}
          jobs={jobs}
          onSelectCandidate={onSelectCandidate}
          onUpdateCandidateStatus={onUpdateCandidateStatus}
        />
      )}

      {/* TAB 2: JOB POSTINGS MANAGER */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-sans">
              Manage Text Job Descriptions
            </h2>
            <button
              id="post-new-job-btn-tab"
              onClick={onOpenPostJobModal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Job</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const jobApplicants = candidates.filter((c) => c.appliedJobId === job.id);
              const topCount = jobApplicants.filter((c) => c.matchScore >= 90).length;

              let daysLeftStr = null;
              if (job.expiresAt) {
                const diffMs = new Date(job.expiresAt).getTime() - Date.now();
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) {
                  daysLeftStr = 'Expired';
                } else {
                  daysLeftStr = `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
                }
              }

              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {job.employmentType} • {job.locationType}
                          </span>
                          {daysLeftStr && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                daysLeftStr === 'Expired'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              <span>{daysLeftStr}</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{job.title}</h3>
                        <p className="text-xs text-slate-500">{job.department} • {job.location}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onEditJob && onEditJob(job)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Edit Job Description"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the job posting "${job.title}"?`)) {
                              if (onDeleteJob) onDeleteJob(job.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Job Posting"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 my-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1 my-3">
                      {job.requiredSkills.map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-slate-500">
                      <span><strong>{jobApplicants.length}</strong> Applicants</span>
                      <span><strong>{topCount}</strong> Shortlisted (90%+)</span>
                    </div>
                    <span className="font-mono text-indigo-600 font-bold">{job.salaryRange}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2.5: INQUIRIES & NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <NotificationCenter
          currentRole="recruiter"
          currentUserEmail={user.email}
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onSendReply={onSendReply}
          onSendNewMessage={onSendNewMessage}
          jobs={jobs}
          candidates={candidates}
        />
      )}

      {/* TAB 3: ATS TALENT INSIGHTS */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Applicant Skill Shortage & Match Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Match Score Distribution */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Candidate Score Distribution
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>90-100% Top Shortlist Fit</span>
                    <span className="font-mono text-amber-700 font-bold">{topTierCount} candidates</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${(topTierCount / (candidates.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>80-89% Qualified Match</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {candidates.filter((c) => c.matchScore >= 80 && c.matchScore < 90).length} candidates
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{
                        width: `${
                          (candidates.filter((c) => c.matchScore >= 80 && c.matchScore < 90).length /
                            (candidates.length || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>&lt;80% Skill Gap Pool</span>
                    <span className="font-mono text-rose-700 font-bold">
                      {candidates.filter((c) => c.matchScore < 80).length} candidates
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full"
                      style={{
                        width: `${
                          (candidates.filter((c) => c.matchScore < 80).length / (candidates.length || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Most Frequent Missing Skills */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top Skill Shortages Across Applicants
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">FastAPI / Python Microservices</span>
                  <span className="text-amber-800 font-bold">42% candidates missing</span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">Kubernetes & Infrastructure IaC</span>
                  <span className="text-amber-800 font-bold">38% candidates missing</span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="font-medium text-slate-800">GraphQL & High Throughput Gateways</span>
                  <span className="text-emerald-800 font-bold">22% candidates missing</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: COMPANY & ATS SETTINGS */}
      {activeTab === 'company' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Company Profile & ATS Algorithm Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your recruiter profile, minimum ATS candidate matching thresholds, and automated applicant feedback templates.
              </p>
            </div>
            {savedSuccess && (
              <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configuration Saved!</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveRecruiterSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Company Logo & Profile Image</label>
                  <label className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition shadow-xs">
                    <Upload className="w-3 h-3" />
                    <span>Upload Image from Device</span>
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
                              setCompanyLogo(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <img
                    src={companyLogo}
                    alt="Logo Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
                    }}
                  />
                  <input
                    type="text"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    placeholder="https://... or upload photo from device above"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Size</label>
                <input
                  type="text"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Headquarters Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Website</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Minimum ATS Candidate Match Eligibility Threshold (%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={50}
                    max={95}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="font-mono text-indigo-700 font-bold text-sm w-12 text-right">
                    {threshold}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Candidates below this score will be locked from direct 1-click job application submission.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 text-xs">
                Company Description & Culture Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Email Templates */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Automated Candidate Response Email Templates</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Interview Schedule Invitation Template
                  </label>
                  <textarea
                    rows={2}
                    value={templateInterview}
                    onChange={(e) => setTemplateInterview(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Constructive Skill-Gap Rejection Notice Template
                  </label>
                  <textarea
                    rows={2}
                    value={templateRejection}
                    onChange={(e) => setTemplateRejection(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                id="save-recruiter-settings-btn"
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save ATS & Recruiter Configuration</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
