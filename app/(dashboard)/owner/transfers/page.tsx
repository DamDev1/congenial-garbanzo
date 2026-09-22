import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTransfers } from '@/lib/actions/transfer';
import { getBranches } from '@/lib/actions/branch';
import TransferListClient from '@/components/transfers/TransferListClient';

export default async function OwnerTransfersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  const transfers = await getTransfers();
  const branches = await getBranches();

  return (
    <TransferListClient 
      initialTransfers={transfers} 
      branches={branches}
      currentUser={session.user}
      isOwner={true}
    />
  );
}
