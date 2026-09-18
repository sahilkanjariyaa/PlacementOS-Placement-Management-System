import React from 'react';

const statusConfig = {
  // Application statuses
  applied: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Applied', dot: 'bg-blue-500' },
  shortlisted: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Shortlisted', dot: 'bg-purple-500' },
  test: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Assessment / Test', dot: 'bg-amber-500' },
  interview: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Interview Round', dot: 'bg-indigo-500' },
  selected: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Selected / Placed', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Rejected', dot: 'bg-rose-500' },

  // Drive statuses
  open: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Open', dot: 'bg-emerald-500' },
  closed: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Closed', dot: 'bg-slate-500' },
  completed: { bg: 'bg-teal-50 text-teal-700 border-teal-200', label: 'Completed', dot: 'bg-teal-500' },

  // Placement status
  unplaced: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Unplaced', dot: 'bg-amber-500' },
  placed: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Placed', dot: 'bg-emerald-500' },
  opted_out: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Opted Out', dot: 'bg-slate-400' },

  // Active status
  active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Active', dot: 'bg-emerald-500' },
  inactive: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Inactive', dot: 'bg-slate-400' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const normalized = status ? status.toLowerCase() : 'applied';
  const config = statusConfig[normalized] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    label: status,
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};
