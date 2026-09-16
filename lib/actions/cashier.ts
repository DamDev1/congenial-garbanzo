'use server';

import connectDB from '../db/mongoose';
import Transaction from '../models/Transaction';
import '../models/Branch';
import '../models/User';
import Expense from '../models/Expense';
import mongoose from 'mongoose';

export async function getCashierStats(cashierId: string) {
  await connectDB();
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const stats = await Transaction.aggregate([
    {
      $match: {
        cashierId: new mongoose.Types.ObjectId(cashierId),
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
        cashTotal: { $sum: '$cashAmount' },
        transferTotal: { $sum: '$transferAmount' },
        creditTotal: { $sum: '$creditAmount' }
      }
    }
  ]);

  const expensesAgg = await Expense.aggregate([
    {
      $match: {
        recordedBy: new mongoose.Types.ObjectId(cashierId),
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const expensesTotal = expensesAgg.length > 0 ? expensesAgg[0].total : 0;

  if (stats.length === 0) {
    return {
      totalRevenue: 0,
      salesCount: 0,
      totalItemsSold: 0,
      cashTotal: 0,
      transferTotal: 0,
      creditTotal: 0,
      expensesTotal
    };
  }

  return {
    totalRevenue: stats[0].totalRevenue,
    salesCount: stats[0].salesCount,
    totalItemsSold: stats[0].totalItemsSold,
    cashTotal: stats[0].cashTotal,
    transferTotal: stats[0].transferTotal,
    creditTotal: stats[0].creditTotal,
    expensesTotal
  };
}

export async function getCashierSales(cashierId: string, filter: 'today' | 'week' | 'month' | 'all' = 'today') {
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

  const query: any = { cashierId };
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
