import { getBranchStats } from '@/lib/actions/dashboard';
import Link from 'next/link';
import { ArrowLeft, User as UserIcon, Wallet, TrendingUp, Package, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function BranchDrillDownPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ filter?: string }>
}) {
  const { id } = await params;
  const { filter = 'today' } = await searchParams;

  let data;
  try {
    data = await getBranchStats(id, filter);
  } catch (err) {
    notFound();
  }

  const { branch, manager, totalRevenue, totalDebt, totalStockValue, transactions, inventory } = data;

  const filters = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/owner/branches" className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{branch.name}</h2>
              {!branch.isActive && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-200 text-slate-500 uppercase tracking-wider">
                  Deactivated
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium mt-1">{branch.location}</p>
          </div>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-slate-100 p-1">
          {filters.map(f => (
            <Link
              key={f.value}
              href={`/owner/branches/${id}?filter=${f.value}`}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === f.value
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Revenue</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₦{totalRevenue.toLocaleString()}</h3>
        </div>

        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all" />
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Customer Debt</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₦{totalDebt.toLocaleString()}</h3>
        </div>

        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Stock Value</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₦{totalStockValue.toLocaleString()}</h3>
        </div>

        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <UserIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Manager</p>
          <h3 className="text-lg font-bold text-slate-900 mt-1">{manager ? manager.name : 'Unassigned'}</h3>
          {manager && <p className="text-sm text-slate-500 truncate">{manager.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-3xl shadow-sm border border-slate-100/50 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {transactions.length} Records
            </span>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px]">
            <ul className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <li className="p-8 text-center text-slate-500">No transactions in this period.</li>
              ) : (
                transactions.map((t: any) => (
                  <li key={t._id} className="p-4 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">₦{t.totalAmount.toLocaleString()}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(t.createdAt).toLocaleString()}
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-bold">
                          {t.paymentMethod}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{t.cashierId?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">Cashier</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="glass rounded-3xl shadow-sm border border-slate-100/50 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Current Stock</h3>
          </div>
          <div className="p-0 overflow-y-auto max-h-[400px]">
            <ul className="divide-y divide-slate-100">
              {inventory.length === 0 ? (
                <li className="p-8 text-center text-slate-500">No inventory tracked.</li>
              ) : (
                inventory.map((inv: any) => (
                  <li key={inv._id} className="p-4 hover:bg-slate-50/50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{inv.productId?.name || 'Unknown Product'}</p>
                      <p className="text-xs text-slate-500 mt-1">Pack Size: {inv.productId?.packSize}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${inv.quantity <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {inv.quantity}
                      </p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Packs</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
