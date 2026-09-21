'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '../db/mongoose';
import PosExchange from '../models/PosExchange';
import '../models/User';

export async function createPosExchange(data: {
  branchId: string;
  recordedBy: string;
  agentName?: string;
  cashGiven: number;
  transferReceived: number;
  fee: number;
  date?: string;
}) {
  await connectDB();

  const exchange = new PosExchange({
    branchId: data.branchId,
    recordedBy: data.recordedBy,
    agentName: data.agentName,
    cashGiven: data.cashGiven,
    transferReceived: data.transferReceived,
    fee: data.fee,
    date: data.date ? new Date(data.date) : new Date(),
  });

  await exchange.save();

  revalidatePath('/cashier/pos-agent');
  revalidatePath('/manager/pos-agent');
  revalidatePath('/owner/pos-agent');
  revalidatePath('/cashier');
  revalidatePath('/manager');
  revalidatePath('/owner');
  revalidatePath('/owner/branches/[id]', 'page');

  return JSON.parse(JSON.stringify(exchange));
}

export async function getPosExchanges(branchId?: string, filter: 'today' | 'week' | 'month' | 'all' = 'today') {
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

  const query: any = {};
  if (branchId) {
    query.branchId = branchId;
  }
  
  if (filter !== 'all') {
    query.date = dateQuery;
  }

  const exchanges = await PosExchange.find(query)
    .populate('recordedBy', 'name email role')
    .sort({ date: -1 })
    .lean();

  return JSON.parse(JSON.stringify(exchanges));
}
