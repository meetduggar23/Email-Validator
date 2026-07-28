import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return 'text-success-500'
  if (score >= 50) return 'text-warning-500'
  return 'text-danger-500'
}

export function getConfidenceBg(score: number): string {
  if (score >= 80) return 'bg-success-500'
  if (score >= 50) return 'bg-warning-500'
  return 'bg-danger-500'
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}
