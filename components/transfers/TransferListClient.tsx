'use client';

import { useState } from 'react';
import { ArrowRightLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { completeTransfer, cancelTransfer } from '@/lib/actions/transfer';
import { TransferFormModal } from './TransferFormModal';

interface TransferListClientProps {
  initialTransfers: any[];
  branches: any[];
  currentUser: any;
}

export default function TransferListClient({ initialTransfers, branches, currentUser }: TransferListClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReceive = async (transferId: string) => {
    if (!confirm('Are you sure you want to receive this stock? This will add the items to your branch inventory.')) return;
    
    setProcessingId(transferId);
    try {
      await completeTransfer(transferId, currentUser.id);
    } catch (error: any) {
      alert(error.message || 'Failed to receive transfer');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (transferId: string) => {
    if (!confirm('Are you sure you want to cancel this transfer? The stock will be returned to the source branch.')) return;
    
    setProcessingId(transferId);
    try {
      await cancelTransfer(transferId);
    } catch (error: any) {
      alert(error.message || 'Failed to cancel transfer');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Stock Transfers</h1>
          <p className="text-slate-500 font-medium mt-1">Manage inventory movement between branches.</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)} 
          className="shadow-lg shadow-blue-500/20 whitespace-nowrap"
        >
          <ArrowRightLeft className="w-5 h-5 mr-2" />
          New Transfer
        </Button>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialTransfers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <ArrowRightLeft className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700">No transfers found</p>
                      <p className="text-sm">Initiate a new stock transfer to see it here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                initialTransfers.map((transfer: any) => (
                  <tr key={transfer._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(transfer.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{transfer.sourceBranchId.name}</span>
                        <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-700">{transfer.destinationBranchId.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">By: {transfer.initiatedBy.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{transfer.items.length} product(s)</div>
                      <div className="text-xs text-slate-500 max-w-[200px] truncate">
                        {transfer.items.map((i: any) => `${i.productId?.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transfer.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> In Transit
                        </span>
                      )}
                      {transfer.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Received
                        </span>
                      )}
                      {transfer.status === 'cancelled' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          <XCircle className="w-3.5 h-3.5" /> Cancelled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {transfer.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          {/* Cancel: Owners can cancel any. Managers can only cancel if they initiated it or it's from their branch */}
                          {(currentUser.role === 'owner' || transfer.sourceBranchId._id === currentUser.branchId) && (
                            <Button 
                              type="button" 
                              onClick={() => handleCancel(transfer._id)}
                              disabled={processingId === transfer._id}
                              isLoading={processingId === transfer._id}
                              className="!bg-white !text-slate-600 border border-slate-200 hover:!bg-slate-50 !py-1.5 !px-3 text-xs"
                            >
                              Cancel
                            </Button>
                          )}
                          
                          {/* Receive: Owners can receive any. Managers can only receive if it's TO their branch */}
                          {(currentUser.role === 'owner' || transfer.destinationBranchId._id === currentUser.branchId) && (
                            <Button 
                              type="button" 
                              onClick={() => handleReceive(transfer._id)}
                              disabled={processingId === transfer._id}
                              isLoading={processingId === transfer._id}
                              className="!bg-blue-600 hover:!bg-blue-700 !py-1.5 !px-3 text-xs shadow-sm shadow-blue-500/20"
                            >
                              Receive Stock
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransferFormModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        branches={branches}
        currentUser={currentUser}
      />
    </div>
  );
}
