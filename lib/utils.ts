import { type ClassValue, clsx } from 'clsx';

// Simple cn utility without tailwind-merge for simplicity
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  if (phone.startsWith('+')) {
    return phone;
  }
  return `+${phone}`;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format time for display
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format datetime for display
export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

// Calculate duration between two dates
export function calculateDuration(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// Calculate progress percentage
export function calculateProgress(valid: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((valid / target) * 100), 100);
}

// Get status color class
export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
    case 'VALID':
    case 'CONNECTED':
      return 'bg-green-100 text-green-700';
    case 'SEARCHING':
    case 'VALIDATING':
    case 'CONNECTING':
      return 'bg-blue-100 text-blue-700';
    case 'QUEUED':
    case 'PENDING':
      return 'bg-amber-100 text-amber-700';
    case 'FAILED':
    case 'INVALID':
    case 'ERROR':
    case 'DISCONNECTED':
      return 'bg-red-100 text-red-700';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

// Get status icon
export function getStatusIcon(status: string): string {
  switch (status) {
    case 'COMPLETED':
    case 'VALID':
    case 'CONNECTED':
      return '✓';
    case 'SEARCHING':
    case 'VALIDATING':
    case 'CONNECTING':
      return '↻';
    case 'QUEUED':
    case 'PENDING':
      return '⏳';
    case 'FAILED':
    case 'INVALID':
    case 'ERROR':
    case 'DISCONNECTED':
      return '✗';
    case 'CANCELLED':
      return '⊘';
    default:
      return '•';
  }
}
