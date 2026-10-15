import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  Play,
  Check,
  Power,
  Navigation,
  Phone
} from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const loadDashboard = async () => {
    try {
      const res = await api.get('/dashboard/driver');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load driver dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleStatus = async () => {
    if (!data?.metrics?.driver_status) return;
    const current = data.metrics.driver_status;
    const nextStatus = current === 'available' ? 'off_duty' : 'available';

    setActionLoading(true);
    try {
      const res = await api.put(`/drivers/${user.driver_id}`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Your status is now ${nextStatus.toUpperCase()}`, 'success');
        loadDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRide = async (bookingId) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/bookings/${bookingId}/accept`);
      if (res.data.success) {
        showToast('Ride accepted! Drive safely to pickup point.', 'success');
        loadDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept ride', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartRide = async (bookingId) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/bookings/${bookingId}/start`);
      if (res.data.success) {
        showToast('Trip started! Status is now in_progress.', 'success');
        loadDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRide = async (bookingId) => {
    setActionLoading(true);
    try {
      const res = await api.put(`/bookings/${bookingId}/complete`);
      if (res.data.success) {
        showToast('Trip completed and payment settled!', 'success');
        loadDashboard();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Spinner message="Loading driver console..." />;
  }

  const { activeTrip, metrics, recentTrips } = data || {};
  const isAvailable = metrics?.driver_status === 'available';

  return (
    <div className="space-y-6">
      {/* Header with Shift Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Driver Console: {user?.full_name} 🚖
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            License: <span className="font-mono font-bold text-slate-700">{user?.license_number}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Duty Status:</span>
            <StatusBadge status={metrics?.driver_status || 'available'} />
          </div>

          <Button
            variant={isAvailable ? 'outline' : 'primary'}
            size="sm"
            icon={Power}
            isLoading={actionLoading}
            onClick={handleToggleStatus}
            disabled={metrics?.driver_status === 'on_trip'}
          >
            {isAvailable ? 'Go Off Duty' : 'Go Available'}
          </Button>
        </div>
      </div>

      {/* Driver Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Trips"
          value={metrics?.total_trips || 0}
          icon={Car}
          color="blue"
          subtitle="All assigned rides"
        />
        <StatCard
          title="Completed"
          value={metrics?.completed_trips || 0}
          icon={CheckCircle}
          color="emerald"
          subtitle="Finished journeys"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${Number(metrics?.total_earnings || 0).toLocaleString()}`}
          icon={DollarSign}
          color="amber"
          subtitle="Gross driver earnings"
        />
        <StatCard
          title="Rating"
          value={metrics?.average_rating ? `${metrics.average_rating} ⭐` : 'N/A'}
          icon={Star}
          color="purple"
          subtitle="Passenger satisfaction"
        />
      </div>

      {/* Active Assigned Trip Card */}
      {activeTrip ? (
        <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-400">
                Active Job: Trip #{activeTrip.booking_id}
              </h3>
            </div>
            <StatusBadge status={activeTrip.booking_status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 rounded-2xl p-4 border border-slate-800">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Passenger</p>
              <p className="text-sm font-bold text-white mt-0.5">{activeTrip.customer_name}</p>
              <p className="text-xs text-amber-400 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" /> {activeTrip.customer_phone}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pickup → Destination</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{activeTrip.pickup_location}</p>
              <p className="text-[11px] text-slate-500">↓ {activeTrip.distance_km} km</p>
              <p className="text-xs font-semibold text-slate-200">{activeTrip.destination_location}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fare & Payment</p>
              <p className="text-xl font-black text-amber-400 mt-0.5">₹{activeTrip.estimated_fare}</p>
              <p className="text-[11px] text-slate-400 font-mono uppercase">
                Payment: {activeTrip.payment_method} ({activeTrip.payment_status})
              </p>
            </div>
          </div>

          {/* Action Button for State Transition */}
          <div className="pt-2 flex items-center justify-end gap-3">
            {activeTrip.booking_status === 'assigned' && (
              <Button
                variant="primary"
                size="md"
                icon={Check}
                isLoading={actionLoading}
                onClick={() => handleAcceptRide(activeTrip.booking_id)}
              >
                Accept This Ride
              </Button>
            )}

            {activeTrip.booking_status === 'accepted' && (
              <Button
                variant="primary"
                size="md"
                icon={Play}
                isLoading={actionLoading}
                onClick={() => handleStartRide(activeTrip.booking_id)}
              >
                Start Trip (Passenger Onboard)
              </Button>
            )}

            {activeTrip.booking_status === 'in_progress' && (
              <Button
                variant="success"
                size="md"
                icon={CheckCircle}
                isLoading={actionLoading}
                onClick={() => handleCompleteRide(activeTrip.booking_id)}
              >
                Complete Trip & Collect Fare
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-white">
          <Navigation className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No active ride assigned</h4>
          <p className="text-xs text-slate-500 mt-1">
            Keep your status set to <strong className="text-emerald-600">Available</strong>. The admin dispatch will assign incoming bookings to you.
          </p>
        </div>
      )}

      {/* Recent Trips Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">Recent Completed Trips</h3>

        {recentTrips && recentTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2 px-3">Trip #</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Rider</th>
                  <th className="py-2 px-3">Route</th>
                  <th className="py-2 px-3">Fare</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentTrips.map((t) => (
                  <tr key={t.booking_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">#{t.booking_id}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(t.booking_time).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">{t.customer_name}</td>
                    <td className="py-3 px-3">
                      <div className="max-w-xs truncate">
                        {t.pickup_location} → {t.destination_location}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      ₹{t.final_fare || t.estimated_fare}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={t.booking_status} />
                    </td>
                    <td className="py-3 px-3">
                      {t.rating ? (
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {t.rating}/5
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-4">No completed trips yet.</p>
        )}
      </div>
    </div>
  );
}
