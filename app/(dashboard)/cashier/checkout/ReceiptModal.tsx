'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  // Extract populated data or fallback
  const items = transaction.items || [];
  const date = new Date(transaction.createdAt).toLocaleString();
  const paymentMethod = transaction.paymentMethod.toUpperCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Complete">
      <div className="flex flex-col items-center mb-6 text-emerald-600">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Payment Successful</h2>
      </div>

      {/* Printable Receipt Area */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6 font-mono text-sm" id="printable-receipt">
        <div className="text-center mb-6">
          <h3 className="font-bold text-lg text-slate-900">De-Luv Limited</h3>
          <p className="text-slate-500 text-xs mt-1">Receipt #{transaction._id?.slice(-8).toUpperCase()}</p>
          <p className="text-slate-500 text-xs">{date}</p>
        </div>

        <div className="border-t border-b border-slate-300 py-4 my-4 space-y-3">
          {items.map((item: any, idx: number) => {
            const name = item.productId?.name || item.name || 'Unknown Product';
            return (
              <div key={idx} className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <span className="font-semibold">{name}</span>
                  <div className="text-slate-500 text-xs">
                    {item.quantity} x ₦{item.price.toLocaleString()}
                  </div>
                </div>
                <span className="font-bold">₦{(item.quantity * item.price).toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-2">
          <span>Total</span>
          <span>₦{transaction.totalAmount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center text-slate-600 text-xs">
          <span>Payment Method</span>
          <span className="font-bold">{paymentMethod}</span>
        </div>
        
        {transaction.customerId && (
          <div className="flex justify-between items-center text-slate-600 text-xs mt-1">
            <span>Customer</span>
            <span className="font-bold">{transaction.customerId.name || 'Credit Account'}</span>
          </div>
        )}

        <div className="text-center mt-8 text-xs text-slate-500">
          <p>Thank you for your patronage!</p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full">
        <Button 
          type="button" 
          onClick={onClose}
          className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm flex-1"
        >
          New Sale
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
          }
        }
      `}</style>
    </Modal>
  );
}
