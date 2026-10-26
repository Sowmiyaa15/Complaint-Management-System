import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border bg-white animate-in slide-in-from-bottom-5 duration-200">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-600 shrink-0" />}

      <span className="text-sm font-medium text-slate-800">{message}</span>

      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
