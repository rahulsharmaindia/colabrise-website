import type { ReactNode } from 'react'

interface DashCardProps {
  children: ReactNode
  className?: string
}

export function DashCard({ children, className = '' }: DashCardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-dark-800 p-5 ${className}`}
    >
      {children}
    </div>
  )
}

interface DashCardHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function DashCardHeader({ title, description, action }: DashCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 px-5 pt-5">
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  )
}
