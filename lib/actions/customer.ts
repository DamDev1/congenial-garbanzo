'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '../db/mongoose';
import Customer from '../models/Customer';
import DebtPayment from '../models/DebtPayment';
import Transaction from '../models/Transaction';
import '../models/User';

export async function getCustomers() {
  await connectDB();
  const customers = await Customer.find().sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(customers));
}

export async function getCustomerHistory(customerId: string) {
  await connectDB();
  
  // Get all sales where the customer took credit
  const creditSales = await Transaction.find({ customerId, creditAmount: { $gt: 0 } })
    .populate('cashierId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // Get all debt payments
  const debtPayments = await DebtPayment.find({ customerId })
    .populate('cashierId', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const history = [
    ...creditSales.map(sale => ({ ...sale, type: 'credit_sale' })),
    ...debtPayments.map(payment => ({ ...payment, type: 'debt_payment' }))
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return JSON.parse(JSON.stringify(history));
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
  revalidatePath('/cashier/customers');

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
  revalidatePath('/cashier/customers');

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
  revalidatePath('/cashier/customers');

  return true;
}
export async function settleCustomerDebt(data: {
  customerId: string;
  cashierId: string;
  branchId: string;
  cashAmount: number;
  transferAmount: number;
}) {
  await connectDB();

  const amountPaid = data.cashAmount + data.transferAmount;
  if (amountPaid <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  const customer = await Customer.findById(data.customerId);
  if (!customer) throw new Error('Customer not found');

  if (amountPaid > customer.debtBalance) {
    throw new Error(`Payment amount (₦${amountPaid}) exceeds outstanding debt (₦${customer.debtBalance})`);
  }

  // Deduct the debt
  customer.debtBalance -= amountPaid;
  await customer.save();

  // Determine payment method label
  let paymentMethod: 'cash' | 'transfer' | 'split' = 'cash';
  if (data.cashAmount > 0 && data.transferAmount > 0) paymentMethod = 'split';
  else if (data.transferAmount > 0) paymentMethod = 'transfer';

  // Record the payment
  const payment = new DebtPayment({
    branchId: data.branchId,
    cashierId: data.cashierId,
    customerId: data.customerId,
    amountPaid,
    cashAmount: data.cashAmount,
    transferAmount: data.transferAmount,
    paymentMethod,
  });

  await payment.save();

  revalidatePath('/owner/customers');
  revalidatePath('/manager/customers');
  revalidatePath('/cashier/checkout');
  revalidatePath('/cashier/customers');

  return JSON.parse(JSON.stringify(payment));
}
