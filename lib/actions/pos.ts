'use server';

import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import connectDB from '../db/mongoose';
import Product from '../models/Product';
import Brand from '../models/Brand';
import Inventory from '../models/Inventory';
import Transaction from '../models/Transaction';
import Customer from '../models/Customer';
import '../models/Branch';
import '../models/User';

export async function getPOSInventory(branchId: string) {
  await connectDB();

  // Fetch all products
  const allProducts = await Product.find({}).lean();
  
  // Fetch existing inventory for this branch
  const existingInventory = await Inventory.find({ branchId }).lean();
  const existingProductIds = new Set(existingInventory.map(inv => inv.productId.toString()));

  // Find products that don't have inventory for this branch
  const missingProducts = allProducts.filter(p => !existingProductIds.has(p._id.toString()));

  // Create missing inventory records
  if (missingProducts.length > 0) {
    const newInventoryDocs = missingProducts.map(p => ({
      branchId,
      productId: p._id,
      quantity: 0
    }));
    await Inventory.insertMany(newInventoryDocs);
  }

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
  items: { productId: string; quantity: number; price: number; name: string }[];
  totalAmount: number;
  cashAmount: number;
  transferAmount: number;
  creditAmount: number;
}) {
  await connectDB();

  const { branchId, cashierId, customerId, items, totalAmount, cashAmount, transferAmount, creditAmount } = data;

  if (!items || items.length === 0) {
    throw new Error('No items in the cart');
  }

  // Validate that the payment amounts sum to the total
  const paymentSum = cashAmount + transferAmount + creditAmount;
  if (Math.abs(paymentSum - totalAmount) > 1) {
    throw new Error('Payment amounts must equal the total amount');
  }

  // If there's a credit portion, a customer is required
  if (creditAmount > 0 && !customerId) {
    throw new Error('A customer must be selected when there is an amount on credit');
  }

  // Derive the payment method label
  const nonZeroMethods = [
    cashAmount > 0 && 'cash',
    transferAmount > 0 && 'transfer',
    creditAmount > 0 && 'credit',
  ].filter(Boolean);

  let paymentMethod: 'cash' | 'transfer' | 'credit' | 'split';
  if (nonZeroMethods.length > 1) {
    paymentMethod = 'split';
  } else {
    paymentMethod = (nonZeroMethods[0] as 'cash' | 'transfer' | 'credit') || 'cash';
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
    cashAmount,
    transferAmount,
    creditAmount,
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

  // 4. Update customer debt only by the credit portion
  if (creditAmount > 0 && customerId) {
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { debtBalance: creditAmount } }
    );
  }

  revalidatePath('/cashier/checkout');
  revalidatePath('/cashier/sales');
  revalidatePath('/cashier');

  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate('customerId')
    .populate('cashierId', 'name')
    .populate('branchId', 'name')
    .lean();

  return JSON.parse(JSON.stringify(populatedTransaction));
}

export async function getCustomers() {
  await connectDB();
  const customers = await Customer.find().sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(customers));
}
