import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Navigation, Plus, Search, Trash2, Edit3, Phone, Mail, Award, CheckCircle } from 'lucide-react';

export default function ManageDriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Driver Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    license_number: '',
    license_expiry: ''
  });

  // Safe Delete
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const res = await api.get(`/drivers?${params.toString()}`);
      if (res.data.success) {
        setDrivers(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadDrivers();
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post('/drivers', formData);
      if (res.data.success) {
        showToast('Driver account created successfully.', 'success');
        setIsAddOpen(false);
        setFormData({
          email: '',
          password: '',
          full_name: '',
          phone: '',
          license_number: '',
          license_expiry: ''
        });
        loadDrivers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create driver', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusToggle = async (driverId, currentStatus) => {
    const nextStatus = currentStatus === 'available' ? 'off_duty' : 'available';
    try {
      const res = await api.put(`/drivers/${driverId}`, { status: nextStatus });
      if (res.data.success) {
        showToast(`Driver status set to ${nextStatus}`, 'success');
        loadDrivers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/drivers/${deleteId}`);
      if (res.data.success) {
        showToast('Driver deleted successfully.', 'success');
        setDeleteId(null);
        loadDrivers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete driver with trip records.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Fleet Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered chauffeurs, shift statuses, and licensing records. Total: {total} drivers.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAddOpen(true)}>
          Register New Driver
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:max-w-md">
          <Input
            placeholder="Search by name, phone, or license..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="secondary" size="md">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'available', label: 'Available' },
              { value: 'on_trip', label: 'On Trip' },
              { value: 'off_duty', label: 'Off Duty' }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading driver records..." />
      ) : drivers.length === 0 ? (
        <EmptyState title="No drivers found" description="Try modifying your search or filter criteria." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">License</th>
                  <th className="py-3 px-4">Assigned Vehicle</th>
                  <th className="py-3 px-4">Trips Done</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {drivers.map((d) => (
                  <tr key={d.driver_id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{d.driver_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{d.full_name}</div>
                      <div className="text-[11px] text-slate-400">{d.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{d.phone}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-semibold text-slate-800">{d.license_number}</div>
                      <div className="text-[10px] text-slate-400">Exp: {d.license_expiry?.split('T')[0]}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {d.assigned_vehicle_model ? (
                        <div>
                          <div className="font-semibold text-slate-900">{d.assigned_vehicle_model}</div>
                          <div className="font-mono text-[10px] text-slate-500">{d.assigned_vehicle_reg}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {d.completed_trips || 0} / {d.total_trips || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                        ★ {d.average_rating ? Number(d.average_rating).toFixed(1) : '5.0'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {d.status !== 'on_trip' && (
                        <button
                          onClick={() => handleStatusToggle(d.driver_id, d.status)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                        >
                          {d.status === 'available' ? 'Set Off Duty' : 'Set Available'}
                        </button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        icon={Trash2}
                        onClick={() => setDeleteId(d.driver_id)}
                      >
                        Delete
                      </Button>
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

      {/* Add Driver Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Driver Account">
        <form onSubmit={handleCreateDriver} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Anand Kumar"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="driver@taxiservice.com"
            />
            <Input
              label="Account Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 00000"
            />
            <Input
              label="Driving License No."
              required
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="DL-0420110012345"
            />
          </div>
          <Input
            label="License Expiry Date"
            type="date"
            required
            value={formData.license_expiry}
            onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Register Driver
            </Button>
          </div>
        </form>
      </Modal>

      {/* Safe Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Safe Delete Driver Profile"
        message="Attempting to delete this driver. NOTE: If this driver has completed or historical trip assignments, the database Foreign Key RESTRICT constraint will block deletion to safeguard ride ledger history."
        confirmText="Confirm Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
