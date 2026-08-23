import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BrandRegisterPage from './pages/BrandRegisterPage'
import InfluencerRegisterPage from './pages/InfluencerRegisterPage'
import CampaignSharePage from './pages/CampaignSharePage'
import NotFoundPage from './pages/NotFoundPage'
import { DashboardRoutes } from './dashboard/routes'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/brands/register" element={<BrandRegisterPage />} />
      <Route path="/creators/register" element={<InfluencerRegisterPage />} />
      <Route path="/campaigns/:campaignId" element={<CampaignSharePage />} />
      {DashboardRoutes()}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
