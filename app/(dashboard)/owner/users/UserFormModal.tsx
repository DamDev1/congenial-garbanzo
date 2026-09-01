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
}

export function UserFormModal({ isOpen, onClose, branches, initialData }: UserFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'cashier'>('cashier');
  const [branchId, setBranchId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setEmail(initialData?.email || '');
      setPassword(''); // Never prefill password
      setRole(initialData?.role || 'cashier');
      setBranchId(initialData?.branchId?._id || initialData?.branchId || '');
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!branchId) throw new Error('Please assign a branch');

      const payload = {
        name,
        email,
        password: password || undefined,
        role,
        branchId,
      };

      if (initialData) {
        await updateUser(initialData._id, payload);
      } else {
        await createUser(payload);
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

        <Input
          id="email"
          type="email"
          label="Email Address / Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="john@deluv.com"
        />

        <Input
          id="password"
          type="password"
          label={initialData ? 'New Password (leave blank to keep current)' : 'Password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!initialData}
          placeholder="••••••••"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-slate-900 block" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'manager' | 'cashier')}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800"
            >
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800"
            >
              <option value="" disabled>Select Branch</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {role === 'manager' && (
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
