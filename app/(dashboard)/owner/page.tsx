import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOwnerDashboardStats, getRecentTransactions } from '@/lib/actions/dashboard';
import { Store, Users, Package, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getOwnerDashboardStats();
  const recentTransactions = await getRecentTransactions();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2 relative">
        {/* Subtle background glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 z-10">
          Welcome back, <span className="text-gradient">{session?.user?.name?.split(' ')[0]}</span>
        </h2>
        <p className="text-slate-500 font-medium z-10">Here is what's happening across your branches today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1 */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Total Branches</h3>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-4xl font-extrabold text-slate-800">{stats.branchCount}</div>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Active</span>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Total Staff</h3>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-4xl font-extrabold text-slate-800">{stats.userCount}</div>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Registered</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Products</h3>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-4xl font-extrabold text-slate-800">{stats.productCount}</div>
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">Catalog</span>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="glass p-6 rounded-2xl flex flex-col gap-4 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-600">Total Debt</h3>
          </div>
          <div className="flex items-end justify-between mt-2">
            <div className="text-4xl font-extrabold text-slate-800">₦0</div>
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Owed</span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 glass rounded-3xl p-8 flex flex-col">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
             <Link href="/owner/sales" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</Link>
           </div>
           {recentTransactions.length === 0 ? (
             <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
               <div className="text-center">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                   <Store className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-slate-500 font-medium">No recent sales to display</p>
                 <p className="text-sm text-slate-400 mt-1">Sales will appear here once branches start operating.</p>
               </div>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {recentTransactions.slice(0, 3).map((tx: any) => (
                 <div key={tx._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                   <div>
                     <div className="font-semibold text-slate-800">₦{tx.totalAmount.toLocaleString()}</div>
                     <div className="text-sm text-slate-500">{tx.branchId?.name || 'Unknown Branch'} • {tx.cashierId?.name || 'Unknown Cashier'}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs font-bold text-slate-400 uppercase">{tx.paymentMethod}</div>
                     <div className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="lg:col-span-3 glass rounded-3xl p-8">
           <h3 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h3>
           <div className="flex flex-col gap-4">
              <Link href="/owner/branches" className="group flex items-center justify-between p-5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-md hover:shadow-blue-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Store className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-white transition-colors">Add New Branch</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </Link>
              
              <Link href="/owner/users" className="group flex items-center justify-between p-5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-emerald-400 hover:to-emerald-500 transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-md hover:shadow-emerald-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Users className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-white transition-colors">Register Staff</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </Link>
              
              <Link href="/owner/products" className="group flex items-center justify-between p-5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600 transition-all duration-300 border border-slate-100 shadow-sm hover:shadow-md hover:shadow-purple-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Package className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold text-slate-700 group-hover:text-white transition-colors">Manage Pricing</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-white group-hover:-translate-x-1 transition-all" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
