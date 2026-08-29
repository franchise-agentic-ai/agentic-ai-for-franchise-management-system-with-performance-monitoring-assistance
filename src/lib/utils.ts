import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number) {
  return new Intl.NumberFormat('en-IN').format(amount);
}

export function getHealthScoreColor(score: number) {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-red-600 bg-red-50 border-red-200';
}
