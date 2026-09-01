'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import Branch from '@/lib/models/Branch';
import { revalidatePath } from 'next/cache';

export async function createBranch(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const location = formData.get('location') as string;

  if (!name || !location) {
    throw new Error('Name and location are required');
  }

  await connectToDatabase();

  await Branch.create({ name, location });

  revalidatePath('/owner/branches');
}

export async function getBranches() {
  await connectToDatabase();
  const branches = await Branch.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(branches));
}

export async function toggleBranchStatus(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  await Branch.findByIdAndUpdate(id, { isActive });
  revalidatePath('/owner/branches');
}
