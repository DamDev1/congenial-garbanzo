import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Store, Users, ArrowRightLeft, TrendingUp, Banknote, Receipt } from 'lucide-react';
import User from '@/lib/models/User';
import Branch from '@/lib/models/Branch';
import Inventory from '@/lib/models/Inventory';
import Transfer from '@/lib/models/Transfer';
import connectDB from '@/lib/db/mongoose';
import DashboardDateFilter from '@/components/DashboardDateFilter';

export default async function ManagerDashboardPage(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const dateStr = typeof searchParams.date === 'string' ? searchParams.date : undefined;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'manager') {
    redirect('/login');
  }

  await connectDB();
  const currentUser = await User.findById(session.user.id).lean();
  
  if (!currentUser || !currentUser.branchId) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">No Branch Assigned</h2>
        <p>Please contact the system administrator to assign you to a branch.</p>
      </div>
    );
  }

  const branchId = currentUser.branchId;
  const branch = await Branch.findById(branchId).lean();

  // 1. Get inventory stats
  const inventoryItems = await Inventory.find({ branchId }).lean();
  const totalProducts = inventoryItems.length;
  const totalStock = inventoryItems.reduce((sum, item) => sum + (item as any).quantity, 0);
  const lowStockCount = inventoryItems.filter(item => (item as any).quantity < 10).length;

  // 2. Get pending transfers for this branch
  // const pendingTransfers = await Transfer.countDocuments({
  //   $or: [{ sourceBranchId: branchId }, { destinationBranchId: branchId }],
  //   status: 'pending'
  // });

  // 3. Get total staff in this branch
  const staffCount = await User.countDocuments({
    branchId: branchId,
    role: { $ne: 'owner' }
  });

  // 4. Get today's sales stats
  const { getManagerStats } = await import('@/lib/actions/manager');
  const salesStats = await getManagerStats(branchId.toString(), dateStr);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {session.user.name}
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Here's what's happening at <span className="font-bold text-slate-700">{branch?.name || 'your branch'}</span> {dateStr ? 'on this date' : 'today'}.
          </p>
        </div>
        <DashboardDateFilter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Today's Revenue */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {/* <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div> */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Revenue</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Cash */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Net Cash</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.periodCashTotal?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        {/* Transfer */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Net Transfer </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.periodTransferTotal?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        {/* Gross Cash */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Total Cash (Gross)</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.periodGrossCashTotal?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        {/* Gross Transfer */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Total Transfer (Gross)</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.periodGrossTransferTotal?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        {/* Debt */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Total Debt </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.periodDebtTotal?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Total Expenses </p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">₦{salesStats.periodExpensesTotal?.toLocaleString() || '0'}</h3>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {/* <div className="w-12 h-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div> */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Total Stock</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">{totalStock.toLocaleString()} items</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10 truncate">{totalProducts} unique products ({lowStockCount} low stock)</p>
        </div>

        {/* Staff Card */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {/* <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div> */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Active Staff</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">{staffCount}</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10 truncate">Staff assigned to branch</p>
        </div>

        {/* Branch Info Card */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            {/* <div className="w-12 h-12 shrink-0 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div> */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Branch</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate" title={branch?.name}>
                {branch?.name || 'Unknown'}
              </h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10 truncate">{branch?.location || 'No location set'}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/manager/inventory" className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Manage Inventory</h3>
              <p className="text-emerald-100 text-sm mt-1">Check stock levels and add products.</p>
            </div>
          </a>

          <a href="/manager/sales" className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Branch Sales</h3>
              <p className="text-blue-100 text-sm mt-1">View the sales history for your branch.</p>
            </div>
          </a>

          <a href="/manager/users" className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Manage Staff</h3>
              <p className="text-slate-300 text-sm mt-1">Add or remove staff for your branch.</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
