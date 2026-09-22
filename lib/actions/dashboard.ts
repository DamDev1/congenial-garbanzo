'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import Branch from '@/lib/models/Branch';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import Transaction from '@/lib/models/Transaction';
import Inventory from '@/lib/models/Inventory';
import Expense from '@/lib/models/Expense';
import PosExchange from '@/lib/models/PosExchange';

export async function getOwnerDashboardStats(dateStr?: string) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const branchCount = await Branch.countDocuments();
  const userCount = await User.countDocuments();
  const productCount = await Product.countDocuments();

  // Specific day's total sales
  const todayStart = dateStr ? new Date(dateStr) : new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = dateStr ? new Date(dateStr) : new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaySalesAgg = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        cashTotal: { $sum: '$cashAmount' },
        transferTotal: { $sum: '$transferAmount' },
        creditTotal: { $sum: '$creditAmount' },
      },
    },
  ]);

  const todaySalesTotal = todaySalesAgg[0]?.total ?? 0;
  const todaySalesCount = todaySalesAgg[0]?.count ?? 0;
  let todayCashTotal = todaySalesAgg[0]?.cashTotal ?? 0;
  let todayTransferTotal = todaySalesAgg[0]?.transferTotal ?? 0;
  const todayDebtTotal = todaySalesAgg[0]?.creditTotal ?? 0;

  const expensesAgg = await Expense.aggregate([
    {
      $match: {
        date: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: '$method',
        total: { $sum: '$amount' },
      },
    },
  ]);
  
  let todayExpensesTotal = 0;
  expensesAgg.forEach((exp) => {
    todayExpensesTotal += exp.total;
    if (exp._id === 'cash') todayCashTotal -= exp.total;
    if (exp._id === 'transfer') todayTransferTotal -= exp.total;
  });

  const posExchangeAgg = await PosExchange.aggregate([
    {
      $match: {
        date: { $gte: todayStart, $lte: todayEnd },
      },
    },
    {
      $group: {
        _id: null,
        totalCashGiven: { $sum: '$cashGiven' },
        totalTransferReceived: { $sum: '$transferReceived' },
      },
    },
  ]);

  const posCashGiven = posExchangeAgg.length > 0 ? posExchangeAgg[0].totalCashGiven : 0;
  const posTransferReceived = posExchangeAgg.length > 0 ? posExchangeAgg[0].totalTransferReceived : 0;

  todayCashTotal -= posCashGiven;
  todayTransferTotal += posTransferReceived;

  // Total outstanding debt (credit transactions)
  const totalDebtAgg = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$creditAmount' },
      },
    },
  ]);

  const totalDebt = totalDebtAgg[0]?.total ?? 0;

  return {
    branchCount,
    userCount,
    productCount,
    todaySalesTotal,
    todaySalesCount,
    todayCashTotal,
    todayTransferTotal,
    todayDebtTotal,
    todayExpensesTotal,
    totalDebt, // All-time total debt
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
    status: 'completed' as const
  };

  const transactions = await Transaction.find(query)
    .populate('cashierId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  let periodCashTotal = transactions.reduce((sum, t) => sum + (t.cashAmount || 0), 0);
  let periodTransferTotal = transactions.reduce((sum, t) => sum + (t.transferAmount || 0), 0);
  const periodDebtTotal = transactions.reduce((sum, t) => sum + (t.creditAmount || 0), 0);
  
  // Calculate outstanding debt from credit transactions (all time for branch)
  const debtQuery = {
    branchId,
    paymentMethod: 'credit' as const,
    status: 'completed' as const
  };
  const creditTransactions = await Transaction.find(debtQuery).lean();
  const totalDebt = creditTransactions.reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  // Stock value calculation
  const inventory = await Inventory.find({ branchId }).populate('productId').lean();
  const totalStockValue = inventory.reduce((sum, inv: any) => {
    return sum + ((inv.quantity || 0) * (inv.productId?.costPrice || 0));
  }, 0);

  // Expenses for the period
  const expenses = await Expense.find({ branchId, date: { $gte: startDate } }).lean();
  const periodExpensesTotal = expenses.reduce((sum, e: any) => {
    if (e.method === 'cash') periodCashTotal -= (e.amount || 0);
    if (e.method === 'transfer') periodTransferTotal -= (e.amount || 0);
    return sum + (e.amount || 0);
  }, 0);

  // POS Exchanges for the period
  const posExchanges = await PosExchange.find({ branchId, date: { $gte: startDate } }).lean();
  const posCashGiven = posExchanges.reduce((sum, p: any) => sum + (p.cashGiven || 0), 0);
  const posTransferReceived = posExchanges.reduce((sum, p: any) => sum + (p.transferReceived || 0), 0);

  periodCashTotal -= posCashGiven;
  periodTransferTotal += posTransferReceived;

  // Also get assigned manager
  const manager = await User.findOne({ branchId, role: 'manager' }).lean();

  return JSON.parse(JSON.stringify({
    branch,
    manager,
    totalRevenue,
    periodCashTotal,
    periodTransferTotal,
    periodDebtTotal,
    periodExpensesTotal,
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

export async function deleteTransaction(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const transaction = await Transaction.findByIdAndDelete(id);
  
  if (!transaction) {
    throw new Error('Transaction not found');
  }

  revalidatePath('/owner/sales');
  revalidatePath('/owner');
  
  return true;
}
