import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getCustomers } from '@/lib/actions/customer';
import CustomersClient from '@/components/customers/CustomersClient';

export default async function ManagerCustomersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'manager') {
    redirect('/login');
  }

  const customers = await getCustomers();

  return <CustomersClient initialCustomers={customers} />;
}
