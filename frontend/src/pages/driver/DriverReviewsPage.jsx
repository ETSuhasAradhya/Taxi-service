import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Star, MessageSquare } from 'lucide-react';

export default function DriverReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await api.get('/reviews/driver-reviews');
        if (res.data.success) {
          setReviews(res.data.data);
          setSummary(res.data.summary);
        }
      } catch (err) {
        console.error('Failed to load driver reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  if (loading) {
    return <Spinner message="Loading reviews..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ratings & Feedback</h1>
        <p className="text-xs text-slate-500 mt-1">
          Passenger reviews, comments, and satisfaction metrics.
        </p>
      </div>

      {/* Summary Scorecard */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-4xl font-black text-slate-900">{summary.average_rating || 'N/A'}</span>
              <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
            </div>
            <p className="text-xs text-slate-500 mt-2">Based on {summary.total_reviews} reviews</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">5-Star Rides</span>
            <div className="text-4xl font-black text-emerald-600 mt-2">{summary.five_star || 0}</div>
            <p className="text-xs text-slate-500 mt-2">Flawless trip ratings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Feedback</span>
            <div className="text-4xl font-black text-slate-900 mt-2">{summary.total_reviews || 0}</div>
            <p className="text-xs text-slate-500 mt-2">Verified completed trips</p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Passenger Comments</h3>

        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="You don't have any passenger reviews on record yet."
          />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.review_id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{r.customer_name}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 italic">"{r.comment || 'Smooth ride.'}"</p>

                <div className="text-[11px] text-slate-400">
                  Trip #{r.booking_id}: {r.pickup_location} → {r.destination_location}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
