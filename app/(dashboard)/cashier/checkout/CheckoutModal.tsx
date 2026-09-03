'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Banknote, ArrowRightLeft, AlertTriangle, User as UserIcon, CheckCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  customers: any[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  isProcessing: boolean;
  handleCheckout: () => void;
  cashAmount: number;
  setCashAmount: (amount: number) => void;
  transferAmount: number;
  setTransferAmount: (amount: number) => void;
  creditAmount: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartTotal,
  customers,
  selectedCustomerId,
  setSelectedCustomerId,
  isProcessing,
  handleCheckout,
  cashAmount,
  setCashAmount,
  transferAmount,
  setTransferAmount,
  creditAmount
}: CheckoutModalProps) {

  const handleTransferChange = (value: string) => {
    const num = Math.max(0, Math.min(cartTotal, Number(value) || 0));
    setTransferAmount(num);
    // Cap cash if transfer + cash exceeds total
    if (num + cashAmount > cartTotal) {
      setCashAmount(Math.max(0, cartTotal - num));
    }
  };

  const handleCashChange = (value: string) => {
    const maxCash = cartTotal - transferAmount;
    const num = Math.max(0, Math.min(maxCash, Number(value) || 0));
    setCashAmount(num);
  };

  const setFullCash = () => {
    setCashAmount(cartTotal);
    setTransferAmount(0);
  };

  const setFullTransfer = () => {
    setTransferAmount(cartTotal);
    setCashAmount(0);
  };

  const onCompleteSale = () => {
    handleCheckout();
    // Modal will close when the parent resets state after successful sale
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout">
      <div className="space-y-4">
        {/* Total */}
        <div className="flex justify-between items-center bg-slate-950 text-white p-4 rounded-2xl">
          <span className="text-sm font-bold uppercase tracking-wider text-slate-300">Total Amount</span>
          <span className="text-2xl font-extrabold">₦{cartTotal.toLocaleString()}</span>
        </div>

        {/* Quick-action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setFullCash}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
              cashAmount === cartTotal && transferAmount === 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            <Banknote className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Full Cash
          </button>
          <button
            type="button"
            onClick={setFullTransfer}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
              transferAmount === cartTotal && cashAmount === 0
                ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-200'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            Full Transfer
          </button>
        </div>

        {/* Transfer input */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            <ArrowRightLeft className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-blue-500" />
            Transfer Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
            <input
              type="number"
              min={0}
              max={cartTotal}
              value={transferAmount || ''}
              onChange={(e) => handleTransferChange(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 pl-8 pr-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Cash input */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            <Banknote className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-emerald-500" />
            Cash Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₦</span>
            <input
              type="number"
              min={0}
              max={cartTotal - transferAmount}
              value={cashAmount || ''}
              onChange={(e) => handleCashChange(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 pl-8 pr-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Credit (remaining) display */}
        {creditAmount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Credit (Owed)
              </span>
              <span className="text-xl font-extrabold text-amber-700">₦{creditAmount.toLocaleString()}</span>
            </div>
            {!selectedCustomerId && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⚠ Select a customer below to proceed — this amount will be added to their debt.
              </p>
            )}
          </div>
        )}

        {creditAmount === 0 && cartTotal > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-bold">Fully paid — no credit</span>
            </div>
          </div>
        )}

        {/* Customer selector */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
            <UserIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-slate-400" />
            Customer {creditAmount > 0 ? '(Required)' : '(Optional)'}
          </label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">{creditAmount > 0 ? 'Select a Customer...' : 'Guest (No Customer)'}</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''} {c.debtBalance > 0 ? `- Owes ₦${c.debtBalance.toLocaleString()}` : ''}
                </option>
              ))}
            </select>
            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
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

        {/* Complete Sale button */}
        <Button 
          type="button" 
          onClick={onCompleteSale}
          disabled={isProcessing || (creditAmount > 0 && !selectedCustomerId)}
          isLoading={isProcessing}
          className="w-full !bg-slate-900 hover:!bg-slate-800 shadow-[0_8px_16px_-6px_rgba(15,23,42,0.4)] h-14 text-lg disabled:!bg-slate-200 disabled:!text-slate-400 disabled:shadow-none"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Complete Sale
        </Button>
      </div>
    </Modal>
  );
}
