'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { settleCustomerDebt } from '@/lib/actions/customer';
import { Banknote, ArrowRightLeft, CheckCircle2, Printer } from 'lucide-react';

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
  const [completedPayment, setCompletedPayment] = useState<any>(null);

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
      const payment = await settleCustomerDebt({
        customerId: customer._id,
        cashierId,
        branchId,
        cashAmount,
        transferAmount,
      });
      setCompletedPayment(payment);
    } catch (error: any) {
      alert(error.message || 'Failed to settle debt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (completedPayment) {
      setCompletedPayment(null);
      setCashAmount(0);
      setTransferAmount(0);
    }
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={completedPayment ? "Debt Payment Receipt" : `Settle Debt: ${customer.name}`}>
      {completedPayment ? (
        <>
          <div className="flex flex-col items-center mb-5 text-emerald-600">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Payment Successful</h2>
          </div>

          {/* Printable Receipt Area */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5 font-mono text-[13px] leading-relaxed text-slate-800 shadow-inner" id="printable-receipt">
            
            {/* Header */}
            <div className="text-center mb-4 pb-3 border-b border-dashed border-slate-300">
              <h3 className="font-black text-base tracking-wide text-slate-900 uppercase">De-Luv Limited</h3>
              <p className="text-[11px] text-slate-600 uppercase tracking-widest mt-1">Debt Payment Receipt</p>
            </div>

            {/* Sale Info */}
            <div className="mb-3 pb-3 border-b border-dashed border-slate-300 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt ID</span>
                <span className="font-bold">{completedPayment._id?.slice(-10).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cashier</span>
                <span className="font-bold">{completedPayment.cashierId?.name || 'Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch</span>
                <span className="font-bold">{completedPayment.branchId?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-bold">
                  {new Date(completedPayment.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                  {new Date(completedPayment.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="border-b border-dashed border-slate-300 pb-3 mb-3 space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500 uppercase">Amount Paid</span>
                <span className="font-black text-base">₦{completedPayment.amountPaid.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="space-y-0.5 pt-1">
                {completedPayment.cashAmount > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Paid via Cash</span>
                    <span className="font-bold">₦{completedPayment.cashAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {completedPayment.transferAmount > 0 && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Paid via Transfer</span>
                    <span className="font-bold">₦{completedPayment.transferAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Status */}
            <div className="mb-2 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer</span>
                <span className="font-bold">{customer.name}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="font-bold">Remaining Debt</span>
                <span className="font-bold">₦{remainingDebt.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-300 space-y-1">
              <p className="font-bold uppercase text-[11px] tracking-wide">Thanks for your payment</p>
              <p className="text-[10px] text-slate-400 mt-2">Powered by De-Luv POS</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full">
            <Button 
              type="button" 
              onClick={handleClose}
              className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm flex-1"
            >
              Close
            </Button>
            <Button 
              type="button" 
              onClick={handlePrint}
              className="flex-1 shadow-lg"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>

          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-receipt, #printable-receipt * {
                visibility: visible;
              }
              #printable-receipt {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 20px;
                background: white;
                border: none;
                box-shadow: none;
                font-size: 12px;
              }
            }
          `}</style>
        </>
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
