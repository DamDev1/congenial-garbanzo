import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTransfers } from '@/lib/actions/transfer';
import { getBranches } from '@/lib/actions/branch';
import TransferListClient from '@/components/transfers/TransferListClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function ManagerTransfersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'manager') {
    redirect('/login');
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean();
  
  if (!user || !user.branchId) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">No Branch Assigned</h2>
        <p>You must be assigned to a branch to manage transfers.</p>
      </div>
    );
  }

  // Pass branchId to only fetch transfers involving their branch
  const transfers = await getTransfers(user.branchId.toString());
  const branches = await getBranches();

  return (
    <TransferListClient 
      initialTransfers={transfers} 
      branches={branches}
      currentUser={{ ...session.user, branchId: user.branchId.toString() }}
    />
  );
}
