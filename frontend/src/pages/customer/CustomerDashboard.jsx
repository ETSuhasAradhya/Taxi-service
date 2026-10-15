import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  PlusCircle,
  AlertCircle,
  ArrowRight,
  Star
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { showToast } = useToast();

  const loadStats = async () => {
    try {
      const res = await api.get('/dashboard/customer');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customer dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCancelBooking = async () => {
    if (!cancellingId) return;
    setIsCancelling(true);
    try {
      const res = await api.put(`/bookings/${cancellingId}/cancel`, {
        cancelled_reason: 'Cancelled by customer from dashboard'
      });
      if (res.data.success) {
        showToast('Ride cancelled successfully.', 'info');
        setCancellingId(null);
        loadStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteRide = async (bookingId) => {
    setIsCompleting(true);
    try {
      const res = await api.put(`/bookings/${bookingId}/complete`);
      if (res.data.success) {
        showToast('Ride completed and payment settled successfully!', 'success');
        loadStats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete ride', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return <Spinner message="Loading your dashboard..." />;
  }

  const { activeBooking, summary, recentBookings } = data || {};

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {user?.full_name || 'Rider'}! 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">Here is a summary of your taxi rides and active trips.</p>
        </div>
        <Link to="/customer/book">
          <Button variant="primary" icon={PlusCircle}>
            Book a New Taxi
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Rides"
          value={summary?.total_bookings || 0}
          icon={Car}
          color="blue"
          subtitle="All time requests"
        />
        <StatCard
          title="Completed Rides"
          value={summary?.completed_bookings || 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Successfully taken"
        />
        <StatCard
          title="Total Spent"
          value={`₹${Number(summary?.total_spent || 0).toLocaleString()}`}
          icon={CreditCard}
          color="amber"
          subtitle="Total paid transactions"
        />
      </div>

      {/* Active Trip Banner */}
      {activeBooking ? (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 p-6 text-slate-950 shadow-lg shadow-amber-500/20 border border-amber-300">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider">Active Trip #{activeBooking.booking_id}</span>
            </div>
            <StatusBadge status={activeBooking.booking_status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-amber-200/50">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup Location</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{activeBooking.pickup_location}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Destination</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{activeBooking.destination_location}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fare & Distance</p>
              <p className="text-sm font-black text-amber-600 mt-0.5">
                ₹{activeBooking.estimated_fare} ({activeBooking.distance_km} km)
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="text-slate-800">
              {activeBooking.driver_name ? (
                <span>
                  Assigned Driver: <strong>{activeBooking.driver_name}</strong> ({activeBooking.vehicle_model} - {activeBooking.registration_number})
                </span>
              ) : (
                <span className="italic">Searching for nearby available driver...</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {['in_progress', 'ongoing', 'accepted', 'assigned'].includes(activeBooking.booking_status) && (
                <Button
                  variant="success"
                  size="sm"
                  icon={CheckCircle}
                  isLoading={isCompleting}
                  onClick={() => handleCompleteRide(activeBooking.booking_id)}
                >
                  Complete Ride & Pay
                </Button>
              )}

              {['pending', 'assigned', 'accepted'].includes(activeBooking.booking_status) && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setCancellingId(activeBooking.booking_id)}
                >
                  Cancel Ride
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Recent Bookings Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Rides</h3>
            <p className="text-xs text-slate-500">Your latest trip logs and receipts</p>
          </div>
          <Link to="/customer/bookings" className="text-xs font-semibold text-amber-600 hover:text-amber-500 flex items-center gap-1">
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings && recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2 px-3">Trip #</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Tier</th>
                  <th className="py-2 px-3">Fare</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Driver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentBookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">#{b.booking_id}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(b.booking_time).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="max-w-xs truncate">
                        {b.pickup_location} → {b.destination_location}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.vehicle_type} />
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{b.final_fare || b.estimated_fare}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.booking_status} />
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {b.driver_name || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No past rides"
            description="You haven't completed any rides yet. Book your first taxi now!"
            actionText="Book a Taxi"
            onAction={() => window.location.href = '/customer/book'}
          />
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancelBooking}
        title="Cancel Ride"
        message="Are you sure you want to cancel this booking? This will refund any pending hold and free up the driver."
        confirmText="Yes, Cancel"
        isLoading={isCancelling}
      />
    </div>
  );
}
