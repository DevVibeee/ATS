import React from 'react';
import { Job, RecruiterProfile } from '../../types';
import { X, Building2, MapPin, Globe, Users, Briefcase, Calendar, CheckCircle2, DollarSign, ShieldCheck } from 'lucide-react';

interface CompanyDetailModalProps {
  job: Job;
  companyProfile?: RecruiterProfile;
  matchScore?: number;
  onClose: () => void;
  onApply?: () => void;
  onApplyJob?: (jobId: string) => void;
  hasApplied?: boolean;
  isEligible?: boolean;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  job,
  companyProfile,
  matchScore,
  onClose,
  onApply,
  onApplyJob,
  hasApplied,
  isEligible,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-4">
            <img
              src={job.companyLogo || companyProfile?.companyLogo}
              alt={job.companyName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 border border-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80';
              }}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900">{job.companyName}</h2>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200 uppercase">
                  Verified Recruiter
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{companyProfile?.industry || 'Enterprise SaaS & Cloud'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {job.location}</span>
              </p>
            </div>
          </div>

          <button
            id="close-company-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Users className="w-3 h-3 text-indigo-600" /> Company Size
            </div>
            <div className="font-bold text-slate-900">{companyProfile?.companySize || '100-500 employees'}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-indigo-600" /> Experience Req
            </div>
            <div className="font-bold text-slate-900">{job.minExperienceYears}+ years</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-indigo-600" /> Salary Band
            </div>
            <div className="font-bold text-slate-900">{job.salaryRange}</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
            <div className="text-slate-500 text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-indigo-600" /> Date Posted
            </div>
            <div className="font-bold text-slate-900">{job.postedDate}</div>
          </div>
        </div>

        {/* Company Description & Culture */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>About {job.companyName}</span>
          </h3>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {companyProfile?.description ||
              `${job.companyName} is an industry leader dedicated to high-impact technology solutions, developer velocity, and inclusive team culture.`}
          </p>
        </div>

        {/* Job Requirement Highlights */}
        <div className="space-y-3 text-xs">
          <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Job Role Specification: {job.title}</span>
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="text-slate-700 font-medium whitespace-pre-line leading-relaxed">
              {job.description}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-800 text-[11px]">Required Technical Competencies:</div>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.map((sk) => (
                <span key={sk} className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
            <div className="space-y-2">
              <div className="font-bold text-slate-800 text-[11px]">Nice-To-Have Skills:</div>
              <div className="flex flex-wrap gap-1.5">
                {job.niceToHaveSkills.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 font-bold rounded-lg text-xs">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {companyProfile?.website ? (
            <a
              href={companyProfile.website}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Visit Official Website</span>
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              Close
            </button>
            {(onApply || onApplyJob) && (
              <button
                onClick={() => {
                  if (onApplyJob) {
                    onApplyJob(job.id);
                  } else if (onApply) {
                    onApply();
                  }
                }}
                disabled={hasApplied}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  hasApplied
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasApplied ? 'Already Applied' : 'Apply For This Position'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
