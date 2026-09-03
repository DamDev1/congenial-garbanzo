'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addInventoryStock } from '@/lib/actions/inventory';
import { PackagePlus, CheckCircle2 } from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: any;
}

export function AddStockModal({ isOpen, onClose, inventoryItem }: AddStockModalProps) {
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await addInventoryStock(inventoryItem._id, qty);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setQuantity('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setQuantity('');
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  if (!isOpen || !inventoryItem) return null;

  const product = inventoryItem.productId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Stock: ${product.name}`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Stock Added Successfully!</h2>
          <p className="text-slate-500 mt-2">The inventory has been updated.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-slate-500 font-bold text-xs uppercase block mb-1">Current Stock</span>
              <span className="text-xl font-black text-slate-800">{inventoryItem.quantity} packs</span>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
              <PackagePlus className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <Input
              label="Quantity to Add (Packs)"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              placeholder="e.g. 50"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-2">
              This will increase the current stock for this branch.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              onClick={handleClose} 
              disabled={isSubmitting}
              className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Add to Inventory
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
