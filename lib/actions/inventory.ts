'use server';

import connectDB from '../db/mongoose';
import Inventory from '../models/Inventory';
import Product from '../models/Product';
import Brand from '../models/Brand';

export async function getManagerInventory(branchId: string) {
  await connectDB();
  
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
