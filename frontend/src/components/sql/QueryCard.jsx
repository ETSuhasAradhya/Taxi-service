import React from 'react';
import { BookOpen, Layers, Database, ArrowRight, Play } from 'lucide-react';

export default function QueryCard({ query, onClick, isSelected }) {
  const isReport = [
    'Customer Reports',
    'Driver Reports',
    'Booking Reports',
    'Revenue Reports',
    'Payment and Revenue Reports'
  ].includes(query.category) || query.report_key;

  const concept = query.dbms_concept || query.dbmsConcept || query.concept;
  const tables = query.tables_involved || query.tablesInvolved || [];

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-400/20 shadow-md bg-amber-50/20'
          : 'border-slate-200/80 hover:border-amber-300'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-wider font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            #{query.id}
          </span>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {query.executable ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Play className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> Executable
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <BookOpen className="w-2.5 h-2.5 text-amber-600" /> Educational
              </span>
            )}
            {isReport && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                Live Report
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug mb-1.5">
          {query.title}
        </h4>

        {/* DBMS Concept */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {concept}
        </p>
      </div>

      {/* Footer Info & Tags */}
      <div>
        {/* Tables Involved */}
        {tables.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5 text-[11px] text-slate-500 font-mono">
            <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{tables.join(', ')}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {query.tags?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono"
            >
              #{tag}
            </span>
          ))}
          {query.tags?.length > 3 && (
            <span className="text-[10px] text-slate-400 self-center">
              +{query.tags.length - 3}
            </span>
          )}
        </div>

        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> {query.category}
          </span>

          <span className="flex items-center gap-1 font-semibold text-[11px] text-amber-600 group-hover:translate-x-0.5 transition-transform">
            Explore <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
