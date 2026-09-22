'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import Expense from '@/lib/models/Expense';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';

export async function addExpense(data: { amount: number; description: string; method: 'cash' | 'transfer'; date?: string; branchId?: string }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const currentUser = await User.findById(session.user.id).lean();

  if (!currentUser) {
    throw new Error('User not found');
  }

  // Determine branchId
  // If owner, they should provide branchId (or default to something if they have a specific branch)
  // If manager/cashier, use their own branchId
  const branchId = session.user.role === 'owner' ? (data.branchId || currentUser.branchId) : currentUser.branchId;

  if (!branchId) {
    throw new Error('Branch ID is required');
  }

  // Validate available balance for the day
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayTransactions = await Transaction.find({
    branchId,
    createdAt: { $gte: todayStart },
    status: 'completed'
  }).lean();

  const todayExpenses = await Expense.find({
    branchId,
    date: { $gte: todayStart }
  }).lean();

  let availableBalance = 0;

  if (data.method === 'cash') {
    const totalCashIn = todayTransactions.reduce((sum, t: any) => sum + (t.cashAmount || 0), 0);
    const totalCashOut = todayExpenses.filter(e => e.method === 'cash').reduce((sum, e: any) => sum + e.amount, 0);
    availableBalance = totalCashIn - totalCashOut;
  } else if (data.method === 'transfer') {
    const totalTransferIn = todayTransactions.reduce((sum, t: any) => sum + (t.transferAmount || 0), 0);
    const totalTransferOut = todayExpenses.filter(e => e.method === 'transfer').reduce((sum, e: any) => sum + e.amount, 0);
    availableBalance = totalTransferIn - totalTransferOut;
  }

  if (availableBalance < data.amount) {
    throw new Error(`Insufficient ${data.method} balance. Available: ₦${availableBalance.toLocaleString()}`);
  }

  const newExpense = await Expense.create({
    branchId,
    recordedBy: session.user.id,
    amount: data.amount,
    description: data.description,
    method: data.method,
    date: data.date ? new Date(data.date) : new Date(),
  });

  return JSON.parse(JSON.stringify(newExpense));
}

export async function getExpenses(filter: 'today' | 'week' | 'month' | 'all' = 'today', branchId?: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const currentUser = await User.findById(session.user.id).lean();

  let query: any = {};
  
  if (session.user.role !== 'owner') {
    query.branchId = currentUser?.branchId;
  } else if (branchId) {
    query.branchId = branchId;
  }

  const now = new Date();
  let dateQuery = {};
  
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

  if (filter !== 'all') {
    query.date = dateQuery;
  }

  const expenses = await Expense.find(query)
    .populate('branchId', 'name')
    .populate('recordedBy', 'name role')
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(expenses));
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();
  const expense = await Expense.findByIdAndDelete(id);
  
  if (!expense) {
    throw new Error('Expense not found');
  }

  revalidatePath('/owner/expenses');
  revalidatePath('/owner');
  
  return true;
}
