import { useState, type ReactNode } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { SidebarNavigation } from './SidebarNavigation'
import { TopBar } from './TopBar'
import { clearAllSessions } from '../../../lib/session'
import { SearchFilterContext } from '../../hooks/useSearchFilter'

interface DashboardShellProps {
  children?: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSignOut = () => {
    clearAllSessions()
    navigate('/', { replace: true })
  }

  const signOutButton = (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      <LogOut className="w-[18px] h-[18px] shrink-0" />
      Sign out
    </button>
  )

  return (
    <SearchFilterContext.Provider value={{ query: searchQuery, setQuery: setSearchQuery }}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white font-sans">
        <SidebarNavigation
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          footerSlot={signOutButton}
        />

        <div className="lg:pl-60 flex flex-col min-h-screen">
          <TopBar
            onMenuToggle={() => setSidebarOpen(true)}
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="flex-1 p-4 lg:p-6">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SearchFilterContext.Provider>
  )
}
