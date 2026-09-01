'use client';

import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { deleteUser } from '@/lib/actions/user';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function UserRowActions({ 
  user, 
  onEdit 
}: { 
  user: any, 
  onEdit: (user: any) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(user._id);
      setShowDeleteModal(false);
      setIsOpen(false);
    } catch (error) {
      alert('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-full hover:bg-slate-100"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-blue-500" />
              Edit
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}

      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete User"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-slate-600">
            Are you sure you want to delete <span className="font-bold text-slate-800">{user.name}</span>? 
            They will lose all access to the system immediately.
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
              className="!bg-red-600 hover:!bg-red-700 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.4)] flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
