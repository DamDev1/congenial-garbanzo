'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import Branch from '@/lib/models/Branch';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getUsers() {
  await connectToDatabase();
  const users = await User.find({ role: { $ne: 'owner' } })
    .populate('branchId', 'name')
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role: 'manager' | 'cashier';
  branchId: string;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'owner') throw new Error('Unauthorized');

  await connectToDatabase();

  // Check if email is already taken
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  // Enforce "One Manager Per Branch" rule
  if (data.role === 'manager' && data.branchId) {
    await User.updateMany(
      { branchId: data.branchId, role: 'manager' },
      { $unset: { branchId: 1 } }
    );
  }

  const hashedPassword = data.password 
    ? await bcrypt.hash(data.password, 10) 
    : await bcrypt.hash('password123', 10); // Default password if none provided

  const newUser = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: data.role,
    branchId: data.branchId,
  });

  revalidatePath('/owner/users');
  return JSON.parse(JSON.stringify(newUser));
}

export async function updateUser(id: string, data: {
  name: string;
  email: string;
  password?: string;
  role: 'manager' | 'cashier';
  branchId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'owner') throw new Error('Unauthorized');

  await connectToDatabase();

  // If changing email, check for conflicts
  const existingUser = await User.findOne({ email: data.email, _id: { $ne: id } });
  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  // Enforce "One Manager Per Branch" rule
  if (data.role === 'manager' && data.branchId) {
    await User.updateMany(
      { branchId: data.branchId, role: 'manager', _id: { $ne: id } },
      { $unset: { branchId: 1 } }
    );
  }

  const updatePayload: any = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  
  if (data.branchId) {
    updatePayload.branchId = data.branchId;
  } else {
    updatePayload.$unset = { branchId: 1 };
  }

  if (data.password) {
    updatePayload.password = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(id, updatePayload, { new: true });
  
  if (!updatedUser) throw new Error('User not found');

  revalidatePath('/owner/users');
  return JSON.parse(JSON.stringify(updatedUser));
}

export async function deleteUser(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'owner') throw new Error('Unauthorized');

  await connectToDatabase();
  await User.findByIdAndDelete(id);

  revalidatePath('/owner/users');
  return { success: true };
}
