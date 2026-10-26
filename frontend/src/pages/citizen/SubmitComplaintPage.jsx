import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import {
  FilePlus,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const CATEGORIES = [
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

export const SubmitComplaintPage = () => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // Check max file size 10MB
    for (const file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the maximum allowed size of 10MB.`);
        return;
      }
    }
    setError('');
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a complaint title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a detailed description of the grievance.');
      return;
    }

    setLoading(true);

    try {
      const response = await complaintService.submitComplaint(
        title.trim(),
        description.trim(),
        category,
        files
      );
      setSubmittedComplaint(response);
    } catch (err) {
      console.error('Submission failed:', err);
      setError(
        err.response?.data?.message ||
        'Failed to submit complaint. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Complaint Successfully Lodged!
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Your complaint has been submitted with initial status <span className="font-semibold text-amber-600">PENDING</span>. City administration has received the grievance.
        </p>

        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 inline-block w-full max-w-sm">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
            Unique Tracking Reference
          </span>
          <span className="text-3xl font-black text-sky-700 tracking-tight block mt-1">
            #{submittedComplaint.id}
          </span>
          <span className="text-xs text-slate-600 font-medium mt-1 block">
            "{submittedComplaint.title}"
          </span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={`/complaints/${submittedComplaint.id}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>View Complaint Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setSubmittedComplaint(null);
              setTitle('');
              setDescription('');
              setCategory(CATEGORIES[0]);
              setFiles([]);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit New Complaint
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide complete details regarding the grievance to ensure prompt investigation.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-sm text-rose-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Complaint Subject / Title *
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken drainage pipe on 4th cross street"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please explain the issue in detail, including specific location, severity, duration, and any hazards..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 leading-relaxed"
            ></textarea>
          </div>

          {/* Supporting Evidence File Upload */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Supporting Evidence / Documents (Optional, max 10MB per file)
            </label>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl cursor-pointer bg-slate-50/60 hover:bg-sky-50/30 transition-all">
              <UploadCloud className="w-8 h-8 text-sky-600 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Click or drag files here to attach
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Images (PNG, JPG), PDF documents supported
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </label>

            {/* Attached file chips */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-slate-600">Attached files ({files.length}):</p>
                <div className="space-y-1.5">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 text-xs text-slate-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-slate-400 shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FilePlus className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
