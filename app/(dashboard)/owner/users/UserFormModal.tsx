'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createUser, updateUser } from '@/lib/actions/user';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: any[];
  initialData?: any;
  fixedRole?: 'manager' | 'cashier';
  fixedBranchId?: string;
}

export function UserFormModal({ isOpen, onClose, branches, initialData, fixedRole, fixedBranchId }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'cashier'>(fixedRole || 'cashier');
  const [branchId, setBranchId] = useState(fixedBranchId || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setUsername(initialData?.username || '');
      setPhone(initialData?.phone || '');
      setPassword(''); // Password is only set on creation
      setRole(fixedRole || initialData?.role || 'cashier');
      setBranchId(fixedBranchId || initialData?.branchId?._id || initialData?.branchId || '');
      setError('');
    }
  }, [isOpen, initialData, fixedRole, fixedBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!branchId) throw new Error('Please assign a branch');

      const payload: any = {
        name,
        username,
        phone,
        role,
        branchId,
      };

      if (!initialData) {
        if (!password) throw new Error('A permanent password is required when creating a user');
        payload.password = password;
      }

      if (initialData) {
        await updateUser(initialData._id, payload);
      } else {
        await createUser(payload as any);
      }

      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !loading && onClose()} 
      title={initialData ? 'Edit User' : 'Add New User'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <Input
          id="name"
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. John Doe"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="username"
            type="text"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="johndoe"
          />
          <Input
            id="phone"
            type="tel"
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="08012345678"
          />
        </div>

        {!initialData && (
          <Input
            id="password"
            type="password"
            label="Permanent Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-900 block" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'manager' | 'cashier')}
              required
              disabled={!!fixedRole}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="cashier">Cashier</option>
              {(!fixedRole || fixedRole === 'manager') && <option value="manager">Manager</option>}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-900 block" htmlFor="branch">
              Assigned Branch
            </label>
            <select
              id="branch"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              disabled={!!fixedBranchId}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
            >
              <option value="" disabled>Select Branch</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {role === 'manager' && !fixedRole && (
          <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
            Note: Assigning a new Manager will automatically unassign any existing Manager for this branch.
          </p>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
          <Button 
            type="button" 
            onClick={onClose} 
            disabled={loading}
            className="!w-auto !bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} className="!w-auto px-8">
            {initialData ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
