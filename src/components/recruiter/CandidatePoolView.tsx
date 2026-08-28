import React, { useState } from 'react';
import { Job, ApplicationStatus } from '../../types';
import { Search, Sparkles, Star, CheckCircle2, User, FileText, ArrowUpRight, MessageSquare, Filter, Building2, Eye, Download, CheckSquare, Square, Mail, Send, X } from 'lucide-react';

interface CandidatePoolViewProps {
  candidates: any[];
  jobs: Job[];
  onSelectCandidate: (candidate: any) => void;
  onUpdateCandidateStatus: (candidateId: string, jobId: string, newStatus: ApplicationStatus, feedback?: string) => void;
}

export const CandidatePoolView: React.FC<CandidatePoolViewProps> = ({
  candidates,
  jobs,
  onSelectCandidate,
  onUpdateCandidateStatus,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionModal, setBulkActionModal] = useState<{ isOpen: boolean; status: ApplicationStatus | null }>({
    isOpen: false,
    status: null,
  });
  const [bulkEmailTemplate, setBulkEmailTemplate] = useState('');
  const [bulkSuccessAlert, setBulkSuccessAlert] = useState<string | null>(null);

  // Filter candidates safely
  const candidateList = Array.isArray(candidates) ? candidates : [];
  const jobList = Array.isArray(jobs) ? jobs : [];

  const filteredCandidates = candidateList.filter((cand) => {
    if (!cand) return false;
    const matchesJob = selectedJobId === 'all' || cand.appliedJobId === selectedJobId;
    const query = (searchQuery || '').trim().toLowerCase();
    const candName = (cand.name || cand.fullName || '').toLowerCase();
    const candEmail = (cand.email || '').toLowerCase();
    const candHeadline = (cand.headline || cand.role || cand.title || '').toLowerCase();
    
    const matchesSearch =
      !query ||
      candName.includes(query) ||
      candEmail.includes(query) ||
      candHeadline.includes(query);
    const matchesScore = (cand.matchScore ?? 0) >= minScoreFilter;

    return matchesJob && matchesSearch && matchesScore;
  });

  // Sort candidates by match score descending (90-100% candidates strictly at the top)
  const sortedCandidates = [...filteredCandidates].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  const topTier = sortedCandidates.filter((c) => (c.matchScore ?? 0) >= 90);
  const midTier = sortedCandidates.filter((c) => (c.matchScore ?? 0) >= 80 && (c.matchScore ?? 0) < 90);
  const lowerTier = sortedCandidates.filter((c) => (c.matchScore ?? 0) < 80);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === sortedCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedCandidates.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleOpenBulkModal = (status: ApplicationStatus) => {
    let defaultMsg = '';
    if (status === 'Shortlisted') {
      defaultMsg = 'Congratulations! Your profile has met our initial ATS requirements and is shortlisted for further review.';
    } else if (status === 'Interview Scheduled') {
      defaultMsg = 'We are excited to invite you for an interview! Please review the attached interview details.';
    } else if (status === 'Pass') {
      defaultMsg = 'Thank you for your application. Although your qualifications were impressive, we have chosen to proceed with other candidates.';
    }
    setBulkEmailTemplate(defaultMsg);
    setBulkActionModal({ isOpen: true, status });
  };

  const handleExecuteBulkAction = () => {
    if (!bulkActionModal.status || selectedIds.length === 0) return;

    selectedIds.forEach((id) => {
      const cand = candidateList.find((c) => c && c.id === id);
      if (cand) {
        onUpdateCandidateStatus(cand.id, cand.appliedJobId, bulkActionModal.status!, bulkEmailTemplate);
      }
    });

    const count = selectedIds.length;
    const statusName = bulkActionModal.status;
    setSelectedIds([]);
    setBulkActionModal({ isOpen: false, status: null });
    setBulkSuccessAlert(`Successfully updated ${count} candidates to "${statusName}" and sent notification template!`);
    setTimeout(() => setBulkSuccessAlert(null), 4000);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Alert Notification */}
      {bulkSuccessAlert && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bulkSuccessAlert}</span>
          </div>
          <button onClick={() => setBulkSuccessAlert(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Job Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search candidate name, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              id="filter-top-tier-btn"
              onClick={() => setMinScoreFilter(minScoreFilter === 90 ? 0 : 90)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                minScoreFilter === 90
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>90-100% Shortlist Only ({topTier.length})</span>
            </button>
          </div>
        </div>

        {/* BULK SELECTION ACTIONS BAR */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition"
            >
              {selectedIds.length === sortedCandidates.length && sortedCandidates.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({selectedIds.length}/{sortedCandidates.length})</span>
            </button>
            {selectedIds.length > 0 && (
              <span className="text-slate-500 font-medium hidden sm:inline">
                {selectedIds.length} candidate{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Bulk Actions:</span>
              <button
                type="button"
                onClick={() => handleOpenBulkModal('Shortlisted')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition"
              >
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>Bulk Shortlist ({selectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenBulkModal('Interview Scheduled')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Invite to Interview</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenBulkModal('Pass')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs border border-rose-200 transition"
              >
                <span>Bulk Reject</span>
              </button>
            </div>
          ) : (
            <span className="text-slate-400 italic text-[11px]">Select checkboxes to enable bulk candidate status updates and email notifications.</span>
          )}
        </div>
      </div>

      {/* SECTION 1: TOP TIER CANDIDATES (90-100% AUTOMATIC SHORTLIST ORDER) */}
      {topTier.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              Top Candidate Shortlist (90% - 100% Match Tier)
            </h3>
            <span className="text-xs text-amber-900 font-mono font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              {topTier.length} Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topTier.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                jobs={jobs}
                isSelected={selectedIds.includes(cand.id)}
                onToggleSelect={() => handleToggleSelect(cand.id)}
                onSelectCandidate={onSelectCandidate}
                onUpdateCandidateStatus={onUpdateCandidateStatus}
                isTopTier
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: QUALIFIED MID TIER (80-89%) */}
      {midTier.length > 0 && minScoreFilter < 90 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mt-6">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Qualified Applicants (80% - 89% Match Tier)
            </h3>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              {midTier.length} Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {midTier.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                jobs={jobs}
                isSelected={selectedIds.includes(cand.id)}
                onToggleSelect={() => handleToggleSelect(cand.id)}
                onSelectCandidate={onSelectCandidate}
                onUpdateCandidateStatus={onUpdateCandidateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SKILL GAP POOL (<80%) */}
      {lowerTier.length > 0 && minScoreFilter < 80 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mt-6">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              Skill Gap Needed Pool (&lt;80% Match)
            </h3>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              {lowerTier.length} Candidates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowerTier.map((cand) => (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                jobs={jobs}
                isSelected={selectedIds.includes(cand.id)}
                onToggleSelect={() => handleToggleSelect(cand.id)}
                onSelectCandidate={onSelectCandidate}
                onUpdateCandidateStatus={onUpdateCandidateStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* BULK ACTION CONFIRMATION MODAL */}
      {bulkActionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Bulk {bulkActionModal.status} ({selectedIds.length} Candidates)
                </h3>
              </div>
              <button onClick={() => setBulkActionModal({ isOpen: false, status: null })} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are updating <strong>{selectedIds.length} candidates</strong> to status <span className="font-bold text-indigo-600">{bulkActionModal.status}</span>. An automated response email template will be generated for all selected candidates.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Notification Email Message Template:</label>
              <textarea
                rows={4}
                value={bulkEmailTemplate}
                onChange={(e) => setBulkEmailTemplate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBulkActionModal({ isOpen: false, status: null })}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteBulkAction}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send to {selectedIds.length} Candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

interface CandidateCardProps {
  candidate: any;
  jobs: Job[];
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onSelectCandidate: (candidate: any) => void;
  onUpdateCandidateStatus: (candidateId: string, jobId: string, newStatus: ApplicationStatus, feedback?: string) => void;
  isTopTier?: boolean;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  jobs,
  isSelected,
  onToggleSelect,
  onSelectCandidate,
  onUpdateCandidateStatus,
  isTopTier,
}) => {
  const job = (jobs || []).find((j) => j && j.id === candidate.appliedJobId);
  const candName = candidate.name || candidate.fullName || 'Candidate';
  const candAvatar = candidate.avatar || candidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
  const candHeadline = candidate.headline || candidate.title || candidate.role || 'Job Applicant';
  const matchScore = candidate.matchScore ?? 0;
  const skillsList = candidate.resume?.extractedSkills?.technical || candidate.skills || [];

  return (
    <div
      className={`bg-white border rounded-2xl p-5 space-y-4 transition-all hover:shadow-md flex flex-col justify-between ${
        isSelected ? 'ring-2 ring-indigo-600 border-indigo-400 bg-indigo-50/10' : ''
      } ${
        isTopTier
          ? 'border-amber-300 shadow-sm bg-gradient-to-br from-white via-amber-50/20 to-white'
          : 'border-slate-200'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center space-x-3">
            {onToggleSelect && (
              <button
                type="button"
                onClick={onToggleSelect}
                className="p-1 text-slate-400 hover:text-indigo-600 transition"
              >
                {isSelected ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300" />
                )}
              </button>
            )}
            <img
              src={candAvatar}
              alt={candName}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/30"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-slate-900 text-base font-sans">{candName}</h4>
                {isTopTier && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                    90%+ Shortlist
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{candHeadline}</p>
            </div>
          </div>

          {/* Match Badge */}
          <div className="text-right shrink-0">
            <div
              className={`px-3 py-1 rounded-xl font-mono text-sm font-black border ${
                matchScore >= 90
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : matchScore >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {matchScore}% Match
            </div>
          </div>
        </div>

        {job && (
          <div className="text-xs text-indigo-700 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 my-2 flex items-center justify-between">
            <span>Applied Job: {job.title}</span>
            <span className="text-[10px] text-slate-500 font-medium">
              {candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString() : 'Active'}
            </span>
          </div>
        )}

        {candidate.candidateResponseStatus && (
          <div className="my-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-lg text-xs font-bold flex items-center justify-between">
            <span>Candidate Reaction:</span>
            <span
              className={
                candidate.candidateResponseStatus === 'Accepted'
                  ? 'text-emerald-700 font-extrabold'
                  : candidate.candidateResponseStatus === 'Reschedule Requested'
                  ? 'text-amber-700 font-extrabold'
                  : 'text-rose-700 font-extrabold'
              }
            >
              {candidate.candidateResponseStatus}{' '}
              {candidate.candidateResponseStatus === 'Accepted'
                ? '✓'
                : candidate.candidateResponseStatus === 'Reschedule Requested'
                ? '⏰'
                : '✕'}
            </span>
          </div>
        )}

        {/* Skills Preview */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {skillsList.slice(0, 5).map((sk: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold"
            >
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <select
          value={candidate.status || 'Under Review'}
          onChange={(e) =>
            onUpdateCandidateStatus(candidate.id, candidate.appliedJobId, e.target.value as ApplicationStatus)
          }
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-indigo-900 font-semibold focus:outline-none"
        >
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted 🌟</option>
          <option value="Interview Scheduled">Interview Scheduled 📅</option>
          <option value="Offered">Offered 🏆</option>
          <option value="Pass">Pass</option>
        </select>

        <button
          id={`view-candidate-details-btn-${candidate.id}`}
          onClick={() => onSelectCandidate(candidate)}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 transition shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Full Audit</span>
        </button>
      </div>

    </div>
  );
};
