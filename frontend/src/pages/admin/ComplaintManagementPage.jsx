import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { userService } from '../../services/userService';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import {
  Search,
  Calendar,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Infrastructure',
  'Sanitation',
  'Public Services',
  'Roads & Transportation',
  'Water Supply',
  'Electricity',
  'Health & Safety',
  'Environmental',
  'Other',
];

const STATUSES = ['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const ComplaintManagementPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortDir, setSortDir] = useState('desc');

  // Modals & Feedback
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {
        sortBy: 'submittedAt',
        sortDir,
      };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const [complaintsRes, employeesRes] = await Promise.all([
        complaintService.getComplaints(params),
        userService.getEmployees(),
      ]);

      setComplaints(complaintsRes.content || []);
      setEmployees(employeesRes);
      if (employeesRes.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(employeesRes[0].id);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, sortDir]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  // Assign Handlers
  const openAssignModal = (complaint) => {
    setAssignTarget(complaint);
    setSelectedEmployeeId(complaint.assignedEmployeeId || (employees[0]?.id || ''));
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssigning(true);
    try {
      await complaintService.assignComplaint(assignTarget.id, selectedEmployeeId);
      setToast({ message: `Complaint #${assignTarget.id} successfully assigned!`, type: 'success' });
      setAssignModalOpen(false);
      fetchComplaints();
    } catch (err) {
      console.error('Assignment error:', err);
      setToast({
        message: err.response?.data?.message || 'Assignment failed',
        type: 'error',
      });
    } finally {
      setAssigning(false);
    }
  };

  // Edit Handlers
  const openEditModal = (complaint) => {
    setEditTarget(complaint);
    setEditTitle(complaint.title);
    setEditCategory(complaint.category);
    setEditDescription(complaint.description);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await complaintService.updateComplaintDetails(editTarget.id, {
        title: editTitle,
        category: editCategory,
        description: editDescription,
      });
      setToast({ message: `Complaint #${editTarget.id} updated successfully!`, type: 'success' });
      setEditModalOpen(false);
      fetchComplaints();
    } catch (err) {
      console.error('Edit error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to update complaint details',
        type: 'error',
      });
    } finally {
      setEditing(false);
    }
  };

  // Delete Handlers
  const openDeleteModal = (complaint) => {
    setDeleteTarget(complaint);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await complaintService.deleteComplaint(deleteTarget.id);
      setToast({ message: `Complaint #${deleteTarget.id} permanently deleted.`, type: 'success' });
      setDeleteModalOpen(false);
      fetchComplaints();
    } catch (err) {
      console.error('Deletion error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to delete complaint',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
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
            Grievance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Central administration console for viewing, filtering, editing, and assigning all complaints.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, complainant, officer, or ID..."
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

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
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
            onClick={fetchComplaints}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shrink-0"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading complaints from database...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-medium text-slate-600">No complaints match your filters</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or category filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Complainant</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Officer</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">#{c.id}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800 max-w-[200px] truncate">
                      {c.title}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-700">
                      <div>{c.complainantName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{c.complainantEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {c.assignedEmployeeName ? (
                        <span className="font-semibold text-slate-800">{c.assignedEmployeeName}</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(c.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <Link
                          to={`/complaints/${c.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Assign */}
                        <button
                          onClick={() => openAssignModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Assign Officer"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => openDeleteModal(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Complaint"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Complaint #${assignTarget?.id}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select an employee officer to investigate and resolve this grievance:
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Officer *
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.email}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Complaint #${editTarget?.id}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editing}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-50"
            >
              {editing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Permanent Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-700">
              <p className="font-bold">This action cannot be undone.</p>
              <p className="mt-1">
                Complaint #{deleteTarget?.id} ("{deleteTarget?.title}") will be permanently deleted along with all its audit history and file attachments.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
