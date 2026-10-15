import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Play, CheckCircle, Check, Phone } from 'lucide-react';

export default function DriverTripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const { showToast } = useToast();

  const loadTrips = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all' ? '/bookings/driver-trips' : `/bookings/driver-trips?status=${filterStatus}`;
      const res = await api.get(url);
      if (res.data.success) {
        setTrips(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load driver trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [filterStatus]);

  const handleAction = async (endpoint, successMessage) => {
    setActionLoading(true);
    try {
      const res = await api.put(endpoint);
      if (res.data.success) {
        showToast(successMessage, 'success');
        loadTrips();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Assigned Trips</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review assignments, accept dispatch orders, and execute ride completions.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Assignments' },
          { id: 'assigned', label: 'Assigned (New)' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              filterStatus === tab.id
                ? 'bg-slate-900 text-amber-400 border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner message="Loading assigned trips..." />
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips found"
          description="You do not have any trips matching this status."
        />
      ) : (
        <div className="space-y-3">
          {trips.map((t) => (
            <div
              key={t.booking_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{t.booking_id}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.booking_time).toLocaleString()}
                  </span>
                  <StatusBadge status={t.vehicle_type} />
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={t.booking_status} />
                  <span className="text-base font-black text-slate-900">
                    ₹{t.final_fare || t.estimated_fare}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Passenger
                  </span>
                  <p className="font-semibold text-slate-900">{t.customer_name}</p>
                  <p className="text-amber-600 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {t.customer_phone}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Route
                  </span>
                  <p className="text-slate-800">{t.pickup_location}</p>
                  <p className="text-slate-400">↓ {t.distance_km} km</p>
                  <p className="text-slate-800">{t.destination_location}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Payment & Vehicle
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={t.payment_status} />
                    <span className="font-mono uppercase text-slate-600">({t.payment_method})</span>
                  </div>
                  <p className="text-slate-500 font-mono mt-1">
                    {t.vehicle_model} ({t.registration_number})
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {t.booking_status === 'assigned' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Check}
                    isLoading={actionLoading}
                    onClick={() => handleAction(`/bookings/${t.booking_id}/accept`, 'Ride accepted!')}
                  >
                    Accept Ride
                  </Button>
                )}

                {t.booking_status === 'accepted' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Play}
                    isLoading={actionLoading}
                    onClick={() => handleAction(`/bookings/${t.booking_id}/start`, 'Trip in progress!')}
                  >
                    Start Trip
                  </Button>
                )}

                {t.booking_status === 'in_progress' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    isLoading={actionLoading}
                    onClick={() => handleAction(`/bookings/${t.booking_id}/complete`, 'Trip completed!')}
                  >
                    Complete Trip
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
