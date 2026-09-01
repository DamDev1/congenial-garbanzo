'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import Branch from '@/lib/models/Branch';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';

export async function getOwnerDashboardStats() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const branchCount = await Branch.countDocuments();
  const userCount = await User.countDocuments();
  const productCount = await Product.countDocuments();

  return {
    branchCount,
    userCount,
    productCount,
  };
}
