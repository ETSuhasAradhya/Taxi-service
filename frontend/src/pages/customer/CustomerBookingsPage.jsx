import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Car,
  Star,
  Clock,
  XCircle,
  MessageSquare,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Cancel state
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review Modal state
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { showToast } = useToast();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all' ? '/bookings/my-bookings' : `/bookings/my-bookings?status=${filterStatus}`;
      const res = await api.get(url);
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const [completingId, setCompletingId] = useState(null);

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    setIsCancelling(true);
    try {
      const res = await api.put(`/bookings/${cancelBookingId}/cancel`, {
        cancelled_reason: 'Rider cancelled booking'
      });
      if (res.data.success) {
        showToast('Booking cancelled successfully.', 'info');
        setCancelBookingId(null);
        loadBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCompleteBooking = async (b) => {
    setCompletingId(b.booking_id);
    try {
      const res = await api.put(`/bookings/${b.booking_id}/complete`);
      if (res.data.success) {
        showToast('Ride completed and payment settled successfully! Please write a review.', 'success');
        loadBookings();
        setReviewBooking(b);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete ride', 'error');
    } finally {
      setCompletingId(null);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        booking_id: reviewBooking.booking_id,
        rating,
        comment
      });
      if (res.data.success) {
        showToast('Review submitted! Thank you for your rating.', 'success');
        setReviewBooking(null);
        setComment('');
        setRating(5);
        loadBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const statuses = [
    { id: 'all', label: 'All Trips' },
    { id: 'pending', label: 'Pending' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Ride History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track past bookings, cancel active requests, or review completed journeys.
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((st) => (
          <button
            key={st.id}
            onClick={() => setFilterStatus(st.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === st.id
                ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner message="Loading your bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="You do not have any bookings matching this status."
          actionText="Book a Taxi"
          onAction={() => window.location.href = '/customer/book'}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => {
            const isCompleted = b.booking_status === 'completed';
            const isCancellable = ['pending', 'assigned', 'accepted'].includes(b.booking_status);
            const canComplete = ['in_progress', 'ongoing', 'accepted', 'assigned'].includes(b.booking_status);
            const hasReview = !!b.review_id;

            return (
              <div
                key={b.booking_id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      #{b.booking_id}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(b.booking_time).toLocaleString()}
                    </span>
                    <StatusBadge status={b.vehicle_type} />
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.booking_status} />
                    <span className="text-base font-black text-slate-900">
                      ₹{b.final_fare || b.estimated_fare}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Itinerary
                    </span>
                    <p className="font-semibold text-slate-900">{b.pickup_location}</p>
                    <p className="text-slate-500">↓ {b.distance_km} km</p>
                    <p className="font-semibold text-slate-900">{b.destination_location}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Driver & Vehicle
                    </span>
                    {b.driver_name ? (
                      <div>
                        <p className="font-semibold text-slate-900">{b.driver_name}</p>
                        <p className="text-slate-500">{b.driver_phone}</p>
                        <p className="text-slate-600 font-mono mt-0.5">
                          {b.vehicle_model} ({b.registration_number})
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No driver assigned yet</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Payment Status
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.payment_status || 'pending'} />
                      <span className="font-mono text-slate-600 uppercase">({b.payment_method})</span>
                    </div>
                    {b.rating && (
                      <div className="mt-2 flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span>You rated: {b.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  {canComplete && (
                    <Button
                      variant="success"
                      size="sm"
                      icon={CheckCircle2}
                      isLoading={completingId === b.booking_id}
                      onClick={() => handleCompleteBooking(b)}
                    >
                      Complete Ride & Pay
                    </Button>
                  )}

                  {isCancellable && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelBookingId(b.booking_id)}
                    >
                      Cancel Booking
                    </Button>
                  )}

                  {isCompleted && !hasReview && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Star}
                      onClick={() => setReviewBooking(b)}
                    >
                      Write Review
                    </Button>
                  )}

                  {isCompleted && hasReview && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Feedback Submitted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Cancellation is permitted before the trip begins."
        confirmText="Yes, Cancel"
        isLoading={isCancelling}
      />

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        title={`Review Trip #${reviewBooking?.booking_id}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              Driver: <strong>{reviewBooking?.driver_name}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Trip: {reviewBooking?.pickup_location} → {reviewBooking?.destination_location}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Rating (1 to 5 Stars) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-slate-700 ml-2">{rating} / 5</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the driver, vehicle cleanliness, and ride comfort?"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setReviewBooking(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingReview}>
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
