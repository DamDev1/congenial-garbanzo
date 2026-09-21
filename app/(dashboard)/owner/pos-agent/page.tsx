import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPosExchanges } from '@/lib/actions/pos-agent';
import PosAgentClient from '@/components/pos-agent/PosAgentClient';
import connectDB from '@/lib/db/mongoose';

export default async function OwnerPosAgentPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'owner') {
    redirect('/login');
  }

  await connectDB();

  const exchanges = await getPosExchanges(undefined, 'all');

  return (
    <PosAgentClient 
      initialExchanges={exchanges} 
      userRole="owner" 
      userId={session.user.id}
    />
  );
}
