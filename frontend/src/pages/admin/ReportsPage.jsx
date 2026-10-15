import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { BarChart3, Terminal, TrendingUp, Users, Car, CheckCircle2, XCircle, Star, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/summary');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  if (loading) {
    return <Spinner message="Computing live relational DBMS reports from MySQL 8 engine..." />;
  }

  const {
    report_monthly_revenue,
    report_bookings_by_status,
    report_top_customers,
    report_top_drivers,
    report_vehicle_utilization,
    report_cancellation_rate,
    report_driver_ratings,
    report_daily_bookings
  } = reports || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Database Management Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business intelligence reports powered by SQL queries directly mapped to the Query Explorer catalog (zero query drift).
          </p>
        </div>
        <Link to="/admin/sql-explorer">
          <Button variant="secondary" icon={Terminal}>
            Open SQL Query Explorer
          </Button>
        </Link>
      </div>

      {/* Grid of Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Monthly Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-sm">{report_monthly_revenue?.title || 'Monthly Revenue Report'}</h2>
            </div>
            <Link to={`/admin/sql-explorer?query=${report_monthly_revenue?.catalogSlug}`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/50 transition-colors">
                <Terminal className="w-3 h-3" /> View SQL
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2">Month</th>
                  <th className="py-2">Total Rides</th>
                  <th className="py-2">Completed</th>
                  <th className="py-2">Gross Revenue</th>
                  <th className="py-2">Settled (Paid)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {report_monthly_revenue?.data?.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-bold font-mono text-slate-900">{r.booking_month || r.month}</td>
                    <td className="py-2.5 font-mono">{r.total_bookings}</td>
                    <td className="py-2.5 font-mono">{r.completed_bookings}</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">₹{Number(r.gross_revenue || 0).toLocaleString()}</td>
                    <td className="py-2.5 font-mono font-bold text-emerald-600">₹{Number(r.collected_revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Bookings by Status */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-slate-900 text-sm">{report_bookings_by_status?.title || 'Trip Status Breakdown'}</h2>
            </div>
            <Link to={`/admin/sql-explorer?query=${report_bookings_by_status?.catalogSlug}`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/50 transition-colors">
                <Terminal className="w-3 h-3" /> View SQL
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2">Status</th>
                  <th className="py-2">Trips Count</th>
                  <th className="py-2">Percentage</th>
                  <th className="py-2">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {report_bookings_by_status?.data?.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-bold uppercase text-slate-900">{r.status}</td>
                    <td className="py-2.5 font-mono font-bold">{r.booking_count || r.count}</td>
                    <td className="py-2.5 font-mono">{r.percentage_of_total || '—'}%</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">₹{Number(r.total_estimated_value || r.total_value || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Top High-Frequency Customers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-slate-900 text-sm">{report_top_customers?.title || 'Top Frequent Riders'}</h2>
            </div>
            <Link to={`/admin/sql-explorer?query=${report_top_customers?.catalogSlug}`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/50 transition-colors">
                <Terminal className="w-3 h-3" /> View SQL
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2">Customer</th>
                  <th className="py-2">Rides</th>
                  <th className="py-2">Completed</th>
                  <th className="py-2">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {report_top_customers?.data?.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{r.full_name || r.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.phone}</div>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{r.total_bookings}</td>
                    <td className="py-2.5 font-mono">{r.completed_bookings}</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">₹{Number(r.total_spend || r.total_spent || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Top Drivers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-slate-900 text-sm">{report_top_drivers?.title || 'Top Performing Drivers'}</h2>
            </div>
            <Link to={`/admin/sql-explorer?query=${report_top_drivers?.catalogSlug}`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/50 transition-colors">
                <Terminal className="w-3 h-3" /> View SQL
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2">Driver</th>
                  <th className="py-2">Completed</th>
                  <th className="py-2">Revenue Generated</th>
                  <th className="py-2">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {report_top_drivers?.data?.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-900">{r.full_name || r.driver_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.phone}</div>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{r.completed_trips || r.total_completed}</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">₹{Number(r.total_revenue || r.revenue_generated || 0).toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-amber-600">★ {r.average_rating ? Number(r.average_rating).toFixed(1) : '5.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Fleet Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-500" />
              <h2 className="font-bold text-slate-900 text-sm">{report_vehicle_utilization?.title || 'Fleet Category Utilization'}</h2>
            </div>
            <Link to={`/admin/sql-explorer?query=${report_vehicle_utilization?.catalogSlug}`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/50 transition-colors">
                <Terminal className="w-3 h-3" /> View SQL
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2">Category</th>
                  <th className="py-2">Total Fleet</th>
                  <th className="py-2">Available</th>
                  <th className="py-2">In Use</th>
                  <th className="py-2">Trips Done</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {report_vehicle_utilization?.data?.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-bold uppercase text-slate-900">{r.vehicle_type}</td>
                    <td className="py-2.5 font-mono font-bold">{r.total_vehicles}</td>
                    <td className="py-2.5 font-mono text-emerald-600 font-bold">{r.available_count}</td>
                    <td className="py-2.5 font-mono text-amber-600 font-bold">{r.in_use_count}</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{r.total_trips || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Cancellation Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-slate-900 text-sm">{report_cancellation_rate?.title || 'Trip Cancellation Analysis'}</h2>
            </div>
            <Link to={`/admin/sql-explorer?query=${report_cancellation_rate?.catalogSlug}`}>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200/50 transition-colors">
                <Terminal className="w-3 h-3" /> View SQL
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-2">Total Bookings</th>
                  <th className="py-2">Cancelled</th>
                  <th className="py-2">Cancellation Rate</th>
                  <th className="py-2">Lost Estimated Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {report_cancellation_rate?.data?.map((r, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-mono font-bold text-slate-900">{r.total_bookings}</td>
                    <td className="py-2.5 font-mono font-bold text-rose-600">{r.cancelled_bookings}</td>
                    <td className="py-2.5 font-mono font-bold text-rose-600 text-sm">{r.cancellation_rate_pct}%</td>
                    <td className="py-2.5 font-mono font-bold text-slate-900">₹{Number(r.lost_potential_revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
