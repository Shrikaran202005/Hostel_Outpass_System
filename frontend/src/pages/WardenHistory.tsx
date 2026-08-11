import React, { useEffect, useState } from 'react';
import { OutingRequest, User, Department } from '../types';
import { outingService } from '../services/outings';
import { authService } from '../services/auth';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { OutingDetailModal } from '../components/OutingDetailModal';
import {
  History,
  Building2,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const WardenHistory: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [outings, setOutings] = useState<OutingRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Selected Outing for View Modal
  const [viewOuting, setViewOuting] = useState<OutingRequest | null>(null);

  const fetchDepartments = async () => {
    try {
      const depts = await outingService.getDepartments();
      setDepartments(depts);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter) params.status_filter = statusFilter;
      if (selectedDeptId) params.department_id = Number(selectedDeptId);

      const data = await outingService.getWardenHistory(params);
      setOutings(data);
    } catch (err) {
      console.error('Failed to load Warden history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchDepartments();
    fetchHistory();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setSelectedDeptId('');
    setTimeout(() => {
      outingService.getWardenHistory().then(setOutings).catch(console.error);
    }, 0);
  };

  // Summary counts calculated from the scoped result set
  const totalCount = outings.length;
  const approvedCount = outings.filter(
    (o) => o.status === 'APPROVED' || o.status === 'EXITED' || o.status === 'COMPLETED'
  ).length;
  const rejectedCount = outings.filter((o) => o.status === 'REJECTED').length;
  const completedCount = outings.filter((o) => o.status === 'COMPLETED').length;
  const lateReturnCount = outings.filter((o) => o.status === 'LATE_RETURN').length;

  const blockDisplayName =
    user?.hostel_block_name || user?.hostel || 'Hostel Block';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <History className="w-6 h-6 text-emerald-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Outing History</h1>
            </div>
            <p className="text-xs text-slate-500">
              Historical outing records for students in your hostel block.
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold shadow-2xs">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Hostel Block: {blockDisplayName}</span>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Outings
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved</span>
            </span>
            <span className="text-2xl font-black text-emerald-700 mt-1 block">{approvedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-[11px] font-bold text-rose-600 uppercase tracking-wider flex items-center space-x-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </span>
            <span className="text-2xl font-black text-rose-700 mt-1 block">{rejectedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="block text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Completed</span>
            </span>
            <span className="text-2xl font-black text-blue-700 mt-1 block">{completedCount}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="block text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Late Returns</span>
            </span>
            <span className="text-2xl font-black text-orange-700 mt-1 block">{lateReturnCount}</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Student Name, Register Number or Outing ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING_HOD">Pending HOD</option>
                <option value="PENDING_WARDEN">Pending Warden</option>
                <option value="APPROVED">Approved</option>
                <option value="EXITED">Exited</option>
                <option value="COMPLETED">Completed</option>
                <option value="LATE_RETURN">Late Return</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="w-full md:w-48">
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code ? `${d.code} - ${d.name}` : d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={fetchHistory}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs inline-flex items-center space-x-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-colors inline-flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* History Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Hostel Block Outing Records ({blockDisplayName})
            </h2>
            <span className="text-xs text-slate-500 font-medium">{outings.length} Record(s)</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading history records...</div>
          ) : outings.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                {searchQuery || statusFilter || selectedDeptId
                  ? 'No matching outing found.'
                  : 'No outing history found.'}
              </p>
              <p className="text-xs text-slate-400">
                {searchQuery || statusFilter || selectedDeptId
                  ? 'Try clearing your search query or status filter.'
                  : 'No student outing requests have been recorded for your hostel block.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">OUTING ID</th>
                    <th className="px-6 py-3.5">STUDENT</th>
                    <th className="px-6 py-3.5">REGISTER NUMBER</th>
                    <th className="px-6 py-3.5">DEPARTMENT</th>
                    <th className="px-6 py-3.5">DATE</th>
                    <th className="px-6 py-3.5">DESTINATION</th>
                    <th className="px-6 py-3.5">STATUS</th>
                    <th className="px-6 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {outings.map((outing) => (
                    <tr key={outing.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        #OUT-{outing.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {outing.student?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {outing.student?.register_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {outing.student?.department?.code ||
                          outing.student?.department_code ||
                          outing.student?.department?.name ||
                          'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {outing.outing_date}
                      </td>
                      <td className="px-6 py-4 text-slate-800 max-w-xs truncate">
                        {outing.destination}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={outing.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewOuting(outing)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center space-x-1 border border-emerald-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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

      {/* Outing Detail Modal */}
      {viewOuting && (
        <OutingDetailModal outing={viewOuting} onClose={() => setViewOuting(null)} />
      )}
    </div>
  );
};
