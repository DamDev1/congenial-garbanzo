'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createProduct } from '@/lib/actions/product';

interface ManagerProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: any[];
  currentUser: any;
}

export function ManagerProductFormModal({ isOpen, onClose, brands, currentUser }: ManagerProductFormModalProps) {
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [packSize, setPackSize] = useState('');
  const [initialStock, setInitialStock] = useState('0');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!brandId && !newBrandName) {
        throw new Error('Please select a brand or create a new one.');
      }
      if (!currentUser.branchId) {
        throw new Error('You are not assigned to a branch.');
      }

      let finalBrandName = '';
      if (brandId === 'NEW') {
        finalBrandName = newBrandName;
      } else {
        const selectedBrand = brands.find(b => b._id === brandId);
        finalBrandName = selectedBrand ? selectedBrand.name : '';
      }

      const finalProductName = finalBrandName ? `${finalBrandName} - ${name}` : name;

      await createProduct({
        name: finalProductName,
        brandId: brandId === 'NEW' ? undefined : brandId,
        newBrandName: brandId === 'NEW' ? newBrandName : undefined,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        packSize: Number(packSize),
        initialStock: Number(initialStock),
        branchId: currentUser.branchId
      });
      
      // Reset form on success
      setName('');
      setBrandId('');
      setNewBrandName('');
      setCostPrice('');
      setSellingPrice('');
      setPackSize('');
      setInitialStock('0');
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSubmitting && onClose()} title="Add New Product">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-bold">Brand</label>
            <select 
              className="w-full bg-slate-50 border mt-2 border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              required
            >
              <option value="">Select brand...</option>
              {brands.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
              <option value="NEW" className="font-bold text-blue-600">+ Add New Brand</option>
            </select>
          </div>

          <Input
            label="Product Name (Variant/Flavor)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Apple or Pineapple"
          />

        </div>

        {brandId === 'NEW' && (
          <Input
            label="New Brand Name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            required
            placeholder="e.g. Rite Foods"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Cost Price (₦)"
            type="number"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
            min="0"
          />
          <Input
            label="Selling Price (₦)"
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
            min="0"
          />
          <Input
            label="Pack Size"
            type="number"
            value={packSize}
            onChange={(e) => setPackSize(e.target.value)}
            required
            min="1"
            placeholder="e.g. 12"
          />
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <Input
              label="Initial Stock Quantity (Packs)"
              type="number"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              required
              min="0"
              placeholder="How many packs are arriving now?"
            />
            <p className="text-xs text-slate-500 mt-2">
              This quantity will be instantly added to your branch's inventory.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Add Product to Catalog
          </Button>
        </div>
      </form>
    </Modal>
  );
}
