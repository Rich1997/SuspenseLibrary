import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (num < 1000) return num.toString();
  if (num < 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num < 1000000) return Math.floor(num / 1000) + 'K';
  if (num < 10000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  return Math.floor(num / 1000000) + 'M';
}

export function formatFullNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}
