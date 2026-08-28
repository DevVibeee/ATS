import React, { useState, useRef } from 'react';
import { UserRole, User } from '../types';
import { Sparkles, UserCheck, Briefcase, GraduationCap, RefreshCw, ShieldCheck, LogOut, Lock, Camera, Upload, Bell, Mail, Home } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: User;
  hasApi: boolean;
  onQuickReset?: () => void;
  onSignOut: () => void;
  onGoToHome?: () => void;
  onOpenAdminLogin?: () => void;
  onUploadAvatar?: (url: string) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  hasApi,
  onQuickReset,
  onSignOut,
  onGoToHome,
  onOpenAdminLogin,
  onUploadAvatar,
  unreadCount = 0,
  onOpenNotifications,
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRoleSwitch = (newRole: UserRole) => {
    onRoleChange(newRole);
    setShowRoleModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadAvatar) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, WEBP, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUploadAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Badge */}
          <div
            onClick={() => onGoToHome && onGoToHome()}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="Return to AuraATS Homepage"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/10 shrink-0 group-hover:scale-105 transition">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 font-sans group-hover:text-indigo-600 transition">
                  Aura<span className="text-indigo-600">ATS</span>
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  RBAC Enterprise SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Role-Based Talent Acquisition & ATS Keyword Matching
              </p>
            </div>
          </div>

          {/* RBAC Active Session Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* SaaS Admin Access Button - Only visible for admin role */}
            {onOpenAdminLogin && currentRole === 'admin' && (
              <button
                id="homepage-admin-access-btn"
                type="button"
                onClick={onOpenAdminLogin}
                className="px-2.5 py-1.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition min-h-[38px]"
                title="Access SaaS Systems Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">SaaS Admin Access</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )}

            {/* Strict RBAC Session Context Pill */}
            <div className="hidden lg:flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <div
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg ${
                  currentRole === 'student'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : currentRole === 'recruiter'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-emerald-400 shadow-sm border border-slate-800'
                }`}
              >
                {currentRole === 'student' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Candidate Portal Active</span>
                  </>
                ) : currentRole === 'recruiter' ? (
                  <>
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Recruiter Portal Active</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SaaS Admin Control Center</span>
                  </>
                )}
              </div>

              {/* Switch Portal button - Only visible for admin role */}
              {currentRole === 'admin' && (
                <button
                  id="switch-rbac-role-btn"
                  onClick={() => setShowRoleModal(true)}
                  className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                  title="Switch Role-Based Access Control Session"
                >
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span>Switch Portal</span>
                </button>
              )}
            </div>

            {/* Notification Center Quick Icon */}
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                title="View Inbox & Inquiries"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-rose-500 text-white font-extrabold text-[9px] rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Current Active Authenticated User Profile with Device Photo Upload */}
            <div className="flex items-center space-x-2 pl-1.5 border-l border-slate-200">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group shrink-0"
                title="Click to upload profile picture from device"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-indigo-500/30 object-cover transition group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div className="hidden md:block text-left text-xs">
                <div className="font-bold text-slate-900 flex items-center space-x-1">
                  <span className="max-w-[100px] lg:max-w-[140px] truncate">{currentUser.name}</span>
                  <UserCheck className="w-3 h-3 text-indigo-600 inline shrink-0" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <span>
                    {currentRole === 'student'
                      ? 'Student'
                      : currentRole === 'recruiter'
                      ? 'Recruiter'
                      : 'Admin'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-indigo-600 hover:underline font-bold text-[9px] ml-1"
                    title="Upload photo from device"
                  >
                    Photo
                  </button>
                </div>
              </div>

              {/* Home & Sign Out Buttons */}
              {onGoToHome && (
                <button
                  id="navbar-home-btn"
                  onClick={onGoToHome}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition min-h-[38px]"
                  title="Return to AuraATS Homepage"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </button>
              )}

              <button
                id="navbar-signout-btn"
                onClick={onSignOut}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition min-h-[38px]"
                title="Sign Out of Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

            {/* Mobile/Quick Switch Button - Admin Only */}
            {currentRole === 'admin' && (
              <button
                id="mobile-role-switch-btn"
                onClick={() => setShowRoleModal(true)}
                className="sm:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 min-h-[38px]"
                title="Switch RBAC Role"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Quick Reset State Button */}
            {onQuickReset && (
              <button
                id="reset-demo-state-btn"
                onClick={onQuickReset}
                title="Reset Demo Data"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200/60 min-h-[38px]"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* RBAC Session Switcher Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fade-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Strict RBAC Credentials Guard</h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Portal Access Restricted by Credentials</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You are currently authenticated as <strong>{currentUser.name}</strong> (
                <span className="font-bold uppercase">{currentUser.role}</span> account).
              </p>
              <p className="text-[11px] text-amber-700">
                {currentUser.role === 'student'
                  ? 'Student accounts cannot access recruiter hiring tools without logging into a verified Recruiter account.'
                  : 'Recruiter accounts cannot enroll as a candidate without logging into a Student candidate account.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-slate-900">Current Active Portal:</div>
                <div className="text-slate-600 font-medium">
                  {currentRole === 'student' ? 'Student Candidate Portal' : 'Recruiter & ATS Hiring Workspace'}
                </div>
              </div>

              <button
                id="signout-and-switch-role-btn"
                onClick={() => {
                  setShowRoleModal(false);
                  onSignOut();
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out & Enter Different Credentials</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              LMS-grade credential isolation prevents cross-role privilege escalation.
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

