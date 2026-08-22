import { useUserRole } from '../hooks/useUserRole'
import { BrandOverviewPage } from './brand/BrandOverviewPage'
import { CreatorOverviewPage } from './creator/CreatorOverviewPage'

export function OverviewPage() {
  const role = useUserRole()

  if (role === 'creator') return <CreatorOverviewPage />
  return <BrandOverviewPage />
}
