'use client';

import { Menu } from 'lucide-react';
import { useSidebarStore } from '@/lib/store/useSidebarStore';

export function MobileMenuButton() {
  const toggle = useSidebarStore((state) => state.toggle);
  
  return (
    <button onClick={toggle} className="md:hidden p-2 -ml-2 text-slate-600 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100">
      <Menu className="w-6 h-6" />
    </button>
  );
}
