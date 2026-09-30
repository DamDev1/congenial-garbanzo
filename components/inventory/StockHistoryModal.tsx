'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { getStockHistory } from '@/lib/actions/inventory';
import { History, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

interface StockHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: any;
}

export function StockHistoryModal({ isOpen, onClose, inventoryItem }: StockHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!isOpen || !inventoryItem) return;

      setIsLoading(true);
      try {
        const data = await getStockHistory(inventoryItem.productId._id, inventoryItem.branchId);
        setHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load stock history');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [isOpen, inventoryItem]);

  if (!isOpen || !inventoryItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stock History: ${inventoryItem.productId?.name}`}>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <History className="w-8 h-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">No history found</p>
            <p className="text-sm mt-1">Stock adjustments will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {history.map((record) => (
              <div key={record._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.quantityAdded > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    {record.quantityAdded > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">
                      {record.quantityAdded > 0 ? '+' : ''}{record.quantityAdded} packs
                    </div>
                    <div className="text-xs text-slate-500">
                      {format(new Date(record.createdAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">
                    <span className="text-slate-400 line-through mr-2">{record.previousQuantity}</span>
                    <span className="text-slate-900">{record.newQuantity}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">Stock level</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
