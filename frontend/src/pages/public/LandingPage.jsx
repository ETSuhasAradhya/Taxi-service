import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import {
  Car,
  Shield,
  Zap,
  MapPin,
  Clock,
  ArrowRight,
  Database,
  Terminal,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const [rates, setRates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pickup, setPickup] = useState('');
  const [dest, setDest] = useState('');
  const [selectedType, setSelectedType] = useState('sedan');
  const [estimate, setEstimate] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [rRes, lRes] = await Promise.all([
          api.get('/fare-rates'),
          api.get('/fare-rates/locations')
        ]);
        if (rRes.data.success) setRates(rRes.data.data);
        if (lRes.data.success) {
          setLocations(lRes.data.data);
          if (lRes.data.data.length >= 2) {
            setPickup(lRes.data.data[0].name);
            setDest(lRes.data.data[1].name);
          }
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      }
    }
    loadData();
  }, []);

  const handleEstimate = async (e) => {
    e?.preventDefault();
    if (!pickup || !dest) return;
    setIsCalculating(true);
    try {
      const res = await api.post('/fare-rates/estimate', {
        vehicle_type: selectedType,
        pickup_location: pickup,
        destination_location: dest
      });
      if (res.data.success) {
        setEstimate(res.data.data);
      }
    } catch (err) {
      console.error('Error estimating fare:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (pickup && dest) {
      handleEstimate();
    }
  }, [pickup, dest, selectedType]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-950">CityCab</span>
                <span className="rounded bg-slate-900 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-amber-400">DBMS</span>
              </div>
              <p className="text-[10px] font-medium text-slate-500">Taxi Service Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-b from-amber-50/50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Pitch */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold">
                <Database className="w-4 h-4 text-amber-600" />
                <span>MySQL 8 Relational Architecture & ACID Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Seamless Urban Rides. Powered by <span className="text-amber-500 underline decoration-amber-300 decoration-wavy">Relational SQL</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                A full-stack, enterprise-grade taxi booking platform demonstrating 3NF normalization, ACID transaction lifecycles, stored procedures, triggers, and an interactive 48-query SQL Explorer.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/register">
                  <Button variant="primary" size="lg" icon={ArrowRight}>
                    Book a Taxi Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" icon={Terminal}>
                    Launch Demo Accounts
                  </Button>
                </Link>
              </div>

              {/* DBMS Features Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">3NF</h4>
                  <p className="text-xs text-slate-500 font-medium">Normalized Schema</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">48+</h4>
                  <p className="text-xs text-slate-500 font-medium">Verified SQL Queries</p>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">ACID</h4>
                  <p className="text-xs text-slate-500 font-medium">Safe Transactions</p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Fare Estimator Widget */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-950">Live Fare Calculator</h3>
                      <p className="text-xs text-slate-500">Computed server-side from MySQL</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    Live Rates
                  </span>
                </div>

                <form onSubmit={handleEstimate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Pickup Location
                    </label>
                    <select
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id || loc.name} value={loc.name}>
                          {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Destination
                    </label>
                    <select
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id || loc.name} value={loc.name} disabled={loc.name === pickup}>
                          {loc.name} {loc.zone ? `(${loc.zone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Vehicle Category
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['mini', 'sedan', 'suv', 'luxury'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(type)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all border ${
                            selectedType === type
                              ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Estimation Output Card */}
                  {estimate && (
                    <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2 mt-4 animate-fade-in">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Distance Estimate:</span>
                        <span className="font-semibold text-slate-900">{estimate.distanceKm || estimate.distance_km || 0} km</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Estimated Travel Time:</span>
                        <span className="font-semibold text-slate-900">~{estimate.estimatedMinutes || Math.round((estimate.distanceKm || estimate.distance_km || 5) * 2.5)} mins</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Base + Distance Rate:</span>
                        <span className="font-semibold text-slate-900">₹{estimate.baseFare || estimate.base_fare || 0} + ₹{estimate.perKmRate || estimate.per_km_rate || 0}/km</span>
                      </div>
                      <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">Estimated Total:</span>
                        <span className="text-2xl font-black text-amber-600">₹{estimate.estimatedFare}</span>
                      </div>
                    </div>
                  )}

                  <Link to="/register" className="block pt-2">
                    <Button variant="primary" size="lg" className="w-full">
                      Proceed to Book This Taxi
                    </Button>
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Showcase Section */}
      <section className="py-16 bg-white border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Our Vehicle Categories & Rates</h2>
            <p className="text-sm text-slate-600 mt-2">Transparent pricing configured dynamically in the MySQL fare_rates table.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rates.map((rate) => {
              const icons = {
                mini: '🚗',
                sedan: '🚘',
                suv: '🚙',
                luxury: '✨'
              };

              return (
                <div
                  key={rate.rate_id}
                  className="rounded-2xl border border-slate-200/80 p-6 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all"
                >
                  <div className="text-3xl mb-3">{icons[rate.vehicle_type] || '🚗'}</div>
                  <h4 className="text-lg font-bold capitalize text-slate-900">{rate.vehicle_type}</h4>
                  <p className="text-xs text-slate-500 mb-4">Base Fare ₹{rate.base_fare}</p>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-4">
                    <div className="flex justify-between">
                      <span>Rate per km:</span>
                      <span className="font-semibold text-slate-900">₹{rate.per_km_rate}/km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per minute:</span>
                      <span className="font-semibold text-slate-900">₹{rate.per_minute_rate}/min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimum fare:</span>
                      <span className="font-semibold text-slate-900">₹{rate.minimum_fare}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-sm text-slate-600 mt-2">A clean state machine transition verified on every ride.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">1. Request & Calculate</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rider enters pickup and drop location. Server calculates distance and estimated fare atomically creating booking and pending payment rows.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">2. Dispatch & Start</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Admin dispatches available driver and vehicle via ACID transaction. Driver accepts and toggles status to in_progress.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">3. Complete & Review</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Driver completes ride, payment status becomes paid, driver and vehicle are released, and rider submits their 1:1 star review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CityCab Taxi Service Management System. Built for College DBMS Course.</p>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
            <Link to="/login" className="hover:text-amber-600">Admin Portal</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-amber-600">Driver Portal</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-amber-600">Customer Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
