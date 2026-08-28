import React, { useState } from 'react';
import { ParsedResume, User } from '../../types';
import { FileText, UploadCloud, CheckCircle2, AlertTriangle, Sparkles, Wand2, ShieldCheck, Tag, ArrowRight, UserCheck } from 'lucide-react';
import { SAMPLE_PRESET_STUDENT_USERS } from '../../data/mockData';

interface ResumeUploaderProps {
  currentResume: ParsedResume | null;
  onResumeParsed: (parsed: ParsedResume) => void;
  onSelectPresetUser?: (presetUser: User) => void;
  isParsing: boolean;
  setIsParsing: (loading: boolean) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentResume,
  onResumeParsed,
  onSelectPresetUser,
  isParsing,
  setIsParsing,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('My_Resume_2026.pdf');

  const handleParseText = async (textToParse: string, fileName: string) => {
    if (!textToParse.trim()) return;
    setIsParsing(true);

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: textToParse, fileName }),
      });

      const data = await response.json();
      if (data.parsed) {
        onResumeParsed(data.parsed);
      }
    } catch (err) {
      console.error('Parsing error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsing(true);

    let cloudinaryResumeUrl = '';

    // Read as DataURL to upload to Cloudinary
    const readerBase64 = new FileReader();
    readerBase64.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        try {
          const cloudRes = await fetch('/api/upload/cloudinary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64Data,
              folder: 'candidate_resumes',
              resourceType: 'auto',
            }),
          });
          const cloudJson = await cloudRes.json();
          if (cloudJson.url) {
            cloudinaryResumeUrl = cloudJson.url;
          }
        } catch (cloudErr) {
          console.error('Cloudinary resume upload error:', cloudErr);
        }
      }

      // Also read text content for parsing
      const readerText = new FileReader();
      readerText.onload = async (textEv) => {
        const content = (textEv.target?.result as string) || file.name;
        try {
          const response = await fetch('/api/parse-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeText: content, fileName: file.name }),
          });

          const data = await response.json();
          if (data.parsed) {
            if (cloudinaryResumeUrl) {
              data.parsed.resumeUrl = cloudinaryResumeUrl;
            }
            onResumeParsed(data.parsed);
          }
        } catch (err) {
          console.error('Parsing error:', err);
        } finally {
          setIsParsing(false);
        }
      };
      readerText.readAsText(file);
    };

    readerBase64.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-sans">
              <FileText className="w-5 h-5 text-indigo-600" />
              ATS Resume Parser & Profile Extractor
            </h2>
            <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-mono font-bold">
              AI Parser
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Upload your resume or pick a preset to analyze keyword taxonomy, soft skills, and ATS formatting health.
          </p>
        </div>

        {currentResume && (
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-xs text-slate-500 font-medium">ATS Health Score</div>
              <div className="text-lg font-bold text-emerald-600 font-mono">
                {currentResume.atsHealthScore} / 100
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modes Sub-tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          id="tab-upload-btn"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'upload'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Upload Document
        </button>
        <button
          id="tab-paste-btn"
          onClick={() => setActiveTab('paste')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
            activeTab === 'paste'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Paste Plain Text
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'upload' && (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:border-indigo-400 transition">
          <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Drag & Drop PDF, DOCX, or TXT file here
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Supports standard resume formats up to 10MB
          </p>
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition">
            <UploadCloud className="w-4 h-4" />
            <span>Select Resume File</span>
            <input
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {activeTab === 'paste' && (
        <div className="space-y-3">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume text here (Summary, Skills, Work Experience, Education)..."
            rows={6}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-mono"
          />
          <button
            id="parse-pasted-text-btn"
            disabled={!pastedText.trim() || isParsing}
            onClick={() => handleParseText(pastedText, 'pasted_resume.txt')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition disabled:opacity-50"
          >
            {isParsing ? (
              <>
                <Wand2 className="w-4 h-4 animate-spin text-white" />
                <span>AI Parsing Resume...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Parse & Extract Profile</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading state indicator */}
      {isParsing && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-bounce" />
          <div className="text-xs">
            <div className="font-bold text-indigo-950">Running Pretrained LLM ATS Parser...</div>
            <div className="text-indigo-700">Extracting taxonomy, skill categories, and formatting health metrics...</div>
          </div>
        </div>
      )}

      {/* Currently Parsed Resume Summary Breakdown */}
      {currentResume && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-sans">
                {currentResume.fullName}
              </h3>
              <p className="text-xs text-slate-500">
                {currentResume.email} • {currentResume.phone} • File: {currentResume.fileName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg font-mono">
                {currentResume.extractedSkills.technical.length} Tech Skills Found
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Extracted Technical Skills */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Technical & Tool Taxonomy
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {currentResume.extractedSkills.technical.map((skill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-[11px] font-semibold"
                  >
                    {skill}
                  </span>
                ))}
                {currentResume.extractedSkills.tools.map((tool, i) => (
                  <span
                    key={`t_${i}`}
                    className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md text-[11px] font-semibold"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* ATS Strengths & Formatting Health */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ATS Health & Formatting Insights
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {currentResume.strengths.slice(0, 2).map((st, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
                {currentResume.formattingIssues.map((issue, i) => (
                  <li key={`iss_${i}`} className="flex items-start gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
