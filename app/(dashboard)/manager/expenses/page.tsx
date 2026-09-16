import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getExpenses } from '@/lib/actions/expenses';
import ExpensesClient from '@/components/expenses/ExpensesClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function ManagerExpensesPage() {
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

  const expenses = await getExpenses('all'); // Show all expenses for the branch

  return (
    <ExpensesClient 
      initialExpenses={expenses} 
      userRole="manager" 
      branchId={currentUser.branchId.toString()} 
    />
  );
}
