'use client';

import { useRef, useState } from 'react';
import { createBranch } from '@/lib/actions/branch';
import { Store, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function CreateBranchForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData(e.currentTarget);
      await createBranch(formData);
      formRef.current?.reset();
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#3B41E3] hover:bg-[#2A2FC3] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_12px_-4px_rgba(59,65,227,0.5)]"
      >
        <Plus className="w-5 h-5" />
        <span>Add Branch</span>
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => !loading && setIsOpen(false)} 
        title="Add New Branch"
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-4">
            <Input
              id="name"
              name="name"
              label="Branch Name"
              required
              placeholder="e.g. Downtown Store"
            />
            <Input
              id="location"
              name="location"
              label="Location/Address"
              required
              placeholder="e.g. 123 Main St, NY"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              disabled={loading}
              className="!w-auto !bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="!w-auto px-8">
              Create Branch
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
