import { notFound } from 'next/navigation';
import { getManagerInventory } from '@/lib/actions/inventory';
import connectDB from '@/lib/db/mongoose';
import Branch from '@/lib/models/Branch';
import BranchInventoryClient from '@/components/inventory/BranchInventoryClient';

export default async function BranchInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  await connectDB();
  const branch = await Branch.findById(id).lean();

  if (!branch) {
    notFound();
  }

  const inventory = await getManagerInventory(id);

  return (
    <BranchInventoryClient 
      branch={JSON.parse(JSON.stringify(branch))} 
      inventory={inventory} 
    />
  );
}
