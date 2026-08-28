import React from 'react';
import { Job, SkillGapAnalysis, ParsedResume } from '../../types';
import { Target, CheckCircle2, XCircle, AlertCircle, Sparkles, BookOpen, Clock, Lock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface SkillGapViewProps {
  job: Job;
  resume: ParsedResume | null;
  analysis: SkillGapAnalysis | null;
  onApplyClick: () => void;
  hasApplied: boolean;
  onClose?: () => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({
  job,
  resume,
  analysis,
  onApplyClick,
  hasApplied,
  onClose,
}) => {
  if (!analysis) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-spin mb-2" />
        <p className="text-sm">Calculating semantic match vector and skill gap breakdown...</p>
      </div>
    );
  }

  const isEligibleToApply = analysis.overallMatchScore >= 80;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">
              {job.employmentType} • {job.locationType}
            </span>
            <span className="text-xs text-slate-500 font-medium">{job.department}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-sans">{job.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {job.companyName} • {job.location} • Min {job.minExperienceYears} Yrs Exp Needed
          </p>
        </div>

        {/* Big Match Meter */}
        <div className="flex items-center space-x-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Overall Match Score</div>
            <div
              className={`text-2xl font-black font-mono ${
                analysis.overallMatchScore >= 80
                  ? 'text-emerald-600'
                  : analysis.overallMatchScore >= 60
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            >
              {analysis.overallMatchScore}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center bg-white shadow-sm">
            <Target className={`w-6 h-6 ${analysis.overallMatchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}`} />
          </div>
        </div>
      </div>

      {/* 80% Threshold Status Callout Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isEligibleToApply
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-start space-x-3">
          {isEligibleToApply ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Lock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">
              {isEligibleToApply
                ? 'Eligible to Apply (Score >= 80%)'
                : 'Application Locked (Requires 80%+ Skill Match)'}
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {isEligibleToApply
                ? 'Your resume and profile reach the recruiter minimum ATS match score. You can apply directly!'
                : `You currently match ${analysis.overallMatchScore}%. Review the skill gap action plan below to learn missing skills and boost your match.`}
            </p>
          </div>
        </div>

        <div>
          {hasApplied ? (
            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Applied
            </span>
          ) : isEligibleToApply ? (
            <button
              id={`apply-job-now-btn-${job.id}`}
              onClick={onApplyClick}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition whitespace-nowrap"
            >
              <span>1-Click Apply</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="px-4 py-2 bg-white text-slate-500 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              Need {(80 - analysis.overallMatchScore)}% More
            </span>
          )}
        </div>
      </div>

      {/* Match Scores Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium mb-1">Keyword Overlap Score</div>
          <div className="text-lg font-bold text-slate-900 font-mono">{analysis.keywordMatchScore}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${analysis.keywordMatchScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium mb-1">Semantic Context Score</div>
          <div className="text-lg font-bold text-slate-900 font-mono">{analysis.semanticMatchScore}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: `${analysis.semanticMatchScore}%` }} />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-500 font-medium mb-1">Experience Alignment</div>
          <div className="text-lg font-bold text-slate-900 font-mono flex items-center gap-1.5">
            <span>{analysis.experienceMatch.candidateYears} / {analysis.experienceMatch.requiredYears} Yrs</span>
            {analysis.experienceMatch.isMet ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 inline" />
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-1">
            {analysis.experienceMatch.isMet ? 'Required experience met' : 'Below required experience level'}
          </p>
        </div>
      </div>

      {/* Required vs Nice-to-have Skill Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Required Skills Matrix */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            Required Skills Analysis
          </h3>

          <div>
            <div className="text-[11px] text-emerald-700 font-bold mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Matched Required Skills ({analysis.matchedRequiredSkills.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.matchedRequiredSkills.length === 0 ? (
                <span className="text-xs text-slate-500 italic">None matched yet</span>
              ) : (
                analysis.matchedRequiredSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {sk}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-rose-700 font-bold mb-1.5 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Missing Required Skills ({analysis.missingRequiredSkills.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingRequiredSkills.length === 0 ? (
                <span className="text-xs text-emerald-700 font-bold">All required skills matched!</span>
              ) : (
                analysis.missingRequiredSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <XCircle className="w-3 h-3 text-rose-600" />
                    {sk}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Nice-to-have Matrix */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Nice-To-Have Skills
          </h3>

          <div>
            <div className="text-[11px] text-emerald-700 font-bold mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Matched Bonus Skills ({analysis.matchedNiceSkills.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.matchedNiceSkills.length === 0 ? (
                <span className="text-xs text-slate-500 italic">None matched</span>
              ) : (
                analysis.matchedNiceSkills.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-semibold"
                  >
                    {sk}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-600 font-bold mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              Optional Skill Extensions ({analysis.missingNiceSkills.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.missingNiceSkills.map((sk, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* AI Skill Gap Action Roadmap */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Skill Gap Action Plan & Learning Roadmap
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            AI Generated Bridge Strategy
          </span>
        </div>

        <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-sans">
          {analysis.aiFeedback}
        </p>

        <div className="space-y-2">
          {analysis.bridgeActionPlan.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{item.missingSkill}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.importance === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {item.importance}
                  </span>
                </div>
                <div className="text-slate-600">{item.learningAction}</div>
              </div>

              <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Est. ~{item.estimatedHours} hrs</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
