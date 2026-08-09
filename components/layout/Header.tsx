'use client';

import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && (
            <p className="text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
