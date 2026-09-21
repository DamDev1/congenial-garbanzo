'use client';

import { useState } from 'react';
import { Plus, Search, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { ExpenseFormModal } from './ExpenseFormModal';

export default function ExpensesClient({ 
  initialExpenses, 
  branchId,
  userRole
}: { 
  initialExpenses: any[]; 
  branchId?: string;
  userRole: string;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(new Date());

  const filteredExpenses = initialExpenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter) {
      const expenseDate = new Date(e.date);
      matchesDate = 
        expenseDate.getFullYear() === dateFilter.getFullYear() &&
        expenseDate.getMonth() === dateFilter.getMonth() &&
        expenseDate.getDate() === dateFilter.getDate();
    }
    
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and track your operational expenses.</p>
        </div>
        <div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="glass rounded-3xl shadow-sm border border-slate-100/50 flex flex-col">
        <div className="p-4 md:p-6 bg-white rounded-t-3xl border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <div className="w-48">
              <CustomDatePicker 
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Filter by date..."
              />
            </div>
            {dateFilter && (
              <button
                onClick={() => setDateFilter(undefined)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Receipt className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700">No expenses found</p>
                      <p className="text-sm">Try adjusting your search or add a new expense.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense: any) => (
                  <tr key={expense._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${expense.method === 'cash' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {expense.method ? expense.method.charAt(0).toUpperCase() + expense.method.slice(1) : 'Cash'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                        ₦{expense.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {expense.branchId?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {expense.recordedBy?.name || 'Unknown'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        branchId={branchId}
        userRole={userRole}
      />
    </div>
  );
}
