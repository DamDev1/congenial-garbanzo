import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Store, Users, ArrowRightLeft, TrendingUp } from 'lucide-react';
import User from '@/lib/models/User';
import Branch from '@/lib/models/Branch';
import Inventory from '@/lib/models/Inventory';
import Transfer from '@/lib/models/Transfer';
import connectDB from '@/lib/db/mongoose';

export default async function ManagerDashboardPage() {
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
  const pendingTransfers = await Transfer.countDocuments({
    $or: [{ sourceBranchId: branchId }, { destinationBranchId: branchId }],
    status: 'pending'
  });

  // 3. Get total staff in this branch
  const staffCount = await User.countDocuments({
    branchId: branchId,
    role: { $ne: 'owner' }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-slate-500 font-medium mt-1">
          Here's what's happening at <span className="font-bold text-slate-700">{branch?.name || 'your branch'}</span> today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 shrink-0 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Total Stock</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">{totalStock.toLocaleString()} items</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10 truncate">{totalProducts} unique products ({lowStockCount} low stock)</p>
        </div>

        {/* Pending Transfers Card */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 shrink-0 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate">Pending Transfers</p>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 truncate">{pendingTransfers}</h3>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 relative z-10 truncate">Awaiting action</p>
        </div>

        {/* Staff Card */}
        <div className="glass rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="w-12 h-12 shrink-0 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
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
            <div className="w-12 h-12 shrink-0 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/manager/inventory" className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-start gap-4 group">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Manage Inventory</h3>
              <p className="text-emerald-100 text-sm mt-1">Check stock levels and add products.</p>
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
