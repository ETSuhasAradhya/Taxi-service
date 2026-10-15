import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function SqlCodeBlock({ sql = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(sql);
      } else {
        // Fallback for non-https or older environments
        const textArea = document.createElement('textarea');
        textArea.value = sql;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const lines = sql.trim().split('\n');

  // Simple, robust syntax highlighting tokenizer for SQL keywords
  const highlightLine = (line) => {
    if (line.trim().startsWith('--')) {
      return <span className="text-slate-500 italic">{line}</span>;
    }

    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
      'ON', 'AND', 'OR', 'NOT', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS', 'DISTINCT', 'BETWEEN', 'IN', 'IS NULL',
      'IS NOT NULL', 'EXISTS', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
      'START TRANSACTION', 'COMMIT', 'ROLLBACK', 'CALL', 'EXPLAIN', 'CASE', 'WHEN',
      'THEN', 'ELSE', 'END', 'DENSE_RANK()', 'OVER', 'DATE', 'DATE_FORMAT', 'NOW()',
      'CURDATE()', 'COALESCE', 'ROUND', 'NULLS LAST'
    ];

    // Regex to identify SQL keywords safely
    const regex = new RegExp(`\\b(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

    const parts = line.split(regex);
    return parts.map((part, idx) => {
      if (keywords.some(k => k.toLowerCase() === part.toLowerCase())) {
        return (
          <span key={idx} className="text-amber-400 font-bold">
            {part.toUpperCase()}
          </span>
        );
      }
      // String literals in quotes
      if (/^'[^']*'$/.test(part)) {
        return <span key={idx} className="text-emerald-400">{part}</span>;
      }
      // Numbers
      if (/^\d+(\.\d+)?$/.test(part)) {
        return <span key={idx} className="text-purple-300">{part}</span>;
      }
      return <span key={idx} className="text-slate-100">{part}</span>;
    });
  };

  return (
    <div className="relative rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-semibold text-slate-400 ml-2">MySQL 8.0 DDL/DML</span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy SQL Query"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px]">Copy SQL</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto max-h-[380px]">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40">
                <td className="pr-4 py-0.5 text-right select-none text-slate-600 text-[11px] w-8">
                  {idx + 1}
                </td>
                <td className="py-0.5 whitespace-pre">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
