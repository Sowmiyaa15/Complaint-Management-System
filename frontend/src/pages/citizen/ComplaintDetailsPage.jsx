import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { StatusBadge } from '../../components/StatusBadge';
import { Toast } from '../../components/Toast';
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  Clock,
  CheckCircle2,
  Lock,
  MessageSquare,
  Send,
  Eye,
  Download,
  AlertCircle,
} from 'lucide-react';

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isEmployee, isCitizen } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Staff Status Update Form
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Staff Internal Note Form
  const [internalNote, setInternalNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getComplaintById(id);
      setComplaint(data);
      setNewStatus(data.status);
    } catch (err) {
      console.error('Failed to load complaint details:', err);
      setError(
        err.response?.data?.message ||
        'Could not load complaint details. You may not have permission to view this complaint.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await complaintService.updateStatus(id, newStatus, statusComment);
      setToast({ message: 'Complaint status updated successfully!', type: 'success' });
      setStatusComment('');
      await fetchComplaintDetails();
    } catch (err) {
      console.error('Status update failed:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to update status',
        type: 'error',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setAddingNote(true);
    try {
      await complaintService.addInternalNote(id, internalNote);
      setToast({ message: 'Internal note recorded securely.', type: 'success' });
      setInternalNote('');
      await fetchComplaintDetails();
    } catch (err) {
      console.error('Adding note failed:', err);
      setToast({
        message: err.response?.data?.message || 'Failed to add internal note',
        type: 'error',
      });
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Display Complaint</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          ← Return Back
        </button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(complaint.status);
  const isStaff = isAdmin || isEmployee;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Top Breadcrumb & Action Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Complaint Reference:</span>
          <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
            #{complaint.id}
          </span>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Title and Badge */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {complaint.category}
              </span>
              <span className="text-xs text-slate-400">
                Submitted on {new Date(complaint.submittedAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {complaint.title}
            </h1>
          </div>
          <div className="shrink-0">
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Status Stepper Progress Bar */}
        <div className="py-2">
          <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-4">
            Resolution Progress Tracker
          </p>
          <div className="grid grid-cols-5 gap-2 relative">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-semibold mt-2 tracking-tight ${
                      isCurrent
                        ? 'text-sky-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Complainant:</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {complaint.complainantName}
            </span>
            <span className="text-slate-400 text-[11px]">{complaint.complainantEmail}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Assigned Officer:</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {complaint.assignedEmployeeName || 'Unassigned'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {complaint.assignedEmployeeEmail || 'Pending assignment'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium">Resolution Timestamp:</span>
            <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
              {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : 'Pending'}
            </span>
          </div>
        </div>

        {/* Description Body */}
        <div>
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
            Grievance Description
          </h3>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
            {complaint.description}
          </div>
        </div>

        {/* Attachments Section */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Supporting Evidence ({complaint.attachments.length})</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {complaint.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 block truncate">
                      {att.fileName}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {att.fileSize ? `${(att.fileSize / 1024).toFixed(1)} KB` : 'Attached file'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="View file inline"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <a
                      href={att.fileUrl.replace('/view', '/download')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Staff Action Controls (Status Update & Internal Notes) */}
      {isStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Update Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Update Complaint Status</span>
            </h3>
            <form onSubmit={handleStatusUpdate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transition Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                  {isAdmin && <option value="ASSIGNED">ASSIGNED</option>}
                  {isAdmin && <option value="PENDING">PENDING</option>}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution / Progress Comment
                </label>
                <textarea
                  rows={3}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Explain actions taken (sent to complainant as official update)..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </form>
          </div>

          {/* Internal Notes Panel (Private to Staff) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <span>Internal Staff Notes</span>
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Staff Only
              </span>
            </div>

            <form onSubmit={handleAddInternalNote} className="space-y-3">
              <textarea
                rows={2}
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add confidential internal note (never shown to citizens)..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-slate-400"
              ></textarea>

              <button
                type="submit"
                disabled={addingNote || !internalNote.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {addingNote ? 'Saving...' : 'Add Private Note'}
              </button>
            </form>

            {/* List of internal notes */}
            {complaint.internalNotes && complaint.internalNotes.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {complaint.internalNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-purple-800">
                      <span className="font-semibold">{note.authorName} ({note.authorRole})</span>
                      <span className="text-purple-600">
                        {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap">{note.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">
                No internal notes recorded yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Public Complaint History Audit Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-600" />
          <span>Complaint Audit Timeline & Public Updates</span>
        </h2>

        {complaint.updates && complaint.updates.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {complaint.updates.map((update, idx) => (
              <div key={update.id || idx} className="relative">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white border-2 border-sky-600"></div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {update.authorName}
                      {update.authorRole && (
                        <span className="ml-1.5 font-normal text-[11px] text-slate-400">
                          ({update.authorRole})
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {update.statusChangeTo && (
                    <div className="inline-block mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-600">
                        Status changed to{' '}
                      </span>
                      <StatusBadge status={update.statusChangeTo} />
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {update.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No activity history recorded.</p>
        )}
      </div>
    </div>
  );
};
