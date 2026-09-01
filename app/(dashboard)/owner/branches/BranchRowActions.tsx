'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, LayoutDashboard, Power, PowerOff } from 'lucide-react';
import { toggleBranchStatus } from '@/lib/actions/branch';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

export default function BranchRowActions({ branchId, isActive }: { branchId: string, isActive: boolean }) {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      await toggleBranchStatus(branchId, !isActive);
      setShowStatusModal(false);
    } catch (error) {
      alert('Failed to update branch status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <Dropdown
        trigger={
          <button className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        }
      >
        {(close) => (
          <>
            <Link
              href={`/owner/branches/${branchId}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              onClick={() => close()}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-500" />
              View Dashboard
            </Link>
            
            <button
              onClick={() => {
                setShowStatusModal(true);
                close();
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
              {isActive ? 'Deactivate Branch' : 'Activate Branch'}
            </button>
          </>
        )}
      </Dropdown>

      <Modal 
        isOpen={showStatusModal} 
        onClose={() => !isUpdating && setShowStatusModal(false)}
        title={isActive ? 'Deactivate Branch' : 'Activate Branch'}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
            isActive ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {isActive ? <PowerOff className="w-8 h-8" /> : <Power className="w-8 h-8" />}
          </div>
          <p className="text-slate-600">
            {isActive 
              ? 'Are you sure you want to deactivate this branch? This will prevent cashiers from logging into this branch and recording new sales. Historical data will be preserved.'
              : 'Are you sure you want to reactivate this branch? Cashiers will be able to log in and process sales again.'
            }
          </p>
          
          <div className="flex items-center gap-3 w-full mt-6">
            <Button 
              type="button" 
              onClick={() => setShowStatusModal(false)}
              disabled={isUpdating}
              className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleToggleStatus}
              isLoading={isUpdating}
              className={`flex-1 text-white shadow-lg ${
                isActive 
                  ? '!bg-orange-600 hover:!bg-orange-700 shadow-orange-600/40' 
                  : '!bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-600/40'
              }`}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
