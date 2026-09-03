'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getCustomerHistory } from '@/lib/actions/customer';
import { ShoppingBag, Banknote, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CustomerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export function CustomerHistoryModal({ isOpen, onClose, customer }: CustomerHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && customer) {
      loadHistory();
    }
  }, [isOpen, customer]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getCustomerHistory(customer._id);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${customer.name}'s History`}>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex justify-between items-center shadow-inner">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Debt Balance</p>
          <p className={`text-2xl font-black ${customer.debtBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            ₦{customer.debtBalance.toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="font-semibold">Loading history...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-center">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="font-semibold text-lg">No Credit History</p>
            <p className="text-sm">This customer hasn't taken any credit or made any debt payments yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8 pb-4">
            {history.map((item, index) => {
              const date = new Date(item.createdAt).toLocaleString('en-GB', { 
                day: '2-digit', month: 'short', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              });
              
              if (item.type === 'credit_sale') {
                return (
                  <div key={item._id} className="relative">
                    <div className="absolute -left-[35px] w-6 h-6 bg-red-100 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                      <ShoppingBag className="w-3 h-3 text-red-600" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-1 border border-red-100">
                            Credit Purchase
                          </span>
                          <p className="text-xs text-slate-500 font-medium">{date}</p>
                        </div>
                        <span className="font-bold text-red-600 text-lg">+₦{item.creditAmount.toLocaleString()}</span>
                      </div>
                      
                      <div className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">
                        <p>Total bill was <strong>₦{item.totalAmount.toLocaleString()}</strong>.</p>
                        <p className="text-xs text-slate-400 mt-1">Processed by {item.cashierId?.name || 'Unknown Staff'}</p>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={item._id} className="relative">
                    <div className="absolute -left-[35px] w-6 h-6 bg-emerald-100 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                      <Banknote className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-1 border border-emerald-100">
                            Debt Repayment
                          </span>
                          <p className="text-xs text-slate-500 font-medium">{date}</p>
                        </div>
                        <span className="font-bold text-emerald-600 text-lg">-₦{item.amountPaid.toLocaleString()}</span>
                      </div>
                      
                      <div className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <div>
                          {item.cashAmount > 0 && <span className="mr-2">Cash: ₦{item.cashAmount.toLocaleString()}</span>}
                          {item.transferAmount > 0 && <span>Transfer: ₦{item.transferAmount.toLocaleString()}</span>}
                        </div>
                        <p className="text-xs text-slate-400">Collected by {item.cashierId?.name || 'Unknown Staff'}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Button onClick={onClose} className="w-full !bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm">
          Close History
        </Button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
    </Modal>
  );
}
