import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CartItem } from './POSClient';

interface POSCartSidebarProps {
  cart: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  isProcessing: boolean;
  onCheckoutOpen: () => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

export function POSCartSidebar({
  cart,
  cartItemCount,
  cartTotal,
  isProcessing,
  onCheckoutOpen,
  updateQuantity,
  removeFromCart
}: POSCartSidebarProps) {
  return (
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
        <div className="flex justify-between items-center mb-5">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-sm">Total Amount</span>
          <span className="text-3xl font-extrabold text-slate-900">₦{cartTotal.toLocaleString()}</span>
        </div>

        <Button 
          type="button" 
          onClick={onCheckoutOpen}
          disabled={cart.length === 0 || isProcessing}
          className="w-full !bg-slate-900 hover:!bg-slate-800 shadow-[0_8px_16px_-6px_rgba(15,23,42,0.4)] h-14 text-lg disabled:!bg-slate-200 disabled:!text-slate-400 disabled:shadow-none"
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Checkout
        </Button>
      </div>
    </div>
  );
}
