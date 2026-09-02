import { Search, ShoppingCart } from 'lucide-react';

interface POSProductGridProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  inventoryByBrand: Record<string, any[]>;
  addToCart: (item: any) => void;
}

export function POSProductGrid({ searchQuery, setSearchQuery, inventoryByBrand, addToCart }: POSProductGridProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner">
      <div className="p-4 md:p-6 bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search products by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {Object.keys(inventoryByBrand).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <ShoppingCart className="w-12 h-12 mb-4 text-slate-300" />
            <p className="text-lg font-semibold">No products found</p>
            <p className="text-sm">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(inventoryByBrand).map(([brandName, items]: [string, any]) => (
              <div key={brandName}>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">{brandName}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {items.map((item: any) => {
                    const outOfStock = item.stockQuantity <= 0;
                    return (
                      <div 
                        key={item._id}
                        onClick={() => !outOfStock && addToCart(item)}
                        className={`relative group bg-white rounded-2xl p-4 border transition-all ${
                          outOfStock 
                            ? 'border-slate-200 opacity-50 cursor-not-allowed grayscale' 
                            : 'border-slate-200 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer active:scale-95'
                        }`}
                      >
                        <div className="aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center overflow-hidden relative">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart className="w-8 h-8 text-slate-300" />
                          )}
                          {outOfStock && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">Out of Stock</span>
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-slate-800 leading-tight mb-1 truncate">{item.name}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-extrabold text-blue-600">₦{item.sellingPrice.toLocaleString()}</span>
                          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {item.stockQuantity} in stock
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
