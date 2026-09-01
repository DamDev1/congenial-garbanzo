'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '../db/mongoose';
import Transfer from '../models/Transfer';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import Branch from '../models/Branch';
import User from '../models/User';

export async function getTransfers(branchId?: string) {
  await connectDB();
  
  const query = branchId 
    ? { $or: [{ sourceBranchId: branchId }, { destinationBranchId: branchId }] }
    : {};

  const transfers = await Transfer.find(query)
    .populate('sourceBranchId', 'name')
    .populate('destinationBranchId', 'name')
    .populate('initiatedBy', 'name')
    .populate('receivedBy', 'name')
    .populate('items.productId', 'name image')
    .sort({ createdAt: -1 })
    .lean();
    
  return JSON.parse(JSON.stringify(transfers));
}

export async function createTransfer(data: {
  sourceBranchId: string;
  destinationBranchId: string;
  initiatedBy: string;
  items: { productId: string; quantity: number }[];
}) {
  await connectDB();

  if (data.sourceBranchId === data.destinationBranchId) {
    throw new Error('Source and destination branches cannot be the same');
  }

  if (!data.items || data.items.length === 0) {
    throw new Error('Must transfer at least one item');
  }

  // 1. Verify stock levels at source branch
  for (const item of data.items) {
    const inv = await Inventory.findOne({ branchId: data.sourceBranchId, productId: item.productId });
    if (!inv || inv.quantity < item.quantity) {
      const product = await Product.findById(item.productId);
      throw new Error(`Insufficient stock for ${product?.name || 'Unknown Product'} at the source branch`);
    }
  }

  // 2. Deduct stock from source branch
  for (const item of data.items) {
    await Inventory.findOneAndUpdate(
      { branchId: data.sourceBranchId, productId: item.productId },
      { $inc: { quantity: -item.quantity } }
    );
  }

  // 3. Create Transfer record
  const transfer = new Transfer({
    ...data,
    status: 'pending'
  });
  
  await transfer.save();

  revalidatePath('/owner/transfers');
  revalidatePath('/manager/transfers');
  
  return JSON.parse(JSON.stringify(transfer));
}

export async function completeTransfer(transferId: string, receivedBy: string) {
  await connectDB();
  
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw new Error('Transfer not found');
  if (transfer.status !== 'pending') throw new Error('Only pending transfers can be completed');

  // 1. Add stock to destination branch
  for (const item of transfer.items) {
    await Inventory.findOneAndUpdate(
      { branchId: transfer.destinationBranchId, productId: item.productId },
      { $inc: { quantity: item.quantity } },
      { upsert: true, new: true }
    );
  }

  // 2. Update transfer status
  transfer.status = 'completed';
  transfer.receivedBy = receivedBy as any;
  await transfer.save();

  revalidatePath('/owner/transfers');
  revalidatePath('/manager/transfers');
  
  return JSON.parse(JSON.stringify(transfer));
}

export async function cancelTransfer(transferId: string) {
  await connectDB();
  
  const transfer = await Transfer.findById(transferId);
  if (!transfer) throw new Error('Transfer not found');
  if (transfer.status !== 'pending') throw new Error('Only pending transfers can be cancelled');

  // 1. Return stock to source branch
  for (const item of transfer.items) {
    await Inventory.findOneAndUpdate(
      { branchId: transfer.sourceBranchId, productId: item.productId },
      { $inc: { quantity: item.quantity } }
    );
  }

  // 2. Update transfer status
  transfer.status = 'cancelled';
  await transfer.save();

  revalidatePath('/owner/transfers');
  revalidatePath('/manager/transfers');
  
  return JSON.parse(JSON.stringify(transfer));
}

export async function getBranchInventoryForTransfer(branchId: string) {
  await connectDB();
  
  const inventory = await Inventory.find({ branchId })
    .populate('productId', 'name')
    .lean();
    
  return JSON.parse(JSON.stringify(inventory.filter((i: any) => i.productId)));
}
