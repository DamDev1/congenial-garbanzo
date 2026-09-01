'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createProduct, updateProduct } from '@/lib/actions/product';

export default function ProductForm({ brands, initialData }: { brands: any[], initialData?: any }) {
  const router = useRouter();

  // If editing, the name is already the full name. 
  // We'll let the user edit it as the full name or we can just populate it.
  const [name, setName] = useState(initialData?.name || '');
  const [brandSelection, setBrandSelection] = useState<string>(initialData?.brandId || '');
  const [newBrandName, setNewBrandName] = useState('');
  const [costPrice, setCostPrice] = useState(initialData?.costPrice?.toString() || '');
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice?.toString() || '');
  const [packSize, setPackSize] = useState(initialData?.packSize?.toString() || '1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!brandSelection && !newBrandName) {
        throw new Error('Please select an existing brand or create a new one.');
      }

      let brandNameStr = '';
      if (brandSelection === 'new') {
        brandNameStr = newBrandName;
      } else {
        const found = brands.find(b => b._id === brandSelection);
        if (found) brandNameStr = found.name;
      }

      // Only combine if we are creating new, or if the name doesn't already contain the brand name
      // To be safe, let's just use the exact name typed for edits, or recombine if creating.
      let fullName = name;
      if (!initialData) {
        fullName = `${brandNameStr} - ${name}`;
      }

      const payload = {
        name: fullName,
        brandId: brandSelection === 'new' ? undefined : brandSelection,
        newBrandName: brandSelection === 'new' ? newBrandName : undefined,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        packSize: Number(packSize),
      };

      if (initialData) {
        await updateProduct(initialData._id, payload);
      } else {
        await createProduct(payload);
      }

      router.push('/owner/products');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-slate-900 block" htmlFor="brand">
            Brand
          </label>
          <select
            id="brand"
            value={brandSelection}
            onChange={(e) => setBrandSelection(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors text-slate-800"
          >
            <option value="" disabled>Select a Brand</option>
            {brands.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
            <option value="new">+ Create New Brand</option>
          </select>
        </div>
        
        <Input
          id="name"
          label="Variant Name (e.g. Apple, Cola)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Apple"
        />


      </div>

      {brandSelection === 'new' && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2">
          <Input
            id="newBrandName"
            label="New Brand Name"
            value={newBrandName}
            onChange={(e) => setNewBrandName(e.target.value)}
            required
            placeholder="e.g. Bigi"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          id="costPrice"
          type="number"
          min="0"
          step="0.01"
          label="Cost Price (₦)"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          required
          placeholder="0.00"
        />
        <Input
          id="sellingPrice"
          type="number"
          min="0"
          step="0.01"
          label="Selling Price (₦)"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          required
          placeholder="0.00"
        />
        <Input
          id="packSize"
          type="number"
          min="1"
          label="Pack Size (Units per pack)"
          value={packSize}
          onChange={(e) => setPackSize(e.target.value)}
          required
          placeholder="12"
        />
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
        <Button
          type="button"
          onClick={() => router.back()}
          className="!w-auto !bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm"
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={loading} className="!w-auto px-8">
          Save Product
        </Button>
      </div>
    </form>
  );
}
