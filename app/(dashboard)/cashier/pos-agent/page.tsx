import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPosExchanges } from '@/lib/actions/pos-agent';
import PosAgentClient from '@/components/pos-agent/PosAgentClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function CashierPosAgentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'cashier') {
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

  // Get POS exchanges for this branch
  const exchanges = await getPosExchanges(currentUser.branchId.toString(), 'today');
  
  // Filter for only those recorded by this cashier
  const cashierExchanges = exchanges.filter((e: any) => e.recordedBy?._id?.toString() === session.user.id);

  return (
    <PosAgentClient 
      initialExchanges={cashierExchanges} 
      userRole="cashier" 
      branchId={currentUser.branchId.toString()} 
      userId={session.user.id}
    />
  );
}
