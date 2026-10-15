import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', message = 'Loading data...', className = '' }) {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-amber-500`} />
      {message && <p className="text-xs font-medium uppercase tracking-wider">{message}</p>}
    </div>
  );
}
