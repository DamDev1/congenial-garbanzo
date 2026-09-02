'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '../db/mongoose';
import Customer from '../models/Customer';

export async function getCustomers() {
  await connectDB();
  const customers = await Customer.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(customers));
}

export async function createCustomer(data: { name: string; phone?: string }) {
  await connectDB();

  if (!data.name) {
    throw new Error('Name is required');
  }

  const customer = new Customer({
    name: data.name,
    phone: data.phone,
    debtBalance: 0,
  });

  await customer.save();

  revalidatePath('/owner/customers');
  revalidatePath('/manager/customers');
  revalidatePath('/cashier/checkout'); // Cashier POS needs to know about new customers

  return JSON.parse(JSON.stringify(customer));
}

export async function updateCustomer(id: string, data: { name: string; phone?: string }) {
  await connectDB();

  if (!data.name) {
    throw new Error('Name is required');
  }

  const customer = await Customer.findByIdAndUpdate(
    id,
    { name: data.name, phone: data.phone },
    { new: true }
  );

  if (!customer) throw new Error('Customer not found');

  revalidatePath('/owner/customers');
  revalidatePath('/manager/customers');
  revalidatePath('/cashier/checkout');

  return JSON.parse(JSON.stringify(customer));
}

export async function deleteCustomer(id: string) {
  await connectDB();

  const customer = await Customer.findById(id);
  if (!customer) throw new Error('Customer not found');

  if (customer.debtBalance > 0) {
    throw new Error('Cannot delete customer with an outstanding debt balance.');
  }

  await Customer.findByIdAndDelete(id);

  revalidatePath('/owner/customers');
  revalidatePath('/manager/customers');
  revalidatePath('/cashier/checkout');

  return true;
}
