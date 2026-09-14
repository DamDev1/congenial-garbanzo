'use server';
import { revalidatePath } from 'next/cache';

import connectDB from '../db/mongoose';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import Brand from '../models/Brand';

export async function getManagerInventory(branchId: string) {
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

  // We need to fetch all inventory items for this branch, and populate the product and brand details
  const inventoryItems = await Inventory.find({ branchId })
    .populate({
      path: 'productId',
      populate: {
        path: 'brandId',
        model: 'Brand'
      }
    })
    .lean();

  // Filter out any orphaned inventory records where product doesn't exist
  const validItems = inventoryItems.filter((item: any) => item.productId);

  return JSON.parse(JSON.stringify(validItems));
}

export async function addInventoryStock(inventoryId: string, quantityToAdd: number) {
  await connectDB();

  if (quantityToAdd <= 0) {
    throw new Error('Quantity must be greater than zero');
  }

  const inventory = await Inventory.findById(inventoryId);
  if (!inventory) {
    throw new Error('Inventory record not found');
  }

  inventory.quantity += quantityToAdd;
  await inventory.save();

  revalidatePath('/manager/inventory');
  revalidatePath('/cashier/checkout');

  return JSON.parse(JSON.stringify(inventory));
}
