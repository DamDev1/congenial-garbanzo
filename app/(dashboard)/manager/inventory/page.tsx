import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getManagerInventory } from '@/lib/actions/inventory';
import { getBrands } from '@/lib/actions/product';
import ManagerInventoryClient from '@/components/inventory/ManagerInventoryClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function ManagerInventoryPage() {
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
        <p>You must be assigned to a branch to manage inventory.</p>
      </div>
    );
  }

  const inventory = await getManagerInventory(user.branchId.toString());
  const brands = await getBrands();

  return (
    <ManagerInventoryClient 
      initialInventory={inventory} 
      brands={brands}
      currentUser={{ ...session.user, branchId: user.branchId.toString() }}
    />
  );
}
