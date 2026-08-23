import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface DashBadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300',
  success: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400',
  error: 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400',
  info: 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400',
}

export function DashBadge({ variant = 'default', children }: DashBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
