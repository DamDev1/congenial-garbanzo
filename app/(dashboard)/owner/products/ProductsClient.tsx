'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Plus, Search } from 'lucide-react';
import ProductRowActions from './ProductRowActions';

export default function ProductsClient({ products }: { products: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.brandId?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Products</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your soft drinks catalog and pricing.</p>
        </div>
        <Link 
          href="/owner/products/new" 
          className="flex items-center gap-2 bg-[#3B41E3] hover:bg-[#2A2FC3] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_12px_-4px_rgba(59,65,227,0.5)] whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </Link>
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pack Size</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
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
                filteredProducts.map((product: any) => (
                  <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {product.brandId?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      ₦{product.costPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      ₦{product.sellingPrice.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {product.packSize}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ProductRowActions productId={product._id.toString()} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
