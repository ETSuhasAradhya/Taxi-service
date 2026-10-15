import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import QueryCard from '../../components/sql/QueryCard';
import QueryDetailModal from '../../components/sql/QueryDetailModal';
import {
  Terminal,
  Search,
  Layers,
  Database,
  Filter,
  Sparkles,
  BookOpen,
  Code2,
  RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Basic SQL',
  'CRUD Operations',
  'Joins',
  'Aggregate Functions',
  'GROUP BY and HAVING',
  'Subqueries',
  'Constraints and Relationships',
  'Transactions',
  'Views and Indexes',
  'Stored Procedures and Triggers',
  'Customer Management',
  'Driver Management',
  'Booking Management',
  'Vehicle Management',
  'Payment and Revenue Reports',
  'Advanced DBMS Queries'
];

const POPULAR_KEYWORDS = [
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'GROUP BY',
  'HAVING',
  'Subquery',
  'COUNT',
  'SUM',
  'AVG',
  'BETWEEN',
  'DISTINCT',
  'Foreign Key',
  'Transactions',
  'Views',
  'Indexes'
];

export default function SqlExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queries, setQueries] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal Detail State
  const [activeQuery, setActiveQuery] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadQueries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);

      const res = await api.get(`/sql-explorer/queries?${params.toString()}`);
      if (res.data.success) {
        setQueries(res.data.data);
        if (res.data.categoryCounts) {
          setCategoryCounts(res.data.categoryCounts);
        }
      }
    } catch (err) {
      console.error('Failed to load SQL catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQueries();
  };

  // Check URL search params for ?query=<slug|id>
  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (queryParam) {
      openQueryById(queryParam);
    }
  }, [searchParams]);

  const openQueryById = async (idOrSlug) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/sql-explorer/queries/${idOrSlug}`);
      if (res.data.success) {
        setActiveQuery(res.data.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load query detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCardClick = (query) => {
    setSearchParams({ query: query.slug || query.id });
    openQueryById(query.id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveQuery(null);
    searchParams.delete('query');
    setSearchParams(searchParams);
  };

  // Client-side difficulty filtering if applied
  const displayedQueries = queries.filter((q) => {
    if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-xl text-slate-950 font-black">
              <Terminal className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">SQL Query Explorer</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Master interactive catalog of 48 verified MySQL 8 queries for college DBMS syllabus, viva prep, and practical labs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={loadQueries}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Bar & Quick Keyword Pills */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Search by keywords (e.g. INNER JOIN, GROUP BY, HAVING, Subquery, Transactions)..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button type="submit" variant="primary">
              Filter Catalog
            </Button>
            {searchQuery && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {/* Quick Keyword Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Syllabus Topics:
          </span>
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw}
              type="button"
              onClick={() => {
                setSearchQuery(kw);
                setSelectedCategory('All');
              }}
              className="px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 transition-colors border border-slate-200/60"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: 16 Categories Sidebar + Cards Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Category Filter Sidebar */}
        <div className="w-full lg:w-72 shrink-0 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 16 DBMS Categories
            </span>
            <span className="text-xs font-mono text-slate-400">Total: 48</span>
          </div>

          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {CATEGORIES.map((cat) => {
              const count = cat === 'All' ? 48 : categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`ml-2 px-1.5 py-0.2 rounded-md font-mono text-[10px] ${
                      isSelected ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query Cards Grid */}
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 font-mono">{displayedQueries.length}</span> queries in{' '}
              <span className="text-amber-700 font-bold">"{selectedCategory}"</span>
            </div>

            <div className="flex items-center gap-1.5">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    difficultyFilter === diff
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <Spinner message="Searching query catalog..." />
          ) : displayedQueries.length === 0 ? (
            <EmptyState
              title="No matching queries found"
              description="Try adjusting your search terms or selecting 'All' categories."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedQueries.map((q) => (
                <QueryCard
                  key={q.id}
                  query={q}
                  isSelected={activeQuery?.id === q.id}
                  onClick={() => handleCardClick(q)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal with Live Execution */}
      <QueryDetailModal
        query={activeQuery}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
