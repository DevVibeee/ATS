import React, { useState } from 'react';
import { Job } from '../../types';
import { X, Wand2, Plus, Sparkles, Building2, MapPin, DollarSign, Target } from 'lucide-react';

interface PostJobModalProps {
  recruiterId: string;
  companyName: string;
  companyLogo: string;
  onClose: () => void;
  onJobCreated: (newJob: Job) => void;
  jobToEdit?: Job | null;
  onJobUpdated?: (updatedJob: Job) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  recruiterId,
  companyName,
  companyLogo,
  onClose,
  onJobCreated,
  jobToEdit,
  onJobUpdated,
}) => {
  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [department, setDepartment] = useState(jobToEdit?.department || 'Engineering');
  const [location, setLocation] = useState(jobToEdit?.location || 'San Francisco, CA');
  const [locationType, setLocationType] = useState<'Remote' | 'Hybrid' | 'Onsite'>(jobToEdit?.locationType || 'Hybrid');
  const [employmentType, setEmploymentType] = useState<'Full-Time' | 'Part-Time' | 'Contract' | 'Internship'>(jobToEdit?.employmentType || 'Full-Time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry-level' | 'Mid-level' | 'Senior' | 'Lead'>(jobToEdit?.experienceLevel || 'Mid-level');
  const [salaryRange, setSalaryRange] = useState(jobToEdit?.salaryRange || '$125,000 - $155,000 / year');
  const [description, setDescription] = useState(jobToEdit?.description || '');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(jobToEdit?.requiredSkills || ['React', 'TypeScript', 'Node.js']);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>(jobToEdit?.niceToHaveSkills || ['Docker', 'PostgreSQL']);
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>(jobToEdit?.mustHaveSkills || ['React', 'TypeScript']);
  const [skillWeights, setSkillWeights] = useState<Record<string, number>>(jobToEdit?.skillWeights || {
    'React': 2.0,
    'TypeScript': 1.5,
    'Node.js': 1.0,
  });
  const [minExperienceYears, setMinExperienceYears] = useState(jobToEdit?.minExperienceYears || 3);
  const [expiryDays, setExpiryDays] = useState<number>(jobToEdit?.expiryDays || 7);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [reqInput, setReqInput] = useState('');
  const [niceInput, setNiceInput] = useState('');

  const toggleMustHave = (sk: string) => {
    if (mustHaveSkills.includes(sk)) {
      setMustHaveSkills(mustHaveSkills.filter((s) => s !== sk));
    } else {
      setMustHaveSkills([...mustHaveSkills, sk]);
    }
  };

  const updateSkillWeight = (sk: string, weight: number) => {
    setSkillWeights({ ...skillWeights, [sk]: weight });
  };

  // AI Job Description Enhancer using Gemini API
  const handleEnhanceWithAI = async () => {
    if (!description.trim() && !title.trim()) return;
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/enhance-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, rawDescription: description }),
      });

      const data = await res.json();
      if (data.enhanced) {
        if (data.enhanced.title) setTitle(data.enhanced.title);
        if (data.enhanced.description) setDescription(data.enhanced.description);
        if (data.enhanced.requiredSkills) setRequiredSkills(data.enhanced.requiredSkills);
        if (data.enhanced.niceToHaveSkills) setNiceToHaveSkills(data.enhanced.niceToHaveSkills);
        if (data.enhanced.minExperienceYears) setMinExperienceYears(data.enhanced.minExperienceYears);
      }
    } catch (e) {
      console.error('Enhancement error:', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAddReqSkill = () => {
    if (reqInput.trim() && !requiredSkills.includes(reqInput.trim())) {
      setRequiredSkills([...requiredSkills, reqInput.trim()]);
      setReqInput('');
    }
  };

  const handleAddNiceSkill = () => {
    if (niceInput.trim() && !niceToHaveSkills.includes(niceInput.trim())) {
      setNiceToHaveSkills([...niceToHaveSkills, niceInput.trim()]);
      setNiceInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    let computedExpiresAt: string | undefined = undefined;
    if (expiryDays > 0) {
      computedExpiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
    }

    if (jobToEdit && onJobUpdated) {
      const updated: Job = {
        ...jobToEdit,
        title,
        department,
        location,
        locationType,
        employmentType,
        experienceLevel,
        salaryRange,
        description,
        requiredSkills,
        niceToHaveSkills,
        mustHaveSkills,
        skillWeights,
        minExperienceYears,
        expiryDays,
        expiresAt: computedExpiresAt,
      };
      onJobUpdated(updated);
    } else {
      const newJob: Job = {
        id: 'job_' + Date.now(),
        recruiterId,
        companyName,
        companyLogo,
        title,
        department,
        location,
        locationType,
        employmentType,
        experienceLevel,
        salaryRange,
        description,
        requiredSkills,
        niceToHaveSkills,
        mustHaveSkills,
        skillWeights,
        minExperienceYears,
        postedDate: new Date().toISOString().split('T')[0],
        expiryDays,
        expiresAt: computedExpiresAt,
        status: 'Active',
      };
      onJobCreated(newJob);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              {jobToEdit ? 'Edit Job Description' : 'Post New Text Job Description'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Post or update job requirements. Configure auto-deletion duration and ATS weights.
            </p>
          </div>

          <button
            id="close-post-job-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full Stack Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Workplace Type</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Salary Range</label>
              <input
                type="text"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Auto Expiry Duration Control */}
          <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80 space-y-1">
            <label className="block text-amber-900 font-bold text-xs flex items-center justify-between">
              <span>⏳ Automatic Job Expiration & Deletion Timer:</span>
              <span className="text-[10px] text-amber-800 font-normal">Job will automatically expire after this duration</span>
            </label>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value))}
              className="w-full bg-white border border-amber-300 rounded-xl p-2 text-xs font-bold text-amber-900 focus:outline-none"
            >
              <option value={1}>1 Day (24 Hours Flash Hiring)</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks)</option>
              <option value={30}>30 Days (1 Month)</option>
              <option value={0}>Never (Manual Deletion Only)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold">Job Description Text *</label>
              <button
                type="button"
                disabled={isEnhancing}
                onClick={handleEnhanceWithAI}
                className="text-[11px] text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                <span>Auto-Extract Skills & Enhance JD with AI</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              placeholder="Paste job description text here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Required Skills Chips */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Required Skills (Mandatory for 80% Threshold)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add skill (e.g. React)..."
                value={reqInput}
                onChange={(e) => setReqInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {requiredSkills.map((sk, i) => {
                const isMustHave = mustHaveSkills.includes(sk);
                const weight = skillWeights[sk] || 1.0;
                return (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{sk}</span>
                      <button
                        type="button"
                        onClick={() => toggleMustHave(sk)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                          isMustHave
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {isMustHave ? '🔥 Must-Have' : '+ Optional'}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 font-medium">ATS Weight:</span>
                      <select
                        value={weight}
                        onChange={(e) => updateSkillWeight(sk, parseFloat(e.target.value))}
                        className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-mono font-bold text-indigo-700"
                      >
                        <option value={1.0}>1.0x (Standard)</option>
                        <option value={1.5}>1.5x (High Priority)</option>
                        <option value={2.0}>2.0x (Critical Core)</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== sk))}
                        className="text-slate-400 hover:text-rose-600 font-bold ml-1 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              id="submit-create-job-btn"
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
            >
              Post Job Posting
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
