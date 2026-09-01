'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownProps {
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  width?: string;
}

export function Dropdown({ trigger, children, width = 'w-48' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScroll = (e: Event) => {
      // Don't close if scrolling inside the dropdown itself
      if ((e.target as HTMLElement)?.closest?.('.dropdown-content')) return;
      setIsOpen(false);
    };
    
    // Use capture phase to catch scroll events on any element
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} className="inline-block relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && mounted && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div 
            className={`dropdown-content absolute z-50 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 ${width}`}
            style={{ 
              top: `${coords.top}px`, 
              left: `${coords.left}px`,
              transform: 'translateX(-100%)' // Align right edge with the trigger's right edge
            }}
          >
            {children(() => setIsOpen(false))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
