import React from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import { LogOut, ShieldCheck, Building2, UserCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-600 text-white';
      case 'HOD':
        return 'bg-purple-600 text-white';
      case 'WARDEN':
        return 'bg-emerald-600 text-white';
      case 'WATCHMAN':
        return 'bg-amber-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              Hostel Outing Permission System
            </h1>
            <p className="text-xs text-slate-500 font-medium">Campus Outing & Approval Management</p>
          </div>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 leading-none mb-0.5">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {user.register_number ? `Reg: ${user.register_number}` : user.email}
                </div>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={() => authService.logout()}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
