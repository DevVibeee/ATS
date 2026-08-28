import React, { useState, useEffect } from 'react';
import { UserRole, User, Job, JobApplication, ApplicationStatus, ParsedResume, DeveloperProfile, NotificationMessage } from './types';
import {
  MOCK_STUDENT_USER,
  MOCK_RECRUITER_USER,
  INITIAL_JOBS,
  INITIAL_CANDIDATE_POOL,
  INITIAL_APPLICATIONS,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { AuthPortal } from './components/auth/AuthPortal';
import { LandingPage } from './components/landing/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { PostJobModal } from './components/modals/PostJobModal';
import { CandidateDetailModal } from './components/modals/CandidateDetailModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

const MOCK_ADMIN_USER: User = {
  id: 'usr_admin_01',
  name: 'Sanaullah Shah',
  email: 'sanaullah786shah92@gmail.com',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const DEFAULT_DEVELOPER_PROFILE: DeveloperProfile = {
  name: 'Sanaullah Shah',
  title: 'AI Systems Architect & Full-Stack Developer',
  bio: 'Specialized in modern AI application architecture, deterministic NLP taxonomies, Google Gemini LLM integrations, and scalable full-stack React systems. Developer of the AuraATS resume parsing engine.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  githubUrl: 'https://github.com/sanaullah-ai',
  huggingfaceUrl: 'https://huggingface.co/sanaullah7964',
  email: 'sanaullah786shah92@gmail.com',
  location: 'Global / Remote',
  skills: ['Gemini API', 'React 18', 'TypeScript', 'Node.js', 'Python', 'Vector DBs', 'RAG'],
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auraats_is_authenticated') === 'true';
  });
  const [isViewingLanding, setIsViewingLanding] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('auraats_current_role') as UserRole;
    if (saved === 'student' || saved === 'recruiter' || saved === 'admin') return saved;
    return 'student';
  });
  const [studentUser, setStudentUser] = useState<User>(() => {
    const saved = localStorage.getItem('auraats_student_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_STUDENT_USER;
  });

  const [recruiterUser, setRecruiterUser] = useState<User>(() => {
    const saved = localStorage.getItem('auraats_recruiter_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MOCK_RECRUITER_USER;
  });

  const [adminUser, setAdminUser] = useState<User>(MOCK_ADMIN_USER);

  useEffect(() => {
    localStorage.setItem('auraats_is_authenticated', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('auraats_current_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('auraats_student_user', JSON.stringify(studentUser));
  }, [studentUser]);

  useEffect(() => {
    localStorage.setItem('auraats_recruiter_user', JSON.stringify(recruiterUser));
  }, [recruiterUser]);

  const [studentTab, setStudentTab] = useState<'feed' | 'resume' | 'skillgap' | 'applications' | 'notifications' | 'settings'>('feed');
  const [recruiterTab, setRecruiterTab] = useState<'candidates' | 'jobs' | 'notifications' | 'analytics' | 'company'>('candidates');

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('auraats_jobs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_JOBS;
  });

  const [candidates, setCandidates] = useState<any[]>(() => {
    const saved = localStorage.getItem('auraats_candidates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CANDIDATE_POOL;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('auraats_applications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_APPLICATIONS;
  });

  const [notifications, setNotifications] = useState<NotificationMessage[]>(() => {
    const saved = localStorage.getItem('auraats_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem('auraats_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('auraats_candidates', JSON.stringify(candidates));
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('auraats_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('auraats_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Initial Sync with MongoDB Atlas Cluster
  useEffect(() => {
    // Sync Jobs from DB
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs(data.jobs);
        } else if (data.success && Array.isArray(data.jobs) && data.jobs.length === 0) {
          // Seed initial jobs to MongoDB Atlas if collection is fresh
          INITIAL_JOBS.forEach((job) => {
            fetch('/api/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(job),
            }).catch(() => {});
          });
        }
      })
      .catch(() => {});

    // Sync Candidates from DB
    fetch('/api/candidates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.candidates) && data.candidates.length > 0) {
          setCandidates(data.candidates);
        }
      })
      .catch(() => {});

    // Sync Applications from DB
    fetch('/api/applications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.applications) && data.applications.length > 0) {
          setApplications(data.applications);
        }
      })
      .catch(() => {});
  }, []);

  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSendReply = (notificationId: string, replyMessage: string) => {
    const targetNotif = notifications.find((n) => n.id === notificationId);
    if (!targetNotif) return;

    const senderRole = currentRole;
    const senderName = currentRole === 'student' ? studentUser.name : recruiterUser.name;
    const newReply = {
      id: 'reply_' + Date.now(),
      senderRole,
      senderName,
      message: replyMessage,
      timestamp: new Date().toISOString(),
    };

    // Update existing thread
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, replies: [...(n.replies || []), newReply] }
          : n
      )
    );

    // Also send reciprocal notification to the recipient
    const reciprocalRecipientRole: UserRole = currentRole === 'student' ? 'recruiter' : 'student';
    const newNotif: NotificationMessage = {
      id: 'notif_' + Date.now(),
      recipientRole: reciprocalRecipientRole,
      senderRole: currentRole,
      senderName,
      subject: `Re: ${targetNotif.subject}`,
      content: replyMessage,
      type: 'INQUIRY',
      jobId: targetNotif.jobId,
      jobTitle: targetNotif.jobTitle,
      candidateId: targetNotif.candidateId,
      candidateName: targetNotif.candidateName,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast('Reply message delivered successfully!');
  };

  const handleSendNewMessage = (msg: Partial<NotificationMessage>) => {
    const newNotif: NotificationMessage = {
      id: 'notif_' + Date.now(),
      recipientRole: msg.recipientRole || (currentRole === 'student' ? 'recruiter' : 'student'),
      senderRole: currentRole,
      senderName: currentRole === 'student' ? studentUser.name : recruiterUser.name,
      subject: msg.subject || 'Direct Inquiry',
      content: msg.content || '',
      type: msg.type || 'INQUIRY',
      jobId: msg.jobId,
      jobTitle: msg.jobTitle,
      candidateId: msg.candidateId,
      candidateName: msg.candidateName,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    showToast('Direct message inquiry sent successfully!');
  };

  const [developerProfile, setDeveloperProfile] = useState<DeveloperProfile>(() => {
    const saved = localStorage.getItem('auraats_developer_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_DEVELOPER_PROFILE;
  });

  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<any | null>(null);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<UserRole>('student');
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  const [hasApiKey, setHasApiKey] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch developer profile from server if available
  useEffect(() => {
    fetch('/api/admin/developer-profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          setDeveloperProfile(data.profile);
          localStorage.setItem('auraats_developer_profile', JSON.stringify(data.profile));
        }
      })
      .catch((err) => console.log('Using local developer profile state', err));
  }, []);

  const handleUpdateDeveloperProfile = (updated: DeveloperProfile) => {
    setDeveloperProfile(updated);
    localStorage.setItem('auraats_developer_profile', JSON.stringify(updated));
    fetch('/api/admin/developer-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile: updated }),
    }).catch((err) => console.error('Failed to save profile to server', err));
  };

  // Check Backend Health and Gemini Key presence
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasGeminiKey) {
          setHasApiKey(true);
        }
      })
      .catch(() => setHasApiKey(false));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Actions
  const handleLogin = (user: User, role: UserRole) => {
    if (role === 'student') {
      setStudentUser(user);
    } else if (role === 'recruiter') {
      setRecruiterUser(user);
    } else {
      setAdminUser(user);
    }
    setCurrentRole(role);
    setIsAuthenticated(true);
    setIsViewingLanding(false);
    setIsAuthModalOpen(false);
    showToast(`Signed in successfully to ${role === 'student' ? 'Student' : role === 'recruiter' ? 'Recruiter' : 'Admin'} Portal!`);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setIsViewingLanding(true);
    showToast('Signed out successfully. Session closed.');
  };

  // Student Actions
  const handleApplyJob = (jobId: string, coverNote: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const existing = applications.find((a) => a.jobId === jobId && a.candidateId === studentUser.id);
    if (existing) {
      showToast('You have already applied to this job posting!');
      return;
    }

    const newApp: JobApplication = {
      id: 'app_' + Date.now(),
      jobId,
      candidateId: studentUser.id,
      appliedAt: new Date().toISOString(),
      matchScoreAtApplication: 94,
      status: 'Applied',
      coverNote,
    };

    setApplications([newApp, ...applications]);

    // Also add to candidate pool for recruiter view
    const newCandEntry = {
      id: studentUser.id,
      name: studentUser.name,
      email: studentUser.email,
      headline: studentUser.studentProfile?.headline || 'Software Candidate',
      avatar: studentUser.avatar,
      resume: studentUser.studentProfile?.resume,
      appliedJobId: jobId,
      matchScore: 94,
      status: 'Applied' as const,
      appliedAt: new Date().toISOString(),
      coverNote,
    };

    setCandidates([newCandEntry, ...candidates]);
    showToast(`Successfully submitted application for ${job.title}!`);

    // Sync to MongoDB Atlas backend
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    }).catch((err) => console.warn('Application sync to DB note:', err));

    fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCandEntry),
    }).catch((err) => console.warn('Candidate sync to DB note:', err));
  };

  const handleUpdateResume = (parsedResume: ParsedResume) => {
    const updatedStudent = {
      ...studentUser,
      studentProfile: {
        ...studentUser.studentProfile!,
        resume: parsedResume,
        skills: parsedResume.extractedSkills.technical,
      },
    };

    setStudentUser(updatedStudent);
    showToast(`Resume "${parsedResume.fileName}" parsed & ATS score updated (${parsedResume.atsHealthScore}%)`);
  };

  const handleUpdateStudentProfile = (updatedProfile: any) => {
    setStudentUser({
      ...studentUser,
      avatar: updatedProfile.avatar || studentUser.avatar,
      studentProfile: {
        ...studentUser.studentProfile!,
        ...updatedProfile,
      },
    });
    showToast('Student profile and avatar updated successfully!');
  };

  const handleCandidateApplicationResponse = (
    appId: string,
    candidateResponseStatus: 'Accepted' | 'Declined' | 'Reschedule Requested' | 'Pending',
    note?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              candidateResponseStatus,
              candidateResponseNote: note || app.candidateResponseNote,
            }
          : app
      )
    );

    const app = applications.find((a) => a.id === appId);
    const job = jobs.find((j) => j.id === app?.jobId);

    setCandidates((prev) =>
      prev.map((c) =>
        c.appliedJobId === app?.jobId || c.id === app?.candidateId
          ? {
              ...c,
              candidateResponseStatus,
              candidateResponseNote: note || c.candidateResponseNote,
            }
          : c
      )
    );

    // Trigger notification to Recruiter
    const autoNotif: NotificationMessage = {
      id: 'notif_' + Date.now(),
      recipientRole: 'recruiter',
      senderRole: 'student',
      senderName: studentUser.name,
      subject: `Candidate Interview Response: ${candidateResponseStatus} (${job?.title || 'Job Position'})`,
      content: `Candidate ${studentUser.name} has responded "${candidateResponseStatus}" regarding the interview for ${job?.title || 'the position'}.${
        note ? ` Note from candidate: "${note}"` : ''
      }`,
      type: 'INQUIRY',
      jobId: app?.jobId,
      jobTitle: job?.title,
      candidateId: app?.candidateId,
      candidateName: studentUser.name,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [autoNotif, ...prev]);
    showToast(`Interview response sent: "${candidateResponseStatus}"`);
  };

  const handleSelectPresetUser = (presetUser: User) => {
    setStudentUser(presetUser);
    showToast(`Active Student Context switched to: ${presetUser.name}`);
  };

  // Recruiter Actions
  const handleUpdateCandidateStatus = (
    candidateId: string,
    jobId: string,
    newStatus: ApplicationStatus,
    feedback?: string,
    interviewDate?: string,
    interviewNote?: string,
    meetingLink?: string
  ) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId && c.appliedJobId === jobId
          ? {
              ...c,
              status: newStatus,
              coverNote: feedback || c.coverNote,
              interviewDate: interviewDate || c.interviewDate,
              interviewNote: interviewNote || c.interviewNote,
              meetingLink: meetingLink || c.meetingLink,
            }
          : c
      )
    );

    setApplications((prev) =>
      prev.map((a) =>
        a.candidateId === candidateId && a.jobId === jobId
          ? {
              ...a,
              status: newStatus,
              recruiterFeedback: feedback || a.recruiterFeedback,
              interviewDate: interviewDate || a.interviewDate,
              interviewNote: interviewNote || a.interviewNote,
              meetingLink: meetingLink || a.meetingLink,
            }
          : a
      )
    );

    const job = jobs.find((j) => j.id === jobId);
    const cand = candidates.find((c) => c.id === candidateId || c.resume?.id === candidateId);
    const isInterview = newStatus === 'Interview Scheduled';

    // Trigger notification to Candidate
    const autoNotif: NotificationMessage = {
      id: 'notif_' + Date.now(),
      recipientRole: 'student',
      senderRole: 'recruiter',
      senderName: `${recruiterUser.name} (${job?.companyName || 'Recruiter Team'})`,
      subject: isInterview
        ? `🎉 Interview Invitation: ${job?.title || 'Job Position'}`
        : `Application Status Update: ${newStatus} for ${job?.title || 'Job Position'}`,
      content: isInterview
        ? interviewNote || `You have been invited for an interview for ${job?.title}!`
        : feedback || `Your application status for ${job?.title} has been updated to "${newStatus}".`,
      type: isInterview ? 'INVITATION' : 'STATUS_UPDATE',
      jobId,
      jobTitle: job?.title,
      candidateId,
      candidateName: cand?.name || cand?.resume?.fullName,
      interviewDate,
      meetingLink,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [autoNotif, ...prev]);
    showToast(`Candidate status updated to "${newStatus}" & notification sent!`);

    // Sync to backend DB
    const matchingApp = applications.find((a) => a.candidateId === candidateId && a.jobId === jobId);
    if (matchingApp?.id) {
      fetch(`/api/applications/${matchingApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    }

    if (cand) {
      fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cand,
          status: newStatus,
          coverNote: feedback || cand.coverNote,
          interviewDate: interviewDate || cand.interviewDate,
          interviewNote: interviewNote || cand.interviewNote,
          meetingLink: meetingLink || cand.meetingLink,
        }),
      }).catch(() => {});
    }
  };

  const [editingJobForModal, setEditingJobForModal] = useState<Job | null>(null);

  const handleJobCreated = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    showToast(`New job posting created: ${newJob.title}`);
    fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJob),
    }).catch((err) => console.warn('Job creation sync note:', err));
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)));
    showToast(`Job posting "${updatedJob.title}" updated successfully!`);
    fetch(`/api/jobs/${updatedJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob),
    }).catch((err) => console.warn('Job update sync note:', err));
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    showToast('Job posting deleted successfully.');
    fetch(`/api/jobs/${jobId}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Job delete sync note:', err));
  };

  const handleQuickReset = () => {
    setJobs(INITIAL_JOBS);
    setCandidates(INITIAL_CANDIDATE_POOL);
    setApplications(INITIAL_APPLICATIONS);
    setStudentUser(MOCK_STUDENT_USER);
    setRecruiterUser(MOCK_RECRUITER_USER);
    showToast('Demo state reset to clean initial defaults.');
  };

  const handleAdminLoginSuccess = (user: User) => {
    setAdminUser(user);
    setCurrentRole('admin');
    setIsAuthenticated(true);
    setIsViewingLanding(false);
    setIsAdminLoginModalOpen(false);
    showToast('Authenticated successfully as SaaS Systems Admin!');
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (currentRole === 'student') {
      const updated = { ...studentUser, avatar: newAvatarUrl };
      setStudentUser(updated);
    } else if (currentRole === 'recruiter') {
      const updated = { ...recruiterUser, avatar: newAvatarUrl };
      setRecruiterUser(updated);
    } else {
      const updated = { ...adminUser, avatar: newAvatarUrl };
      setAdminUser(updated);
    }
    showToast('Profile picture updated from device!');
  };

  const activeUser =
    currentRole === 'student'
      ? studentUser
      : currentRole === 'recruiter'
      ? recruiterUser
      : adminUser;

  if (!isAuthenticated || isViewingLanding) {
    return (
      <>
        <LandingPage
          onLogin={handleLogin}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onOpenAuthModal={(role = 'student', tab = 'signin') => {
            setAuthModalRole(role);
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
          developerProfile={developerProfile}
          isAuthenticated={isAuthenticated}
          currentUser={activeUser}
          currentRole={currentRole}
          onGoToDashboard={() => setIsViewingLanding(false)}
          onSignOut={handleSignOut}
        />

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <AuthPortal
              initialRole={authModalRole}
              initialTab={authModalTab}
              onLogin={handleLogin}
              onOpenAdminLogin={() => {
                setIsAuthModalOpen(false);
                setIsAdminLoginModalOpen(true);
              }}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </div>
        )}

        {isAdminLoginModalOpen && (
          <AdminLoginModal
            onClose={() => setIsAdminLoginModalOpen(false)}
            onAdminLoginSuccess={handleAdminLoginSuccess}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      
      <div>
        {/* Top Header */}
        <Navbar
          currentRole={currentRole}
          onRoleChange={(role) => {
            setCurrentRole(role);
            showToast(`RBAC Context Switched to ${role === 'student' ? 'Student' : role === 'recruiter' ? 'Recruiter' : 'SaaS Admin'} Portal`);
          }}
          currentUser={activeUser}
          hasApi={hasApiKey}
          onQuickReset={handleQuickReset}
          onSignOut={handleSignOut}
          onGoToHome={() => {
            setIsViewingLanding(true);
            showToast('Returned to Homepage (Session remains active)');
          }}
          onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
          onUploadAvatar={handleUpdateAvatar}
          unreadCount={notifications.filter((n) => n.recipientRole === currentRole && !n.read).length}
          onOpenNotifications={() => {
            if (currentRole === 'student') {
              setStudentTab('notifications');
            } else if (currentRole === 'recruiter') {
              setRecruiterTab('notifications');
            }
            showToast('Opening Inquiries & Notifications Hub');
          }}
        />

        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-indigo-500/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Main View Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary fallbackTitle="Dashboard View Recovery">
            {currentRole === 'student' ? (
              <StudentDashboard
                user={studentUser}
                jobs={jobs}
                applications={applications}
                onApplyJob={handleApplyJob}
                onUpdateResume={handleUpdateResume}
                onUpdateProfile={handleUpdateStudentProfile}
                onSelectPresetUser={handleSelectPresetUser}
                onCandidateApplicationResponse={handleCandidateApplicationResponse}
                isParsing={isParsing}
                setIsParsing={setIsParsing}
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onSendReply={handleSendReply}
                onSendNewMessage={handleSendNewMessage}
                activeTab={studentTab}
                onTabChange={setStudentTab}
              />
            ) : currentRole === 'recruiter' ? (
              <RecruiterDashboard
                user={recruiterUser}
                jobs={jobs}
                candidates={candidates}
                onSelectCandidate={setSelectedCandidateForModal}
                onUpdateCandidateStatus={handleUpdateCandidateStatus}
                onOpenPostJobModal={() => {
                  setEditingJobForModal(null);
                  setIsPostJobModalOpen(true);
                }}
                onUpdateRecruiterProfile={(profile) =>
                  setRecruiterUser({ ...recruiterUser, recruiterProfile: profile })
                }
                onEditJob={(job) => {
                  setEditingJobForModal(job);
                  setIsPostJobModalOpen(true);
                }}
                onDeleteJob={handleDeleteJob}
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onSendReply={handleSendReply}
                onSendNewMessage={handleSendNewMessage}
                activeTab={recruiterTab}
                onTabChange={setRecruiterTab}
              />
            ) : (
              <AdminDashboard
                adminUser={adminUser}
                jobs={jobs}
                candidates={candidates}
                developerProfile={developerProfile}
                onUpdateDeveloperProfile={handleUpdateDeveloperProfile}
                onShowToast={showToast}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Modals */}
      {isPostJobModalOpen && (
        <PostJobModal
          recruiterId={recruiterUser.id}
          companyName={recruiterUser.recruiterProfile?.companyName || 'TechCompany'}
          companyLogo={
            recruiterUser.recruiterProfile?.companyLogo ||
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'
          }
          jobToEdit={editingJobForModal}
          onJobUpdated={handleJobUpdated}
          onClose={() => {
            setIsPostJobModalOpen(false);
            setEditingJobForModal(null);
          }}
          onJobCreated={handleJobCreated}
        />
      )}

      {selectedCandidateForModal && (
        <CandidateDetailModal
          candidate={selectedCandidateForModal}
          jobs={jobs}
          onClose={() => setSelectedCandidateForModal(null)}
          onUpdateStatus={handleUpdateCandidateStatus}
        />
      )}

      {isAdminLoginModalOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginModalOpen(false)}
          onAdminLoginSuccess={handleAdminLoginSuccess}
        />
      )}

      {/* Clean Global Footer */}
      <Footer />

    </div>
  );
}
