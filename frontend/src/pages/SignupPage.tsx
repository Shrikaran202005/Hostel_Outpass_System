import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Department, HostelBlock, Role } from '../types';
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Building,
  Home,
  GraduationCap,
  Hash,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  // Selected Account Type Role (STUDENT | HOD | WARDEN)
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');

  // Form inputs
  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>('');
  const [hostelBlockId, setHostelBlockId] = useState<number | ''>('');
  const [roomNumber, setRoomNumber] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dynamic Options loaded from backend
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hostelBlocks, setHostelBlocks] = useState<HostelBlock[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Submit and Error states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [depts, blocks] = await Promise.all([
          authService.getDepartments(),
          authService.getHostelBlocks(),
        ]);
        setDepartments(depts);
        setHostelBlocks(blocks);
      } catch (err) {
        console.error('Failed to load signup options', err);
        setError('Failed to load system departments and hostel blocks. Please refresh.');
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMetadata();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Common Validations
    if (!name.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    // Role Specific Validations
    if (selectedRole === 'STUDENT') {
      if (!registerNumber.trim()) {
        setError('Register Number is required for Student.');
        return;
      }
      if (!departmentId) {
        setError('Department selection is required for Student.');
        return;
      }
      if (!year) {
        setError('Academic Year selection is required for Student.');
        return;
      }
      if (!hostelBlockId) {
        setError('Hostel Block selection is required for Student.');
        return;
      }
      if (!roomNumber.trim()) {
        setError('Room Number is required for Student.');
        return;
      }
    } else if (selectedRole === 'HOD') {
      if (!departmentId) {
        setError('Department selection is required for HOD.');
        return;
      }
    } else if (selectedRole === 'WARDEN') {
      if (!hostelBlockId) {
        setError('Hostel Block selection is required for Warden.');
        return;
      }
    }

    setSubmitting(true);

    try {
      await authService.signup({
        role: selectedRole,
        name: name.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        register_number: selectedRole === 'STUDENT' ? registerNumber.trim() : undefined,
        department_id: (selectedRole === 'STUDENT' || selectedRole === 'HOD') && departmentId ? Number(departmentId) : undefined,
        year: selectedRole === 'STUDENT' && year ? Number(year) : undefined,
        hostel_block_id: (selectedRole === 'STUDENT' || selectedRole === 'WARDEN') && hostelBlockId ? Number(hostelBlockId) : undefined,
        room_number: selectedRole === 'STUDENT' ? roomNumber.trim() : undefined,
      });

      // On success, redirect to login with success message
      navigate('/login', {
        state: { successMessage: `Account created successfully as ${selectedRole}. Please log in.` },
      });
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail) && detail.length > 0) {
        setError(detail[0]?.msg || 'Validation failed. Please check your inputs.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-brand-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl shadow-brand-600/30">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Account Registration</h1>
          <p className="text-slate-400 text-xs mt-1">Self-Registration Portal for Students, HODs, and Wardens</p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {loadingMeta ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Loading available departments and hostel blocks...
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Account Type Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Account Type <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-brand-400 absolute left-3.5 top-3" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="w-full bg-slate-900/90 border border-brand-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="STUDENT" className="bg-slate-900 text-white font-semibold">Student</option>
                    <option value="HOD" className="bg-slate-900 text-white font-semibold">HOD (Head of Department)</option>
                    <option value="WARDEN" className="bg-slate-900 text-white font-semibold">Warden (Hostel Block)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedRole === 'STUDENT' && 'Student account for raising outing permission requests.'}
                  {selectedRole === 'HOD' && 'Department HOD account for reviewing department student requests.'}
                  {selectedRole === 'WARDEN' && 'Hostel Warden account for confirming parent consent and granting final approvals.'}
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder={selectedRole === 'STUDENT' ? 'e.g. Arjun Raj' : selectedRole === 'HOD' ? 'e.g. Dr. Arun Kumar' : 'e.g. Mr. Rajesh Kumar'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder={selectedRole === 'STUDENT' ? 'karthik@example.com' : selectedRole === 'HOD' ? 'hod.cse@example.com' : 'warden.cblock@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* STUDENT Specific Fields */}
              {selectedRole === 'STUDENT' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Register Number <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. CSE2027005"
                          value={registerNumber}
                          onChange={(e) => setRegisterNumber(e.target.value)}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Year of Study <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <select
                          required
                          value={year}
                          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">
                            [ Select Year ]
                          </option>
                          <option value={1} className="bg-slate-900 text-white">1st Year</option>
                          <option value={2} className="bg-slate-900 text-white">2nd Year</option>
                          <option value={3} className="bg-slate-900 text-white">3rd Year</option>
                          <option value={4} className="bg-slate-900 text-white">4th Year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Department <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <select
                          required
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">
                            [ Select Department ]
                          </option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Hostel Block <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <select
                          required
                          value={hostelBlockId}
                          onChange={(e) => setHostelBlockId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-slate-900 text-slate-400">
                            [ Select Hostel Block ]
                          </option>
                          {hostelBlocks.map((block) => (
                            <option key={block.id} value={block.id} className="bg-slate-900 text-white">
                              {block.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Room Number <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. C-204"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* HOD Specific Field */}
              {selectedRole === 'HOD' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Department <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      required
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        [ Select Department ]
                      </option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id} className="bg-slate-900 text-white">
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">This HOD will become responsible for approving outing requests of this department.</p>
                </div>
              )}

              {/* WARDEN Specific Field */}
              {selectedRole === 'WARDEN' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Assigned Hostel Block <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <select
                      required
                      value={hostelBlockId}
                      onChange={(e) => setHostelBlockId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        [ Select Hostel Block ]
                      </option>
                      {hostelBlocks.map((block) => (
                        <option key={block.id} value={block.id} className="bg-slate-900 text-white">
                          {block.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">This Warden will become responsible for parent consent confirmation and final approval of this hostel block.</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/25 disabled:opacity-50 mt-6"
              >
                {submitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Create {selectedRole} Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Login Link Footer */}
          <div className="mt-6 pt-5 border-t border-slate-700/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
