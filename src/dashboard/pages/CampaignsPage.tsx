import { useUserRole } from '../hooks/useUserRole'
import { BrandCampaignsPage } from './brand/BrandCampaignsPage'
import { CreatorCampaignsPage } from './creator/CreatorCampaignsPage'

export function CampaignsPage() {
  const role = useUserRole()

  if (role === 'creator') return <CreatorCampaignsPage />
  return <BrandCampaignsPage />
}
