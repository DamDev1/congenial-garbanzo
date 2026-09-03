'use client';

import { useState, useMemo } from 'react';
import { createSale } from '@/lib/actions/pos';
import { ReceiptModal } from './ReceiptModal';
import { POSProductGrid } from './POSProductGrid';
import { POSCartSidebar } from './POSCartSidebar';
import { CheckoutModal } from './CheckoutModal';

interface POSClientProps {
  inventory: any[];
  customers: any[];
  branchId: string;
  cashierId: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  image?: string;
}

export default function POSClient({ inventory, customers, branchId, cashierId }: POSClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Split payment amounts
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);

  const uniqueBrands = useMemo(() => {
    const brands = new Set(inventory.map(item => item.brandName));
    return Array.from(brands).sort();
  }, [inventory]);

  const inventoryByBrand = useMemo(() => {
    const filtered = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.brandName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === 'All' || item.brandName === selectedBrand;
      return matchesSearch && matchesBrand;
    });
    
    const grouped = filtered.reduce((acc: any, item: any) => {
      if (!acc[item.brandName]) acc[item.brandName] = [];
      acc[item.brandName].push(item);
      return acc;
    }, {});
    
    return grouped;
  }, [inventory, searchQuery, selectedBrand]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const creditAmount = Math.max(0, cartTotal - cashAmount - transferAmount);

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

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (creditAmount > 0 && !selectedCustomerId) {
      alert('Please select a customer — there is an outstanding credit amount.');
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = await createSale({
        branchId,
        cashierId,
        customerId: selectedCustomerId || undefined,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, name: i.name })),
        totalAmount: cartTotal,
        cashAmount,
        transferAmount,
        creditAmount
      });
      
      setCompletedTransaction(transaction);
      setCart([]);
      setSelectedCustomerId('');
      setCashAmount(0);
      setTransferAmount(0);
      setIsCheckoutOpen(false);
    } catch (error: any) {
      alert(error.message || 'Failed to complete transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-6">
      
      <POSProductGrid 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        uniqueBrands={uniqueBrands}
        inventoryByBrand={inventoryByBrand}
        addToCart={addToCart}
      />

      <POSCartSidebar 
        cart={cart}
        cartItemCount={cartItemCount}
        cartTotal={cartTotal}
        isProcessing={isProcessing}
        onCheckoutOpen={() => setIsCheckoutOpen(true)}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartTotal={cartTotal}
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        setSelectedCustomerId={setSelectedCustomerId}
        isProcessing={isProcessing}
        handleCheckout={handleCheckout}
        cashAmount={cashAmount}
        setCashAmount={setCashAmount}
        transferAmount={transferAmount}
        setTransferAmount={setTransferAmount}
        creditAmount={creditAmount}
      />

      <ReceiptModal 
        isOpen={!!completedTransaction} 
        onClose={() => setCompletedTransaction(null)} 
        transaction={completedTransaction} 
      />
    </div>
  );
}
