'use server';

import connectToDatabase from '../db/mongoose';
import Product from '../models/Product';
import Brand from '../models/Brand';
import Branch from '../models/Branch';
import Inventory from '../models/Inventory';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  await connectToDatabase();
  // Populate brand details
  const products = await Product.find({}).populate('brandId', 'name').sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(products));
}

export async function getProduct(id: string) {
  await connectToDatabase();
  const product = await Product.findById(id).lean();
  return JSON.parse(JSON.stringify(product));
}

export async function getBrands() {
  await connectToDatabase();
  const brands = await Brand.find({}).sort({ name: 1 });
  return JSON.parse(JSON.stringify(brands));
}

export async function createProduct(data: {
  name: string;
  brandId?: string;
  newBrandName?: string;
  costPrice: number;
  sellingPrice: number;
  packSize: number;
  initialStock?: number;
  branchId?: string;
}) {
  await connectToDatabase();

  let finalBrandId = data.brandId;

  if (data.newBrandName) {
    let existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${data.newBrandName}$`, 'i') } });
    if (!existingBrand) {
      existingBrand = await Brand.create({ name: data.newBrandName });
    }
    finalBrandId = existingBrand._id.toString();
  }

  if (!finalBrandId) {
    throw new Error('A brand must be selected or created.');
  }

  const newProduct = await Product.create({
    name: data.name,
    brandId: finalBrandId,
    costPrice: data.costPrice,
    sellingPrice: data.sellingPrice,
    packSize: data.packSize,
  });

  const branches = await Branch.find({});
  if (branches.length > 0) {
    const inventoryDocs = branches.map(branch => {
      // If a branchId is specified, apply the initialStock ONLY to that branch
      let quantity = 0;
      if (data.branchId && data.initialStock && branch._id.toString() === data.branchId) {
        quantity = data.initialStock;
      }

      return {
        branchId: branch._id,
        productId: newProduct._id,
        quantity: quantity,
      };
    });
    await Inventory.insertMany(inventoryDocs);
  }

  revalidatePath('/owner/products');
  revalidatePath('/manager/inventory');
  return JSON.parse(JSON.stringify(newProduct));
}

export async function updateProduct(id: string, data: {
  name: string;
  brandId?: string;
  newBrandName?: string;
  costPrice: number;
  sellingPrice: number;
  packSize: number;
}) {
  await connectToDatabase();

  let finalBrandId = data.brandId;

  if (data.newBrandName) {
    let existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${data.newBrandName}$`, 'i') } });
    if (!existingBrand) {
      existingBrand = await Brand.create({ name: data.newBrandName });
    }
    finalBrandId = existingBrand._id.toString();
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    {
      name: data.name,
      ...(finalBrandId ? { brandId: finalBrandId } : {}),
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      packSize: data.packSize,
    },
    { new: true }
  );

  if (!updatedProduct) {
    throw new Error('Product not found');
  }

  revalidatePath('/owner/products');
  revalidatePath('/manager/inventory');
  revalidatePath('/cashier/checkout');

  return JSON.parse(JSON.stringify(updatedProduct));
}

export async function deleteProduct(id: string) {
  await connectToDatabase();

  await Product.findByIdAndDelete(id);
  await Inventory.deleteMany({ productId: id });

  revalidatePath('/owner/products');
  return { success: true };
}

