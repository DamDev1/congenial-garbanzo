import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CartItem } from './POSClient';

interface POSCartSidebarProps {
  cart: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  customers: any[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  isProcessing: boolean;
  handleCheckout: (method: 'cash' | 'credit') => void;
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

export function POSCartSidebar({
  cart,
  cartItemCount,
  cartTotal,
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  isProcessing,
  handleCheckout,
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
                <option key={c._id} value={c._id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} {c.debtBalance > 0 ? `- Owes ₦${c.debtBalance.toLocaleString()}` : ''}
                </option>
              ))}
            </select>
            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {selectedCustomerId && customers.find(c => c._id === selectedCustomerId)?.debtBalance > 0 && (
            <div className="text-sm font-bold text-red-500 px-1">
              Outstanding Debt: ₦{customers.find(c => c._id === selectedCustomerId)?.debtBalance.toLocaleString()}
            </div>
          )}
          {selectedCustomerId && customers.find(c => c._id === selectedCustomerId)?.debtBalance === 0 && (
            <div className="text-sm font-bold text-emerald-500 px-1">
              No outstanding debt
            </div>
          )}

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
  );
}
