'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  onRowClick?: (item: T) => void;
  rowKey?: (item: T) => string;
}

export default function Table<T>({
  columns,
  data,
  emptyMessage = 'Tidak ada data',
  className,
  onRowClick,
  rowKey,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  const getRowKey = (item: T, index: number): string => {
    if (rowKey) return rowKey(item);
    return String(index);
  };

  const getCellValue = (item: T, key: string): ReactNode => {
    const value = (item as Record<string, unknown>)[key];
    return value !== undefined ? String(value) : '';
  };

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-slate-200', className)}>
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left font-semibold text-slate-700',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((item, index) => (
            <tr
              key={getRowKey(item, index)}
              className={cn(
                'hover:bg-slate-50 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn('px-4 py-3 text-slate-600', column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : getCellValue(item, column.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
