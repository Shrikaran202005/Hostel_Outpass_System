import React, { useEffect, useState } from 'react';
import { OutingRequest, User } from '../types';
import { outingService } from '../services/outings';
import { authService } from '../services/auth';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { OutingDetailModal } from '../components/OutingDetailModal';
import { UserCheck, CheckCircle2, XCircle, Clock, Eye, AlertCircle, Building } from 'lucide-react';

export const HodDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingOutings, setPendingOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal state
  const [activeOuting, setActiveOuting] = useState<OutingRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);

  // View modal state
  const [viewOuting, setViewOuting] = useState<OutingRequest | null>(null);

  const fetchPendingOutings = async () => {
    try {
      const data = await outingService.getHodPendingOutings();
      setPendingOutings(data);
    } catch (err) {
      console.error('Failed to load pending HOD outings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
    fetchPendingOutings();
  }, []);

  const handleDecision = async () => {
    if (!activeOuting || !actionType) return;
    setProcessing(true);

    try {
      if (actionType === 'approve') {
        await outingService.hodApprove(activeOuting.id, comment);
      } else {
        await outingService.hodReject(activeOuting.id, comment);
      }
      setActiveOuting(null);
      setActionType(null);
      setComment('');
      fetchPendingOutings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit HOD decision.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header with Scope Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <UserCheck className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">HOD Approval Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500">Review and approve academic outing permission requests</p>
          </div>

          {user && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-800 text-xs font-bold shadow-2xs">
              <Building className="w-4 h-4 text-purple-600" />
              <span>
                My Department: {user.department_code || user.department_name || 'CSE'}
              </span>
            </div>
          )}
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Pending HOD Approvals ({user?.department_code || 'My Department'})
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
              {pendingOutings.length} Pending
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading pending requests...</div>
          ) : pendingOutings.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">All pending requests cleared!</p>
              <p className="text-xs text-slate-400 mt-1">
                There are currently no outing requests awaiting review for department{' '}
                <strong className="text-slate-600">{user?.department_code || 'your department'}</strong>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Student Details</th>
                    <th className="px-6 py-3.5">Department & Hostel</th>
                    <th className="px-6 py-3.5">Outing Window</th>
                    <th className="px-6 py-3.5">Destination & Reason</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingOutings.map((outing) => (
                    <tr key={outing.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">#OUT-{outing.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{outing.student?.name}</div>
                        <div className="text-[11px] text-slate-500">Reg: {outing.student?.register_number}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                          {outing.student?.department?.code || user?.department_code || 'CSE'}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {outing.student?.hostel_block?.name || outing.student?.hostel || 'Hostel'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        <div>{outing.outing_date}</div>
                        <div className="text-[11px] text-slate-500">
                          {outing.leaving_time} - {outing.expected_return_time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{outing.destination}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{outing.reason}</div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setViewOuting(outing)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setActiveOuting(outing);
                            setActionType('approve');
                            setComment('');
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setActiveOuting(outing);
                            setActionType('reject');
                            setComment('');
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Decision Modal */}
      {activeOuting && actionType && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              {actionType === 'approve' ? 'Approve Outing Request' : 'Reject Outing Request'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Outing #OUT-{activeOuting.id} for {activeOuting.student?.name} ({activeOuting.student?.department?.code || user?.department_code})
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarks / Comments {actionType === 'reject' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                rows={3}
                placeholder={actionType === 'approve' ? 'Optional approval note' : 'Reason for rejection'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setActiveOuting(null);
                  setActionType(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDecision}
                disabled={processing || (actionType === 'reject' && !comment.trim())}
                className={`px-4 py-2 text-white font-bold rounded-xl text-xs shadow-md transition-colors ${
                  actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                } disabled:opacity-50`}
              >
                {processing ? 'Processing...' : actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outing Details Modal */}
      <OutingDetailModal outing={viewOuting} onClose={() => setViewOuting(null)} />
    </div>
  );
};
