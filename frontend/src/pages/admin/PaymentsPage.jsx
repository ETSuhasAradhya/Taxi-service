import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { CreditCard, CheckCircle, Clock, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [confirmingId, setConfirmingId] = useState(null);

  const { showToast } = useToast();

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      if (methodFilter) params.append('method', methodFilter);

      const res = await api.get(`/payments?${params.toString()}`);
      if (res.data.success) {
        setPayments(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, methodFilter]);

  const handleConfirmPaid = async (paymentId) => {
    setConfirmingId(paymentId);
    try {
      const res = await api.put(`/payments/${paymentId}/pay`);
      if (res.data.success) {
        showToast('Payment settled and marked as paid.', 'success');
        loadPayments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update payment status', 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Ledger & Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transactional audit records from <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-amber-700">payments</code> table. Total records: {total}.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Payment Statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' }
            ]}
          />
          <Select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Payment Methods' },
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'card', label: 'Credit/Debit Card' }
            ]}
          />
        </div>
      </div>

      {loading ? (
        <Spinner message="Loading payment ledger..." />
      ) : payments.length === 0 ? (
        <EmptyState title="No payment records found" description="Try selecting a different filter." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                  <th className="py-3 px-4">Receipt ID</th>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Chauffeur</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Settled At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#{p.payment_id}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">BK-{p.booking_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{p.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.customer_phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.driver_name ? (
                        <div className="font-semibold text-slate-900">{p.driver_name}</div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                        <span>{p.pickup_location}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{p.destination_location}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.distance_km} km</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase font-bold text-xs tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-slate-900 whitespace-nowrap">
                      ₹{Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.payment_status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {p.payment_status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle}
                          isLoading={confirmingId === p.payment_id}
                          onClick={() => handleConfirmPaid(p.payment_id)}
                        >
                          Confirm Paid
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
    </div>
  );
}
