'use client';

import { useState } from 'react';
import { Plus, Users, MapPin, User as UserIcon } from 'lucide-react';
import { UserFormModal } from './UserFormModal';
import UserRowActions from './UserRowActions';

export default function UsersList({ users, branches }: { users: any[], branches: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleOpenNew = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">User Management</h2>
          <p className="text-slate-500 font-medium mt-1">Manage managers and cashiers across branches.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-[#3B41E3] hover:bg-[#2A2FC3] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-[0_4px_12px_-4px_rgba(59,65,227,0.5)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="glass rounded-3xl overflow-hidden shadow-sm border border-slate-100/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Branch</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="font-semibold text-slate-700">No users found</p>
                      <p className="text-sm">Click "Add User" to create your first manager or cashier.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        user.role === 'manager' 
                          ? 'bg-purple-50 text-purple-700 border-purple-100' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {user.branchId ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {user.branchId.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <UserRowActions user={user} onEdit={handleOpenEdit} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        branches={branches}
        initialData={selectedUser}
      />
    </>
  );
}
