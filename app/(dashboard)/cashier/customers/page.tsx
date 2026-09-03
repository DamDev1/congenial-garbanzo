import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCustomers } from '@/lib/actions/customer';
import CustomersClient from '@/components/customers/CustomersClient';
import { getCurrentUser } from '@/lib/actions/user';

export default async function CashierCustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'cashier' && session.user.role !== 'manager')) {
    redirect('/login');
  }

  const user = await getCurrentUser();
  if (!user || !user.branchId) {
    return (
      <div className="p-12 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">No Branch Assigned</h2>
        <p>You must be assigned to a branch to access this page.</p>
      </div>
    );
  }

  const customers = await getCustomers();

  return (
    <CustomersClient 
      initialCustomers={customers} 
      cashierId={user._id.toString()}
      branchId={user.branchId.toString()}
    />
  );
}
