import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Star, MessageSquare, ArrowRight, User, Navigation } from 'lucide-react';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (ratingFilter) params.append('rating', ratingFilter);

      const res = await api.get(`/reviews?${params.toString()}`);
      if (res.data.success) {
        setReviews(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, ratingFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rider Feedback & Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ratings and comments logged in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700">reviews</code> table (1:1 per completed ride). Total: {total}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Ratings (1-5 Stars)' },
              { value: '5', label: '5 Stars Only' },
              { value: '4', label: '4 Stars Only' },
              { value: '3', label: '3 Stars Only' },
              { value: '2', label: '2 Stars Only' },
              { value: '1', label: '1 Star Only' }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading customer feedback..." />
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews found" description="Try selecting a different rating filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Review ID</th>
                  <th className="py-3 px-4">Trip Ref</th>
                  <th className="py-3 px-4">Rider</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Customer Comment</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {reviews.map((r) => (
                  <tr key={r.review_id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{r.review_id}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">BK-{r.booking_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.customer_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{r.driver_name}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50 w-fit">
                        <span>★ {r.rating}</span>
                        <div className="flex text-amber-400 text-[10px]">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                      {r.comment ? (
                        <span className="italic">"{r.comment}"</span>
                      ) : (
                        <span className="text-slate-400 italic">No written comment</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <div className="flex items-center gap-1 text-slate-800">
                        <span>{r.pickup_location}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{r.destination_location}</span>
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                        {r.vehicle_type}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
