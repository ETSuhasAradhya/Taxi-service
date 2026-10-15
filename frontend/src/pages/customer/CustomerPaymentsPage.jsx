import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { CreditCard, Calendar, CheckCircle2 } from 'lucide-react';

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const res = await api.get('/payments/my-payments');
        if (res.data.success) {
          setPayments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load customer payments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  if (loading) {
    return <Spinner message="Loading payments ledger..." />;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Receipts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed ledger of charges, payment methods, and settlement timestamps.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="You do not have any payment records on file yet."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Trip #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payments.map((p) => (
                <tr key={p.payment_id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    PAY-{p.payment_id.toString().padStart(4, '0')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                    #{p.booking_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(p.booking_time).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="max-w-xs truncate">
                      {p.pickup_location} → {p.destination_location}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹{Number(p.amount).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono uppercase text-slate-600">
                    {p.payment_method}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={p.payment_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
