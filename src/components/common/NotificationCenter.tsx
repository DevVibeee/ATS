import React, { useState } from 'react';
import { NotificationMessage, UserRole } from '../../types';
import {
  Inbox,
  Send,
  Calendar,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  CornerUpLeft,
  Mail,
  Video,
  Sparkles,
  UserCheck,
  AlertCircle,
  Check
} from 'lucide-react';

interface NotificationCenterProps {
  currentRole: UserRole;
  currentUserEmail?: string;
  notifications: NotificationMessage[];
  onMarkAsRead: (id: string) => void;
  onSendReply: (notificationId: string, replyMessage: string) => void;
  onSendNewMessage: (msg: Partial<NotificationMessage>) => void;
  onCandidateApplicationResponse?: (
    applicationId: string,
    status: 'Accepted' | 'Declined' | 'Reschedule Requested',
    note?: string
  ) => void;
  applications?: any[];
  jobs?: any[];
  candidates?: any[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentRole,
  currentUserEmail,
  notifications,
  onMarkAsRead,
  onSendReply,
  onSendNewMessage,
  onCandidateApplicationResponse,
  applications = [],
  jobs = [],
  candidates = [],
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INVITATION' | 'STATUS_UPDATE' | 'INQUIRY' | 'UNREAD'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(
    notifications.length > 0 ? notifications[0].id : null
  );

  const [replyText, setReplyText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [composeJobId, setComposeJobId] = useState('');
  const [composeCandidateId, setComposeCandidateId] = useState('');

  // Filter notifications for current user role
  const userNotifications = notifications.filter((n) => {
    if (currentRole === 'admin') return true;
    return n.recipientRole === currentRole;
  });

  const filteredNotifications = userNotifications.filter((n) => {
    if (filterType === 'UNREAD') {
      if (n.read) return false;
    } else if (filterType !== 'ALL') {
      if (n.type !== filterType) return false;
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const subj = (n.subject || '').toLowerCase();
    const body = (n.content || '').toLowerCase();
    const sender = (n.senderName || '').toLowerCase();
    const job = (n.jobTitle || '').toLowerCase();
    return (
      subj.includes(q) ||
      body.includes(q) ||
      sender.includes(q) ||
      job.includes(q)
    );
  });

  const selectedNotification = userNotifications.find((n) => n.id === selectedNotificationId) || filteredNotifications[0];

  const handleSelect = (n: NotificationMessage) => {
    setSelectedNotificationId(n.id);
    if (!n.read) {
      onMarkAsRead(n.id);
    }
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedNotification) return;

    onSendReply(selectedNotification.id, replyText.trim());
    setReplyText('');
  };

  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeSubject.trim() || !composeContent.trim()) return;

    if (currentRole === 'student') {
      const job = jobs.find((j) => j.id === composeJobId);
      onSendNewMessage({
        recipientRole: 'recruiter',
        senderRole: 'student',
        senderName: currentUserEmail ? currentUserEmail.split('@')[0] : 'Student Applicant',
        subject: composeSubject,
        content: composeContent,
        type: 'INQUIRY',
        jobId: composeJobId || undefined,
        jobTitle: job ? job.title : 'General Career Inquiry',
      });
    } else {
      const selCand = candidates.find((c) => c.id === composeCandidateId);
      const candJob = jobs.find((j) => j.id === (selCand ? selCand.appliedJobId : composeJobId));
      onSendNewMessage({
        recipientRole: 'student',
        senderRole: 'recruiter',
        senderName: 'AuraATS Talent Team',
        subject: composeSubject,
        content: composeContent,
        type: 'INQUIRY',
        candidateId: selCand ? selCand.id : undefined,
        candidateName: selCand ? selCand.name : undefined,
        jobId: selCand ? selCand.appliedJobId : composeJobId || undefined,
        jobTitle: candJob ? candJob.title : 'Career Opportunity',
      });
    }

