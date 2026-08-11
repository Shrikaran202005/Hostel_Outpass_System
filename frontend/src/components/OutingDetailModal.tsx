import React, { useEffect, useState } from 'react';
import { OutingRequest, ApprovalHistory } from '../types';
import { outingService } from '../services/outings';
import { StatusBadge } from './StatusBadge';
import { Timeline } from './Timeline';
import { X, Calendar, Clock, MapPin, FileText, UserCheck, ShieldCheck } from 'lucide-react';

interface OutingDetailModalProps {
  outing: OutingRequest | null;
  onClose: () => void;
}

export const OutingDetailModal: React.FC<OutingDetailModalProps> = ({ outing, onClose }) => {
  const [history, setHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (outing) {
      setLoading(true);
      outingService
        .getOutingHistory(outing.id)
        .then((data) => setHistory(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [outing]);

  if (!outing) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                Outing #OUT-{outing.id}
              </span>
              <StatusBadge status={outing.status} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Outing Request Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Student Info */}
          {outing.student && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Student Details
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Name:</span>{' '}
                  <span className="font-semibold text-slate-900">{outing.student.name}</span>
                </div>
                <div>
                  <span className="text-slate-500">Register No:</span>{' '}
                  <span className="font-semibold text-slate-900">{outing.student.register_number}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hostel:</span>{' '}
                  <span className="font-semibold text-slate-900">{outing.student.hostel || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Room No:</span>{' '}
                  <span className="font-semibold text-slate-900">{outing.student.room_number || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Outing details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Outing Date</span>
                <span className="text-sm font-semibold text-slate-900">{outing.outing_date}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Clock className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[11px] text-slate-400 font-medium">Time Window</span>
                <span className="text-sm font-semibold text-slate-900">
                  {outing.leaving_time} - {outing.expected_return_time}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Destination:</span>{' '}
                <span className="text-slate-900">{outing.destination}</span>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Reason:</span>{' '}
                <span className="text-slate-900">{outing.reason}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
              <ShieldCheck className={`w-4 h-4 ${outing.parent_approval_confirmed ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="font-semibold text-slate-700">Parent Approval Status:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${outing.parent_approval_confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {outing.parent_approval_confirmed ? 'Confirmed by Warden' : 'Not Confirmed'}
              </span>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
              Audit History & Timeline
            </h3>
            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading audit history...</div>
            ) : (
              <Timeline history={history} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
