'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CustomDatePicker } from './ui/CustomDatePicker';

export default function DashboardDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDateChange = (selectedDate: Date) => {
    // Need to adjust for local timezone offset when getting YYYY-MM-DD
    const tzOffset = selectedDate.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(selectedDate.getTime() - tzOffset)).toISOString().slice(0, 10);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', localISOTime);
    router.push(`?${params.toString()}`);
  };

  if (!mounted) return null;

  return (
    <div className="relative z-20">
      <CustomDatePicker
        value={new Date(date)}
        onChange={handleDateChange}
        maxDate={new Date()}
        className="w-48"
      />
    </div>
  );
}
