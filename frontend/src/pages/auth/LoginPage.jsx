import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      // Route based on role
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'Invalid email or password. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-primary-500 flex items-center justify-center text-white mx-auto shadow-md shadow-sky-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome to CMS Portal
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Centralized Grievance Redressal & Complaint Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-sm text-rose-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
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
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Testing / Assessment */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@example.com', 'Admin@123')}
                className="py-2 px-2 text-center rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 font-medium border border-purple-200 transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('emp1@example.com', 'Employee@123')}
                className="py-2 px-2 text-center rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-medium border border-sky-200 transition-colors"
              >
                Employee
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('citizen1@example.com', 'Citizen@123')}
                className="py-2 px-2 text-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium border border-emerald-200 transition-colors"
              >
                Citizen
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-700 underline">
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
