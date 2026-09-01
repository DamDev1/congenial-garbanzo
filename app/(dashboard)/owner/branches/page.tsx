import { getBranches } from '@/lib/actions/branch';
import { CreateBranchForm } from './CreateBranchForm';
import { Store, MapPin } from 'lucide-react';
import BranchRowActions from './BranchRowActions';
import Link from 'next/link';

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Branch Management</h2>
          <p className="text-slate-500 font-medium mt-1">Add and manage your retail locations.</p>
        </div>
        <CreateBranchForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium text-lg">No branches found.</p>
            <p className="text-sm text-slate-400 mt-1">Create your first branch to get started.</p>
          </div>
        ) : (
          branches.map((branch: any) => {
            const isActive = branch.isActive ?? true;
            return (
            <div 
              key={branch._id} 
              className={`relative bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group ${
                isActive ? '' : 'opacity-75 grayscale-[0.5]'
              }`}
            >
              <div className="relative z-30 flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Store className="w-6 h-6" />
                </div>
                
                {/* Actions Menu */}
                <div className="relative">
                  <BranchRowActions branchId={branch._id.toString()} isActive={isActive} />
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <Link 
                    href={`/owner/branches/${branch._id}`}
                    className="font-extrabold text-xl text-slate-900 group-hover:text-blue-700 transition-colors before:absolute before:inset-0 before:z-0 focus:outline-none"
                  >
                    {branch.name}
                  </Link>
                  {!isActive && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-600 uppercase tracking-wider relative z-20">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-start gap-1.5 text-sm text-slate-500 mt-2 relative z-20">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                  <span className="leading-snug">{branch.location}</span>
                </div>
                
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-6 pt-4 border-t border-slate-100/50 relative z-20">
                  Added {new Date(branch.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
