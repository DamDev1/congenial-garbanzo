import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getExpenses } from '@/lib/actions/expenses';
import ExpensesClient from '@/components/expenses/ExpensesClient';

export default async function OwnerExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  const expenses = await getExpenses('all'); // Show all expenses by default

  return <ExpensesClient initialExpenses={expenses} userRole="owner" isOwner={true} />;
}
