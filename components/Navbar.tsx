import { User, Bell } from 'lucide-react';

export function Navbar({ user }: { user: { name?: string | null; role?: string } }) {
  return (
    <header className="h-24 px-6 md:px-10 flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md">
      <div className="md:hidden font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">
        De-Luv POS
      </div>
      
      <div className="hidden md:flex flex-col">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Overview</h2>
        <p className="text-2xl font-bold text-slate-800 capitalize">{user.role} Portal</p>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-blue-500 transition-colors bg-white rounded-full shadow-sm border border-slate-100 hover:shadow-md">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
        </button>

        <div className="h-10 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 text-white flex items-center justify-center shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
            <span className="text-[11px] font-medium text-blue-600 capitalize mt-1 tracking-wide">{user.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
