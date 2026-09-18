'use client';

import { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createPosExchange } from '@/lib/actions/pos-agent';

interface PosAgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId?: string;
  userId: string;
}

export function PosAgentFormModal({ isOpen, onClose, branchId, userId }: PosAgentFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [agentName, setAgentName] = useState('');
  const [cashGiven, setCashGiven] = useState('');
  const [transferReceived, setTransferReceived] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      setError('Branch information missing.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const cash = parseFloat(cashGiven);
      const transfer = parseFloat(transferReceived);
      
      if (isNaN(cash) || cash <= 0 || isNaN(transfer) || transfer <= 0) {
        throw new Error('Please enter valid amounts for cash and transfer.');
      }

      await createPosExchange({
        branchId,
        recordedBy: userId,
        agentName,
        cashGiven: cash,
        transferReceived: transfer,
        fee: cash - transfer
      });

      // Reset form
      setAgentName('');
      setCashGiven('');
      setTransferReceived('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Record POS Exchange</h2>
              <p className="text-sm text-slate-400">Log cash handed to a POS agent</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Agent Name (Optional)</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. John Doe Opay"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cash Given Out</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                <input
                  type="number"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Transfer Received</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₦</span>
                <input
                  type="number"
                  value={transferReceived}
                  onChange={(e) => setTransferReceived(e.target.value)}
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
          
          {(cashGiven && transferReceived) && !isNaN(parseFloat(cashGiven)) && !isNaN(parseFloat(transferReceived)) && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Calculated Fee:</span>
              <span className={`font-bold ${parseFloat(cashGiven) - parseFloat(transferReceived) >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                ₦{(parseFloat(cashGiven) - parseFloat(transferReceived)).toLocaleString()}
              </span>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? 'Saving...' : 'Save Exchange'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
