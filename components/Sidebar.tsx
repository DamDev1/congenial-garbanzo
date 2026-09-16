'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/lib/store/useSidebarStore';
import { Home, Users, Store, Package, ArrowRightLeft, LogOut, UserSquare, Receipt, X, Banknote } from 'lucide-react';

const ownerNavItems = [
  { href: '/owner', label: 'Dashboard', icon: Home },
  { href: '/owner/branches', label: 'Branches', icon: Store },
  { href: '/owner/users', label: 'Users', icon: Users },
  { href: '/owner/products', label: 'Products', icon: Package },
  { href: '/owner/sales', label: 'Sales History', icon: Receipt },
  { href: '/owner/customers', label: 'Customers', icon: UserSquare },
  { href: '/owner/expenses', label: 'Expenses', icon: Banknote },
  // { href: '/owner/transfers', label: 'Transfers', icon: ArrowRightLeft },
];

const managerNavItems = [
  { href: '/manager', label: 'Dashboard', icon: Home },
  { href: '/manager/inventory', label: 'Inventory', icon: Package },
  { href: '/manager/sales', label: 'Sales History', icon: Receipt },
  // { href: '/manager/transfers', label: 'Transfers', icon: ArrowRightLeft },
  { href: '/manager/users', label: 'Staff', icon: Users },
  { href: '/manager/customers', label: 'Customers', icon: UserSquare },
  { href: '/manager/expenses', label: 'Expenses', icon: Banknote },
];

const cashierNavItems = [
  { href: '/cashier', label: 'Dashboard', icon: Home },
  { href: '/cashier/checkout', label: 'Checkout', icon: Store },
  { href: '/cashier/sales', label: 'Sales History', icon: Package },
  { href: '/cashier/customers', label: 'Customers', icon: UserSquare },
  { href: '/cashier/expenses', label: 'Expenses', icon: Banknote },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  useEffect(() => {
    close();
  }, [pathname, close]);

  let navItems = cashierNavItems;
  if (userRole === 'owner') navItems = ownerNavItems;
  if (userRole === 'manager') navItems = managerNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={close}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-slate-950 text-slate-100 flex flex-col 
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:m-4 md:rounded-3xl shadow-2xl overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Add mobile close button */}
        <button onClick={close} className="md:hidden absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50">
          <X className="w-5 h-5" />
        </button>
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="h-24 flex items-center px-8 relative z-10">
        <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 drop-shadow-sm">
         De-Luv Investment
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 relative z-10">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">
          Menu
        </div>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isDashboardRoot = item.href === '/owner' || item.href === '/manager' || item.href === '/cashier';
            const isActive = isDashboardRoot
              ? pathname === item.href
              : (pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white shadow-sm ring-1 ring-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-400' : ''}`} />
                  <span className="font-medium text-[15px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 relative z-10">
        <div className="bg-slate-800/40 rounded-2xl p-1 backdrop-blur-sm border border-slate-700/50">
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Sign Out</span>
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
