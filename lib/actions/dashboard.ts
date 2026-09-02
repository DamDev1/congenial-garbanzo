'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import Branch from '@/lib/models/Branch';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Transaction from '@/lib/models/Transaction';
import Inventory from '@/lib/models/Inventory';

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

export async function getBranchStats(branchId: string, filter: string = 'today') {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const branch = await Branch.findById(branchId).lean();
  if (!branch) throw new Error('Branch not found');

  // Date filtering logic
  const now = new Date();
  let startDate = new Date();
  
  if (filter === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (filter === 'week') {
    startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startDate.setHours(0, 0, 0, 0);
  } else if (filter === 'month') {
    startDate.setDate(1); // Start of month
    startDate.setHours(0, 0, 0, 0);
  } else {
    // all time
    startDate = new Date(0);
  }

  const query = {
    branchId,
    createdAt: { $gte: startDate },
    status: 'completed'
  };

  const transactions = await Transaction.find(query)
    .populate('cashierId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  
  // Calculate outstanding debt from credit transactions
  const debtQuery = {
    branchId,
    paymentMethod: 'credit',
    status: 'completed'
    // Depending on schema, we might need to check if it's paid off, 
    // but for now, total credit amount issued is the debt.
  };
  const creditTransactions = await Transaction.find(debtQuery).lean();
  const totalDebt = creditTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Stock value calculation
  const inventory = await Inventory.find({ branchId }).populate('productId').lean();
  const totalStockValue = inventory.reduce((sum, inv: any) => {
    return sum + ((inv.quantity || 0) * (inv.productId?.costPrice || 0));
  }, 0);

  // Also get assigned manager
  const manager = await User.findOne({ branchId, role: 'manager' }).lean();

  return JSON.parse(JSON.stringify({
    branch,
    manager,
    totalRevenue,
    totalDebt,
    totalStockValue,
    transactions,
    inventory
  }));
}

export async function getRecentTransactions(limit: number = 5) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const transactions = await Transaction.find({ status: 'completed' })
    .populate('branchId', 'name')
    .populate('cashierId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(transactions));
}

export async function getOwnerSales(filter: 'today' | 'week' | 'month' | 'all' = 'today') {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  
  let dateQuery = {};
  const now = new Date();
  
  if (filter === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    dateQuery = { $gte: start };
  } else if (filter === 'week') {
    const start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0, 0, 0, 0);
    dateQuery = { $gte: start };
  } else if (filter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    dateQuery = { $gte: start };
  }

  const query: any = { status: 'completed' };
  if (filter !== 'all') {
    query.createdAt = dateQuery;
  }

  const sales = await Transaction.find(query)
    .populate('branchId', 'name')
    .populate('cashierId', 'name')
    .populate('customerId', 'name phone debtBalance')
    .populate({
      path: 'items.productId',
      select: 'name image',
    })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(sales));
}
