import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCashierStats } from '@/lib/actions/cashier';
import { Wallet, ShoppingBag, Package } from 'lucide-react';
import DashboardDateFilter from '@/components/DashboardDateFilter';

export default async function CashierDashboardPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const dateStr = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'cashier') {
    redirect('/login');
  }

  const stats = await getCashierStats(session.user.id, dateStr);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Here is your summary for {dateStr ? 'this date' : 'today'}.</p>
        </div>
        <DashboardDateFilter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-2">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          {/* <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 relative z-10">
            <Wallet className="w-6 h-6" />
          </div> */}
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Revenue</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">₦{stats.totalRevenue.toLocaleString()}</h3>
        </div>

        {/* Cash */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-1">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-green-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Cash</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">₦{stats.cashTotal.toLocaleString()}</h3>
        </div>

        {/* Transfer */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-1">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Transfer</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">₦{stats.transferTotal.toLocaleString()}</h3>
        </div>

        {/* Debt */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-1">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-orange-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Debt</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">₦{stats.creditTotal.toLocaleString()}</h3>
        </div>

        {/* Expenses */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-1">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Expenses</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">₦{stats.expensesTotal.toLocaleString()}</h3>
        </div>

        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-1">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          {/* <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 relative z-10">
            <ShoppingBag className="w-5 h-5" />
          </div> */}
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Sales</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">{stats.salesCount}</h3>
        </div>

        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 flex flex-col relative overflow-hidden xl:col-span-1">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
          {/* <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 relative z-10">
            <Package className="w-5 h-5" />
          </div> */}
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider relative z-10">Items Sold</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1 relative z-10">{stats.totalItemsSold}</h3>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Ready to serve customers?</h3>
          <p className="text-slate-600 mt-1">Jump right into the checkout to start processing new sales for your branch.</p>
        </div>
        <a
          href="/cashier/checkout"
          className="px-6 py-3 bg-[#3B41E3] hover:bg-[#2A2FC3] text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all text-center whitespace-nowrap"
        >
          Open Checkout
        </a>
      </div>
    </div>
  );
}
