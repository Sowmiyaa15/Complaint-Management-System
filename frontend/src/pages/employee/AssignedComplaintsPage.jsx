import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Search,
  Calendar,
  Briefcase,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';

const STATUSES = ['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const AssignedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortDir, setSortDir] = useState('desc');

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: 'submittedAt',
        sortDir,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await complaintService.getAssignedComplaints(params);
      setComplaints(data.content || []);
    } catch (err) {
      console.error('Failed to load assigned complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [statusFilter, sortDir]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAssigned();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assigned Complaint Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Grievances allocated to you for on-ground investigation, documentation, and resolution.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description or complainant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                Status: {st}
              </option>
            ))}
          </select>

          {/* Sort Order */}
          <button
            type="button"
            onClick={() => setSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 shrink-0"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline uppercase text-[11px]">{sortDir}</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchAssigned}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shrink-0"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Fetching assigned complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No matching assigned complaints</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are no complaints matching the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Complainant</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">#{c.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {c.complainantName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
                      >
                        Manage & Update →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
