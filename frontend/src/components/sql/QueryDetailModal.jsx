import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SqlCodeBlock from './SqlCodeBlock';
import OutputTable from './OutputTable';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  Share2,
  Database,
  Layers,
  BookOpen,
  CheckCircle2,
  TableProperties,
  Info,
  Play,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function QueryDetailModal({ query, isOpen, onClose }) {
  const { showToast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [liveResult, setLiveResult] = useState(null);
  const [liveError, setLiveError] = useState(null);

  if (!query) return null;

  const handleShareLink = () => {
    const url = `${window.location.origin}/admin/sql-explorer?query=${query.slug || query.id}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url);
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.left = '-999999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    showToast('Deep-link copied to clipboard!', 'info');
  };

  const handleRunLive = async () => {
    if (!query.executable) return;
    setIsRunning(true);
    setLiveError(null);
    try {
      const res = await api.post(`/sql-explorer/run/${query.id}`);
      if (res.data.success) {
        setLiveResult(res.data);
        showToast(`Executed in ${res.data.executionTimeMs}ms (${res.data.rowCount} rows)`, 'success');
      }
    } catch (err) {
      setLiveError(err.response?.data?.message || 'Execution failed on MySQL server');
    } finally {
      setIsRunning(false);
    }
  };

  const isReport = [
    'Customer Reports',
    'Driver Reports',
    'Booking Reports',
    'Revenue Reports',
    'Payment and Revenue Reports'
  ].includes(query.category) || query.report_key;

  const concept = query.dbms_concept || query.dbmsConcept || query.concept;
  const useCase = query.sample_use_case || query.why_useful_in_taxi_app || query.useCase;
  const tables = query.tables_involved || query.tablesInvolved || [];
  const explanation = query.line_by_line_explanation || query.explanation || [];
  const sampleOutput = query.sample_output || query.sampleOutput;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={query.title}>
      <div className="space-y-6">
        {/* Header Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg">
              Query #{query.id}
            </span>

            {query.executable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Play className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Live Executable
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Educational Safe View
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> {query.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              icon={Share2}
              onClick={handleShareLink}
              title="Copy URL deep-link to this query"
            >
              Share Link
            </Button>

            {query.executable && (
              <Button
                size="sm"
                variant="primary"
                icon={Play}
                isLoading={isRunning}
                onClick={handleRunLive}
              >
                Run Live Query
              </Button>
            )}
          </div>
        </div>

        {/* DBMS Concept & Use Case Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-500" /> DBMS Concept
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {concept}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Info className="w-4 h-4 text-sky-500" /> Production Use Case
            </div>
            <p className="text-sm text-slate-700">
              {useCase}
            </p>
          </div>
        </div>

        {/* Tables Involved & Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Tables Involved:</span>
            <div className="flex flex-wrap gap-1">
              {tables.map((tbl) => (
                <span
                  key={tbl}
                  className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono font-semibold border border-amber-200"
                >
                  {tbl}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {query.tags?.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Syntax-Highlighted SQL Code Block */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              SQL Query Statement
            </h4>
            <span className="text-[11px] text-slate-400">MySQL 8.0 InnoDB Dialect</span>
          </div>
          <SqlCodeBlock sql={query.sql} />
        </div>

        {/* Live Execution Output if Run */}
        {liveResult && (
          <div className="space-y-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" /> Live Database Result (MySQL 8)
              </h4>
              <div className="flex items-center gap-3 text-xs font-mono text-emerald-700">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {liveResult.executionTimeMs} ms
                </span>
                <span>•</span>
                <span>{liveResult.rowCount} rows returned</span>
              </div>
            </div>

            <OutputTable
              columns={liveResult.columns}
              rows={liveResult.data?.map(row => liveResult.columns.map(col => row[col]))}
              isSample={false}
            />
          </div>
        )}

        {liveError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{liveError}</span>
          </div>
        )}

        {/* Line-by-Line DBMS Explanation */}
        {explanation.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TableProperties className="w-4 h-4 text-amber-500" /> Line-by-Line Pedagogical Breakdown
            </h4>

            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {explanation.map((item, idx) => (
                <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="sm:w-2/5 shrink-0 font-mono text-xs font-semibold text-amber-800 bg-amber-50/70 p-2 rounded-xl border border-amber-200/50 break-words whitespace-pre-wrap">
                    Line {item.line}: {item.code || `SQL Block ${item.line}`}
                  </div>
                  <div className="sm:w-3/5 text-xs text-slate-600 leading-relaxed pt-1">
                    {item.explanation || item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Output Table */}
        {!liveResult && sampleOutput && sampleOutput.columns && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sample Execution Output Preview
            </h4>
            <OutputTable
              columns={sampleOutput.columns}
              rows={sampleOutput.rows}
              isSample={true}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
