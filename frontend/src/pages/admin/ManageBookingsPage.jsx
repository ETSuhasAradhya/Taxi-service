import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  BookmarkCheck,
  Search,
  Filter,
  UserCheck,
  Navigation,
  Car,
  Calendar,
  XCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Assign Modal
  const [assignBooking, setAssignBooking] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Cancel Dialog
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { showToast } = useToast();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const res = await api.get(`/bookings?${params.toString()}`);
      if (res.data.success) {
        setBookings(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadBookings();
  };

  const openAssignModal = async (booking) => {
    setAssignBooking(booking);
    setSelectedDriverId('');
    setSelectedVehicleId('');
    try {
      const [dRes, vRes] = await Promise.all([
        api.get('/drivers/available'),
        api.get(`/vehicles/available?vehicle_type=${booking.vehicle_type}`)
      ]);
      if (dRes.data.success) {
        setAvailableDrivers(dRes.data.data);
        if (dRes.data.data.length > 0) setSelectedDriverId(dRes.data.data[0].driver_id);
      }
      if (vRes.data.success) {
        setAvailableVehicles(vRes.data.data);
        if (vRes.data.data.length > 0) setSelectedVehicleId(vRes.data.data[0].vehicle_id);
      }
    } catch (err) {
      console.error('Failed to fetch available drivers/vehicles:', err);
      showToast('Error loading available resources', 'error');
    }
  };

  const handleExecuteAssign = async (e) => {
    e.preventDefault();
    if (!selectedDriverId || !selectedVehicleId) {
      showToast('Please select both an available driver and a vehicle.', 'error');
      return;
    }

    setIsAssigning(true);
    try {
      const res = await api.put(`/bookings/${assignBooking.booking_id}/assign`, {
        driver_id: parseInt(selectedDriverId, 10),
        vehicle_id: parseInt(selectedVehicleId, 10)
      });
      if (res.data.success) {
        showToast('Driver and vehicle assigned successfully!', 'success');
        setAssignBooking(null);
        loadBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign driver', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelBookingId) return;
    setIsCancelling(true);
    try {
      const res = await api.put(`/bookings/${cancelBookingId}/cancel`, {
        cancelled_reason: 'Cancelled by Administrator'
      });
      if (res.data.success) {
        showToast('Booking cancelled and resources freed.', 'info');
        setCancelBookingId(null);
        loadBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bookings & Dispatch</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ride management, driver assignments, and state transitions. Total: {total} records.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:max-w-md">
          <Input
            placeholder="Search rider, driver, route..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold uppercase text-slate-400 whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Dispatch</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <Spinner message="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings match criteria"
          description="Try broadening your search term or clearing the status filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-3">Trip #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Rider</th>
                  <th className="py-3 px-3">Route</th>
                  <th className="py-3 px-3">Tier</th>
                  <th className="py-3 px-3">Driver Assigned</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Fare</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">#{b.booking_id}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(b.booking_time).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{b.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{b.customer_phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="max-w-xs truncate font-medium text-slate-800">
                        {b.pickup_location} → {b.destination_location}
                      </div>
                      <div className="text-[11px] text-slate-400">{b.distance_km} km</div>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.vehicle_type} />
                    </td>
                    <td className="py-3 px-3">
                      {b.driver_name ? (
                        <div>
                          <span className="font-semibold text-slate-900">{b.driver_name}</span>
                          <div className="text-[11px] text-slate-400">{b.driver_phone}</div>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {b.registration_number || '—'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      ₹{b.final_fare || b.estimated_fare}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={b.booking_status} />
                    </td>
                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      {b.booking_status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => openAssignModal(b)}
                        >
                          Assign
                        </Button>
                      )}

                      {['pending', 'assigned', 'accepted'].includes(b.booking_status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => setCancelBookingId(b.booking_id)}
                        >
                          Cancel
                        </Button>
                      )}
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

      {/* Assign Driver & Vehicle Modal */}
      <Modal
        isOpen={!!assignBooking}
        onClose={() => setAssignBooking(null)}
        title={`Dispatch Assignment: Booking #${assignBooking?.booking_id}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleExecuteAssign} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
            <p>
              <strong>Rider:</strong> {assignBooking?.customer_name} ({assignBooking?.customer_phone})
            </p>
            <p>
              <strong>Route:</strong> {assignBooking?.pickup_location} → {assignBooking?.destination_location}
            </p>
            <p>
              <strong>Tier Requested:</strong> <span className="font-bold uppercase">{assignBooking?.vehicle_type}</span>
            </p>
          </div>

          {/* Available Drivers */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-500" /> Select Available Driver *
            </label>
            {availableDrivers.length === 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                No drivers currently available! (All drivers are on trip or off duty).
              </div>
            ) : (
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                required
              >
                {availableDrivers.map((d) => (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.full_name} ({d.phone})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Available Vehicles */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-500" /> Select Available Vehicle ({assignBooking?.vehicle_type}) *
            </label>
            {availableVehicles.length === 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                No vehicles of type '{assignBooking?.vehicle_type}' available in fleet!
              </div>
            ) : (
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                required
              >
                {availableVehicles.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.model} ({v.registration_number}) - {v.seats} seats
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setAssignBooking(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isAssigning}
              disabled={availableDrivers.length === 0 || availableVehicles.length === 0}
            >
              Commit Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancelBookingId}
        onClose={() => setCancelBookingId(null)}
        onConfirm={handleCancelBooking}
        title="Admin Cancel Booking"
        message="Are you sure you want to cancel this booking? The driver and vehicle will be released immediately."
        confirmText="Yes, Cancel"
        isLoading={isCancelling}
      />
    </div>
  );
}
