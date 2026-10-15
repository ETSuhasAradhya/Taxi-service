import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Car, Plus, Search, Trash2, Wrench, CheckCircle, ShieldAlert } from 'lucide-react';

export default function ManageVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Add Vehicle Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    registration_number: '',
    model: '',
    vehicle_type: 'sedan',
    seats: 4,
    driver_id: ''
  });

  // Safe Delete
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('vehicle_type', typeFilter);

      const res = await api.get(`/vehicles?${params.toString()}`);
      if (res.data.success) {
        setVehicles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load fleet:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDriversList = async () => {
    try {
      const res = await api.get('/drivers?limit=100');
      if (res.data.success) {
        setDrivers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load drivers for vehicle dropdown:', err);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    loadDriversList();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVehicles();
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        seats: parseInt(formData.seats, 10),
        driver_id: formData.driver_id ? parseInt(formData.driver_id, 10) : null
      };
      const res = await api.post('/vehicles', payload);
      if (res.data.success) {
        showToast('Vehicle added to fleet successfully.', 'success');
        setIsAddOpen(false);
        setFormData({
          registration_number: '',
          model: '',
          vehicle_type: 'sedan',
          seats: 4,
          driver_id: ''
        });
        loadVehicles();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add vehicle', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMaintenance = async (vehicleId, currentStatus) => {
    const nextStatus = currentStatus === 'maintenance' ? 'available' : 'maintenance';
    try {
      const res = await api.put(`/vehicles/${vehicleId}`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Vehicle status set to ${nextStatus}`, 'success');
        loadVehicles();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update vehicle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/vehicles/${deleteId}`);
      if (res.data.success) {
        showToast('Vehicle removed from fleet successfully.', 'success');
        setDeleteId(null);
        loadVehicles();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete vehicle with historical bookings.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fleet & Vehicle Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered vehicles, seating capacities, maintenance states, and driver assignments. Total: {vehicles.length} units.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Add Vehicle to Fleet
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:max-w-md">
          <Input
            placeholder="Search by model or registration plate..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'mini', label: 'Mini' },
              { value: 'sedan', label: 'Sedan' },
              { value: 'suv', label: 'SUV' },
              { value: 'luxury', label: 'Luxury' }
            ]}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'available', label: 'Available' },
              { value: 'in_use', label: 'In Use' },
              { value: 'maintenance', label: 'Maintenance' }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading fleet vehicles..." />
      ) : vehicles.length === 0 ? (
        <EmptyState title="No vehicles found" description="Try clearing filters or adding a new vehicle." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Model & Plate</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Assigned Chauffeur</th>
                  <th className="py-3 px-4">Total Trips</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {vehicles.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{v.vehicle_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.model}</div>
                      <div className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 inline-block px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">
                        {v.registration_number}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold uppercase text-slate-800">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        v.vehicle_type === 'luxury' ? 'bg-purple-100 text-purple-800' :
                        v.vehicle_type === 'suv' ? 'bg-blue-100 text-blue-800' :
                        v.vehicle_type === 'sedan' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {v.vehicle_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{v.seats} seats</td>
                    <td className="py-3.5 px-4">
                      {v.assigned_driver_name ? (
                        <div>
                          <div className="font-semibold text-slate-900">{v.assigned_driver_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{v.assigned_driver_phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{v.total_trips || 0}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {v.status !== 'in_use' && (
                        <button
                          onClick={() => handleToggleMaintenance(v.vehicle_id, v.status)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                        >
                          {v.status === 'maintenance' ? 'Set Available' : 'Set Maintenance'}
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        icon={Trash2}
                        onClick={() => setDeleteId(v.vehicle_id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Vehicle to Fleet">
        <form onSubmit={handleCreateVehicle} className="space-y-4">
          <Input
            label="Registration Number / License Plate"
            required
            value={formData.registration_number}
            onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
            placeholder="e.g. DL-01-AB-1234"
          />
          <Input
            label="Vehicle Model & Make"
            required
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="e.g. Toyota Innova Crysta"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Vehicle Category"
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              options={[
                { value: 'mini', label: 'Mini (Hatchback)' },
                { value: 'sedan', label: 'Sedan' },
                { value: 'suv', label: 'SUV' },
                { value: 'luxury', label: 'Luxury' }
              ]}
            />
            <Input
              label="Passenger Seating Capacity"
              type="number"
              min="2"
              max="10"
              required
              value={formData.seats}
              onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Default Driver Assignment (Optional)
            </label>
            <select
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">None (Pool Vehicle)</option>
              {drivers.map((d) => (
                <option key={d.driver_id} value={d.driver_id}>
                  {d.full_name} ({d.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Vehicle
            </Button>
          </div>
        </form>
      </Modal>

      {/* Safe Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Safe Delete Vehicle"
        message="Attempting to delete vehicle. NOTE: If this vehicle has logged bookings on record, the database Foreign Key RESTRICT constraint will abort deletion to maintain ride audit logs."
        confirmText="Confirm Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
