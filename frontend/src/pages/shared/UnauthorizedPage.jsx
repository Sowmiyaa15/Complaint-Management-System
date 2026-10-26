import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Denied</h1>
        <p className="text-sm text-slate-500 mt-2">
          You do not have the required role privileges to access this resource or administrative screen.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
