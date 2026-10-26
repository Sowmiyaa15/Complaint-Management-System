import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { Toast } from '../../components/Toast';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfileState } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
      });
      updateProfileState(updated);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(
        err.response?.data?.message ||
        'Failed to update profile. Email might already be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal account credentials and municipal contact information.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-sky-600/20">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{name}</h2>
            <p className="text-xs text-slate-400">{email}</p>
            <div className="mt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 uppercase">
                {user?.role} Role
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Contact Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1-555-0100"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
