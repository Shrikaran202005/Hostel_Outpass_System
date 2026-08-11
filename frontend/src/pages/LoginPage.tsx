import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Building2, Mail, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { successMessage?: string })?.successMessage;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      switch (res.role) {
        case 'STUDENT':
          navigate('/student/dashboard');
          break;
        case 'HOD':
          navigate('/hod/dashboard');
          break;
        case 'WARDEN':
          navigate('/warden/dashboard');
          break;
        case 'WATCHMAN':
          navigate('/watchman/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign in. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Hostel@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-brand-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">College Hostel Outing Portal</h1>
          <p className="text-slate-400 text-xs mt-1">Multi-Department & Multi-Hostel Block Scoped Management System</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/25 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-4 pt-3 border-t border-slate-700/60 text-center">
            <span className="text-xs text-slate-400">Don't have an account? </span>
            <Link
              to="/signup"
              className="text-xs text-slate-200 hover:text-white font-bold transition-colors inline-flex items-center space-x-1 ml-1 underline underline-offset-2"
            >
              <span>Create New Account</span>
            </Link>
          </div>


          {/* Quick Demo Accounts by Role */}
          <div className="mt-6 pt-5 border-t border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Multi-User Scoped Demo Accounts
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">Password: Hostel@123</span>
            </div>

            <div className="space-y-3">
              {/* Students Row */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Students (by Dept & Block):</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoUser('student.a@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-brand-400">Arjun Raj</div>
                    <div className="text-[10px] text-slate-400">CSE | A Block</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoUser('student.b@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-brand-400">Nithya S</div>
                    <div className="text-[10px] text-slate-400">ECE | B Block</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoUser('student.c@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-brand-400">Rahul Menon</div>
                    <div className="text-[10px] text-slate-400">CSE | C Block</div>
                  </button>
                </div>
              </div>

              {/* HODs Row */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">HODs (Scoped by Department):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoUser('hod.cse@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-purple-400">Dr. Arun Kumar</div>
                    <div className="text-[10px] text-purple-300">hod.cse@hostelapp.local (CSE)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoUser('hod.ece@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-purple-400">Dr. Priya Sharma</div>
                    <div className="text-[10px] text-purple-300">hod.ece@hostelapp.local (ECE)</div>
                  </button>
                </div>
              </div>

              {/* Wardens Row */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Wardens (Scoped by Hostel Block):</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoUser('warden.a@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Mr. Rajesh</div>
                    <div className="text-[10px] text-emerald-300">A Block</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoUser('warden.b@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Ms. Meena</div>
                    <div className="text-[10px] text-emerald-300">B Block</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoUser('warden.c@hostelapp.local')}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
                  >
                    <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-400">Mr. Suresh</div>
                    <div className="text-[10px] text-emerald-300">C Block</div>
                  </button>
                </div>
              </div>

              {/* Watchman Row */}
              <button
                type="button"
                onClick={() => setDemoUser('watchman@hostelapp.local')}
                className="w-full p-2 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-left transition-colors group"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400">Mr. Suresh B (Gate Watchman)</div>
                <div className="text-[10px] text-amber-300">watchman@hostelapp.local (Gate Exit & Return Verification)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
