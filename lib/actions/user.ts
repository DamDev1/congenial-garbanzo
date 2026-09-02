'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function getUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await connectToDatabase();
  
  let query: any = { role: { $ne: 'owner' } };

  // Managers can only see cashiers in their own branch
  if (session.user.role === 'manager') {
    query = { role: 'cashier', branchId: session.user.branchId };
  }

  const users = await User.find(query)
    .populate('branchId', 'name')
    .sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

export async function createUser(data: {
  name: string;
  username: string;
  phone: string;
  password?: string;
  role: 'manager' | 'cashier';
  branchId: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await connectToDatabase();

  // Enforce Manager permissions
  if (session.user.role === 'manager') {
    if (data.role !== 'cashier') {
      throw new Error('Managers can only create Cashiers.');
    }
    // Force the branchId to be the manager's branch
    data.branchId = session.user.branchId!;
  } else if (session.user.role !== 'owner') {
    throw new Error('Unauthorized to create users.');
  }

  // Check if username is already taken
  const existingUser = await User.findOne({ username: data.username });
  if (existingUser) {
    throw new Error('A user with this username already exists.');
  }

  // Enforce "One Manager Per Branch" rule for Owners
  if (session.user.role === 'owner' && data.role === 'manager' && data.branchId) {
    await User.updateMany(
      { branchId: data.branchId, role: 'manager' },
      { $unset: { branchId: 1 } }
    );
  }

  if (!data.password) {
    throw new Error('A permanent password is required at creation.');
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const newUser = await User.create({
    name: data.name,
    username: data.username,
    phone: data.phone,
    password: hashedPassword,
    role: data.role,
    branchId: data.branchId,
  });

  revalidatePath('/owner/users');
  revalidatePath('/manager/users');
  return JSON.parse(JSON.stringify(newUser));
}

export async function updateUser(id: string, data: {
  name: string;
  username: string;
  phone: string;
  role: 'manager' | 'cashier';
  branchId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'owner') throw new Error('Only owners can update users.');

  await connectToDatabase();

  // If changing username, check for conflicts
  const existingUser = await User.findOne({ username: data.username, _id: { $ne: id } });
  if (existingUser) {
    throw new Error('A user with this username already exists.');
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
    username: data.username,
    phone: data.phone,
    role: data.role,
  };
  
  if (data.branchId) {
    updatePayload.branchId = data.branchId;
  } else {
    updatePayload.$unset = { branchId: 1 };
  }

  const updatedUser = await User.findByIdAndUpdate(id, updatePayload, { new: true });
  
  if (!updatedUser) throw new Error('User not found');

  revalidatePath('/owner/users');
  revalidatePath('/manager/users');
  return JSON.parse(JSON.stringify(updatedUser));
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  await connectToDatabase();

  const userToToggle = await User.findById(id);
  if (!userToToggle) throw new Error('User not found');

  // Enforce Manager permissions
  if (session.user.role === 'manager') {
    if (userToToggle.role !== 'cashier' || userToToggle.branchId?.toString() !== session.user.branchId) {
      throw new Error('Managers can only deactivate cashiers in their own branch.');
    }
  } else if (session.user.role !== 'owner') {
    throw new Error('Unauthorized');
  }

  userToToggle.isActive = isActive;
  await userToToggle.save();

  revalidatePath('/owner/users');
  revalidatePath('/manager/users');
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  
  await connectToDatabase();
  const user = await User.findById(session.user.id).lean();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}
