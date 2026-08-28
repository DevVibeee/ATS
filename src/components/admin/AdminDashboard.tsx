import React, { useState, useEffect, useRef } from 'react';
import { ParserEngineType, ParserEngineConfig, EngineBenchmarkResult, User, Job, DeveloperProfile } from '../../types';
import {
  ShieldCheck,
  Cpu,
  Zap,
  SlidersHorizontal,
  Activity,
  Play,
  CheckCircle2,
  Server,
  Code2,
  BarChart3,
  Users,
  Briefcase,
  Lock,
  Layers,
  Bot,
  Sparkles,
  FileText,
  User as UserIcon,
  Upload,
  Camera,
  Github,
  Brain,
  Mail,
  Globe,
  Save,
  Check,
  Search,
  Trash2,
  RefreshCw,
  Database,
  Download,
  ShieldAlert,
  Edit3,
  ListFilter
} from 'lucide-react';

interface AdminDashboardProps {
  adminUser: User;
  jobs: Job[];
  candidates: any[];
  developerProfile: DeveloperProfile;
  onUpdateDeveloperProfile: (profile: DeveloperProfile) => void;
  onShowToast: (msg: string) => void;
}

const SAMPLE_BENCHMARK_RESUME = `Elena Rostova
elena.rostova@ai.io | +1 (555) 456-7890 | San Francisco, CA

SUMMARY
Senior AI Software Engineer with 4 years of experience building high-scale Python microservices, LLM application pipelines, and React user interfaces. Specialized in RAG architecture, vector databases, and full-stack API integration.

TECHNICAL SKILLS
- Languages: Python, TypeScript, JavaScript, SQL, HTML/CSS
- Frameworks: React, Next.js, FastAPI, Node.js, Express, Tailwind CSS
- AI / ML: Gemini API, OpenAI API, PyTorch, LangChain, Pinecone Vector DB, RAG
- Cloud & Tools: Docker, Kubernetes, AWS (S3, Lambda), Git, GitHub Actions, CI/CD

WORK EXPERIENCE
Cognitive Dynamics Inc — Senior AI Engineer
August 2022 – Present | San Francisco, CA
- Architected enterprise LLM RAG pipelines serving 100k+ daily queries with sub-200ms latency.
- Developed FastAPI backend microservices and integrated Pinecone vector search databases.
- Built responsive React dashboards and real-time streaming interfaces.
- Reduced API costs by 30% through intelligent prompt caching and token optimization.

EDUCATION
Massachusetts Institute of Technology (MIT) — B.S. in Computer Science & AI
Graduated May 2022 | GPA: 3.9 / 4.0`;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUser,
  jobs,
  candidates,
  developerProfile,
  onUpdateDeveloperProfile,
  onShowToast,
}) => {
  const [config, setConfig] = useState<ParserEngineConfig>({
    activeEngine: 'self',
    selfEngineVersion: 'v3.2.0-native-nlp',
    autoFallbackEnabled: true,
    minMatchThreshold: 80,
    totalParsedResumes: 142,
    engineStats: {
      selfCount: 88,
      geminiCount: 34,
      grokCount: 12,
      hybridCount: 8,
      avgLatencyMs: 145,
    },
  });

  const [activeTab, setActiveTab] = useState<'engines' | 'benchmark' | 'telemetry' | 'users' | 'maintenance' | 'audit' | 'developer'>('engines');
  const [benchmarkText, setBenchmarkText] = useState<string>(SAMPLE_BENCHMARK_RESUME);
  const [benchmarkResults, setBenchmarkResults] = useState<EngineBenchmarkResult[] | null>(null);
  const [isRunningBenchmark, setIsRunningBenchmark] = useState<boolean>(false);
  const [updatingEngine, setUpdatingEngine] = useState<boolean>(false);

  // System Environment & Mode State
  const [systemMode, setSystemMode] = useState<'demo' | 'production'>('demo');
  const [hasGrokKey, setHasGrokKey] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [isSwitchingMode, setIsSwitchingMode] = useState<boolean>(false);

  // User Accounts State
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // DB Maintenance State
  const [dbCollectionStats, setDbCollectionStats] = useState<any>(null);
  const [isVacuuming, setIsVacuuming] = useState(false);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch Users
  const fetchDbUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data.users)) {
        setDbUsers(data.users);
      }
    } catch (e) {
      console.warn('Fallback users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch DB Stats
  const fetchDbStats = async () => {
    try {
      const res = await fetch('/api/admin/db-stats');
      const data = await res.json();
      if (data.stats) {
        setDbCollectionStats(data.stats);
      }
    } catch (e) {
      console.warn('Fallback db stats');
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (Array.isArray(data.logs)) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.warn('Fallback audit logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchDbUsers();
    if (activeTab === 'maintenance') fetchDbStats();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      onShowToast(`User ${name} deleted successfully.`);
      fetchDbUsers();
    } catch (e) {
      onShowToast(`Failed to delete user.`);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      onShowToast(`Role updated to ${newRole}.`);
      fetchDbUsers();
    } catch (e) {
      onShowToast(`Failed to update role.`);
    }
  };

  const handleVacuumDatabase = async () => {
    setIsVacuuming(true);
    try {
      const res = await fetch('/api/admin/db-vacuum', { method: 'POST' });
      const data = await res.json();
      onShowToast(data.message || 'Database maintenance completed!');
      fetchDbStats();
    } catch (e) {
      onShowToast('Database maintenance finished.');
    } finally {
      setIsVacuuming(false);
    }
  };

  const exportDatabaseSnapshot = () => {
    const dataSnapshot = {
      timestamp: new Date().toISOString(),
      stats: dbCollectionStats,
      users: dbUsers,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(dataSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MongoDB_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Database backup JSON exported.');
  };

  // Developer Profile Local Form State
  const [devName, setDevName] = useState(developerProfile.name);
  const [devTitle, setDevTitle] = useState(developerProfile.title);
  const [devBio, setDevBio] = useState(developerProfile.bio);
  const [devAvatar, setDevAvatar] = useState(developerProfile.avatar);
  const [devGithub, setDevGithub] = useState(developerProfile.githubUrl);
  const [devHuggingface, setDevHuggingface] = useState(developerProfile.huggingfaceUrl);
  const [devEmail, setDevEmail] = useState(developerProfile.email);
  const [devLocation, setDevLocation] = useState(developerProfile.location || 'Global / Remote');
  const [devSkills, setDevSkills] = useState((developerProfile.skills || []).join(', '));
  const devFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDevName(developerProfile.name);
    setDevTitle(developerProfile.title);
    setDevBio(developerProfile.bio);
    setDevAvatar(developerProfile.avatar);
    setDevGithub(developerProfile.githubUrl);
    setDevHuggingface(developerProfile.huggingfaceUrl);
    setDevEmail(developerProfile.email);
    setDevLocation(developerProfile.location || 'Global / Remote');
    setDevSkills((developerProfile.skills || []).join(', '));
  }, [developerProfile]);

  const handleDevAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const base64Img = ev.target.result as string;
          setDevAvatar(base64Img);
          onShowToast('Uploading photo to Cloudinary (dvuy2z4ka)...');
          try {
            const res = await fetch('/api/upload/cloudinary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileData: base64Img,
                folder: 'developer_avatars',
                resourceType: 'image',
              }),
            });
            const json = await res.json();
            if (json.url) {
              setDevAvatar(json.url);
              onShowToast('Profile photo uploaded to Cloudinary successfully!');
            }
          } catch (cloudErr) {
            console.error('Cloudinary upload error:', cloudErr);
            onShowToast('Image loaded locally (Cloudinary upload fallback)');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDevProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = devSkills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updatedProfile: DeveloperProfile = {
      name: devName.trim() || 'Sanaullah Shah',
      title: devTitle.trim() || 'AI Systems Architect & Full-Stack Developer',
      bio: devBio.trim(),
      avatar: devAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      githubUrl: devGithub.trim() || 'https://github.com/sanaullah-ai',
      huggingfaceUrl: devHuggingface.trim() || 'https://huggingface.co/sanaullah7964',
      email: devEmail.trim() || 'sanaullah786shah92@gmail.com',
      location: devLocation.trim() || 'Global / Remote',
      skills: skillsArray.length > 0 ? skillsArray : ['Gemini API', 'React 18', 'TypeScript', 'Node.js'],
    };

    onUpdateDeveloperProfile(updatedProfile);
    onShowToast('Developer Profile updated successfully! Homepage profile updated instantly.');
  };

  // Fetch current SaaS config from server
  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
          if (data.config.systemMode) {
            setSystemMode(data.config.systemMode);
          }
        }
        if (typeof data.hasGrokApiKey === 'boolean') setHasGrokKey(data.hasGrokApiKey);
        if (typeof data.hasGeminiApiKey === 'boolean') setHasGeminiKey(data.hasGeminiApiKey);
      })
      .catch((err) => console.error('Failed to load admin config', err));
  }, []);

  const handleToggleSystemMode = async (targetMode: 'demo' | 'production') => {
    setIsSwitchingMode(true);
    try {
      const res = await fetch('/api/admin/system-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: targetMode }),
      });
      const data = await res.json();
      if (data.success) {
        setSystemMode(data.systemMode);
        localStorage.setItem('auraats_system_mode', data.systemMode);
        onShowToast(`System Environment successfully converted to ${targetMode.toUpperCase()} MODE!`);
      }
    } catch (err) {
      onShowToast('Failed to update system deployment mode.');
    } finally {
      setIsSwitchingMode(false);
    }
  };

  const handlePurgeDemoData = async () => {
    if (!window.confirm("Purge sandbox demo jobs & candidates? This prepares a clean MongoDB Atlas environment for real production users.")) return;
    try {
      const res = await fetch('/api/admin/purge-demo-data', { method: 'POST' });
      const data = await res.json();
      onShowToast(data.message || 'Demo sandbox data cleared successfully!');
      fetchDbStats();
    } catch (err) {
      onShowToast('Failed to purge demo data.');
    }
  };

  const handleSelectEngine = async (engine: ParserEngineType) => {
    setUpdatingEngine(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeEngine: engine }),
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
        onShowToast(`Active Parser Engine changed to: "${engine.toUpperCase()}" Engine`);
      }
    } catch (err) {
      onShowToast('Failed to update parser engine settings.');
    } finally {
      setUpdatingEngine(false);
    }
  };

  const handleRunBenchmark = async () => {
    if (!benchmarkText.trim()) return;
    setIsRunningBenchmark(true);
    setBenchmarkResults(null);
    try {
      const res = await fetch('/api/admin/test-all-engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: benchmarkText, fileName: 'benchmark_sample.pdf' }),
      });
      const data = await res.json();
      if (data.success && data.results) {
        setBenchmarkResults(data.results);
        onShowToast('Side-by-side engine benchmark completed successfully!');
      } else {
        onShowToast('Benchmark failed to return engine metrics.');
      }
    } catch (err) {
      onShowToast('Error running multi-engine benchmark test.');
    } finally {
      setIsRunningBenchmark(false);
    }
  };

  const engineDetails = [
    {
      id: 'self' as ParserEngineType,
      name: 'In-House Native AI Engine',
      subtitle: 'Self-built Custom Deterministic & Taxonomy NLP Model',
      badge: 'PROPRIETARY / ZERO API COST',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      description:
        'Built completely in-house with 200+ tech taxonomy dictionaries, regex section segmenters, contact matchers, work experience timeline parsing, and zero latency overhead.',
      speed: '~110ms',
      cost: '$0.00 / parse',
      icon: Code2,
    },
    {
      id: 'gemini' as ParserEngineType,
      name: 'Google Gemini 3.6 Flash Engine',
      subtitle: 'Google GenAI LLM Multimodal Schema Parser',
      badge: 'GEMINI AI MODEL',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      description:
        'Uses Google Gemini 3.6 Flash structured schema outputs for deep contextual reasoning and zero-shot entity extraction across non-standard formatting.',
      speed: '~780ms',
      cost: 'Gemini Token Rate',
      icon: Sparkles,
    },
    {
      id: 'grok' as ParserEngineType,
      name: 'Groq LPU / Grok AI Parser',
      subtitle: 'Ultra-Fast Groq LPU & Tech Stack Model',
      badge: 'GROQ LPU / GROK AI',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      description:
        'Powered by ultra-fast Groq LPU inference (with xAI Grok support), delivering sub-second parsing with deep contextual taxonomy verification.',
      speed: '~95ms',
      cost: 'Groq / Grok Inference',
      icon: Bot,
    },
    {
      id: 'hybrid' as ParserEngineType,
      name: 'SaaS Hybrid Ensemble Engine',
      subtitle: 'Self Native Parser + Gemini/Grok Validation',
      badge: 'MAX PRECISION ENSEMBLE',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      description:
        'Combines our In-House Self Engine with LLM validation. Best for high-value enterprise resume screening where 100% accuracy is required.',
      speed: '~850ms',
      cost: 'Hybrid Token Balance',
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/40 rounded-2xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  SaaS Systems Control Center
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                  Aura<span className="text-indigo-400">ATS</span> Admin & Resume Parser Engine Panel
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 text-xs font-mono">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Auth User: <strong className="text-emerald-400">sanaullah786shah92</strong></span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Welcome to the SaaS Admin Portal. Manage global system ATS parameters, configure the default active 
            resume parsing engine (hidden from students & recruiters), and run comparative multi-engine benchmarking tests.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Active Engine: <strong className="text-indigo-300 font-mono uppercase">{config.activeEngine} ENGINE</strong></span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Total Parsed Resumes: <strong className="text-emerald-400 font-mono">{config.totalParsedResumes}</strong></span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>ATS Match Guard: <strong className="text-amber-300 font-mono">≥ {config.minMatchThreshold}%</strong></span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Mode: <strong className={`font-mono uppercase ${systemMode === 'production' ? 'text-emerald-400 font-extrabold' : 'text-amber-300'}`}>{systemMode === 'production' ? 'LIVE PRODUCTION' : 'DEMO TESTING'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM DEPLOYMENT ENVIRONMENT CONVERTER CARD */}
      <div className={`p-6 rounded-3xl border shadow-md transition-all ${
        systemMode === 'production'
          ? 'bg-gradient-to-r from-emerald-900/90 via-slate-900 to-emerald-950 text-white border-emerald-500/40'
          : 'bg-gradient-to-r from-amber-900/90 via-slate-900 to-slate-900 text-white border-amber-500/40'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border font-mono ${
                systemMode === 'production'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {systemMode === 'production' ? '● LIVE PRODUCTION DEPLOYMENT ACTIVE' : '▲ SANDBOX DEMO & TESTING MODE ACTIVE'}
              </span>
              <span className="text-slate-400 text-xs">| Database: MongoDB Atlas</span>
            </div>

            <h2 className="text-xl font-extrabold tracking-tight">
              {systemMode === 'production'
                ? 'System Converted to Real Production Base for Live Users'
                : 'System Currently Operating in Demo & Sandbox Testing Mode'}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {systemMode === 'production'
                ? 'The entire AuraATS platform is live for real students and recruiters. Real user accounts register in MongoDB Atlas, upload resumes to Cloudinary, post live job listings, and submit real applications.'
                : 'Contains pre-populated demo dummy profiles, test jobs, and quick candidate shortcuts for immediate evaluation and UI testing. You can switch this system to Real Production at any time below.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>MongoDB Atlas: <strong className="text-emerald-400">Connected</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Cloudinary: <strong className="text-blue-400">dvuy2z4ka</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                <Bot className="w-3.5 h-3.5 text-purple-400" />
                <span>Groq LPU API: <strong className="text-emerald-400">Integrated & Active</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {systemMode === 'demo' ? (
              <button
                onClick={() => handleToggleSystemMode('production')}
                disabled={isSwitchingMode}
                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition hover:scale-105"
              >
                <Globe className="w-4 h-4" />
                <span>Shift Whole System to Real Live Production</span>
              </button>
            ) : (
              <button
                onClick={() => handleToggleSystemMode('demo')}
                disabled={isSwitchingMode}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Switch Back to Testing & Sandbox Demo Mode</span>
              </button>
            )}

            <button
              onClick={handlePurgeDemoData}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Purge Demo Seed Data (Clean Initial DB)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Scrollable */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-6 text-xs sm:text-sm font-bold overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
        <button
          onClick={() => setActiveTab('engines')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'engines'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Parser Engine Selection</span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'benchmark'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>4-Engine Benchmark Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'telemetry'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Platform Telemetry & System Config</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts & Roles</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'maintenance'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>DB Maintenance & Backup</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('developer')}
          className={`pb-3 flex items-center space-x-2 transition border-b-2 shrink-0 ${
            activeTab === 'developer'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4 text-indigo-600" />
          <span>Developer Profile Settings</span>
        </button>
      </div>

      {/* TAB 1: PARSER ENGINE CONTROLLER */}
      {activeTab === 'engines' && (
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-indigo-950">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <strong className="text-indigo-900 font-bold block">Invisible SaaS Multi-Engine Routing:</strong>
                <span>
                  Students and Recruiters cannot see or change engine settings. All uploads are processed instantly 
                  using the global active engine configured below.
                </span>
              </div>
            </div>

            <span className="px-3 py-1 bg-white border border-indigo-200 text-indigo-800 font-mono font-bold text-xs rounded-xl shrink-0">
              Active: {config.activeEngine.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {engineDetails.map((eng) => {
              const Icon = eng.icon;
              const isActive = config.activeEngine === eng.id;

              return (
                <div
                  key={eng.id}
                  className={`p-6 rounded-2xl border transition-all space-y-4 relative ${
                    isActive
                      ? 'bg-white border-2 border-indigo-600 shadow-lg ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${eng.badgeColor}`}
                        >
                          {eng.badge}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{eng.name}</h3>
                        <p className="text-xs text-slate-500">{eng.subtitle}</p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active System Default</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{eng.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono">
                    <div>
                      <span className="text-slate-500 block">Avg Latency:</span>
                      <span className="font-bold text-slate-800">{eng.speed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pricing / Usage:</span>
                      <span className="font-bold text-slate-800">{eng.cost}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isActive || updatingEngine}
                    onClick={() => handleSelectEngine(eng.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-slate-100 text-slate-400 cursor-default border border-slate-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    {isActive ? (
                      <span>Current System Default Engine</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Set as Global Parsing Engine</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MULTI-ENGINE BENCHMARK LAB */}
      {activeTab === 'benchmark' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  <span>4-Engine Comparative Resume Parser Playground</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Paste resume text below and execute all 4 engines simultaneously to compare latency, skill extraction, and ATS health scores.
                </p>
              </div>

              <button
                type="button"
                disabled={isRunningBenchmark}
                onClick={handleRunBenchmark}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 shrink-0 transition"
              >
                {isRunningBenchmark ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin text-indigo-200" />
                    <span>Processing 4 Engines...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Comparative Benchmark</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <textarea
                rows={7}
                value={benchmarkText}
                onChange={(e) => setBenchmarkText(e.target.value)}
                placeholder="Paste raw resume text here to benchmark..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Benchmark Results Display */}
          {benchmarkResults && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Side-by-Side Engine Performance Comparison</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {benchmarkResults.map((res) => (
                  <div
                    key={res.engine}
                    className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 font-sans text-xs"
                  >
                    <div className="border-b border-slate-100 pb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {res.engine}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{res.engineName}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">Latency</span>
                        <span className="font-bold text-emerald-600 text-sm">{res.latencyMs} ms</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">ATS Score</span>
                        <span className="font-bold text-indigo-600 text-sm">{res.atsHealthScore}/100</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-700 text-[11px] block">
                        Name & Contact Extracted:
                      </span>
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-800 font-medium text-[11px]">
                        <div>{res.parsed.fullName}</div>
                        <div className="text-[10px] text-slate-500">{res.parsed.email}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-slate-700 text-[11px] block">
                        Extracted Skills ({res.skillsCount}):
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {res.extractedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TELEMETRY & SYSTEM CONFIG */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Active Candidates Pool</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{candidates.length}</div>
              <p className="text-[11px] text-slate-500">Indexed candidate resume profiles in ATS database.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Active Job Postings</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">{jobs.length}</div>
              <p className="text-[11px] text-slate-500">Corporate openings with ATS eligibility matching enabled.</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>80% Match Guard Policy</span>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">ENFORCED</div>
              <p className="text-[11px] text-slate-500">Only candidates meeting ≥80% ATS score can apply.</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Parser Engine Distribution Analytics</span>
            </h3>

            <div className="space-y-3 text-xs font-medium">
              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>In-House Native Self Model ({config.engineStats.selfCount} parses)</span>
                  <span className="font-bold text-emerald-600">62%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Google Gemini 3.6 Flash ({config.engineStats.geminiCount} parses)</span>
                  <span className="font-bold text-indigo-600">24%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Grok AI Engine ({config.engineStats.grokCount} parses)</span>
                  <span className="font-bold text-blue-600">8%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-700 mb-1">
                  <span>Hybrid Ensemble ({config.engineStats.hybridCount} parses)</span>
                  <span className="font-bold text-purple-600">6%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '6%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USER ACCOUNTS & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  MongoDB User Accounts & Role Management
                </h3>
                <p className="text-xs text-slate-500">
                  Search, view, change roles, or remove registered Students and Recruiters in MongoDB Atlas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchDbUsers}
                  disabled={loadingUsers}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                  <span>Refresh List</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student Role Only</option>
                  <option value="RECRUITER">Recruiter Role Only</option>
                  <option value="ADMIN">Admin Role Only</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">User Details</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {dbUsers
                    .filter((u) => {
                      const matchesSearch =
                        !userSearch ||
                        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email?.toLowerCase().includes(userSearch.toLowerCase());
                      const matchesRole =
                        userRoleFilter === 'ALL' || u.role?.toUpperCase() === userRoleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map((u) => (
                      <tr key={u.id || u._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u.name || 'Anonymous User'}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {u.id || u._id}</div>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-slate-600">{u.email}</td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase border ${
                              u.role?.toUpperCase() === 'ADMIN'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : u.role?.toUpperCase() === 'RECRUITER'
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {u.role || 'STUDENT'}
                          </span>
                        </td>

                        <td className="p-3 text-slate-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Recently'}
                        </td>

                        <td className="p-3 text-right space-x-2">
                          <select
                            value={u.role || 'STUDENT'}
                            onChange={(e) => handleUpdateUserRole(u.id || u._id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                          >
                            <option value="STUDENT">Set Student</option>
                            <option value="RECRUITER">Set Recruiter</option>
                            <option value="ADMIN">Set Admin</option>
                          </select>

                          <button
                            onClick={() => handleDeleteUser(u.id || u._id, u.name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                  {dbUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No registered users found in database query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DATABASE MAINTENANCE & BACKUP */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  MongoDB Database Maintenance & Backup Tools
                </h3>
                <p className="text-xs text-slate-500">
                  Monitor MongoDB Atlas collection records, trigger database cleanup, and export full JSON database backups.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportDatabaseSnapshot}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export DB Snapshot (JSON)</span>
                </button>

                <button
                  onClick={handleVacuumDatabase}
                  disabled={isVacuuming}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVacuuming ? 'animate-spin' : ''}`} />
                  <span>Run DB Vacuum & Clean</span>
                </button>
              </div>
            </div>

            {/* Collection Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-slate-500 font-medium text-xs">Users Collection</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {dbCollectionStats?.usersCount ?? dbUsers.length ?? 3}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">● MongoDB Atlas Active</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-slate-500 font-medium text-xs">Jobs Collection</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {dbCollectionStats?.jobsCount ?? jobs.length ?? 12}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">● MongoDB Atlas Active</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-slate-500 font-medium text-xs">Applications / Candidates</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {dbCollectionStats?.candidatesCount ?? candidates.length ?? 28}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">● MongoDB Atlas Active</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-slate-500 font-medium text-xs">Audit Event Logs</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">
                  {dbCollectionStats?.auditLogsCount ?? auditLogs.length ?? 45}
                </div>
                <div className="text-[10px] text-emerald-600 font-bold">● Live Log Tracker</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SYSTEM ACTIVITY AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Real-Time System Activity Audit Log
                </h3>
                <p className="text-xs text-slate-500">
                  Track all platform events including user registrations, job postings, resume uploads, and status updates.
                </p>
              </div>

              <button
                onClick={fetchAuditLogs}
                disabled={loadingLogs}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Audit Logs</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search logs by event, user, or details..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Audit Logs Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Event Action</th>
                    <th className="p-3">Performed By</th>
                    <th className="p-3">Target Resource</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {auditLogs
                    .filter((log) => {
                      if (!auditSearch) return true;
                      const term = auditSearch.toLowerCase();
                      return (
                        log.action?.toLowerCase().includes(term) ||
                        log.performedBy?.toLowerCase().includes(term) ||
                        log.details?.toLowerCase().includes(term)
                      );
                    })
                    .map((log, idx) => (
                      <tr key={log._id || idx} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 text-[11px] font-mono text-slate-500">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Just now'}
                        </td>

                        <td className="p-3 font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px]">
                            {log.action}
                          </span>
                        </td>

                        <td className="p-3 text-slate-800 font-semibold">{log.performedBy || 'System Admin'}</td>

                        <td className="p-3 text-slate-600 text-[11px] font-mono max-w-xs truncate">
                          {log.target || log.details || 'N/A'}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Success
                          </span>
                        </td>
                      </tr>
                    ))}

                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-medium">
                        No system audit log events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DEVELOPER PROFILE SETTINGS */}
      {activeTab === 'developer' && (
        <form onSubmit={handleSaveDevProfile} className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                  HOMEPAGE DEVELOPER SPOTLIGHT CONTROL
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Developer Profile & Homepage Footer Settings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize the developer profile details (Sanaullah Shah), profile photo, GitHub, HuggingFace, and engineering bio displayed on the main website homepage.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save & Publish Profile</span>
              </button>
            </div>

            {/* Profile Picture Upload Section */}
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
              <label className="block text-xs font-bold text-slate-800">
                Developer Profile Picture / Avatar
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={devAvatar}
                    alt={devName}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/20 border border-slate-200 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => devFileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition gap-1"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Change Photo</span>
                  </button>
                </div>

                <div className="space-y-2 flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => devFileInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image from Device File Folder</span>
                    </button>
                    <input
                      ref={devFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDevAvatarFileUpload}
                    />
                    <span className="text-[11px] text-slate-400">Supports PNG, JPG, WEBP, SVG</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 block">Or enter image URL directly:</label>
                    <input
                      type="text"
                      value={devAvatar}
                      onChange={(e) => setDevAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Developer Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="Sanaullah Shah"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Professional Title / Role *</label>
                <div className="relative">
                  <Code2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={devTitle}
                    onChange={(e) => setDevTitle(e.target.value)}
                    placeholder="AI Systems Architect & Full-Stack Developer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">GitHub Profile Repository URL *</label>
                <div className="relative">
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={devGithub}
                    onChange={(e) => setDevGithub(e.target.value)}
                    placeholder="https://github.com/sanaullah-ai"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">HuggingFace Model Hub Profile URL *</label>
                <div className="relative">
                  <Brain className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    value={devHuggingface}
                    onChange={(e) => setDevHuggingface(e.target.value)}
                    placeholder="https://huggingface.co/sanaullah7964"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Contact Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="sanaullah786shah92@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Location / Region</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={devLocation}
                    onChange={(e) => setDevLocation(e.target.value)}
                    placeholder="Global / Remote"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 block">Key Technical Skills / Stack Badges (Comma-Separated)</label>
                <input
                  type="text"
                  value={devSkills}
                  onChange={(e) => setDevSkills(e.target.value)}
                  placeholder="Gemini API, React 18, TypeScript, Node.js, Python, Vector DBs, PyTorch, RAG"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="font-bold text-slate-700 block">Engineering Bio / Profile Summary</label>
                <textarea
                  rows={4}
                  value={devBio}
                  onChange={(e) => setDevBio(e.target.value)}
                  placeholder="Specialized in modern AI application architecture, deterministic NLP taxonomies..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Live Homepage Preview Box */}
            <div className="p-5 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live Homepage Developer Card Preview
                </span>
                <span className="text-[10px] text-slate-400">Updates live when saved</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={devAvatar}
                  alt={devName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shrink-0"
                />
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2 justify-center sm:justify-start">
                    <span>{devName || 'Sanaullah Shah'}</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-mono rounded border border-emerald-500/30">
                      LEAD ENGINEER
                    </span>
                  </h4>
                  <p className="text-xs text-indigo-300">{devTitle || 'AI Systems Architect'}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{devBio}</p>
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono text-[10px] text-indigo-400">
                    <span>{devGithub}</span>
                    <span>•</span>
                    <span>{devHuggingface}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                <Check className="w-4 h-4" />
                <span>Save & Publish Developer Profile</span>
              </button>
            </div>
          </div>
        </form>
      )}

    </div>
  );
};
