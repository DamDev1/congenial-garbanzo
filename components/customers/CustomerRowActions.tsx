'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { deleteCustomer } from '@/lib/actions/customer';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { CustomerFormModal } from './CustomerFormModal';
import { SettleDebtModal } from './SettleDebtModal';
import { CustomerHistoryModal } from './CustomerHistoryModal';
import { Banknote } from 'lucide-react';

interface CustomerRowActionsProps {
  customer: any;
  cashierId?: string;
  branchId?: string;
}

export default function CustomerRowActions({ customer, cashierId, branchId }: CustomerRowActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettleDebtModal, setShowSettleDebtModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCashier = !!cashierId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer(customer._id);
      setShowDeleteModal(false);
    } catch (error: any) {
      alert(error.message || 'Failed to delete customer');
    } finally {
      setIsDeleting(false);
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
            {isCashier && customer.debtBalance > 0 && branchId && (
              <button
                onClick={() => {
                  setShowSettleDebtModal(true);
                  close();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <Banknote className="w-4 h-4" />
                Settle Debt
              </button>
            )}
            <button
              onClick={() => {
                setShowHistoryModal(true);
                close();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Clock className="w-4 h-4" />
              View History
            </button>
            <button
              onClick={() => {
                setShowEditModal(true);
                close();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-slate-500" />
              Edit
            </button>
            {!isCashier && (
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  close();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </>
        )}
      </Dropdown>

      <CustomerHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        customer={customer}
      />

      <CustomerFormModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        customer={customer} 
      />

      {cashierId && branchId && (
        <SettleDebtModal
          isOpen={showSettleDebtModal}
          onClose={() => setShowSettleDebtModal(false)}
          customer={customer}
          cashierId={cashierId}
          branchId={branchId}
        />
      )}

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Customer"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-slate-600">
            Are you sure you want to delete <strong>{customer.name}</strong>? 
            {customer.debtBalance > 0 ? (
              <span className="block mt-2 font-bold text-red-600">
                Warning: This customer has an outstanding debt of ₦{customer.debtBalance.toLocaleString()}. You cannot delete them until their balance is cleared.
              </span>
            ) : (
              " This action cannot be undone."
            )}
          </p>
          
          <div className="flex items-center gap-3 w-full mt-6">
            <Button 
              type="button" 
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="!bg-white !text-slate-700 border border-slate-200 hover:!bg-slate-50 shadow-sm flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={customer.debtBalance > 0}
              className="!bg-red-600 hover:!bg-red-700 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)] flex-1 disabled:opacity-50 disabled:shadow-none"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
