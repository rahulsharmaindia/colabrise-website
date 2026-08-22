import { Settings } from 'lucide-react'
import { EmptyState } from '../components/ui'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure your workspace and preferences.</p>
      </div>

      <EmptyState
        icon={<Settings className="w-10 h-10" />}
        title="Coming soon"
        description="Account settings, team management, and API keys will live here."
      />
    </div>
  )
}
