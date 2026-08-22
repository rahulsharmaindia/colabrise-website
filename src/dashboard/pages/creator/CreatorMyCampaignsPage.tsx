import { useEffect, useState, useCallback } from 'react'
import { Compass, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { DashCard, DashButton, DashBadge, EmptyState } from '../../components/ui'
import { apiClient } from '../../../lib/api-client'
import { getErrorMessage } from '../../../lib/api-client'

interface MyCampaign {
  campaignId: string
  title: string
  status: string
  brandName?: string | null
  applicationStatus?: string | null
  startDate?: string | null
  endDate?: string | null
}

const appStatusVariant: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  withdrawn: 'default',
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function CreatorMyCampaignsPage() {
  const [campaigns, setCampaigns] = useState<MyCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/api/my-campaigns')
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyCampaigns()
  }, [fetchMyCampaigns])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-white">My Campaigns</h1>
        <DashCard>
          <p className="text-red-400 text-sm">{error}</p>
          <DashButton className="mt-4" size="sm" onClick={fetchMyCampaigns}>
            Retry
          </DashButton>
        </DashCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">Campaigns you've applied to or are collaborating on.</p>
        </div>
        <DashButton variant="ghost" size="sm" onClick={fetchMyCampaigns}>
          <RefreshCw className="w-4 h-4" />
        </DashButton>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Compass className="w-10 h-10" />}
          title="No campaigns yet"
          description="Apply to campaigns from the Discover page to see them here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((campaign) => (
            <DashCard key={campaign.campaignId} className="flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white truncate">{campaign.title}</h3>
                  {campaign.brandName && (
                    <p className="text-xs text-gray-500 mt-0.5">by {campaign.brandName}</p>
                  )}
                </div>
                {campaign.applicationStatus && (
                  <DashBadge variant={appStatusVariant[campaign.applicationStatus] ?? 'default'}>
                    {campaign.applicationStatus}
                  </DashBadge>
                )}
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(campaign.startDate)}
                </span>
                <span className="ml-auto">
                  <DashBadge variant={campaign.status === 'active' ? 'success' : 'default'}>
                    {campaign.status}
                  </DashBadge>
                </span>
              </div>
            </DashCard>
          ))}
        </div>
      )}
    </div>
  )
}
