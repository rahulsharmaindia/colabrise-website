import { Route } from 'react-router-dom'
import { DashboardShell } from './components/layout'
import { AuthGuard } from './components/AuthGuard'
import {
  OverviewPage,
  BrandsPage,
  CampaignsPage,
  CreatorsPage,
  SettingsPage,
  CreatorMyCampaignsPage,
} from './pages'

/**
 * All dashboard routes, wrapped in AuthGuard + DashboardShell layout.
 * Unauthenticated users are redirected to /brands/register.
 *
 * Role-based page rendering is handled inside each page component
 * (e.g. OverviewPage renders BrandOverviewPage or CreatorOverviewPage
 * based on useUserRole()). Routes stay the same for both roles — the
 * nav config simply hides irrelevant links per role.
 */
export function DashboardRoutes() {
  return (
    <Route
      path="/dashboard"
      element={
        <AuthGuard>
          <DashboardShell />
        </AuthGuard>
      }
    >
      <Route index element={<OverviewPage />} />
      <Route path="brands" element={<BrandsPage />} />
      <Route path="campaigns" element={<CampaignsPage />} />
      <Route path="campaigns/:campaignId" element={<CampaignsPage />} />
      <Route path="creators" element={<CreatorsPage />} />
      <Route path="my-campaigns" element={<CreatorMyCampaignsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  )
}
