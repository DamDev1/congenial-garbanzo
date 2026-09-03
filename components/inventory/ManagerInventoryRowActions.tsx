'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, PackagePlus } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { ManagerProductFormModal } from './ManagerProductFormModal';
import { AddStockModal } from './AddStockModal';

interface ManagerInventoryRowActionsProps {
  item: any;
  brands: any[];
  currentUser: any;
}

export default function ManagerInventoryRowActions({ item, brands, currentUser }: ManagerInventoryRowActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);

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
            <button
              onClick={() => {
                setShowAddStockModal(true);
                close();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <PackagePlus className="w-4 h-4" />
              Add Stock
            </button>
            <button
              onClick={() => {
                setShowEditModal(true);
                close();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-blue-500" />
              Edit Product
            </button>
          </>
        )}
      </Dropdown>

      <ManagerProductFormModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        brands={brands}
        currentUser={currentUser}
        product={item.productId}
      />

      <AddStockModal
        isOpen={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        inventoryItem={item}
      />
    </div>
  );
}
