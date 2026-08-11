import React, { useEffect, useState } from 'react';
import { OutingRequest, User } from '../types';
import { outingService } from '../services/outings';
import { authService } from '../services/auth';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { OutingDetailModal } from '../components/OutingDetailModal';
import { ShieldCheck, PhoneCall, CheckCircle2, XCircle, AlertTriangle, Eye, Home } from 'lucide-react';

export const WardenDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pendingOutings, setPendingOutings] = useState<OutingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal state
  const [activeOuting, setActiveOuting] = useState<OutingRequest | null>(null);
  const [parentChecked, setParentChecked] = useState(false);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Detail Modal state
  const [viewOuting, setViewOuting] = useState<OutingRequest | null>(null);

  const fetchPendingOutings = async () => {
    try {
      const data = await outingService.getWardenPendingOutings();
      setPendingOutings(data);
    } catch (err) {
      console.error('Failed to load pending Warden outings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
    fetchPendingOutings();
  }, []);

  const openDecisionModal = (outing: OutingRequest) => {
    setActiveOuting(outing);
    setParentChecked(outing.parent_approval_confirmed);
    setComment('');
    setErrorMsg('');
  };

  const handleParentConfirmationToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setParentChecked(isChecked);
    setErrorMsg('');

    if (isChecked && activeOuting && !activeOuting.parent_approval_confirmed) {
      try {
        const updated = await outingService.wardenConfirmParent(activeOuting.id);
        setActiveOuting(updated);
      } catch (err: any) {
        setParentChecked(false);
        setErrorMsg(err.response?.data?.detail || 'Failed to record parent confirmation.');
      }
    }
  };

  const handleApprove = async () => {
    if (!activeOuting) return;
    setErrorMsg('');

    if (!parentChecked && !activeOuting.parent_approval_confirmed) {
      setErrorMsg('Parent approval must be verified and checked before final Warden approval.');
      return;
    }

    setProcessing(true);
    try {
      await outingService.wardenApprove(activeOuting.id, comment);
      setActiveOuting(null);
      fetchPendingOutings();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to approve outing request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!activeOuting) return;
    setProcessing(true);
    setErrorMsg('');

    try {
      await outingService.wardenReject(activeOuting.id, comment);
      setActiveOuting(null);
      fetchPendingOutings();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to reject outing request.');
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
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Warden Final Approval Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500">Verify parent consent personally and grant final outing authorization</p>
          </div>

          {user && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold shadow-2xs">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>
                My Hostel Block: {user.hostel_block_name || 'A Block'}
              </span>
            </div>
          )}
        </div>

        {/* Requests Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Pending Warden Approvals ({user?.hostel_block_name || 'My Block'})
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
              {pendingOutings.length} Pending
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading pending requests...</div>
          ) : pendingOutings.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">All Warden approvals cleared!</p>
              <p className="text-xs text-slate-400 mt-1">
                There are no HOD-approved requests currently pending verification for{' '}
                <strong className="text-slate-600">{user?.hostel_block_name || 'your block'}</strong>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Student Details</th>
                    <th className="px-6 py-3.5">Hostel & Department</th>
                    <th className="px-6 py-3.5">Outing Date & Window</th>
                    <th className="px-6 py-3.5">Destination & Reason</th>
                    <th className="px-6 py-3.5">Parent Approval</th>
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
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {outing.student?.hostel_block?.name || user?.hostel_block_name || 'A Block'}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Room {outing.student?.room_number || 'N/A'} | Dept: {outing.student?.department?.code || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{outing.outing_date}</div>
                        <div className="text-[11px] text-slate-500">
                          {outing.leaving_time} - {outing.expected_return_time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{outing.destination}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{outing.reason}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            outing.parent_approval_confirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <PhoneCall className="w-3 h-3 mr-1" />
                          {outing.parent_approval_confirmed ? 'Confirmed' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setViewOuting(outing)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => openDecisionModal(outing)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
                        >
                          Process Request
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

      {/* Warden Decision & Parent Confirmation Modal */}
      {activeOuting && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Warden Verification & Final Approval</h3>
            <p className="text-xs text-slate-500 mt-1">
              Outing #OUT-{activeOuting.id} for <strong className="text-slate-700">{activeOuting.student?.name}</strong> ({activeOuting.student?.hostel_block?.name || user?.hostel_block_name})
            </p>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Parent verification box */}
            <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/60">
              <h4 className="text-xs font-bold uppercase text-amber-800 tracking-wider mb-2 flex items-center space-x-1.5">
                <PhoneCall className="w-4 h-4" />
                <span>Mandatory Parent Verification Step</span>
              </h4>
              <p className="text-xs text-amber-700 mb-3">
                The Warden must personally contact the student's parent/guardian by phone or in person to verify authorization.
              </p>

              <label className="flex items-center space-x-3 cursor-pointer p-2.5 bg-white rounded-lg border border-amber-300 hover:border-amber-400 transition-colors">
                <input
                  type="checkbox"
                  checked={parentChecked || activeOuting.parent_approval_confirmed}
                  onChange={handleParentConfirmationToggle}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-900">
                  [ ] Parent approval obtained
                </span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Remarks to Student</label>
              <textarea
                rows={2}
                placeholder="Optional warden notes or remarks"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setActiveOuting(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                Reject Request
              </button>
              <button
                onClick={handleApprove}
                disabled={processing || (!parentChecked && !activeOuting.parent_approval_confirmed)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Final Approve Outing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outing Detail Modal */}
      <OutingDetailModal outing={viewOuting} onClose={() => setViewOuting(null)} />
    </div>
  );
};
