import React, { useState, useEffect } from 'react';
import { Job, ApplicationStatus } from '../../types';
import {
  X,
  Star,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Building2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Send,
  Download,
  Globe,
  Video,
  Clock,
  MessageSquare
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: any;
  jobs: Job[];
  onClose: () => void;
  onUpdateStatus: (
    candidateId: string,
    jobId: string,
    status: ApplicationStatus,
    feedback?: string,
    interviewDate?: string,
    interviewNote?: string,
    meetingLink?: string
  ) => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  jobs,
  onClose,
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState<ApplicationStatus>(candidate.status || 'Under Review');
  const [feedback, setFeedback] = useState<string>(candidate.coverNote || candidate.recruiterFeedback || '');
  const [interviewDate, setInterviewDate] = useState<string>(candidate.interviewDate || '');
  const [interviewNote, setInterviewNote] = useState<string>(candidate.interviewNote || 'Looking forward to discussing your technical experience!');
  const [meetingLink, setMeetingLink] = useState<string>(candidate.meetingLink || 'https://meet.google.com/abc-defg-hij');

  const [starRating, setStarRating] = useState<number>(5);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'parsed' | 'audit' | 'interview' | 'action'>('parsed');

  const job = jobs.find((j) => j.id === candidate.appliedJobId);
  const resume = candidate.resume;

  useEffect(() => {
    if (candidate?.id) {
      fetch(`/api/recruiter/candidate-notes/${candidate.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.notes && data.notes.length > 0) {
            const latest = data.notes[data.notes.length - 1];
            if (latest.rating) setStarRating(latest.rating);
            if (latest.notes) setFeedback(latest.notes);
          }
        })
        .catch(() => {});
    }
  }, [candidate?.id]);

  const handleSave = async () => {
    try {
      await fetch('/api/recruiter/candidate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: candidate.id,
          jobId: candidate.appliedJobId,
          rating: starRating,
          notes: feedback,
          updatedBy: 'Recruiter Admin',
        }),
      });
    } catch (e) {
      console.warn('Saved locally');
    }

    onUpdateStatus(
      candidate.id,
      candidate.appliedJobId,
      status,
      feedback,
      interviewDate,
      interviewNote,
      meetingLink
    );
    setSaveSuccessMsg('Rating and interview feedback saved!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 1000);
  };

  const handleDownloadResume = () => {
    if (!resume) return;
    const content = `RESUME DOCUMENT: ${resume.fullName}\nEmail: ${resume.email} | Phone: ${resume.phone}\nSummary: ${resume.summary}\n\nRAW TEXT:\n${resume.rawText}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resume.fullName.replace(/\s+/g, '_')}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-xl space-y-5 max-h-[92vh] overflow-y-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-base sm:text-xl font-bold text-slate-900 font-sans truncate">{candidate.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-xl text-xs font-black font-mono border shrink-0 ${
                    candidate.matchScore >= 90
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : candidate.matchScore >= 80
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {candidate.matchScore}% Match
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span className="truncate">{candidate.headline}</span>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">Applied for <strong className="text-indigo-600">{job?.title || 'Job'}</strong></span>
              </p>
              {candidate.portfolioUrl && (
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-bold hover:underline text-[11px] inline-flex items-center gap-1 mt-0.5 truncate max-w-full"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">Portfolio: {candidate.portfolioUrl}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {resume && (
              <button
                type="button"
                id="download-candidate-resume-btn"
                onClick={handleDownloadResume}
                className="px-2.5 sm:px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1 border border-indigo-200 transition min-h-[38px]"
                title="Download candidate resume document"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download Resume</span>
              </button>
            )}
            <button
              id="close-candidate-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs - Mobile Horizontally Scrollable */}
        <div className="flex space-x-2 border-b border-slate-100 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('parsed')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeTab === 'parsed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Parsed Resume & Profile
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            ATS Audit & Skill Fit
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
              activeTab === 'interview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Schedule Interview / Inquiry
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'action'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Recruiter Action & Feedback
          </button>
        </div>

        {/* TAB 1: PARSED RESUME & WORK HISTORY */}
        {activeTab === 'parsed' && (
          <div className="space-y-4 text-xs">
            {resume ? (
              <>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-900 text-sm">Professional Executive Summary</div>
                  <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                </div>

                {/* Skills Breakdown */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Extracted Skill Taxonomy
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(resume.extractedSkills?.technical || []).map((sk: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-white text-slate-800 border border-slate-200 rounded-md font-semibold">
                        {sk}
                      </span>
                    ))}
                    {(resume.extractedSkills?.tools || []).map((t: string, i: number) => (
                      <span key={`t_${i}`} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Full Raw Resume Document Box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Original Document Raw Text
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadResume}
                      className="text-indigo-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Save File
                    </button>
                  </div>
                  <pre className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {resume.rawText}
                  </pre>
                </div>

                {/* Work Experience Timeline */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Work Experience History
                  </div>
                  <div className="space-y-3">
                    {(resume.workExperience || []).map((exp: any, i: number) => (
                      <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>{exp.role} @ {exp.company}</span>
                          <span className="text-slate-500 text-[10px] font-mono">{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5 mt-1">
                          {(exp.highlights || []).map((h: string, idx: number) => (
                            <li key={idx}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-slate-500 p-6 text-center">No parsed resume available</div>
            )}
          </div>
        )}

        {/* TAB 2: ATS AUDIT & FIT */}
        {activeTab === 'audit' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 text-[11px] font-medium">Overall Candidate Fit Score</div>
                <div className="text-3xl font-black text-emerald-600 font-mono my-1">{candidate.matchScore}%</div>
                <div className="text-[10px] text-slate-500">Calculated by Real Matching Algorithm</div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <div className="text-slate-500 text-[11px] font-medium">Resume ATS Formatting Health</div>
                <div className="text-3xl font-black text-indigo-600 font-mono my-1">{resume?.atsHealthScore || 90}%</div>
                <div className="text-[10px] text-slate-500">Clean taxonomy & contact validation</div>
              </div>
            </div>

            {resume?.strengths && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Key Strengths
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {resume.strengths.map((s: string, i: number) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SCHEDULE INTERVIEW & DIRECT INQUIRY */}
        {activeTab === 'interview' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-2">
              <div className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Schedule Direct Interview / Send Inquiry</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Send an invitation to <strong>{candidate.name}</strong> for a technical interview or inquiry call.
                The candidate will receive this alert in their Student Dashboard and can accept or request a time adjustment!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Proposed Interview Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Meeting Video Link (Google Meet / Zoom):
                </label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Interview Inquiry Message & Details for Candidate:
              </label>
              <textarea
                value={interviewNote}
                onChange={(e) => setInterviewNote(e.target.value)}
                placeholder="Details about the technical round, panel members, or preparation notes..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {candidate.candidateResponseStatus && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>Candidate Reaction: {candidate.candidateResponseStatus}</span>
                </div>
                {candidate.candidateResponseNote && (
                  <p className="text-amber-800 italic">{candidate.candidateResponseNote}</p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                id="send-interview-inquiry-btn"
                onClick={() => {
                  setStatus('Interview Scheduled');
                  onUpdateStatus(
                    candidate.id,
                    candidate.appliedJobId,
                    'Interview Scheduled',
                    feedback,
                    interviewDate,
                    interviewNote,
                    meetingLink
                  );
                  onClose();
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Interview Inquiry</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: RECRUITER ACTION & FEEDBACK */}
        {activeTab === 'action' && (
          <div className="space-y-4 text-xs">
            {saveSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Candidate Evaluation Rating (1-5 Stars) */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
              <label className="block text-slate-800 font-bold">
                Internal Recruiter Candidate Evaluation Rating (1–5 Stars):
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setStarRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= starRating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-extrabold text-amber-800 ml-2 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {starRating} / 5 Rating
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Update Candidate Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted 🌟 (Top Match)</option>
                <option value="Interview Scheduled">Interview Scheduled 📅</option>
                <option value="Offered">Offered 🏆</option>
                <option value="Pass">Pass</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Recruiter Interview Notes & Evaluation Feedback:
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write internal notes, technical interview evaluation, strengths/weaknesses for candidate or HR record..."
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                id="save-candidate-status-btn"
                onClick={handleSave}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Status & Send Notes</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

