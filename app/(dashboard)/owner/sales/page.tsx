import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getOwnerSales } from '@/lib/actions/dashboard';
import SalesClient from '@/components/sales/SalesClient';
import connectDB from '@/lib/db/mongoose';

export default async function OwnerSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: 'today' | 'week' | 'month' | 'all' }>
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  await connectDB();

  const { filter = 'today' } = await searchParams;
  const sales = await getOwnerSales(filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Global Sales History</h1>
          <p className="text-slate-500 font-medium mt-1">View all sales records across all branches.</p>
        </div>
      </div>

      <SalesClient initialSales={sales} initialFilter={filter} isOwner={true} />
    </div>
  );
}
