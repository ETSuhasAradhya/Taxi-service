import React from 'react';

export default function StatusBadge({ status, type = 'status', className = '' }) {
  if (!status) return null;

  const statusKey = String(status).toLowerCase();

  const statusMap = {
    // Bookings
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    assigned: 'bg-sky-100 text-sky-800 border-sky-200',
    accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',

    // Driver & Vehicle Availability
    available: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    on_trip: 'bg-purple-100 text-purple-800 border-purple-200',
    in_use: 'bg-purple-100 text-purple-800 border-purple-200',
    off_duty: 'bg-slate-100 text-slate-700 border-slate-200',
    maintenance: 'bg-rose-100 text-rose-800 border-rose-200',

    // Payment Statuses
    paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    failed: 'bg-rose-100 text-rose-800 border-rose-200',
    refunded: 'bg-amber-100 text-amber-800 border-amber-200',

    // Vehicle Tiers
    mini: 'bg-blue-50 text-blue-700 border-blue-200',
    sedan: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    suv: 'bg-purple-50 text-purple-700 border-purple-200',
    luxury: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold'
  };

  const labels = {
    in_progress: 'In Progress',
    on_trip: 'On Trip',
    in_use: 'In Use',
    off_duty: 'Off Duty',
    mini: 'Mini',
    sedan: 'Sedan',
    suv: 'SUV',
    luxury: 'Luxury'
  };

  const colorClass = statusMap[statusKey] || 'bg-slate-100 text-slate-800 border-slate-200';
  const displayLabel = labels[statusKey] || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
      {displayLabel}
    </span>
  );
}
