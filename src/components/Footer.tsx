import React from 'react';
import { ShieldCheck, Sparkles, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand & System Info */}
          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AuraATS Enterprise SaaS</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Talent Acquisition & Career Platform</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Candidate & Recruiter RBAC Isolated
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500" /> Enterprise Data Guard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
