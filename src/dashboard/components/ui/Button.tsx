import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface DashButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/20',
  secondary: 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

export function DashButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: DashButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
