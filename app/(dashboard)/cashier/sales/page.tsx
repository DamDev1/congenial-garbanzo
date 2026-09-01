import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCashierSales } from '@/lib/actions/cashier';
import SalesClient from './SalesClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function CashierSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: 'today' | 'week' | 'month' | 'all' }>
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'cashier') {
    redirect('/login');
  }

  const { filter = 'today' } = await searchParams;
  const sales = await getCashierSales(session.user.id, filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sales History</h1>
          <p className="text-slate-500 font-medium mt-1">View your personal sales records and reprint receipts.</p>
        </div>
      </div>

      <SalesClient initialSales={sales} initialFilter={filter} />
    </div>
  );
}
