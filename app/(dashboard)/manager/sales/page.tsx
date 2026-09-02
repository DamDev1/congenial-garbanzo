import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getManagerSales } from '@/lib/actions/manager';
import SalesClient from '@/components/sales/SalesClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function ManagerSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: 'today' | 'week' | 'month' | 'all' }>
}) {
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

  const { filter = 'today' } = await searchParams;
  const sales = await getManagerSales(currentUser.branchId.toString(), filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Branch Sales History</h1>
          <p className="text-slate-500 font-medium mt-1">View all sales records for your branch and track cashier performance.</p>
        </div>
      </div>

      <SalesClient initialSales={sales} initialFilter={filter} />
    </div>
  );
}
