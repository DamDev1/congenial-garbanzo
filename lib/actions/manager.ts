'use server';

import connectDB from '../db/mongoose';
import Transaction from '../models/Transaction';
import '../models/Branch';
import '../models/User';
import Expense from '../models/Expense';
import mongoose from 'mongoose';

export async function getManagerStats(branchId: string) {
  await connectDB();
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const stats = await Transaction.aggregate([
    {
      $match: {
        branchId: new mongoose.Types.ObjectId(branchId),
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        salesCount: { $sum: 1 },
        totalItemsSold: { $sum: { $sum: '$items.quantity' } },
        periodCashTotal: { $sum: '$cashAmount' },
        periodTransferTotal: { $sum: '$transferAmount' },
        periodDebtTotal: { $sum: '$creditAmount' }
      }
    }
  ]);

  const expensesAgg = await Expense.aggregate([
    {
      $match: {
        branchId: new mongoose.Types.ObjectId(branchId),
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);
  
  const periodExpensesTotal = expensesAgg[0]?.total ?? 0;

  if (stats.length === 0) {
    return {
      totalRevenue: 0,
      salesCount: 0,
      totalItemsSold: 0,
      periodCashTotal: 0,
      periodTransferTotal: 0,
      periodDebtTotal: 0,
      periodExpensesTotal
    };
  }

  return {
    totalRevenue: stats[0].totalRevenue || 0,
    salesCount: stats[0].salesCount || 0,
    totalItemsSold: stats[0].totalItemsSold || 0,
    periodCashTotal: stats[0].periodCashTotal || 0,
    periodTransferTotal: stats[0].periodTransferTotal || 0,
    periodDebtTotal: stats[0].periodDebtTotal || 0,
    periodExpensesTotal
  };
}

export async function getManagerSales(branchId: string, filter: 'today' | 'week' | 'month' | 'all' = 'today') {
  await connectDB();
  
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

  const query: any = { branchId };
  if (filter !== 'all') {
    query.createdAt = dateQuery;
  }

  const sales = await Transaction.find(query)
    .populate('customerId', 'name phone debtBalance')
    .populate('cashierId', 'name')
    .populate('branchId', 'name')
    .populate({
      path: 'items.productId',
      select: 'name image',
    })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(sales));
}
