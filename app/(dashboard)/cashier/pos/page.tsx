import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPOSInventory, getCustomers } from '@/lib/actions/pos';
import POSClient from './POSClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function POSPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'cashier' && session.user.role !== 'manager')) {
    redirect('/login');
  }

  // We need to know which branch the cashier/manager is assigned to
  await connectDB();
  const user = await User.findById(session.user.id).lean();
  
  if (!user || !user.branchId) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">No Branch Assigned</h2>
        <p>You must be assigned to a branch to use the POS system.</p>
      </div>
    );
  }

  // Fetch inventory for their branch
  const inventory = await getPOSInventory(user.branchId.toString());
  const customers = await getCustomers();

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col -mt-8 -mx-8 sm:mt-0 sm:mx-0 sm:h-[calc(100vh-6rem)] animate-in fade-in duration-500">
      <POSClient 
        inventory={inventory} 
        customers={customers} 
        branchId={user.branchId.toString()} 
        cashierId={user._id.toString()} 
      />
    </div>
  );
}
