'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ReceiptModal } from '../pos/ReceiptModal';

export default function SalesClient({ initialSales, initialFilter }: { initialSales: any[], initialFilter: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    router.push(`/cashier/sales?filter=${newFilter}`);
  };

  const filters = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-2xl w-fit border border-slate-200">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.value 
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Receipt className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700">No sales found</p>
                      <p className="text-sm">Try adjusting your date filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialSales.map((sale: any) => (
                  <tr key={sale._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">
                        {sale.items.length} item(s)
                      </div>
                      <div className="text-xs text-slate-500 max-w-[200px] truncate">
                        {sale.items.map((i: any) => i.productId?.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.customerId ? (
                        <div>
                          <div className="font-bold text-slate-800">{sale.customerId.name}</div>
                          <div className="text-xs text-slate-500">{sale.customerId.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Guest</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        sale.paymentMethod === 'cash' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {sale.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      ₦{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        type="button"
                        onClick={() => setSelectedTransaction(sale)}
                        className="!bg-white !text-blue-600 border border-blue-200 hover:!bg-blue-50 shadow-sm"
                      >
                        <Receipt className="w-4 h-4 mr-2" />
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal 
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  );
}
