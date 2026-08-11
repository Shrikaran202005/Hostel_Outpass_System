import React, { useEffect, useState } from 'react';
import { OutingRequest, User, StudentDirectoryItem, Department, HostelBlock } from '../types';
import { outingService } from '../services/outings';
import { authService } from '../services/auth';
import { Navbar } from '../components/Navbar';
import { StatusBadge } from '../components/StatusBadge';
import { OutingDetailModal } from '../components/OutingDetailModal';
import {
  ShieldAlert,
  Search,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  RefreshCw,
  Eye,
  X,
  Users,
  Filter,
  UserCheck,
  Calendar,
  MapPin,
  FileText,
} from 'lucide-react';

export const WatchmanDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [todaysOutings, setTodaysOutings] = useState<OutingRequest[]>([]);
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hostelBlocks, setHostelBlocks] = useState<HostelBlock[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OutingRequest[] | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<number | ''>('');
  const [selectedBlockId, setSelectedBlockId] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Alerts
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modals
  const [viewOuting, setViewOuting] = useState<OutingRequest | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDirectoryItem | null>(null);

  const fetchTodaysOutings = async () => {
    setLoading(true);
    try {
      const data = await outingService.getWatchmanTodaysOutings();
      setTodaysOutings(data);
    } catch (err) {
      console.error('Failed to fetch today\'s outings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedDeptId !== '') params.department_id = Number(selectedDeptId);
      if (selectedBlockId !== '') params.hostel_block_id = Number(selectedBlockId);

      const data = await outingService.getWatchmanStudents(params);
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch student directory', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchFilterMetadata = async () => {
    try {
      const [depts, blocks] = await Promise.all([
        authService.getDepartments(),
        authService.getHostelBlocks(),
      ]);
      setDepartments(depts);
      setHostelBlocks(blocks);
    } catch (err) {
      console.error('Failed to fetch filter metadata', err);
    }
  };

  useEffect(() => {
    const u = authService.getCurrentUser();
    setUser(u);
    fetchTodaysOutings();
    fetchFilterMetadata();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedDeptId, selectedBlockId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      fetchStudents();
      return;
    }
    setSearching(true);
    setAlertMsg(null);
    try {
      const results = await outingService.watchmanSearchOutings(searchQuery.trim());
      setSearchResults(results);
      fetchStudents();
    } catch (err: any) {
      setAlertMsg({ type: 'error', msg: err.response?.data?.detail || 'Search failed.' });
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setAlertMsg(null);
    setSelectedDeptId('');
    setSelectedBlockId('');
    fetchStudents();
  };

  const handleRecordExit = async (outingId: number, studentName?: string) => {
    setAlertMsg(null);
    try {
      await outingService.watchmanRecordExit(outingId);
      setAlertMsg({
        type: 'success',
        msg: `Gate Exit recorded successfully for ${studentName || 'student'} (#OUT-${outingId}).`,
      });
      fetchTodaysOutings();
      fetchStudents();
      if (searchResults) {
        handleSearch({ preventDefault: () => {} } as any);
      }
      if (selectedStudent && selectedStudent.active_outing?.id === outingId) {
        setSelectedStudent({
          ...selectedStudent,
          current_outing_status: 'EXITED',
          active_outing: { ...selectedStudent.active_outing, status: 'EXITED' },
        });
      }
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        msg: err.response?.data?.detail || 'Failed to record student exit.',
      });
    }
  };

  const handleRecordReturn = async (outingId: number, studentName?: string) => {
    setAlertMsg(null);
    try {
      const updated = await outingService.watchmanRecordReturn(outingId);
      setAlertMsg({
        type: 'success',
        msg: `Gate Return recorded successfully for ${studentName || 'student'} (#OUT-${outingId}). Status: ${updated.status}.`,
      });
      fetchTodaysOutings();
      fetchStudents();
      if (searchResults) {
        handleSearch({ preventDefault: () => {} } as any);
      }
      if (selectedStudent && selectedStudent.active_outing?.id === outingId) {
        setSelectedStudent({
          ...selectedStudent,
          current_outing_status: updated.status,
          active_outing: { ...selectedStudent.active_outing, status: updated.status },
        });
      }
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        msg: err.response?.data?.detail || 'Failed to record student return.',
      });
    }
  };

  const displayedOutings = searchResults !== null ? searchResults : todaysOutings;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Main Gate Security Desk</h1>
            </div>
            <p className="text-xs text-slate-500">Verify student approval credentials and record gate exit/return movement</p>
          </div>

          <button
            onClick={() => {
              fetchTodaysOutings();
              fetchStudents();
            }}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh Gate Log</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Student Register Number (e.g. CSE2027001), Outing ID (#OUT-1), or Student Name"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={searching}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
              {(searchResults !== null || searchQuery !== '' || selectedDeptId !== '' || selectedBlockId !== '') && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Clear Search
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Message Alert Banner */}
        {alertMsg && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
              alertMsg.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {alertMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <span>{alertMsg.msg}</span>
            </div>
            <button onClick={() => setAlertMsg(null)} className="text-current opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section 1: Today's Authorized Outings */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              {searchResults !== null ? 'Search Results' : "Today's Authorized Outings"}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Showing {displayedOutings.length} records
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading gate records...</div>
          ) : displayedOutings.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No matching outing records found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchResults !== null
                  ? 'Try searching with a different Register Number or ID.'
                  : 'There are no active or approved student outings scheduled for today.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Student Details</th>
                    <th className="px-6 py-3.5">Date & Scheduled Window</th>
                    <th className="px-6 py-3.5">Destination</th>
                    <th className="px-6 py-3.5">Current Status</th>
                    <th className="px-6 py-3.5 text-right">Gate Verification Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedOutings.map((outing) => (
                    <tr key={outing.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">#OUT-{outing.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{outing.student?.name}</div>
                        <div className="text-[11px] font-mono text-brand-600 font-semibold">
                          Reg: {outing.student?.register_number || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {outing.student?.hostel} ({outing.student?.room_number})
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{outing.outing_date}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {outing.leaving_time} - {outing.expected_return_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{outing.destination}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={outing.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setViewOuting(outing)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
                        >
                          View Audit
                        </button>

                        {/* Record Exit */}
                        {outing.status === 'APPROVED' && (
                          <button
                            onClick={() => handleRecordExit(outing.id, outing.student?.name)}
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center space-x-1 shadow-xs"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Record Exit</span>
                          </button>
                        )}

                        {/* Record Return */}
                        {outing.status === 'EXITED' && (
                          <button
                            onClick={() => handleRecordReturn(outing.id, outing.student?.name)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center space-x-1 shadow-xs"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Record Return</span>
                          </button>
                        )}

                        {(outing.status === 'COMPLETED' || outing.status === 'LATE_RETURN') && (
                          <span className="text-[11px] font-semibold text-slate-400 italic">Movement Completed</span>
                        )}
                        {outing.status === 'REJECTED' && (
                          <span className="text-[11px] font-semibold text-rose-500 italic">Unauthorized (Rejected)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: All Students Directory */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">All Students</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Showing {students.length} registered students in campus database</p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>

              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-brand-500"
              >
                <option value="">All Blocks</option>
                {hostelBlocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {studentsLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading student directory...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No students found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">REGISTER NUMBER</th>
                    <th className="px-6 py-3.5">STUDENT NAME</th>
                    <th className="px-6 py-3.5">DEPARTMENT</th>
                    <th className="px-6 py-3.5">HOSTEL BLOCK</th>
                    <th className="px-6 py-3.5">ROOM</th>
                    <th className="px-6 py-3.5">CURRENT OUTING STATUS</th>
                    <th className="px-6 py-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-600">
                        {student.register_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {student.name}
                        <div className="text-[10px] text-slate-400 font-normal">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {student.department_code || student.department_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {student.hostel_block_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                        {student.room_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        {student.current_outing_status === 'NO ACTIVE OUTING' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            No Active Outing
                          </span>
                        ) : (
                          <StatusBadge status={student.current_outing_status as any} />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs transition-colors inline-flex items-center space-x-1 border border-brand-200"
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

      {/* Outing Audit History Modal */}
      <OutingDetailModal outing={viewOuting} onClose={() => setViewOuting(null)} />

      {/* Watchman Student View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs font-mono text-brand-600 font-semibold mt-0.5">
                  Reg No: {selectedStudent.register_number || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-semibold text-slate-800">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                <span className="font-semibold text-slate-800">{selectedStudent.department_name} ({selectedStudent.department_code})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Hostel Block</span>
                <span className="font-semibold text-slate-800">{selectedStudent.hostel_block_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Room Number</span>
                <span className="font-semibold text-slate-800">{selectedStudent.room_number || 'N/A'}</span>
              </div>
            </div>

            {/* Outing Information */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider mb-3 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Active / Recent Outing Record</span>
              </h4>

              {selectedStudent.active_outing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      #OUT-{selectedStudent.active_outing.id}
                    </span>
                    <StatusBadge status={selectedStudent.active_outing.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Outing Date</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.active_outing.outing_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Time Window</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {selectedStudent.active_outing.leaving_time} - {selectedStudent.active_outing.expected_return_time}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Destination</span>
                      <span className="font-semibold text-slate-800">{selectedStudent.active_outing.destination}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Reason</span>
                      <span className="text-slate-700">{selectedStudent.active_outing.reason}</span>
                    </div>
                  </div>

                  {/* Gate Movement Actions inside Modal */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                    {selectedStudent.active_outing.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleRecordExit(selectedStudent.active_outing!.id, selectedStudent.name)}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Record Exit</span>
                      </button>
                    )}

                    {selectedStudent.active_outing.status === 'EXITED' && (
                      <button
                        type="button"
                        onClick={() => handleRecordReturn(selectedStudent.active_outing!.id, selectedStudent.name)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5 shadow-xs"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Record Return</span>
                      </button>
                    )}

                    {['PENDING_HOD', 'PENDING_WARDEN', 'PENDING_WARDEN_ASSIGNMENT', 'REJECTED'].includes(
                      selectedStudent.active_outing.status
                    ) && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                        Not authorized for exit
                      </span>
                    )}

                    {selectedStudent.active_outing.status === 'COMPLETED' && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        Movement Completed
                      </span>
                    )}

                    {selectedStudent.active_outing.status === 'LATE_RETURN' && (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                        Late Return
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500">No active outing request</p>
                </div>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
