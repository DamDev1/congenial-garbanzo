'use client';

import { useState, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createSale } from '@/lib/actions/pos';
import { ReceiptModal } from './ReceiptModal';

interface POSClientProps {
  inventory: any[];
  customers: any[];
  branchId: string;
  cashierId: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  image?: string;
}

export default function POSClient({ inventory, customers, branchId, cashierId }: POSClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  
  // Credit checkout state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Group inventory by brand for easier browsing
  const inventoryByBrand = useMemo(() => {
    const filtered = inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.brandName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const grouped = filtered.reduce((acc: any, item: any) => {
      if (!acc[item.brandName]) acc[item.brandName] = [];
      acc[item.brandName].push(item);
      return acc;
    }, {});
    
    return grouped;
  }, [inventory, searchQuery]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (item: any) => {
    if (item.stockQuantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(i => i.productId === item._id);
      if (existing) {
        if (existing.quantity >= item.stockQuantity) return prev; // Cannot exceed stock
        return prev.map(i => 
          i.productId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        productId: item._id,
        name: item.name,
        price: item.sellingPrice,
        quantity: 1,
        maxStock: item.stockQuantity,
        image: item.image
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; // Handled by remove
          if (newQty > item.maxStock) return item; // Cannot exceed stock
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCheckout = async (paymentMethod: 'cash' | 'credit') => {
    if (cart.length === 0) return;
    if (paymentMethod === 'credit' && !selectedCustomerId) {
      alert('Please select a customer for credit checkout.');
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = await createSale({
        branchId,
        cashierId,
        customerId: paymentMethod === 'credit' ? selectedCustomerId : undefined,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, name: i.name })),
        paymentMethod,
        totalAmount: cartTotal
      });
      
      setCompletedTransaction(transaction);
      setCart([]);
      setSelectedCustomerId('');
    } catch (error: any) {
      alert(error.message || 'Failed to complete transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      
      {/* Left Area: Product Grid */}
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* Right Area: Cart Sidebar */}
      <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden z-20">
        <div className="p-6 border-b border-slate-100 bg-slate-950 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
              Current Sale
            </h2>
            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-bold shadow-inner">
              {cartItemCount} items
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-semibold">Cart is empty</p>
              <p className="text-sm">Click products to add them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.productId} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">{item.name}</div>
                    <div className="font-semibold text-blue-600 mt-0.5">₦{item.price.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <button 
                      onClick={() => item.quantity > 1 ? updateQuantity(item.productId, -1) : removeFromCart(item.productId)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="w-6 text-center font-bold text-slate-700">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-sm transition-all disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total Amount</span>
            <span className="text-3xl font-extrabold text-slate-900">₦{cartTotal.toLocaleString()}</span>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <select 
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Guest (Cash Only)</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
              <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0 || isProcessing}
                isLoading={isProcessing}
                className="!bg-emerald-600 hover:!bg-emerald-700 shadow-[0_8px_16px_-6px_rgba(16,185,129,0.4)] h-14 text-lg"
              >
                <Banknote className="w-5 h-5 mr-2" />
                Cash
              </Button>
              <Button 
                type="button" 
                onClick={() => handleCheckout('credit')}
                disabled={cart.length === 0 || !selectedCustomerId || isProcessing}
                isLoading={isProcessing}
                className="!bg-purple-600 hover:!bg-purple-700 shadow-[0_8px_16px_-6px_rgba(147,51,234,0.4)] h-14 text-lg disabled:!bg-slate-200 disabled:!text-slate-400 disabled:shadow-none"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Credit
              </Button>
            </div>
            {!selectedCustomerId && cart.length > 0 && (
              <p className="text-xs text-center text-slate-500 mt-2">Select a customer to enable Credit checkout.</p>
            )}
          </div>
        </div>
      </div>

      <ReceiptModal 
        isOpen={!!completedTransaction} 
        onClose={() => setCompletedTransaction(null)} 
        transaction={completedTransaction} 
      />
    </div>
  );
}
