import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("bg-white shadow-sm ring-1 ring-slate-200 rounded-lg overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <h3 className={cn("text-base font-semibold leading-6 text-slate-900", className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}
