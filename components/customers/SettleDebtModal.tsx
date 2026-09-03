'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { settleCustomerDebt } from '@/lib/actions/customer';
import { Banknote, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  cashierId: string;
  branchId: string;
}

export function SettleDebtModal({ isOpen, onClose, customer, cashierId, branchId }: SettleDebtModalProps) {
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const totalPayment = cashAmount + transferAmount;
  const remainingDebt = Math.max(0, customer.debtBalance - totalPayment);

  const handleCashChange = (value: string) => {
    const num = Math.max(0, Math.min(customer.debtBalance - transferAmount, Number(value) || 0));
    setCashAmount(num);
  };

  const handleTransferChange = (value: string) => {
    const num = Math.max(0, Math.min(customer.debtBalance, Number(value) || 0));
    setTransferAmount(num);
    if (num + cashAmount > customer.debtBalance) {
      setCashAmount(Math.max(0, customer.debtBalance - num));
    }
  };

  const setFullCash = () => {
    setCashAmount(customer.debtBalance);
    setTransferAmount(0);
  };

  const setFullTransfer = () => {
    setTransferAmount(customer.debtBalance);
    setCashAmount(0);
  };

  const handleSettle = async () => {
    if (totalPayment <= 0) return;
    
    setIsProcessing(true);
    try {
      await settleCustomerDebt({
        customerId: customer._id,
        cashierId,
        branchId,
        cashAmount,
        transferAmount,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCashAmount(0);
        setTransferAmount(0);
        onClose();
      }, 2000);
    } catch (error: any) {
      alert(error.message || 'Failed to settle debt');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Settle Debt: ${customer.name}`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-emerald-600">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Payment Successful</h2>
          <p className="text-slate-500 mt-2">The debt balance has been updated.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex justify-between items-center">
            <span className="text-red-700 font-bold text-sm uppercase">Total Owed</span>
            <span className="text-2xl font-black text-red-700">₦{customer.debtBalance.toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={setFullCash}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold border transition-all ${
                cashAmount === customer.debtBalance && transferAmount === 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200'
              }`}
            >
              <Banknote className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Full Cash
            </button>
            <button
              type="button"
              onClick={setFullTransfer}
              className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold border transition-all ${
                transferAmount === customer.debtBalance && cashAmount === 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-200'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Full Transfer
            </button>
          </div>

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
                max={customer.debtBalance}
                value={transferAmount || ''}
                onChange={(e) => handleTransferChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 pl-8 pr-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

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
                max={customer.debtBalance - transferAmount}
                value={cashAmount || ''}
                onChange={(e) => handleCashChange(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-3 pl-8 pr-4 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-t border-slate-100">
            <span className="text-slate-500 font-bold text-sm">Remaining Debt</span>
            <span className="text-lg font-bold text-slate-900">₦{remainingDebt.toLocaleString()}</span>
          </div>

          <Button 
            type="button" 
            onClick={handleSettle}
            disabled={totalPayment <= 0 || isProcessing}
            isLoading={isProcessing}
            className="w-full !bg-slate-900 hover:!bg-slate-800 shadow-[0_8px_16px_-6px_rgba(15,23,42,0.4)] h-14 text-lg disabled:!bg-slate-200 disabled:!text-slate-400 disabled:shadow-none"
          >
            Process Payment
          </Button>
        </div>
      )}
    </Modal>
  );
}
