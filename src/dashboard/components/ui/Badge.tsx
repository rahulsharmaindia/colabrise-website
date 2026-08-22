import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface DashBadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-gray-300',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  error: 'bg-red-500/15 text-red-400',
  info: 'bg-cyan-500/15 text-cyan-400',
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
