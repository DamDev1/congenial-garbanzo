import { getBranches } from '@/lib/actions/branch';
import { CreateBranchForm } from './CreateBranchForm';
import { Store, MapPin } from 'lucide-react';

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Branch Management</h2>
        <p className="text-slate-500">Add and manage your retail locations.</p>
      </div>

      <CreateBranchForm />

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-medium text-slate-800">Existing Branches</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {branches.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No branches found. Create your first branch above.
            </div>
          ) : (
            branches.map((branch: any) => (
              <div key={branch._id} className="p-6 flex items-start justify-between hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{branch.name}</h4>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {branch.location}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Added {new Date(branch.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Edit
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
