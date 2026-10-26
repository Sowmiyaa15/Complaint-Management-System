import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Modal } from '../../components/Modal';
import { Toast } from '../../components/Toast';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const ROLES = ['ALL', 'ADMIN', 'EMPLOYEE', 'CITIZEN'];

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Feedback Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState('EMPLOYEE');
  const [createPhone, setCreatePhone] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('EMPLOYEE');
  const [editPhone, setEditPhone] = useState('');
  const [editing, setEditing] = useState(false);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const data = await userService.getUsers(params);
      setUsers(data.content || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  // Create User Handler
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await userService.createUser({
        name: createName.trim(),
        email: createEmail.trim(),
        password: createPassword,
        role: createRole,
        phoneNumber: createPhone.trim(),
      });
      setToast({ message: `User "${createName}" created successfully!`, type: 'success' });
      setCreateModalOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreatePhone('');
      fetchUsers();
    } catch (err) {
      console.error('Create user error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to create user',
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  // Edit User Handler
  const openEditModal = (u) => {
    setEditTarget(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditPhone(u.phoneNumber || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      await userService.updateUser(editTarget.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        phoneNumber: editPhone.trim(),
      });
      setToast({ message: `User "${editName}" updated successfully!`, type: 'success' });
      setEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Edit user error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to update user',
        type: 'error',
      });
    } finally {
      setEditing(false);
    }
  };

  // Delete User Handler
  const openDeleteModal = (u) => {
    setDeleteTarget(u);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await userService.deleteUser(deleteTarget.id);
      setToast({ message: `User "${deleteTarget.name}" deleted.`, type: 'success' });
      setDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to delete user',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'EMPLOYEE':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
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
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision staff accounts, configure role-based privileges, and oversee user profiles.
          </p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Staff User</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                Role: {r}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={fetchUsers}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shrink-0"
            title="Refresh user list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-medium text-slate-600">No users match your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the role filter or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">#{u.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{u.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete User"
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

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Staff / Admin User"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. Robert Officer"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="officer@example.com"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
            <select
              value={createRole}
              onChange={(e) => setCreateRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="EMPLOYEE">EMPLOYEE (Investigation Officer)</option>
              <option value="ADMIN">ADMIN (System Administrator)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
            <input
              type="tel"
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              placeholder="+1-555-0199"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User #${editTarget?.id}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="CITIZEN">CITIZEN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
            />
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
        title="Confirm User Deletion"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-700">
              <p className="font-bold">Are you sure you want to remove this user?</p>
              <p className="mt-1">
                User #{deleteTarget?.id} ("{deleteTarget?.name}", {deleteTarget?.email}) will be permanently deleted.
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
