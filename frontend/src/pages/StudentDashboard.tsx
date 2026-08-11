import React, { useEffect, useState } from 'react';
import { OutingRequest, User } from '../types';
import { outingService } from '../services/outings';
import { authService } from '../services/auth';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { OutingDetailModal } from '../components/OutingDetailModal';
import {
  Plus,
  Clock,
  Calendar,
  MapPin,
  FileText,
  AlertCircle,
  X,
  History,
  CheckCircle2,
  Ban,
  Send,
  Building,
  GraduationCap,
  Home,
  Lock,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOuting, setSelectedOuting] = useState<OutingRequest | null>(null);

  // Form states
  const [outingDate, setOutingDate] = useState('');
  const [leavingTime, setLeavingTime] = useState('10:00');
  const [returnTime, setReturnTime] = useState('16:00');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMyOutings = async () => {
    try {
      const data = await outingService.getMyOutings();
      setOutings(data);
    } catch (err) {
      console.error('Failed to load outings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
    fetchMyOutings();

    // Default to tomorrow's date for ease of testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setOutingDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleCreateOuting = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const todayStr = new Date().toISOString().split('T')[0];
    if (outingDate < todayStr) {
      setFormError('Outing date cannot be in the past.');
      return;
    }

    if (leavingTime >= returnTime) {
      setFormError('Leaving time must be before expected return time.');
      return;
    }

    if (!destination.trim() || !reason.trim()) {
      setFormError('Destination and reason are mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      await outingService.createOuting({
        outing_date: outingDate,
        leaving_time: `${leavingTime}:00`,
        expected_return_time: `${returnTime}:00`,
        destination: destination.trim(),
        reason: reason.trim(),
      });
      setShowCreateModal(false);
      setDestination('');
      setReason('');
      fetchMyOutings();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to submit outing request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOuting = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this outing request?')) return;
    try {
      await outingService.cancelOuting(id);
      fetchMyOutings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel outing request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Outing Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your campus outing permission requests</p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Outing Request</span>
          </button>
        </div>

        {/* Read-Only Student Academic & Hostel Scope Card */}
        {user && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                <span>My Academic & Hostel Profile</span>
              </span>
              <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Assigned by College Admin</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Building className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium uppercase">Department</span>
                  <span className="font-bold text-slate-900">
                    {user.department_code ? `${user.department_code} - ${user.department_name || ''}` : 'CSE Department'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Home className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium uppercase">Hostel Block</span>
                  <span className="font-bold text-slate-900">
                    {user.hostel_block_name || user.hostel || 'A Block'} {user.room_number ? `(Room ${user.room_number})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <GraduationCap className="w-5 h-5 text-brand-600 shrink-0" />
                <div>
                  <span className="block text-[10px] text-slate-400 font-medium uppercase">Academic Year</span>
                  <span className="font-bold text-slate-900">
                    {user.year ? `${user.year}rd Year` : '3rd Year'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">My Outing Requests</h2>
            <span className="text-xs text-slate-500 font-medium">Total: {outings.length}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your outings...</div>
          ) : outings.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No outing requests raised yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "New Outing Request" to raise permission.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Outing Date</th>
                    <th className="px-6 py-3.5">Time Window</th>
                    <th className="px-6 py-3.5">Destination</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outings.map((outing) => (
                    <tr key={outing.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">#OUT-{outing.id}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{outing.outing_date}</td>
                      <td className="px-6 py-4">
                        {outing.leaving_time} - {outing.expected_return_time}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{outing.destination}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={outing.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOuting(outing)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          View Details
                        </button>
                        {(outing.status === 'PENDING_HOD' || outing.status === 'PENDING_WARDEN') && (
                          <button
                            onClick={() => handleCancelOuting(outing.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Outing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Raise New Outing Request</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOuting} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Outing Date</label>
                <input
                  type="date"
                  required
                  value={outingDate}
                  onChange={(e) => setOutingDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Leaving Time</label>
                  <input
                    type="time"
                    required
                    value={leavingTime}
                    onChange={(e) => setLeavingTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Return Time</label>
                  <input
                    type="time"
                    required
                    value={returnTime}
                    onChange={(e) => setReturnTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Mall / Medical Center"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Outing</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Please state the specific reason for requesting permission"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-brand-600/20 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Outing Detail & History Modal */}
      <OutingDetailModal outing={selectedOuting} onClose={() => setSelectedOuting(null)} />
    </div>
  );
};
