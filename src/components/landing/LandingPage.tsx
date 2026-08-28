import React, { useState } from 'react';
import { UserRole, User, DeveloperProfile } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileText,
  Zap,
  BarChart3,
  Cpu,
  Globe,
  Github,
  Award,
  Users,
  Search,
  Bot,
  SlidersHorizontal,
  ChevronRight,
  Code2,
  Brain,
  Star,
  Terminal,
  ExternalLink,
  Play,
  LogOut,
  UserCheck
} from 'lucide-react';
import { MOCK_STUDENT_USER, MOCK_RECRUITER_USER } from '../../data/mockData';

interface LandingPageProps {
  onLogin: (user: User, role: UserRole) => void;
  onOpenAdminLogin: () => void;
  onOpenAuthModal: (role?: UserRole, tab?: 'signin' | 'signup') => void;
  developerProfile: DeveloperProfile;
  isAuthenticated?: boolean;
  currentUser?: User;
  currentRole?: UserRole;
  onGoToDashboard?: () => void;
  onSignOut?: () => void;
}

const SAMPLE_DEMO_TEXT = `Sanaullah Shah
Senior AI & Full-Stack Systems Engineer
sanaullah786shah92@gmail.com | github.com/sanaullah-ai | huggingface.co/sanaullah7964

SUMMARY
Expert AI Engineer specializing in enterprise RAG architectures, LLM fine-tuning, vector search databases, full-stack React/TypeScript web apps, and high-performance microservices.

SKILLS
- AI/ML: Gemini API, OpenAI API, LangChain, PyTorch, Hugging Face, Vector DBs, RAG
- Frontend: React 18, TypeScript, Tailwind CSS, Next.js, Redux, Motion
- Backend & Cloud: Node.js, Express, Python, FastAPI, Docker, PostgreSQL, Firestore

WORK EXPERIENCE
Lead AI Architect — Cognitive SaaS Labs (2022 – Present)
- Built enterprise resume parsing engines processing 100k+ candidate profiles with sub-200ms latency.
- Implemented real-time 80% ATS match guard for recruiter candidate filtering.`;

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onOpenAdminLogin,
  onOpenAuthModal,
  developerProfile,
  isAuthenticated,
  currentUser,
  currentRole,
  onGoToDashboard,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'recruiters' | 'engine'>('candidates');
  const [testerText, setTesterText] = useState(SAMPLE_DEMO_TEXT);
  const [parsedDemoResult, setParsedDemoResult] = useState<{
    score: number;
    skills: string[];
    name: string;
    email: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestResume = () => {
    setIsTesting(true);
    setTimeout(() => {
      setParsedDemoResult({
        score: 94,
        skills: ['Gemini API', 'React', 'TypeScript', 'Node.js', 'PyTorch', 'Vector DBs', 'FastAPI', 'Tailwind CSS'],
        name: 'Sanaullah Shah',
        email: 'sanaullah786shah92@gmail.com',
      });
      setIsTesting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* 1. PUBLIC NAVBAR HEADER */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div
            onClick={() => onGoToDashboard && onGoToDashboard()}
            className={`flex items-center space-x-3 ${isAuthenticated ? 'cursor-pointer group' : ''}`}
            title={isAuthenticated ? 'Go to Dashboard' : 'AuraATS Enterprise'}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Aura<span className="text-indigo-400">ATS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v3.2 Enterprise
                </span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">
                AI Talent Acquisition & Career Platform
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition">How It Works</a>
            <a href="#live-tester" className="hover:text-indigo-400 transition">Live ATS Tester</a>
            <a href="#developer" className="hover:text-indigo-400 transition">Developer Profile</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAuthenticated && currentUser ? (
              <>
                {onOpenAdminLogin && currentRole === 'admin' && (
                  <button
                    onClick={onOpenAdminLogin}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                    title="SaaS Systems Control Center"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Admin Access</span>
                  </button>
                )}

                {/* Authenticated user pill */}
                <div className="flex items-center space-x-2 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-500/50"
                  />
                  <div className="hidden sm:block text-left text-xs">
                    <span className="font-bold text-slate-200 block leading-tight max-w-[110px] truncate">{currentUser.name}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase">
                      {currentRole === 'student' ? 'Candidate' : currentRole === 'recruiter' ? 'Recruiter' : 'Admin'}
                    </span>
                  </div>
                </div>

                {onGoToDashboard && (
                  <button
                    id="landing-go-to-dashboard-btn"
                    onClick={onGoToDashboard}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
                    title="Return to your active dashboard session"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {onSignOut && (
                  <button
                    id="landing-signout-btn"
                    onClick={onSignOut}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 hover:border-rose-700/50 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                    title="Sign Out of Portal"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onOpenAdminLogin}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="SaaS Systems Control Center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Admin Access</span>
                </button>

                <button
                  onClick={() => onOpenAuthModal('student', 'signin')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  Sign In
                </button>

                <button
                  onClick={() => onOpenAuthModal('student', 'signup')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Next-Gen Enterprise Resume Parsing & Match Guard System</span>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Bridge the Gap Between <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-300 to-emerald-400">Talent & Corporate Careers</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              AuraATS empowers software candidates to optimize their resumes for strict Applicant Tracking Systems, while providing recruiters with automated 80% skill match eligibility filters and instant talent shortlists.
            </p>
          </div>

          {/* Action CTAs & 1-Click Portals */}
          {isAuthenticated && currentUser ? (
            <div className="space-y-4 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-inner">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Active Session: Signed in as <strong>{currentUser.name}</strong> (
                  {currentRole === 'student' ? 'Candidate Portal' : currentRole === 'recruiter' ? 'Recruiter Portal' : 'SaaS Admin'}
                  )
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {onGoToDashboard && (
                  <button
                    onClick={onGoToDashboard}
                    className="px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                  >
                    {currentRole === 'student' ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : currentRole === 'recruiter' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    <span>
                      Return to {currentRole === 'student' ? 'Candidate Dashboard' : currentRole === 'recruiter' ? 'Recruiter Workspace' : 'Admin Portal'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {currentRole === 'student' ? (
                  <button
                    onClick={() => onLogin(MOCK_RECRUITER_USER, 'recruiter')}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 transition"
                  >
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span>Launch Recruiter Workspace</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onLogin(MOCK_STUDENT_USER, 'student')}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 transition"
                  >
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span>Launch Candidate Portal</span>
                  </button>
                )}

                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="px-4 py-3 bg-slate-950 hover:bg-rose-950/40 text-rose-400 border border-slate-800 hover:border-rose-800/40 font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onLogin(MOCK_STUDENT_USER, 'student')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Launch Candidate Portal (Demo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onLogin(MOCK_RECRUITER_USER, 'recruiter')}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Briefcase className="w-4 h-4 text-blue-400" />
                <span>Launch Recruiter Workspace (Demo)</span>
              </button>

              <button
                onClick={onOpenAdminLogin}
                className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-slate-800 font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>SaaS Admin Portal</span>
              </button>
            </div>
          )}

          {/* Highlights Metrics Cards */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-xl font-extrabold text-indigo-400 font-mono">≥ 80%</div>
              <div className="text-xs font-semibold text-slate-300">Automated Match Guard</div>
              <div className="text-[10px] text-slate-500">Enforces high candidate fit before applying</div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">Sub-200ms</div>
              <div className="text-xs font-semibold text-slate-300">Parsing Latency</div>
              <div className="text-[10px] text-slate-500">Fast deterministic & AI LLM skill extraction</div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-xl font-extrabold text-blue-400 font-mono">200+</div>
              <div className="text-xs font-semibold text-slate-300">Tech Taxonomy Skills</div>
              <div className="text-[10px] text-slate-500">Recognizes modern frameworks & stacks</div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
              <div className="text-xl font-extrabold text-purple-400 font-mono">Isolated</div>
              <div className="text-xs font-semibold text-slate-300">Strict RBAC Portals</div>
              <div className="text-[10px] text-slate-500">Separate Student, Recruiter & Admin views</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PLATFORM CORE FEATURES SECTION */}
      <section id="features" className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Enterprise Features
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built for Candidate Growth & Corporate Recruitment Precision
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore how AuraATS solves modern resume screening bottlenecks for both applicants and talent acquisition teams.
            </p>
          </div>

          {/* Feature Toggle Buttons */}
          <div className="flex justify-center border-b border-slate-800 space-x-4 sm:space-x-8 text-xs font-bold">
            <button
              onClick={() => setActiveTab('candidates')}
              className={`pb-3 flex items-center space-x-2 transition border-b-2 ${
                activeTab === 'candidates'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>For Software Candidates & Students</span>
            </button>

            <button
              onClick={() => setActiveTab('recruiters')}
              className={`pb-3 flex items-center space-x-2 transition border-b-2 ${
                activeTab === 'recruiters'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>For Corporate Recruiters & HR</span>
            </button>

            <button
              onClick={() => setActiveTab('engine')}
              className={`pb-3 flex items-center space-x-2 transition border-b-2 ${
                activeTab === 'engine'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Multi-Engine Parser Architecture</span>
            </button>
          </div>

          {/* TAB 1: CANDIDATES */}
          {activeTab === 'candidates' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="p-2.5 bg-indigo-600/20 rounded-xl w-fit text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Instant Resume Text & PDF Parsing</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload PDF files or paste raw resume text. Our engine instantly extracts contact details, work timeline, education, and technical skills.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="p-2.5 bg-emerald-600/20 rounded-xl w-fit text-emerald-400 border border-emerald-500/30">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">ATS Health Score & Feedback</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get real-time scores out of 100 with formatting suggestions, skill expansion recommendations, and keyword density diagnostics.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="p-2.5 bg-amber-600/20 rounded-xl w-fit text-amber-400 border border-amber-500/30">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Skill Gap Analysis & Match Guard</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Test your resume against real Job Descriptions. See missing critical keywords and know exactly if you meet the ≥80% match eligibility guard.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: RECRUITERS */}
          {activeTab === 'recruiters' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="p-2.5 bg-blue-600/20 rounded-xl w-fit text-blue-400 border border-blue-500/30">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Text JD Creation & Custom Thresholds</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Publish corporate openings with text Job Descriptions. Set custom match thresholds and required technical stack filters.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="p-2.5 bg-purple-600/20 rounded-xl w-fit text-purple-400 border border-purple-500/30">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Automated Candidate Shortlists</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Only high-match applicants reach your shortlist. Filter top candidates scored by technical compatibility and timeline experience.
                </p>
              </div>

              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="p-2.5 bg-emerald-600/20 rounded-xl w-fit text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-white text-base">Status Tracking & Application Pipeline</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Move candidates seamlessly from Applied to Under Review, Shortlisted, Interview Scheduled, or Hired with instant state updates.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PARSER ENGINE */}
          {activeTab === 'engine' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">Self Native Engine</span>
                <h4 className="font-bold text-white text-sm">Deterministic NLP Model</h4>
                <p className="text-xs text-slate-400">Custom regex segmenters and 200+ skill taxonomy dictionaries with zero API cost.</p>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300">Gemini 3.6 Flash</span>
                <h4 className="font-bold text-white text-sm">Google Multimodal AI</h4>
                <p className="text-xs text-slate-400">Deep structured schema extraction across complex or non-standard formatting.</p>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">Grok AI Model</span>
                <h4 className="font-bold text-white text-sm">Tech Stack Specialist</h4>
                <p className="text-xs text-slate-400">High-speed code skill verification and engineering portfolio parsing.</p>
              </div>

              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300">Hybrid Ensemble</span>
                <h4 className="font-bold text-white text-sm">Max Precision Model</h4>
                <p className="text-xs text-slate-400">Combines native deterministic speed with LLM validation for high-value enterprise hiring.</p>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. LIVE INTERACTIVE ATS TESTER PLAYGROUND */}
      <section id="live-tester" className="py-16 bg-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Interactive Homepage Demo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Try the Resume ATS Parser Right Here</h2>
            <p className="text-xs text-slate-400">
              Sample our multi-engine skill extractor live on the homepage before logging in.
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>Resume Input Text Stream</span>
              </div>

              <button
                type="button"
                disabled={isTesting}
                onClick={handleTestResume}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition"
              >
                {isTesting ? (
                  <>
                    <Zap className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Live Parse Test</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={6}
              value={testerText}
              onChange={(e) => setTesterText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            {parsedDemoResult && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Parsed Candidate: {parsedDemoResult.name}</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold rounded-full border border-emerald-500/30">
                    ATS Score: {parsedDemoResult.score}/100
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[11px] font-semibold block">Extracted Tech Stack Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedDemoResult.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg font-mono text-[11px] border border-indigo-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. DEVELOPER SPOTLIGHT SECTION (SANAULLAH) */}
      <section id="developer" className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Engineering Leadership
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Architected & Engineered by {developerProfile.name.toUpperCase()}</h2>
            <p className="text-xs text-slate-400">
              Lead Architect behind the AuraATS multi-engine resume parser and enterprise RBAC recruitment platform.
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              
              <img
                src={developerProfile.avatar}
                alt={developerProfile.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-xl shrink-0 border border-slate-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                }}
              />

              <div className="space-y-3 text-center md:text-left flex-1">
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
                    <span>{developerProfile.name}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-md border border-emerald-500/30">
                      LEAD ENGINEER
                    </span>
                  </h3>
                  <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                    {developerProfile.title}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {developerProfile.bio}
                </p>

                {developerProfile.skills && developerProfile.skills.length > 0 && (
                  <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                    {developerProfile.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 text-[10px] font-mono rounded border border-indigo-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-mono">
                  <a
                    href={developerProfile.githubUrl.startsWith('http') ? developerProfile.githubUrl : `https://${developerProfile.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Github className="w-4 h-4 text-indigo-400" />
                    <span>{developerProfile.githubUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <a
                    href={developerProfile.huggingfaceUrl.startsWith('http') ? developerProfile.huggingfaceUrl : `https://${developerProfile.huggingfaceUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                  >
                    <Brain className="w-4 h-4 text-amber-400" />
                    <span>{developerProfile.huggingfaceUrl.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. MAIN HOMEPAGE FOOTER (ONLY PLACE WITH DEVELOPER LINKS & DETAILS) */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Column 1: Platform Brand */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white text-base">AuraATS</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enterprise Talent Acquisition & Career Acceleration Platform powered by multi-engine resume scoring.
              </p>
            </div>

            {/* Column 2: Developer Profile & Links */}
            <div className="space-y-2 md:col-span-2 p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <div className="font-bold text-white text-xs flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Developer & Engineering Profile: {developerProfile.name.toUpperCase()}</span>
              </div>
              
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Built with precision by <strong>{developerProfile.name}</strong> ({developerProfile.title}). Connect on developer repositories and AI model hubs:
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                <a
                  href={developerProfile.githubUrl.startsWith('http') ? developerProfile.githubUrl : `https://${developerProfile.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>{developerProfile.githubUrl.replace(/^https?:\/\//, '')}</span>
                </a>

                <span className="text-slate-600">•</span>

                <a
                  href={developerProfile.huggingfaceUrl.startsWith('http') ? developerProfile.huggingfaceUrl : `https://${developerProfile.huggingfaceUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>{developerProfile.huggingfaceUrl.replace(/^https?:\/\//, '')}</span>
                </a>

                <span className="text-slate-600">•</span>

                <span className="text-slate-300">{developerProfile.email}</span>
              </div>
            </div>

            {/* Column 3: Quick Navigation & Admin Access */}
            <div className="space-y-2 md:col-span-1 text-right md:text-right">
              <div className="font-bold text-white text-xs">Access Control</div>
              <button
                onClick={onOpenAdminLogin}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SaaS Admin Access</span>
              </button>
              <div className="text-[10px] text-slate-500 pt-1">Username: sanaullah786shah92</div>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 AuraATS Enterprise SaaS. Designed & Developed by <strong>{developerProfile.name}</strong>.
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Strict RBAC Isolation</span>
              <span>•</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 80% Match Guard</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
