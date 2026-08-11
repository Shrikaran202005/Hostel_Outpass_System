import React from 'react';
import { ApprovalHistory } from '../types';
import {
  FileText,
  UserCheck,
  XCircle,
  PhoneCall,
  CheckCircle2,
  LogOut,
  LogIn,
  AlertTriangle,
  Ban,
} from 'lucide-react';

interface TimelineProps {
  history: ApprovalHistory[];
}

export const Timeline: React.FC<TimelineProps> = ({ history }) => {
  const getStepDetails = (item: ApprovalHistory) => {
    switch (item.action) {
      case 'SUBMITTED':
        return {
          title: 'Outing Request Submitted',
          icon: <FileText className="w-4 h-4 text-blue-600" />,
          bgColor: 'bg-blue-100 border-blue-200',
        };
      case 'HOD_APPROVED':
        return {
          title: 'HOD Approval Granted',
          icon: <UserCheck className="w-4 h-4 text-purple-600" />,
          bgColor: 'bg-purple-100 border-purple-200',
        };
      case 'HOD_REJECTED':
        return {
          title: 'Rejected by HOD',
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          bgColor: 'bg-rose-100 border-rose-200',
        };
      case 'PARENT_APPROVAL_CONFIRMED':
        return {
          title: 'Parent Approval Confirmed by Warden',
          icon: <PhoneCall className="w-4 h-4 text-amber-600" />,
          bgColor: 'bg-amber-100 border-amber-200',
        };
      case 'WARDEN_APPROVED':
        return {
          title: 'Final Warden Approval Granted',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bgColor: 'bg-emerald-100 border-emerald-200',
        };
      case 'WARDEN_REJECTED':
        return {
          title: 'Rejected by Warden',
          icon: <XCircle className="w-4 h-4 text-rose-600" />,
          bgColor: 'bg-rose-100 border-rose-200',
        };
      case 'CANCELLED':
        return {
          title: 'Cancelled by Student',
          icon: <Ban className="w-4 h-4 text-slate-600" />,
          bgColor: 'bg-slate-100 border-slate-200',
        };
      case 'EXIT_RECORDED':
        return {
          title: 'Gate Exit Recorded',
          icon: <LogOut className="w-4 h-4 text-sky-600" />,
          bgColor: 'bg-sky-100 border-sky-200',
        };
      case 'RETURN_RECORDED':
        return {
          title: 'Gate Return Recorded',
          icon: <LogIn className="w-4 h-4 text-indigo-600" />,
          bgColor: 'bg-indigo-100 border-indigo-200',
        };
      case 'LATE_RETURN_DETECTED':
        return {
          title: 'Late Return Flagged',
          icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
          bgColor: 'bg-orange-100 border-orange-200',
        };
      case 'COMPLETED':
        return {
          title: 'Outing Completed',
          icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
          bgColor: 'bg-blue-100 border-blue-200',
        };
      default:
        return {
          title: item.action,
          icon: <FileText className="w-4 h-4 text-slate-600" />,
          bgColor: 'bg-slate-100 border-slate-200',
        };
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return ts;
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        No history records available.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item) => {
        const step = getStepDetails(item);
        return (
          <div key={item.id} className="relative group">
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${step.bgColor}`}
            >
              {step.icon}
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-xs text-slate-900">{step.title}</span>
                <span className="text-[11px] font-medium text-slate-400">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>
                  By <strong className="text-slate-700 font-medium">{item.actor_name || `ID #${item.actor_id}`}</strong>
                </span>
                <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                  {item.actor_role}
                </span>
              </div>

              {item.comment && (
                <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">
                  "{item.comment}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
