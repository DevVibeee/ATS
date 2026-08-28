import React, { useState } from 'react';
import { UserRole, User } from '../../types';
import {
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Star,
  Layers,
  KeyRound,
  X
} from 'lucide-react';
import { MOCK_STUDENT_USER, MOCK_RECRUITER_USER } from '../../data/mockData';

interface AuthPortalProps {
  onLogin: (user: User, role: UserRole) => void;
  initialRole?: UserRole;
  initialTab?: 'signin' | 'signup';
  onOpenAdminLogin?: () => void;
  onClose?: () => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  onLogin,
  initialRole = 'student',
  initialTab = 'signin',
  onOpenAdminLogin,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Student specific sign up fields
  const [headline, setHeadline] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  // Recruiter specific sign up fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');

  // Error message state
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Handle Quick Demo Login
  const handleDemoLogin = async (role: UserRole) => {
    const demoUser = role === 'student' ? MOCK_STUDENT_USER : MOCK_RECRUITER_USER;
    try {
      setIsLoading(true);
      // Ensure demo account exists in Atlas
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: demoUser.name,
          email: demoUser.email,
          password: 'demo_password_123',
          role: role,
          avatar: demoUser.avatar,
          studentProfile: demoUser.studentProfile,
          recruiterProfile: demoUser.recruiterProfile,
        }),
      });
    } catch (e) {
      // ignore existing account warning
    } finally {
      setIsLoading(false);
      onLogin(demoUser, role);
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'signin') {
      if (!email || !password) {
        setError('Please provide both email address and password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            role: selectedRole,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          // If fallback for demo emails
          if (email.includes('alex') || email.includes('sarah') || email.includes('student') || email.includes('recruiter')) {
            const fallback = selectedRole === 'student' ? { ...MOCK_STUDENT_USER, email } : { ...MOCK_RECRUITER_USER, email };
            onLogin(fallback, selectedRole);
            return;
          }
          setError(data.error || 'Authentication failed. Check your credentials or click Sign Up to register.');
          return;
        }

        onLogin(data.user, data.user.role || selectedRole);
      } catch (err: any) {
        setError('Network error connecting to MongoDB Atlas server.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign Up Flow
      if (!name || !email || !password) {
        setError('Please fill in all required registration fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter passwords.');
        return;
      }

      setIsLoading(true);
      try {
        let payload: any = {
          name,
          email,
          password,
          role: selectedRole,
        };

        if (selectedRole === 'student') {
          payload.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
          payload.studentProfile = {
            headline: headline || 'Software Engineering Specialist',
            phone: '+1 (555) 019-2831',
            location: 'San Francisco, CA',
            bio: 'Driven engineer passionate about building high-quality scalable web apps.',
            experienceYears: 3,
            desiredRole: 'Full Stack Engineer',
            skills: skillsInput ? skillsInput.split(',').map((s) => s.trim()) : ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'],
            education: [
              {
                institution: 'State University',
                degree: 'B.S.',
                fieldOfStudy: 'Computer Science',
                startYear: '2020',
                endYear: '2024',
              },
            ],
            workHistory: [],
            resume: null,
          };
        } else {
          payload.avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
          payload.recruiterProfile = {
            companyName: companyName || 'Aura Tech Solutions',
            companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            industry: industry || 'Software & AI',
            companySize: '50-200 employees',
            location: 'San Francisco, CA',
            website: 'https://auratech.example.com',
            description: 'Leading innovations in intelligent web applications.',
          };
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.error || 'Registration failed.');
          return;
        }

        onLogin(data.user, selectedRole);
      } catch (err: any) {
        setError('Network error saving account to MongoDB Atlas.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-sm flex flex-col justify-center py-6 px-3 sm:px-6 lg:px-8 text-slate-800 relative z-50">
      
      {onClose && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full border border-slate-700 shadow-xl transition z-50 min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Return to Main Homepage"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2.5">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 p-1 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
            Aura<span className="text-indigo-600">ATS</span> Enterprise
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Role-Based Portal Access Control System
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict RBAC Security Enforced</span>
          </div>
        </div>
      </div>

      {/* Main Auth Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 shadow-xl border border-slate-200 rounded-3xl space-y-5">
          
          {/* Step 1: Select Role Portal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              1. Choose Portal Access Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="auth-role-student-btn"
                onClick={() => {
                  setSelectedRole('student');
                  setError(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                  selectedRole === 'student'
                    ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'student' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Candidate Portal</div>
                  <div className="text-[10px] text-slate-500 font-normal">Student / Job Seeker</div>
                </div>
              </button>

              <button
                type="button"
                id="auth-role-recruiter-btn"
                onClick={() => {
                  setSelectedRole('recruiter');
                  setError(null);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                  selectedRole === 'recruiter'
                    ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/20 text-blue-950 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'recruiter' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Recruiter Portal</div>
                  <div className="text-[10px] text-slate-500 font-normal">HR / Talent Manager</div>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Sign In vs Sign Up Tabs */}
          <div className="border-b border-slate-200 pb-1 flex justify-center space-x-6">
            <button
              type="button"
              id="auth-tab-signin"
              onClick={() => {
                setActiveTab('signin');
                setError(null);
              }}
              className={`pb-2 text-xs font-bold border-b-2 transition ${
                activeTab === 'signin'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In (Existing User)
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
              }}
              className={`pb-2 text-xs font-bold border-b-2 transition ${
                activeTab === 'signup'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign Up (Register New Account)
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* If Sign Up: Full Name */}
            {activeTab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'student' ? 'Alex Rivera' : 'Sarah Jenkins'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder={
                    selectedRole === 'student'
                      ? 'alex.rivera@university.edu'
                      : 'sarah.jenkins@techcorp.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Additional Sign Up Fields */}
            {activeTab === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {selectedRole === 'student' ? (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Headline / Desired Role
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Full Stack Engineer"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Key Skills (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, TypeScript, Python, Node.js"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Acme Corporation"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        placeholder="Software & Cloud Services"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Sign In Options */}
            {activeTab === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 mr-2"
                  />
                  Remember me
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-indigo-600 font-semibold hover:underline">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2 ${
                selectedRole === 'student'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <span>
                {activeTab === 'signin'
                  ? `Sign In to ${selectedRole === 'student' ? 'Candidate' : 'Recruiter'} Portal`
                  : `Create ${selectedRole === 'student' ? 'Candidate' : 'Recruiter'} Account`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Instant Access Section */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Or One-Click Demo Portal Launch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-student-login-btn"
                onClick={() => handleDemoLogin('student')}
                className="p-3 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    Candidate
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-full">
                    Demo
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">Alex Rivera</p>
              </button>

              <button
                type="button"
                id="demo-recruiter-login-btn"
                onClick={() => handleDemoLogin('recruiter')}
                className="p-3 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    Recruiter
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full">
                    Demo
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">Sarah Jenkins</p>
              </button>

              <button
                type="button"
                id="demo-admin-login-btn"
                onClick={onOpenAdminLogin}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition space-y-1 text-white"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    SaaS Admin
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded-full border border-emerald-500/30">
                    Control
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Sanaullah Shah</p>
              </button>
            </div>
          </div>

          {/* Security & Feature Bullet Notes */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict Role-Based Access Isolation:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-slate-500">
              <li>Candidates access My Resume, ATS keyword scoring, & 80% Skill Gap Analyzer.</li>
              <li>Recruiters manage Text JDs, review 90%+ Candidate Shortlists, & candidate status.</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
