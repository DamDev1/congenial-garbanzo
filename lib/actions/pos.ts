'use server';

import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import connectDB from '../db/mongoose';
import Product from '../models/Product';
import Brand from '../models/Brand';
import Inventory from '../models/Inventory';
import Transaction from '../models/Transaction';
import Customer from '../models/Customer';

export async function getPOSInventory(branchId: string) {
  await connectDB();
  
  // We need all inventory items for this branch, populated with Product and Brand
  // We only want to return items where the product exists.
  const inventory = await Inventory.find({ branchId })
    .populate({
      path: 'productId',
      populate: {
        path: 'brandId',
        model: Brand
      }
    })
    .lean();
    
  // Filter out any broken references
  const validInventory = inventory.filter((item: any) => item.productId && item.productId.brandId);
  
  // Format for the client
  return JSON.parse(JSON.stringify(validInventory.map((item: any) => ({
    _id: item.productId._id,
    name: item.productId.name,
    sellingPrice: item.productId.sellingPrice,
    image: item.productId.image,
    brandId: item.productId.brandId._id,
    brandName: item.productId.brandId.name,
    stockQuantity: item.quantity,
  }))));
}

export async function createSale(data: {
  branchId: string;
  cashierId: string;
  customerId?: string;
  items: { productId: string; quantity: number; price: number }[];
  paymentMethod: 'cash' | 'credit';
  totalAmount: number;
}) {
  await connectDB();
  
  const { branchId, cashierId, customerId, items, paymentMethod, totalAmount } = data;
  
  if (!items || items.length === 0) {
    throw new Error('No items in the cart');
  }
  
  if (paymentMethod === 'credit' && !customerId) {
    throw new Error('A customer must be selected for credit sales');
  }

  // 1. Verify stock levels for all items first
  for (const item of items) {
    const inv = await Inventory.findOne({ branchId, productId: item.productId });
    if (!inv || inv.quantity < item.quantity) {
      const product = await Product.findById(item.productId);
      throw new Error(`Insufficient stock for ${product?.name || 'Unknown Product'}`);
    }
  }

  // 2. Create the transaction
  const transaction = new Transaction({
    branchId,
    cashierId,
    customerId: customerId || undefined,
    items,
    totalAmount,
    paymentMethod,
    status: 'completed'
  });
  
  await transaction.save();

  // 3. Deduct inventory
  for (const item of items) {
    await Inventory.findOneAndUpdate(
      { branchId, productId: item.productId },
      { $inc: { quantity: -item.quantity } }
    );
  }

  // 4. Update customer debt if credit
  if (paymentMethod === 'credit' && customerId) {
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { debtBalance: totalAmount } }
    );
  }

  revalidatePath('/cashier/pos');
  revalidatePath('/cashier/sales');
  revalidatePath('/cashier');
  
  return JSON.parse(JSON.stringify(transaction));
}

export async function getCustomers() {
  await connectDB();
  const customers = await Customer.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(customers));
}
