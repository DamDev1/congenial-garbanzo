'use client';

import { useState } from 'react';
import { Plus, Search, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PosAgentFormModal } from './PosAgentFormModal';
import { deletePosExchange } from '@/lib/actions/pos-agent';

export default function PosAgentClient({ 
  initialExchanges, 
  branchId,
  userRole,
  userId,
  isOwner
}: { 
  initialExchanges: any[]; 
  branchId?: string;
  userRole: string;
  userId: string;
  isOwner?: boolean;
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExchanges = initialExchanges.filter(e =>
    e.agentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.recordedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">POS Agents</h1>
          <p className="text-slate-500 font-medium mt-1">Track cash handovers to POS agents.</p>
        </div>
        <div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="shadow-lg shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Record POS Exchange
          </Button>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-100/50 flex flex-col">
        <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by agent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cash Given</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer Received</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Recorded By</th>
                {isOwner && <th className="px-6 py-4 text-right"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExchanges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <ArrowRightLeft className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700">No exchanges found</p>
                      <p className="text-sm">Record a cash handover when a POS agent visits.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExchanges.map((exchange: any) => (
                  <tr key={exchange._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-800">
                        {new Date(exchange.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-700">{exchange.agentName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                        ₦{exchange.cashGiven.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        ₦{exchange.transferReceived.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        ₦{exchange.fee.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {exchange.recordedBy?.name || 'Unknown'}
                      </div>
                    </td>
                    {isOwner && (
                      <td className="px-6 py-4 text-right">
                        <Button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this POS exchange? This action cannot be undone.')) {
                              try {
                                await deletePosExchange(exchange._id);
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }
                          }}
                          className="!bg-red-50 !text-red-600 border border-red-200 hover:!bg-red-100 shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PosAgentFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        branchId={branchId}
        userId={userId}
      />
    </div>
  );
}
