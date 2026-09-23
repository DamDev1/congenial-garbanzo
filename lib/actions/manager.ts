'use server';

import connectDB from '../db/mongoose';
import Transaction from '../models/Transaction';
import '../models/Branch';
import '../models/User';
import Expense from '../models/Expense';
import PosExchange from '../models/PosExchange';
import '../models/Customer';
import '../models/Product';
import DebtPayment from '../models/DebtPayment';
import mongoose from 'mongoose';
import Customer from '../models/Customer';

export async function getManagerStats(branchId: string, dateStr?: string) {
  await connectDB();

  const startOfDay = dateStr ? new Date(dateStr) : new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = dateStr ? new Date(dateStr) : new Date();
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

  // Calculate total outstanding debt from all customers for this branch
  const branchCustomers = await Customer.find({ branchId }).lean();
  const totalDebt = branchCustomers.reduce((sum: number, c: any) => sum + (c.debtBalance || 0), 0);

  const expensesAgg = await Expense.aggregate([
    {
      $match: {
        branchId: new mongoose.Types.ObjectId(branchId),
        date: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $group: {
        _id: '$method',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let periodExpensesTotal = 0;
  let cashExpenses = 0;
  let transferExpenses = 0;

  expensesAgg.forEach((exp) => {
    periodExpensesTotal += exp.total;
    if (exp._id === 'cash') cashExpenses += exp.total;
    if (exp._id === 'transfer') transferExpenses += exp.total;
  });

  const posExchangeAgg = await PosExchange.aggregate([
    {
      $match: {
        branchId: new mongoose.Types.ObjectId(branchId),
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

  const debtPaymentAgg = await DebtPayment.aggregate([
    {
      $match: {
        branchId: new mongoose.Types.ObjectId(branchId),
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalCash: { $sum: '$cashAmount' },
        totalTransfer: { $sum: '$transferAmount' }
      }
    }
  ]);

  const debtPaymentCash = debtPaymentAgg.length > 0 ? debtPaymentAgg[0].totalCash : 0;
  const debtPaymentTransfer = debtPaymentAgg.length > 0 ? debtPaymentAgg[0].totalTransfer : 0;

  if (stats.length === 0) {
    return {
      totalRevenue: 0,
      salesCount: 0,
      totalItemsSold: 0,
      periodCashTotal: 0 + debtPaymentCash - cashExpenses - posCashGiven,
      periodTransferTotal: 0 + debtPaymentTransfer - transferExpenses + posTransferReceived,
      periodGrossCashTotal: debtPaymentCash,
      periodGrossTransferTotal: debtPaymentTransfer,
      periodDebtTotal: 0,
      periodExpensesTotal,
      totalDebt,
      debtRecovered: debtPaymentCash + debtPaymentTransfer
    };
  }

  return {
    totalRevenue: stats[0].totalRevenue || 0,
    salesCount: stats[0].salesCount || 0,
    totalItemsSold: stats[0].totalItemsSold || 0,
    periodCashTotal: (stats[0].periodCashTotal || 0) + debtPaymentCash - cashExpenses - posCashGiven,
    periodTransferTotal: (stats[0].periodTransferTotal || 0) + debtPaymentTransfer - transferExpenses + posTransferReceived,
    periodGrossCashTotal: (stats[0].periodCashTotal || 0) + debtPaymentCash,
    periodGrossTransferTotal: (stats[0].periodTransferTotal || 0) + debtPaymentTransfer,
    periodDebtTotal: stats[0].periodDebtTotal || 0,
    periodExpensesTotal,
    totalDebt,
    debtRecovered: debtPaymentCash + debtPaymentTransfer
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
