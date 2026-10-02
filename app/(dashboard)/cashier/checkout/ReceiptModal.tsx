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

  const items = transaction.items || [];
  const totalQuantity = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
  const date = new Date(transaction.createdAt);
  const formattedDate = `${date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  const saleId = transaction._id?.slice(-10).toUpperCase();
  const cashierName = transaction.cashierId?.name || 'Staff';
  const branchName = transaction.branchId?.name || '—';

  const chargedParts: string[] = [];
  if (transaction.cashAmount > 0) chargedParts.push('Cash');
  if (transaction.transferAmount > 0) chargedParts.push('Transfer');
  if (transaction.creditAmount > 0) chargedParts.push('Credit');
  const chargedLabel = chargedParts.length > 0 ? chargedParts.join(' + ') : 'Cash';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Complete">
      <div className="flex flex-col items-center mb-5 text-emerald-600">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Payment Successful</h2>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5 font-mono text-[13px] leading-relaxed text-slate-800 shadow-inner" id="printable-receipt">
        
        <div className="text-center mb-4 pb-3 border-b border-dashed border-slate-300">
          <h3 className="font-black text-base tracking-wide text-slate-900 uppercase">De-Luv Investment Limited</h3>
          <p className="text-sm font-bold text-slate-700 mt-1">Tel: 08035370718</p>
        </div>

        <div className="mb-3 pb-3 border-b border-dashed border-slate-300 space-y-0.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Sale ID</span>
            <span className="font-bold">{saleId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cashier</span>
            <span className="font-bold">{cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Branch</span>
            <span className="font-bold">{branchName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date</span>
            <span className="font-bold">{formattedDate}</span>
          </div>
        </div>

        <table className="w-full border-collapse border border-black mb-3 text-black" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '33%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '28%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-black text-[12px] font-bold uppercase tracking-wider">
              <th className="py-1 px-1 border-r border-black text-center">QTY</th>
              <th className="py-1 px-1 border-r border-black text-left">ITEM</th>
              <th className="py-1 px-1 border-r border-black text-right">PRICE</th>
              <th className="py-1 px-1 text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => {
              const name = item.productId?.name || item.name || 'Unknown';
              const amount = item.quantity * item.price;
              return (
                <tr key={idx} className="border-b border-black last:border-b-0">
                  <td className="py-1 px-1 border-r border-black text-center font-bold text-[11px]">{item.quantity}</td>
                  <td className="py-1 px-1 border-r border-black text-left font-bold text-[11px] whitespace-normal leading-tight overflow-hidden text-ellipsis">{name}</td>
                  <td className="py-1 px-1 border-r border-black text-right font-bold text-[11px] tabular-nums">{item.price.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                  <td className="py-1 px-1 text-right font-bold text-[11px] tabular-nums">{amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="border-y border-slate-400 py-2 mb-2 space-y-1">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-bold text-xs uppercase">Total Qty</span>
            <span className="font-bold text-sm">{totalQuantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">Total Amount</span>
            <span className="font-black text-base">₦{transaction.totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="mb-2 space-y-0.5">
          {transaction.cashAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Charged (Cash)</span>
              <span className="font-bold">₦{transaction.cashAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {transaction.transferAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Charged (Transfer)</span>
              <span className="font-bold">₦{transaction.transferAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {transaction.creditAmount > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Credit (Owed)</span>
              <span className="font-bold">₦{transaction.creditAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        {/* Customer & Debt */}
        {transaction.customerId && (
          <div className="border-t border-dashed border-slate-300 pt-2 mb-2 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer</span>
              <span className="font-bold">{transaction.customerId.name || 'Credit Account'}</span>
            </div>
            {transaction.customerId.debtBalance > 0 && (
              <div className="flex justify-between text-red-600">
                <span className="font-bold">Total Owing</span>
                <span className="font-bold">₦{transaction.customerId.debtBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-4 pt-3 border-t border-dashed border-slate-300 space-y-1">
          <p className="font-bold uppercase text-[11px] tracking-wide">Thanks for your patronage</p>
          <p className="text-[10px] text-slate-500 leading-tight">
            Please confirm items before leaving. No<br />
            refund/exchange after purchase.
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Powered by De-Luv POS</p>
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
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          /* CRITICAL: Hide the main background app entirely so it doesn't create blank pages */
          body > *:not(:has(#printable-receipt)) {
            display: none !important;
          }

          /* Reset body and html */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
          }

          /* Hide everything by default */
          body * {
            visibility: hidden;
          }

          /* Reset modal fixed positioning and max-height which causes clipping */
          .fixed, [role="dialog"], .overflow-y-auto {
            position: static !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            transform: none !important;
          }

          /* Show the receipt and its children */
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }

          /* Position the receipt at the top left of the physical page */
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            margin: 0;
            padding: 2mm 4mm;
            background: white;
            border: none;
            box-shadow: none;
            font-size: 11px;
            overflow: visible !important;
            box-sizing: border-box;
            height: auto !important;
          }

          #printable-receipt table {
            width: 100% !important;
            table-layout: fixed !important;
            word-wrap: break-word;
          }

          #printable-receipt tr {
            page-break-inside: avoid;
          }

          #printable-receipt td,
          #printable-receipt th {
            padding: 2px !important;
          }
        }
      `}</style>
    </Modal>
  );
}
