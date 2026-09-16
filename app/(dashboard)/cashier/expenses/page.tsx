import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getExpenses } from '@/lib/actions/expenses';
import ExpensesClient from '@/components/expenses/ExpensesClient';
import User from '@/lib/models/User';
import connectDB from '@/lib/db/mongoose';

export default async function CashierExpensesPage() {
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

  // Get expenses specifically recorded by this cashier
  const expenses = await getExpenses('all', currentUser.branchId.toString());
  
  // Filter for only their expenses on the client side or we can let them see all branch expenses?
  // Let's filter to show only expenses recorded by this cashier to maintain privacy of other cashiers
  const cashierExpenses = expenses.filter((e: any) => e.recordedBy?._id?.toString() === session.user.id);

  return (
    <ExpensesClient 
      initialExpenses={cashierExpenses} 
      userRole="cashier" 
      branchId={currentUser.branchId.toString()} 
    />
  );
}
