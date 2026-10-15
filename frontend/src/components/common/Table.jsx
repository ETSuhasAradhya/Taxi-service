import React from 'react';

export default function Table({ headers = [], children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/75">
            {headers.map((head, idx) => (
              <th
                key={idx}
                className="px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
}
