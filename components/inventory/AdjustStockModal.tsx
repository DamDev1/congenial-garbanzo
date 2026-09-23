'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { addInventoryStock, reduceInventoryStock } from '@/lib/actions/inventory';
import { PackagePlus, PackageMinus, CheckCircle2 } from 'lucide-react';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: any;
}

export function AdjustStockModal({ isOpen, onClose, inventoryItem }: AdjustStockModalProps) {
  const [action, setAction] = useState<'add' | 'reduce'>('add');
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

    if (action === 'reduce' && qty > inventoryItem.quantity) {
      setError('Cannot reduce more stock than is currently available.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (action === 'add') {
        await addInventoryStock(inventoryItem._id, qty);
      } else {
        await reduceInventoryStock(inventoryItem._id, qty);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setQuantity('');
        setAction('add');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setQuantity('');
      setError('');
      setIsSuccess(false);
      setAction('add');
      onClose();
    }
  };

  if (!isOpen || !inventoryItem) return null;

  const product = inventoryItem.productId;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Adjust Stock: ${product?.name}`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Stock Updated Successfully!</h2>
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
              {action === 'add' ? (
                <PackagePlus className="w-5 h-5 text-blue-500" />
              ) : (
                <PackageMinus className="w-5 h-5 text-orange-500" />
              )}
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setAction('add')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                action === 'add' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Add Stock
            </button>
            <button
              type="button"
              onClick={() => setAction('reduce')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                action === 'reduce' ? "bg-white shadow-sm text-orange-600" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Reduce Stock
            </button>
          </div>

          <div className={`p-4 rounded-xl border ${
            action === 'add' ? "bg-blue-50/50 border-blue-100" : "bg-orange-50/50 border-orange-100"
          }`}>
            <Input
              label={action === 'add' ? "Quantity to Add (Packs)" : "Quantity to Reduce (Packs)"}
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="1"
              max={action === 'reduce' ? inventoryItem.quantity : undefined}
              placeholder="e.g. 10"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className={action === 'add' ? "!bg-blue-600 hover:!bg-blue-700 shadow-blue-500/25" : "!bg-orange-600 hover:!bg-orange-700 shadow-orange-500/25"}
            >
              {action === 'add' ? "Add Stock" : "Reduce Stock"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
