import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FilePlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Calendar,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await complaintService.getMyComplaints({ size: 5, sortBy: 'submittedAt', sortDir: 'desc' });
        setComplaints(data.content || []);
      } catch (err) {
        console.error('Failed to load dashboard complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolved = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-primary-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full text-sky-100">
            Citizen Grievance Redressal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-sky-100 mt-1 max-w-xl">
            Track status updates on your existing complaints or file a new municipal grievance directly with city administration.
          </p>
        </div>
        <Link
          to="/submit-complaint"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-sky-700 font-bold text-sm shadow-md hover:bg-sky-50 active:bg-sky-100 transition-all"
        >
          <FilePlus className="w-4 h-4" />
          <span>Submit New Complaint</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Submitted"
          value={total}
          icon={ClipboardList}
          color="blue"
          subtitle="All filed complaints"
        />
        <StatCard
          title="Pending Review"
          value={pending}
          icon={Clock}
          color="amber"
          subtitle="Awaiting admin assignment"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={AlertCircle}
          color="indigo"
          subtitle="Currently being investigated"
        />
        <StatCard
          title="Resolved / Closed"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Grievances completed"
        />
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest filed submissions</p>
          </div>
          <Link
            to="/citizen/complaints"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No complaints submitted yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't filed any municipal complaints. Click the button below to submit your first issue.
            </p>
            <Link
              to="/submit-complaint"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-medium text-xs shadow-xs hover:bg-sky-700 transition-colors"
            >
              <FilePlus className="w-4 h-4" />
              <span>Submit Complaint</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Title</th>
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
                        View Details →
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
