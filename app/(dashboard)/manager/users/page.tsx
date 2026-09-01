import { getUsers } from '@/lib/actions/user';
import { getBranches } from '@/lib/actions/branch';
import UsersList from '@/app/(dashboard)/owner/users/UsersList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ManagerUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'manager') {
    redirect('/login');
  }

  const [users, branches] = await Promise.all([
    getUsers(),
    getBranches(),
  ]);

  // Pass down the constraint to lock the form to only creating cashiers for this specific branch
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <UsersList 
        users={users} 
        branches={branches} 
        fixedRole="cashier"
        fixedBranchId={session.user.branchId}
      />
    </div>
  );
}
