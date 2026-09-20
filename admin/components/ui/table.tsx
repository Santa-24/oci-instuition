import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  padding?: 'normal' | 'compact' | string;
}

export function Table({ className, children, padding, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
      <table
        className={cn(
          'w-full caption-bottom text-xs',
          padding === 'compact' && '[&_td]:py-2.5 [&_td]:px-3 [&_th]:py-2 [&_th]:px-3',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-canvas-subtle/80 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground select-none',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn('divide-y divide-border/70', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-canvas-subtle/60 data-[state=selected]:bg-canvas-subtle',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className, children, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-10 px-4 text-left align-middle font-bold text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0 text-foreground', className)}
      {...props}
    >
      {children}
    </td>
  );
}
