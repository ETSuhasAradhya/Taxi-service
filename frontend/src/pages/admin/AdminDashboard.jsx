import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import {
  Users,
  Car,
  BookmarkCheck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Navigation
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <Spinner message="Loading system metrics..." />;
  }

  const { stats, statusDistribution, monthlyRevenue, vehicleDistribution, recentBookings } = data || {};

  // Maximum monthly revenue for SVG bar scaling
  const maxRevenue = Math.max(...(monthlyRevenue?.map((m) => Number(m.revenue)) || [1]));

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick SQL Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Overview Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time MySQL relational database metrics and operational telemetry.
          </p>
        </div>

        <Link to="/admin/sql-explorer">
          <Button variant="primary" icon={Terminal}>
            Open SQL Query Explorer
          </Button>
        </Link>
      </div>

      {/* Metric KPI Cards Grid with View SQL Query Deep-Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <StatCard
            title="Total Revenue (Paid)"
            value={`₹${Number(stats?.total_revenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="emerald"
            subtitle="Realized cash & digital receipts"
          />
          <Link
            to="/admin/sql-explorer?query=report-monthly-revenue"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
          >
            <Terminal className="w-3 h-3 text-emerald-600" /> View SQL Query
          </Link>
        </div>

        <div className="relative group">
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings || 0}
            icon={BookmarkCheck}
            color="blue"
            subtitle={`${stats?.completed_bookings || 0} completed rides`}
          />
          <Link
            to="/admin/sql-explorer?query=report-bookings-by-status"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 transition-colors"
          >
            <Terminal className="w-3 h-3 text-sky-600" /> View SQL Query
          </Link>
        </div>

        <div className="relative group">
          <StatCard
            title="Active Drivers"
            value={stats?.total_drivers || 0}
            icon={Navigation}
            color="amber"
            subtitle={`${stats?.available_drivers || 0} available for dispatch`}
          />
          <Link
            to="/admin/sql-explorer?query=report-top-drivers"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
          >
            <Terminal className="w-3 h-3 text-amber-600" /> View SQL Query
          </Link>
        </div>

        <div className="relative group">
          <StatCard
            title="Fleet Size"
            value={stats?.total_vehicles || 0}
            icon={Car}
            color="purple"
            subtitle={`${stats?.available_vehicles || 0} vehicles available`}
          />
          <Link
            to="/admin/sql-explorer?query=groupby-vehicle-tier-breakdown"
            className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
          >
            <Terminal className="w-3 h-3 text-purple-600" /> View SQL Query
          </Link>
        </div>
      </div>

      {/* Secondary Status Counts with Top Customers Deep-Link */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Registered Riders</p>
              <p className="text-lg font-bold text-slate-900">{stats?.total_customers || 0}</p>
            </div>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <Link
            to="/admin/sql-explorer?query=report-top-customers"
            className="mt-2 text-[10px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
          >
            <Terminal className="w-2.5 h-2.5" /> View SQL Query
          </Link>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Active Rides</p>
            <p className="text-lg font-bold text-sky-600">{stats?.active_bookings || 0}</p>
          </div>
          <Clock className="w-5 h-5 text-sky-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Pending Dispatch</p>
            <p className="text-lg font-bold text-amber-600">{stats?.pending_bookings || 0}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400">Cancelled Rides</p>
            <p className="text-lg font-bold text-rose-600">{stats?.cancelled_bookings || 0}</p>
          </div>
          <XCircle className="w-5 h-5 text-rose-400" />
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Bar Chart (SVG) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Revenue Growth</h3>
              <p className="text-xs text-slate-500">Gross completed earnings grouped by calendar month</p>
            </div>
            <Link
              to="/admin/sql-explorer?query=report-monthly-revenue"
              className="text-xs font-semibold text-amber-600 hover:text-amber-500 flex items-center gap-1 font-mono"
            >
              <Terminal className="w-3.5 h-3.5" /> View SQL Query →
            </Link>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-6 px-2">
            {monthlyRevenue?.map((m) => {
              const heightPercent = maxRevenue > 0 ? (Number(m.revenue) / maxRevenue) * 100 : 0;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    ₹{Number(m.revenue).toLocaleString()}
                  </span>
                  <div className="w-full bg-slate-100 rounded-xl h-44 flex items-end p-1">
                    <div
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                      className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-lg group-hover:from-amber-600 group-hover:to-amber-400 transition-all shadow-sm"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                    {m.month_label}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {m.total_rides} rides
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Status Distribution</h3>
              <p className="text-xs text-slate-500">Active vs historical breakdown</p>
            </div>
            <Link
              to="/admin/sql-explorer?query=report-bookings-by-status"
              className="text-xs font-semibold text-amber-600 hover:text-amber-500 flex items-center gap-1 font-mono"
            >
              <Terminal className="w-3.5 h-3.5" /> View SQL Query →
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {statusDistribution?.map((s) => {
              const total = stats?.total_bookings || 1;
              const pct = Math.round((s.count / total) * 100);

              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 capitalize flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {s.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-slate-500">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-amber-400 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Recent Bookings</h3>
            <p className="text-xs text-slate-500">Latest operations processed through view v_booking_details</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-amber-600 hover:text-amber-500 flex items-center gap-1"
          >
            Manage All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                <th className="py-2.5 px-3">Trip #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Fare</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {recentBookings?.map((b) => (
                <tr key={b.booking_id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">#{b.booking_id}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {new Date(b.booking_time).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{b.customer_name}</td>
                  <td className="py-3 px-3">
                    <div className="max-w-xs truncate">
                      {b.pickup_location} → {b.destination_location}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <StatusBadge status={b.vehicle_type} />
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {b.driver_name || <span className="text-amber-600 font-semibold italic">Unassigned</span>}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    ₹{b.final_fare || b.estimated_fare}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.booking_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
