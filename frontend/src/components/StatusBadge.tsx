import React from 'react';
import { OutingStatus } from '../types';

interface StatusBadgeProps {
  status: OutingStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (status: OutingStatus) => {
    switch (status) {
      case 'PENDING_HOD':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PENDING_WARDEN':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'PENDING_WARDEN_ASSIGNMENT':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'APPROVED':

        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'CANCELLED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'EXITED':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'LATE_RETURN':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getFormatLabel = (status: OutingStatus) => {
    switch (status) {
      case 'PENDING_HOD':
        return 'Pending HOD';
      case 'PENDING_WARDEN':
        return 'Pending Warden';
      case 'PENDING_WARDEN_ASSIGNMENT':
        return 'Pending Warden Assignment';
      case 'APPROVED':

        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'CANCELLED':
        return 'Cancelled';
      case 'EXITED':
        return 'Exited';
      case 'COMPLETED':
        return 'Completed';
      case 'LATE_RETURN':
        return 'Late Return';
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {getFormatLabel(status)}
    </span>
  );
};
