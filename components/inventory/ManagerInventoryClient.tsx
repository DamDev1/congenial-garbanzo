'use client';

import { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ManagerProductFormModal } from './ManagerProductFormModal';

interface ManagerInventoryClientProps {
  initialInventory: any[];
  brands: any[];
  currentUser: any;
}

export default function ManagerInventoryClient({ initialInventory, brands, currentUser }: ManagerInventoryClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedBrand, setSelectedBrand] = useState('All');

  const filteredInventory = initialInventory.filter((item: any) => {
    const matchesSearch = item.productId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.productId.brandId?.name && item.productId.brandId.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBrand = selectedBrand === 'All' || item.productId.brandId?.name === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Inventory Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage stock levels and catalog items for your branch.</p>
        </div>
        <div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-100/50 flex flex-col">
        <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product or brand name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2.5 px-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          >
            <option value="All">All Brands</option>
            {brands.map((b: any) => (
              <option key={b._id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pack Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">In Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Package className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700">No products found</p>
                      <p className="text-sm">Try adjusting your search or add a new product.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{item.productId.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-600">
                        {item.productId.brandId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{item.productId.packSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-emerald-600">
                        ₦{item.productId.sellingPrice?.toLocaleString() || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.quantity > 10
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : item.quantity > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {item.quantity} packs
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ManagerProductFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        brands={brands}
        currentUser={currentUser}
      />
    </div>
  );
}
