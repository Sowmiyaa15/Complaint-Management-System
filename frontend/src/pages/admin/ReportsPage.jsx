import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { StatCard } from '../../components/StatCard';
import { Toast } from '../../components/Toast';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Timer,
  Users,
  RefreshCw,
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const ReportsPage = () => {
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [employeePerformance, setEmployeePerformance] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [kpiRes, trendsRes, empRes] = await Promise.all([
        reportService.getKpis(),
        reportService.getTrends(),
        reportService.getEmployeePerformance(
          startDate ? `${startDate}T00:00:00` : null,
          endDate ? `${endDate}T23:59:59` : null
        ),
      ]);

      setKpis(kpiRes);
      setTrends(trendsRes);
      setEmployeePerformance(empRes);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await reportService.exportCsv(
        startDate ? `${startDate}T00:00:00` : null,
        endDate ? `${endDate}T23:59:59` : null
      );
      setToast({ message: 'CSV report downloaded successfully!', type: 'success' });
    } catch (err) {
      console.error('CSV export failed:', err);
      setToast({ message: 'Failed to generate CSV export', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const trendChartData = {
    labels: trends.map((t) => t.date),
    datasets: [
      {
        label: 'Complaint Submissions',
        data: trends.map((t) => t.count),
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Performance Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated grievance metrics, temporal submission trends, and officer resolution performance.
          </p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={exporting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Exporting...' : 'Export CSV Report'}</span>
        </button>
      </div>

      {/* Date Range Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-700">Date Range:</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Apply Filter</span>
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  fetchReports();
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Processed"
          value={kpis?.totalComplaints || 0}
          icon={BarChart3}
          color="blue"
          subtitle="System-wide volume"
        />
        <StatCard
          title="Resolved Grievances"
          value={kpis?.resolvedCount || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Officially completed"
        />
        <StatCard
          title="Pending Queue"
          value={kpis?.pendingCount || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting processing"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={`${kpis?.averageResolutionHours || 0} hrs`}
          icon={Timer}
          color="indigo"
          subtitle="Mean time to resolution"
        />
      </div>

      {/* Trends Chart & Employee Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temporal Submission Trends */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Complaint Submission Trends</h2>
            <p className="text-xs text-slate-400">Chronological volume over time</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            {trends.length > 0 ? (
              <Bar
                data={trendChartData}
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
              <p className="text-xs text-slate-400">No trend data available for selected period.</p>
            )}
          </div>
        </div>

        {/* Employee Performance Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Officer Resolution Performance</h2>
            <p className="text-xs text-slate-400">Resolved complaint count per assigned employee</p>
          </div>

          <div className="flex-1 overflow-x-auto">
            {employeePerformance.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium">No resolutions recorded within this period</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Officer</th>
                    <th className="px-4 py-3 text-right">Resolved Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employeePerformance.map((emp) => (
                    <tr key={emp.employeeId} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {emp.employeeName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          {emp.resolvedCount} completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
