'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Search, Clock, MessageCircle, Settings } from 'lucide-react';

const menuItems = [
  {
    href: '/search-lead',
    label: 'Search',
    icon: Search,
  },
  {
    href: '/history',
    label: 'History',
    icon: Clock,
  },
  {
    href: '/connector',
    label: 'WhatsApp',
    icon: MessageCircle,
  },
  {
    href: '/integration',
    label: 'API',
    icon: Settings,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 py-2 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('w-6 h-6', isActive ? 'scale-110' : '')} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
