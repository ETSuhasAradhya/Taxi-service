import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import {
  Car,
  MapPin,
  CreditCard,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function BookTaxiPage() {
  const [locations, setLocations] = useState([]);
  const [pickup, setPickup] = useState('');
  const [dest, setDest] = useState('');
  const [vehicleType, setVehicleType] = useState('sedan');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [fareEstimate, setFareEstimate] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await api.get('/fare-rates/locations');
        if (res.data.success) {
          setLocations(res.data.data);
          if (res.data.data.length >= 2) {
            setPickup(res.data.data[0].name);
            setDest(res.data.data[1].name);
          }
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
      }
    }
    fetchLocations();
  }, []);

  // Recalculate fare when pickup, destination, or vehicle type changes
  useEffect(() => {
    async function calculate() {
      if (!pickup || !dest || pickup === dest) {
        setFareEstimate(null);
        return;
      }
      setIsCalculating(true);
      try {
        const res = await api.post('/fare-rates/estimate', {
          vehicle_type: vehicleType,
          pickup_location: pickup,
          destination_location: dest
        });
        if (res.data.success) {
          setFareEstimate(res.data.data);
        }
      } catch (err) {
        console.error('Fare estimate error:', err);
      } finally {
        setIsCalculating(false);
      }
    }
    calculate();
  }, [pickup, dest, vehicleType]);

  const handleBookRide = async (e) => {
    e.preventDefault();
    if (!pickup || !dest) {
      showToast('Please select both pickup and destination locations.', 'error');
      return;
    }
    if (pickup === dest) {
      showToast('Pickup and destination locations cannot be identical.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        vehicle_type: vehicleType,
        pickup_location: pickup,
        destination_location: dest,
        payment_method: paymentMethod
      });
      if (res.data.success) {
        showToast('Taxi booked successfully! Finding nearest driver.', 'success');
        navigate('/customer/bookings');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create booking', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleTiers = [
    { id: 'mini', name: 'Mini', desc: 'Compact & affordable daily rides', seats: 4 },
    { id: 'sedan', name: 'Sedan', desc: 'Comfortable spacious AC sedan', seats: 4 },
    { id: 'suv', name: 'SUV', desc: 'Extra room for families & luggage', seats: 7 },
    { id: 'luxury', name: 'Luxury', desc: 'Premium executive Mercedes/BMW', seats: 4 }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Book a Taxi</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select your journey details. Fares are calculated in real-time from the MySQL fare_rates database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <form onSubmit={handleBookRide} className="space-y-5">
            {/* Pickup */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" /> Pickup Location
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Destination Location
              </label>
              <select
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name} disabled={loc.name === pickup}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Tier Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Select Taxi Tier
              </label>
              <div className="grid grid-cols-2 gap-3">
                {vehicleTiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setVehicleType(tier.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      vehicleType === tier.id
                        ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-400/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate-900 capitalize">{tier.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {tier.seats} seats
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', name: 'Credit/Debit Card' },
                  { id: 'upi', name: 'UPI / QR Code' },
                  { id: 'cash', name: 'Cash to Driver' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      paymentMethod === pm.id
                        ? 'bg-slate-900 text-amber-400 border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pm.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Confirm & Request Booking
            </Button>
          </form>
        </div>

        {/* Right Fare Breakdown Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-950">Trip Calculation</h3>
                <p className="text-[11px] text-slate-500">Atomic MySQL fare estimation</p>
              </div>
            </div>

            {fareEstimate ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Tier:</span>
                  <span className="font-bold text-slate-900 capitalize">{fareEstimate.vehicleType}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Calculated Distance:</span>
                  <span className="font-bold text-slate-900">{fareEstimate.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Time:</span>
                  <span className="font-bold text-slate-900">~{fareEstimate.estimatedMinutes} mins</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Base Fare:</span>
                  <span className="font-bold text-slate-900">₹{fareEstimate.baseFare}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance Charge ({fareEstimate.perKmRate}/km):</span>
                  <span className="font-bold text-slate-900">₹{(fareEstimate.distanceKm * fareEstimate.perKmRate).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Time Charge ({fareEstimate.perMinuteRate}/min):</span>
                  <span className="font-bold text-slate-900">₹{(fareEstimate.estimatedMinutes * fareEstimate.perMinuteRate).toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900">Estimated Total:</span>
                  <span className="text-2xl font-black text-amber-600">₹{fareEstimate.estimatedFare}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Select different pickup and drop locations to see fare calculation.
              </div>
            )}
          </div>

          {/* Database Guarantee Badge */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/50 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>ACID Guarantee:</strong> Your ride creation and payment ledger row are committed together inside an atomic MySQL transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
