import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../../services/reportService';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Timer,
  ArrowRight,
  UserPlus,
  BarChart3,
  Calendar,
} from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [unassignedComplaints, setUnassignedComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const loadData = async () => {
    try {
      const [kpiRes, statusRes, catRes, unassignedRes, empRes] = await Promise.all([
        reportService.getKpis(),
        reportService.getStatusBreakdown(),
        reportService.getCategoryDistribution(),
        complaintService.getComplaints({ status: 'PENDING', size: 5 }),
        userService.getEmployees(),
      ]);

      setKpis(kpiRes);
      setStatusData(statusRes);
      setCategoryData(catRes);
      setUnassignedComplaints(unassignedRes.content || []);
      setEmployees(empRes);
      if (empRes.length > 0) {
        setSelectedEmployeeId(empRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedEmployeeId) return;

    setAssigning(true);
    try {
      await complaintService.assignComplaint(selectedComplaint.id, selectedEmployeeId);
      setToast({ message: `Complaint #${selectedComplaint.id} assigned successfully!`, type: 'success' });
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Assignment failed:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to assign complaint',
        type: 'error',
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading admin analytics & metrics...</p>
      </div>
    );
  }

  // Chart Configurations
  const doughnutChartData = {
    labels: statusData.map((s) => s.status),
    datasets: [
      {
        data: statusData.map((s) => s.count),
        backgroundColor: [
          '#f59e0b', // PENDING - Amber
          '#0284c7', // ASSIGNED - Sky
          '#6366f1', // IN_PROGRESS - Indigo
          '#10b981', // RESOLVED - Emerald
          '#64748b', // CLOSED - Slate
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const barChartData = {
    labels: categoryData.map((c) => c.category),
    datasets: [
      {
        label: 'Complaints',
        data: categoryData.map((c) => c.count),
        backgroundColor: '#0284c7',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider bg-sky-500/20 text-sky-300 px-3 py-1 rounded-full border border-sky-500/30">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Central Command Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Real-time oversight of system-wide grievances, resolution KPIs, category breakdown, and officer allocations.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Manage Complaints
          </Link>
          <Link
            to="/admin/reports"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/10"
          >
            Detailed Reports
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Complaints"
          value={kpis?.totalComplaints || 0}
          icon={ClipboardList}
          color="blue"
          subtitle="System-wide submissions"
        />
        <StatCard
          title="Pending Assignment"
          value={kpis?.pendingCount || 0}
          icon={Clock}
          color="amber"
          subtitle={`${kpis?.unassignedCount || 0} unassigned complaints`}
        />
        <StatCard
          title="Active Investigations"
          value={(kpis?.assignedCount || 0) + (kpis?.inProgressCount || 0)}
          icon={AlertCircle}
          color="indigo"
          subtitle="Assigned & in progress"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={`${kpis?.averageResolutionHours || 0}h`}
          icon={Timer}
          color="emerald"
          subtitle="From submission to resolved"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Status Distribution</h2>
            <p className="text-xs text-slate-400">Live breakdown across lifecycle phases</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {statusData.length > 0 ? (
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                  },
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">No status data available.</p>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Complaints by Category</h2>
            <p className="text-xs text-slate-400">Grievance volume by municipal division</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 10 } } },
                    x: { ticks: { font: { size: 10 } } },
                  },
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">No category data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Unassigned / Pending Complaints Quick-Action Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Unassigned Pending Complaints</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Requires administrator assignment to an employee officer
            </p>
          </div>
          <Link
            to="/admin/complaints?status=PENDING"
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All Pending</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {unassignedComplaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700">All complaints have been assigned!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">There are no unassigned pending complaints.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Complainant</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unassignedComplaints.map((c) => (
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
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openAssignModal(c)}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs border border-sky-200 transition-colors inline-flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Complaint #${selectedComplaint?.id}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <span className="text-xs text-slate-400 block mb-1">Complaint:</span>
            <p className="text-sm font-bold text-slate-800">
              "{selectedComplaint?.title}"
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Officer to Assign *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning || !selectedEmployeeId}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
