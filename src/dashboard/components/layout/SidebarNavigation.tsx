import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { getNavConfig, type NavSection } from '../../lib/nav-config'
import { useUserRole } from '../../hooks/useUserRole'
import type { ReactNode } from 'react'

interface SidebarNavigationProps {
  open: boolean
  onClose: () => void
  headerSlot?: ReactNode
  footerSlot?: ReactNode
}

function NavSectionGroup({ section }: { section: NavSection }) {
  return (
    <div>
      {section.title && (
        <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {section.title}
        </p>
      )}
      <ul className="space-y-0.5">
        {section.items.map((item) => (
          <li key={item.href}>
            <NavLink
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SidebarNavigation({ open, onClose, headerSlot, footerSlot }: SidebarNavigationProps) {
  const role = useUserRole()
  const navSections = getNavConfig(role)

  const content = (
    <div className="flex flex-col h-full">
      {/* Header — Colabrise logo */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-white/5">
        {headerSlot ?? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500" />
            <span className="text-gray-900 dark:text-white font-semibold text-sm">Colabrise</span>
          </div>
        )}
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, i) => (
          <NavSectionGroup key={i} section={section} />
        ))}
      </nav>

      {/* Footer slot */}
      {footerSlot && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-white/5">{footerSlot}</div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-dark-800">
        {content}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="relative w-64 h-full bg-white dark:bg-dark-800 shadow-xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
