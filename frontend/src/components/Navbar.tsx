import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import { authService } from '../services/auth';
import { LogOut, Building2, Clock, CheckCircle2, History } from 'lucide-react';

interface NavbarProps {
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const location = useLocation();

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

  const isHod = user?.role === 'HOD';
  const isWarden = user?.role === 'WARDEN';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Hostel Outing Permission System
              </h1>
              <p className="text-xs text-slate-500 font-medium">Campus Outing & Approval Management</p>
            </div>
          </Link>

          {/* Navigation Links for HOD and WARDEN */}
          {user && (isHod || isWarden) && (
            <nav className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-200">
              {isHod && (
                <>
                  <Link
                    to="/hod/dashboard"
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1.5 ${
                      location.pathname === '/hod/dashboard'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pending Requests</span>
                  </Link>
                  <Link
                    to="/hod/history"
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1.5 ${
                      location.pathname === '/hod/history'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </Link>
                </>
              )}

              {isWarden && (
                <>
                  <Link
                    to="/warden/dashboard"
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1.5 ${
                      location.pathname === '/warden/dashboard'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pending Requests</span>
                  </Link>
                  <Link
                    to="/warden/history"
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1.5 ${
                      location.pathname === '/warden/history'
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>History</span>
                  </Link>
                </>
              )}
            </nav>
          )}
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
