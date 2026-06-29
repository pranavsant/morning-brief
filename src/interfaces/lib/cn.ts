/**
 * cn — className merge helper (clsx + tailwind-merge).
 *
 * Layer: interfaces.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
