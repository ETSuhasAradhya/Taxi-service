import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

export default function OutputTable({ columns = [], rows = [], executionTime, isSample = false }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
        Empty result set (0 rows returned).
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Metrics Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-semibold text-slate-700">
          {rows.length} {rows.length === 1 ? 'row' : 'rows'} returned
        </span>
        {executionTime && (
          <span className="flex items-center gap-1 font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Clock className="w-3 h-3" /> Execution: {executionTime}
          </span>
        )}
        {isSample && (
          <span className="flex items-center gap-1 font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <CheckCircle className="w-3 h-3 text-amber-600" /> Stored Pedagogical Sample
          </span>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner max-h-[340px]">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-sm border-b border-slate-200 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 py-2.5 font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-amber-50/30 transition-colors">
                {Array.isArray(row)
                  ? row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 whitespace-nowrap text-slate-800">
                        {cell === null ? (
                          <span className="text-slate-400 italic">NULL</span>
                        ) : (
                          String(cell)
                        )}
                      </td>
                    ))
                  : columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-3 py-2 whitespace-nowrap text-slate-800">
                        {row[col] === null ? (
                          <span className="text-slate-400 italic">NULL</span>
                        ) : (
                          String(row[col])
                        )}
                      </td>
                    ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
