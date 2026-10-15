import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { DollarSign, Edit3, Calculator, Info, CheckCircle2 } from 'lucide-react';

export default function FareRatesPage() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Rate Modal
  const [editingRate, setEditingRate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    base_fare: '',
    per_km_rate: '',
    per_minute_rate: '',
    minimum_fare: ''
  });

  // Simulator
  const [locations, setLocations] = useState([]);
  const [simPickup, setSimPickup] = useState('');
  const [simDrop, setSimDrop] = useState('');
  const [simType, setSimType] = useState('sedan');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const { showToast } = useToast();

  const loadRates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fare-rates');
      if (res.data.success) {
        setRates(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load fare rates:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const res = await api.get('/fare-rates/locations');
      if (res.data.success) {
        setLocations(res.data.data);
        if (res.data.data.length >= 2) {
          setSimPickup(res.data.data[0]);
          setSimDrop(res.data.data[1]);
        }
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  };

  useEffect(() => {
    loadRates();
    loadLocations();
  }, []);

  const openEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      base_fare: rate.base_fare,
      per_km_rate: rate.per_km_rate,
      per_minute_rate: rate.per_minute_rate,
      minimum_fare: rate.minimum_fare
    });
  };

  const handleSaveRate = async (e) => {
    e.preventDefault();
    if (!editingRate) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/fare-rates/${editingRate.rate_id}`, {
        base_fare: parseFloat(formData.base_fare),
        per_km_rate: parseFloat(formData.per_km_rate),
        per_minute_rate: parseFloat(formData.per_minute_rate),
        minimum_fare: parseFloat(formData.minimum_fare)
      });
      if (res.data.success) {
        showToast(`Fare rates for ${editingRate.vehicle_type} updated successfully.`, 'success');
        setEditingRate(null);
        loadRates();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update fare rate', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulate = async () => {
    if (!simPickup || !simDrop) return;
    setSimLoading(true);
    try {
      const res = await api.post('/fare-rates/estimate', {
        vehicle_type: simType,
        pickup_location: simPickup,
        destination_location: simDrop
      });
      if (res.data.success) {
        setSimResult(res.data.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Calculation error', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fare Rates & Pricing Matrix</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic per-km pricing, base fees, and minimum thresholds stored in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700">fare_rates</code>.
          </p>
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading fare rates..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Vehicle Category</th>
                  <th className="py-3 px-4">Base Fare (Flag Drop)</th>
                  <th className="py-3 px-4">Distance Rate</th>
                  <th className="py-3 px-4">Time Rate</th>
                  <th className="py-3 px-4">Minimum Fare</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rates.map((r) => (
                  <tr key={r.rate_id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{r.rate_id}</td>
                    <td className="py-3.5 px-4 font-bold uppercase text-slate-900">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        r.vehicle_type === 'luxury' ? 'bg-purple-100 text-purple-800' :
                        r.vehicle_type === 'suv' ? 'bg-blue-100 text-blue-800' :
                        r.vehicle_type === 'sedan' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {r.vehicle_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{Number(r.base_fare).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">₹{Number(r.per_km_rate).toFixed(2)} / km</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">₹{Number(r.per_minute_rate || 0).toFixed(2)} / min</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{Number(r.minimum_fare).toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {r.updated_at ? new Date(r.updated_at).toLocaleString() : 'System Default'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Edit3}
                        onClick={() => openEdit(r)}
                      >
                        Adjust Pricing
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulator Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold">Server-Side Fare Calculation Simulator</h2>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          Test real-time fare computation using the server distance matrix and pricing formula: <code>MAX(minimum_fare, base_fare + (distance_km * per_km_rate))</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pickup Location</label>
            <select
              value={simPickup}
              onChange={(e) => setSimPickup(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Destination Location</label>
            <select
              value={simDrop}
              onChange={(e) => setSimDrop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Vehicle Class</label>
            <select
              value={simType}
              onChange={(e) => setSimType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              <option value="mini">Mini (Hatchback)</option>
              <option value="sedan">Sedan (Comfort)</option>
              <option value="suv">SUV (6-Seater)</option>
              <option value="luxury">Luxury (Executive)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <Button variant="primary" onClick={handleSimulate} isLoading={simLoading}>
            Run Server Computation
          </Button>

          {simResult && (
            <div className="flex items-center gap-6 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Distance:</span>
                <span className="ml-2 font-mono font-bold text-amber-300">{simResult.distance_km} km</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Computed Fare:</span>
                <span className="ml-2 font-mono font-bold text-2xl text-white">₹{simResult.estimated_fare}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingRate}
        onClose={() => setEditingRate(null)}
        title={`Adjust Fare Rates: ${editingRate?.vehicle_type?.toUpperCase()}`}
      >
        <form onSubmit={handleSaveRate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base Fare (₹)"
              type="number"
              step="0.01"
              required
              value={formData.base_fare}
              onChange={(e) => setFormData({ ...formData, base_fare: e.target.value })}
            />
            <Input
              label="Per Km Rate (₹/km)"
              type="number"
              step="0.01"
              required
              value={formData.per_km_rate}
              onChange={(e) => setFormData({ ...formData, per_km_rate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Per Minute Rate (₹/min)"
              type="number"
              step="0.01"
              value={formData.per_minute_rate}
              onChange={(e) => setFormData({ ...formData, per_minute_rate: e.target.value })}
            />
            <Input
              label="Minimum Fare Threshold (₹)"
              type="number"
              step="0.01"
              required
              value={formData.minimum_fare}
              onChange={(e) => setFormData({ ...formData, minimum_fare: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setEditingRate(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Rates
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
