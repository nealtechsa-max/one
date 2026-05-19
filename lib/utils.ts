import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInMinutes } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a')
}

export function calcHours(start: Date | string, end: Date | string): number {
  const mins = differenceInMinutes(new Date(end), new Date(start))
  return Math.round((mins / 60) * 4) / 4 // round to nearest 0.25
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-green-100 text-green-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    UNPAID: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
