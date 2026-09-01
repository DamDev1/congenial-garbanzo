'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { createTransfer, getBranchInventoryForTransfer } from '@/lib/actions/transfer';
import { Plus, Trash2 } from 'lucide-react';

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: any[];
  currentUser: any;
}

export function TransferFormModal({ isOpen, onClose, branches, currentUser }: TransferFormModalProps) {
  const [sourceBranchId, setSourceBranchId] = useState('');
  const [destinationBranchId, setDestinationBranchId] = useState('');
  const [items, setItems] = useState<{ productId: string, quantity: number }[]>([]);
  
  const [availableInventory, setAvailableInventory] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [error, setError] = useState('');

  // Lock source branch for managers
  const isManager = currentUser.role === 'manager';
  
  useEffect(() => {
    if (isOpen) {
      setSourceBranchId(isManager && currentUser.branchId ? currentUser.branchId : '');
      setDestinationBranchId('');
      setItems([]);
      setAvailableInventory([]);
      setError('');
    }
  }, [isOpen, isManager, currentUser]);

  useEffect(() => {
    if (sourceBranchId) {
      setIsLoadingInventory(true);
      getBranchInventoryForTransfer(sourceBranchId)
        .then(data => {
          setAvailableInventory(data);
          setItems([]); // reset items when source changes
        })
        .catch(() => setError('Failed to load inventory for selected branch'))
        .finally(() => setIsLoadingInventory(false));
    }
  }, [sourceBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await createTransfer({
        sourceBranchId,
        destinationBranchId,
        initiatedBy: currentUser.id,
        items
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Initiate Transfer">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Source Branch</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
              value={sourceBranchId}
              onChange={(e) => setSourceBranchId(e.target.value)}
              required
              disabled={isManager}
            >
              <option value="">Select source...</option>
              {branches.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Destination Branch</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={destinationBranchId}
              onChange={(e) => setDestinationBranchId(e.target.value)}
              required
            >
              <option value="">Select destination...</option>
              {branches.filter(b => b._id !== sourceBranchId).map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {sourceBranchId && (
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700">Products to Transfer</label>
              <Button type="button" onClick={addItem} className="!py-1.5 !px-3 text-sm">
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
            
            {isLoadingInventory ? (
              <p className="text-sm text-slate-500">Loading inventory...</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No products added yet.</p>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item, index) => {
                  const invItem = availableInventory.find(i => i.productId._id === item.productId);
                  const maxStock = invItem ? invItem.quantity : 0;
                  
                  return (
                    <div key={index} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex-1 space-y-1">
                        <select 
                          className="w-full bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm"
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Select product...</option>
                          {availableInventory.map(inv => (
                            <option key={inv.productId._id} value={inv.productId._id} disabled={inv.quantity <= 0}>
                              {inv.productId.name} (Stock: {inv.quantity})
                            </option>
                          ))}
                        </select>
                        {item.productId && maxStock > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              max={maxStock}
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="w-20 bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded text-sm"
                              required
                            />
                            <span className="text-xs text-slate-500">/ {maxStock} max</span>
                          </div>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isSubmitting}
            disabled={!sourceBranchId || !destinationBranchId || items.length === 0 || items.some(i => !i.productId || i.quantity <= 0)}
          >
            Initiate Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
}
