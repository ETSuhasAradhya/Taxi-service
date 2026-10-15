import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'amber', subtitle, trend }) {
  const colorMap = {
    amber: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
    blue: 'bg-blue-500/10 text-blue-600 border-blue-200/50',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    purple: 'bg-purple-500/10 text-purple-600 border-purple-200/50',
    rose: 'bg-rose-500/10 text-rose-600 border-rose-200/50'
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorMap[color] || colorMap.amber}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
        </div>
      )}
    </div>
  );
}
