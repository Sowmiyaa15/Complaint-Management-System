import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const data = await complaintService.getAssignedComplaints({ size: 10, sortBy: 'submittedAt', sortDir: 'desc' });
        setComplaints(data.content || []);
      } catch (err) {
        console.error('Failed to load assigned complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const totalAssigned = complaints.length;
  const pendingAction = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-800/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full text-sky-100">
            Staff Investigation Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Officer Workspace — {user?.name}
          </h1>
          <p className="text-sm text-sky-100 mt-1 max-w-xl">
            Review and resolve assigned citizen grievances, document investigative milestones, and record internal staff notes.
          </p>
        </div>
        <Link
          to="/employee/complaints"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-sky-800 font-bold text-sm shadow-md hover:bg-sky-50 transition-all"
        >
          <Briefcase className="w-4 h-4" />
          <span>View Assigned Queue</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Assigned"
          value={totalAssigned}
          icon={Briefcase}
          color="blue"
          subtitle="Workload in your queue"
        />
        <StatCard
          title="Assigned (New)"
          value={pendingAction}
          icon={Clock}
          color="amber"
          subtitle="Requires investigation start"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={AlertCircle}
          color="indigo"
          subtitle="Work currently underway"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed grievances"
        />
      </div>

      {/* Assigned Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Assigned Complaints</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned grievances requiring officer attention</p>
          </div>
          <Link
            to="/employee/complaints"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading assigned complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Your assigned queue is clear!</h3>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no active complaints assigned to your queue.
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
                        Process Complaint →
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