    setComposeSubject('');
    setComposeContent('');
    setComposeJobId('');
    setComposeCandidateId('');
    setIsComposing(false);
  };

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-[750px]">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900 text-white p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/80 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold font-sans">Notifications & Inquiry Center</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500 text-white animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {currentRole === 'student'
                ? 'Received recruiter interview invitations, application updates, & direct inquiries.'
                : 'Received candidate responses, inquiries, & application interview acknowledgments.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComposing(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Inquiry</span>
          </button>
        </div>
      </div>

      {/* Main Inbox Body Grid */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        
        {/* Left Sidebar Filters */}
        <div className="w-full md:w-56 bg-slate-50 p-3 shrink-0 flex md:flex-col justify-between overflow-x-auto md:overflow-y-auto gap-1 border-b md:border-b-0 border-slate-200">
          <div className="space-y-1 w-full flex md:flex-col gap-1 md:gap-1">
            <button
              onClick={() => setFilterType('ALL')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                filterType === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                <span>All Inbox</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${filterType === 'ALL' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {userNotifications.length}
              </span>
            </button>

            <button
              onClick={() => setFilterType('UNREAD')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                filterType === 'UNREAD'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Unread</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setFilterType('INVITATION')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                filterType === 'INVITATION'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Interview Invites</span>
              </div>
            </button>

            <button
              onClick={() => setFilterType('STATUS_UPDATE')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                filterType === 'STATUS_UPDATE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Status Updates</span>
              </div>
            </button>

            <button
              onClick={() => setFilterType('INQUIRY')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                filterType === 'INQUIRY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Direct Inquiries</span>
              </div>
            </button>
          </div>
        </div>

        {/* Middle Notification List Panel */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden bg-white">
          <div className="p-3 border-b border-slate-100 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-5 top-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.map((n) => {
              const isSelected = selectedNotification?.id === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 relative ${
                    isSelected
                      ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                      : n.read
                      ? 'bg-white hover:bg-slate-50/80'
                      : 'bg-blue-50/40 hover:bg-blue-50/80 font-bold'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">{n.senderName}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                        n.type === 'INVITATION'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : n.type === 'STATUS_UPDATE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      }`}
                    >
                      {n.type === 'INVITATION'
                        ? 'Invite'
                        : n.type === 'STATUS_UPDATE'
                        ? 'Status'
                        : 'Inquiry'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 truncate">{n.subject}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 font-normal">{n.content}</p>
                </button>
              );
            })}

            {filteredNotifications.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-1">
                <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No notifications found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail & Thread Reply Panel */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50/50 p-4 sm:p-6 space-y-6">
          {selectedNotification ? (
            <div className="space-y-6 max-w-3xl mx-auto w-full">
              
              {/* Card Header */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        selectedNotification.senderAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={selectedNotification.senderName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{selectedNotification.senderName}</div>
                      <div className="text-xs text-slate-500">
                        Sender Role: <span className="capitalize font-semibold text-indigo-600">{selectedNotification.senderRole}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono">
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 border ${
                        selectedNotification.type === 'INVITATION'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : selectedNotification.type === 'STATUS_UPDATE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-300'
                      }`}
                    >
                      {selectedNotification.type}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{selectedNotification.subject}</h3>
                  {selectedNotification.jobTitle && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Job Context: {selectedNotification.jobTitle}</span>
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  {selectedNotification.content}
                </div>

                {/* Interview Action Card if Type === INVITATION & role === student */}
                {selectedNotification.type === 'INVITATION' && currentRole === 'student' && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-indigo-900 text-xs flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-indigo-600" />
                        <span>Interactive Interview Invitation Response Controls</span>
                      </div>
                    </div>

                    {selectedNotification.interviewDate && (
                      <div className="text-xs text-slate-700 font-medium">
                        <strong>Proposed Schedule:</strong> {new Date(selectedNotification.interviewDate).toLocaleString()}
                      </div>
                    )}

                    {selectedNotification.meetingLink && (
                      <div className="text-xs text-slate-700 font-medium">
                        <strong>Meeting Link:</strong>{' '}
                        <a href={selectedNotification.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">
                          {selectedNotification.meetingLink}
                        </a>
                      </div>
                    )}

                    {onCandidateApplicationResponse && selectedNotification.jobId && (() => {
                      const matchedApp = applications.find(
                        (a) => a.jobId === selectedNotification.jobId || a.id === selectedNotification.candidateId
                      );
                      const currentStatus = matchedApp?.candidateResponseStatus;

                      if (currentStatus === 'Accepted') {
                        return (
                          <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs shadow-sm">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Interview Invitation Accepted ✓ — Your response has been recorded and sent live to the recruiter.</span>
                            </div>
                          </div>
                        );
                      }

                      if (currentStatus === 'Reschedule Requested') {
                        return (
                          <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl font-bold text-xs shadow-sm">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Reschedule Requested ⏰ — Note: "{matchedApp.candidateResponseNote || 'Preferred time requested.'}"</span>
                            </div>
                          </div>
                        );
                      }

                      if (currentStatus === 'Declined') {
                        return (
                          <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-900 border border-rose-300 rounded-xl font-bold text-xs shadow-sm">
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Invitation Declined ✕ — Recruiter has been notified.</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              const targetApp = matchedApp || applications.find((a) => a.jobId === selectedNotification.jobId);
                              if (targetApp) onCandidateApplicationResponse(targetApp.id, 'Accepted');
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept Interview</span>
                          </button>

                          <button
                            onClick={() => {
                              const note = prompt('Enter note or preferred reschedule date/time:');
                              const targetApp = matchedApp || applications.find((a) => a.jobId === selectedNotification.jobId);
                              if (targetApp && note) onCandidateApplicationResponse(targetApp.id, 'Reschedule Requested', note);
                            }}
                            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Request Reschedule</span>
                          </button>

                          <button
                            onClick={() => {
                              const targetApp = matchedApp || applications.find((a) => a.jobId === selectedNotification.jobId);
                              if (targetApp) onCandidateApplicationResponse(targetApp.id, 'Declined');
                            }}
                            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Thread Replies */}
              {selectedNotification.replies && selectedNotification.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
                    Message Thread Replies ({selectedNotification.replies.length})
                  </h4>
                  {selectedNotification.replies.map((r) => (
                    <div key={r.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-900">{r.senderName} ({r.senderRole})</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(r.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 pt-1 font-sans leading-relaxed">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Reply Box */}
              <form onSubmit={handleSubmitReply} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CornerUpLeft className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Send Direct Reply Message:</span>
                </label>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Write your reply to ${selectedNotification.senderName}...`}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs font-medium space-y-2">
              <Mail className="w-12 h-12 text-slate-300" />
              <p>Select a notification from the list to view details and reply.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Inquiry Modal */}
      {isComposing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Compose Direct Inquiry Message</span>
              </h3>
              <button onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
                ×
              </button>
            </div>

            <form onSubmit={handleSendCompose} className="space-y-3.5 text-xs">
              {currentRole === 'student' ? (
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    To (Select Recruiter / Company) *:
                  </label>
                  <select
                    required
                    value={composeJobId}
                    onChange={(e) => setComposeJobId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Target Job / Company Recruiter --</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.companyName} — {j.title} ({j.location})
                      </option>
                    ))}
                    <option value="general_support">AuraATS Career Advisory Team</option>
                  </select>

                  {composeJobId && (
                    <div className="mt-2 bg-indigo-50/90 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-900 font-bold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>
                        Recipient: {jobs.find((j) => j.id === composeJobId)?.companyName || 'AuraATS'} Talent Acquisition Team
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    To (Select Target Candidate / Applicant) *:
                  </label>
                  <select
                    required
                    value={composeCandidateId}
                    onChange={(e) => setComposeCandidateId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Choose Candidate --</option>
                    {candidates.map((c) => {
                      const candJob = jobs.find((j) => j.id === c.appliedJobId);
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email}) — {candJob ? candJob.title : c.headline}
                        </option>
                      );
                    })}
                  </select>

                  {composeCandidateId && (() => {
                    const selCand = candidates.find((c) => c.id === composeCandidateId);
                    if (!selCand) return null;
                    return (
                      <div className="mt-2 bg-indigo-50/90 border border-indigo-200 rounded-xl p-2.5 text-xs text-indigo-900 font-bold flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                          Recipient: {selCand.name} ({selCand.email})
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block text-slate-800 font-bold mb-1">Subject Title *:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inquiry regarding interview schedule or application update"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">Message Body *:</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type your message details here..."
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
