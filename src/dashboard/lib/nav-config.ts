import { Building2, Megaphone, LayoutDashboard, Users, Settings, Compass, type LucideIcon } from 'lucide-react'
import type { UserRole } from '../hooks/useUserRole'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

// ── Brand navigation ─────────────────────────────────────────
const brandNav: NavSection[] = [
  {
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Manage',
    items: [
      { label: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
      { label: 'Creators', href: '/dashboard/creators', icon: Users },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

// ── Creator navigation ───────────────────────────────────────
const creatorNav: NavSection[] = [
  {
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Discover',
    items: [
      { label: 'Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
      { label: 'Brands', href: '/dashboard/brands', icon: Building2 },
    ],
  },
  {
    title: 'My Stuff',
    items: [
      { label: 'My Campaigns', href: '/dashboard/my-campaigns', icon: Compass },
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

/**
 * Returns the sidebar nav config for the given user role.
 * Falls back to brand nav for unknown roles.
 */
export function getNavConfig(role: UserRole): NavSection[] {
  switch (role) {
    case 'creator':
      return creatorNav
    case 'brand':
    default:
      return brandNav
  }
}
