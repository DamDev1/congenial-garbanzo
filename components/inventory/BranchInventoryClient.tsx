'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Search, ArrowLeft, PackagePlus } from 'lucide-react';
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal';

export default function BranchInventoryClient({ branch, inventory }: { branch: any, inventory: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const filteredInventory = inventory.filter((item: any) => 
    item.productId?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.productId?.brandId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/owner/branches/${branch._id}`} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-sm transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Inventory: {branch.name}</h2>
          <p className="text-slate-500 font-medium mt-1">Manage stock quantities for this specific branch.</p>
        </div>
      </div>

      <div className="glass rounded-3xl shadow-sm border border-slate-100/50 flex flex-col">
        <div className="p-4 md:p-6 bg-white rounded-t-3xl border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pack Size</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-4 text-right"></th>
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
                      <p className="font-semibold text-slate-700">No inventory found</p>
                      <p className="text-sm">Try adjusting your search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item: any) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.productId?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.productId?.brandId?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {item.productId?.packSize}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className={item.quantity <= 0 ? 'text-red-500' : 'text-emerald-600'}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100"
                      >
                        <PackagePlus className="w-4 h-4" />
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AdjustStockModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        inventoryItem={selectedItem}
      />
    </div>
  );
}
