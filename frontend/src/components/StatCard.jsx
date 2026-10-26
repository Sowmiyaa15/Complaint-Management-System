import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colorMap = {
    blue: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      accent: 'border-sky-500',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      accent: 'border-amber-500',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      accent: 'border-indigo-500',
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      accent: 'border-emerald-500',
    },
    slate: {
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      accent: 'border-slate-500',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      accent: 'border-rose-500',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
