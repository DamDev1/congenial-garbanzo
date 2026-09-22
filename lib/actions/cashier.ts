'use server';

import connectDB from '../db/mongoose';
import Transaction from '../models/Transaction';
import '../models/Branch';
import '../models/User';
import Expense from '../models/Expense';
import PosExchange from '../models/PosExchange';
import mongoose from 'mongoose';

export async function getCashierStats(cashierId: string, dateStr?: string) {
  await connectDB();
  
  const startOfDay = dateStr ? new Date(dateStr) : new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = dateStr ? new Date(dateStr) : new Date();
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
        _id: '$method',
        total: { $sum: '$amount' }
      }
    }
  ]);

  let expensesTotal = 0;
  let cashExpenses = 0;
  let transferExpenses = 0;
  
  expensesAgg.forEach((exp) => {
    expensesTotal += exp.total;
    if (exp._id === 'cash') cashExpenses += exp.total;
    if (exp._id === 'transfer') transferExpenses += exp.total;
  });

  const posExchangeAgg = await PosExchange.aggregate([
    {
      $match: {
        recordedBy: new mongoose.Types.ObjectId(cashierId),
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalCashGiven: { $sum: '$cashGiven' },
        totalTransferReceived: { $sum: '$transferReceived' }
      }
    }
  ]);

  const posCashGiven = posExchangeAgg.length > 0 ? posExchangeAgg[0].totalCashGiven : 0;
  const posTransferReceived = posExchangeAgg.length > 0 ? posExchangeAgg[0].totalTransferReceived : 0;

  if (stats.length === 0) {
    return {
      totalRevenue: 0,
      salesCount: 0,
      totalItemsSold: 0,
      cashTotal: 0 - posCashGiven - cashExpenses,
      transferTotal: 0 + posTransferReceived - transferExpenses,
      grossCashTotal: 0,
      grossTransferTotal: 0,
      creditTotal: 0,
      expensesTotal
    };
  }

  return {
    totalRevenue: stats[0].totalRevenue,
    salesCount: stats[0].salesCount,
    totalItemsSold: stats[0].totalItemsSold,
    cashTotal: stats[0].cashTotal - posCashGiven - cashExpenses,
    transferTotal: stats[0].transferTotal + posTransferReceived - transferExpenses,
    grossCashTotal: stats[0].cashTotal,
    grossTransferTotal: stats[0].transferTotal,
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
