'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createCustomer, updateCustomer } from '@/lib/actions/customer';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any; // If provided, we're editing
  branchId?: string;
}

export function CustomerFormModal({ isOpen, onClose, customer, branchId }: CustomerFormModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer && isOpen) {
      setName(customer.name);
      setPhone(customer.phone || '');
    } else if (isOpen) {
      setName('');
      setPhone('');
    }
    setError('');
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (customer) {
        await updateCustomer(customer._id, { name, phone });
      } else {
        await createCustomer({ name, phone, branchId });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !isSubmitting && onClose()} 
      title={customer ? "Edit Customer" : "Add New Customer"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. John Doe"
        />

        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 08012345678 (Optional)"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {customer ? 'Save Changes' : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
