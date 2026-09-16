'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { addExpense } from '@/lib/actions/expenses';

export function ExpenseFormModal({
  isOpen,
  onClose,
  branchId,
  userRole,
}: {
  isOpen: boolean;
  onClose: () => void;
  branchId?: string;
  userRole: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<{
    amount: string;
    description: string;
    method: 'cash' | 'transfer';
    date: string;
  }>({
    amount: '',
    description: '',
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.amount || !formData.description || !formData.date) {
        throw new Error('Please fill in all required fields');
      }

      await addExpense({
        amount: Number(formData.amount),
        description: formData.description,
        method: formData.method,
        date: formData.date,
        branchId,
      });

      setFormData({
        amount: '',
        description: '',
        method: 'cash',
        date: new Date().toISOString().split('T')[0],
      });
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record New Expense">
        
        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Amount (₦) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="e.g. 5000"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Payment Method *</label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as 'cash' | 'transfer' })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              placeholder="What was this expense for?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              className="flex-1 !bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </Button>
          </div>
        </form>
    </Modal>
  );
}
