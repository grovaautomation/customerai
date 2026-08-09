import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status Badge with dot indicator
interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const getVariant = (): BadgeProps['variant'] => {
    switch (status) {
      case 'COMPLETED':
      case 'VALID':
      case 'CONNECTED':
        return 'success';
      case 'SEARCHING':
      case 'VALIDATING':
      case 'CONNECTING':
        return 'info';
      case 'QUEUED':
      case 'PENDING':
        return 'warning';
      case 'FAILED':
      case 'INVALID':
      case 'ERROR':
      case 'DISCONNECTED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'COMPLETED':
      case 'VALID':
      case 'CONNECTED':
        return 'bg-green-500';
      case 'SEARCHING':
      case 'VALIDATING':
      case 'CONNECTING':
        return 'bg-blue-500 animate-pulse';
      case 'QUEUED':
      case 'PENDING':
        return 'bg-amber-500';
      case 'FAILED':
      case 'INVALID':
      case 'ERROR':
      case 'DISCONNECTED':
        return 'bg-red-500';
      case 'CANCELLED':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Badge variant={getVariant()} size={size}>
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full inline-block', getDotColor())} />
      {label || status}
    </Badge>
  );
}
