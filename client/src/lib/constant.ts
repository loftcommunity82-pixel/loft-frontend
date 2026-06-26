import { LayoutDashboard, Briefcase, MessageSquare, Settings, Users, Building2, type LucideIcon } from 'lucide-react'

export type MenuItem = {
  name: string
  icon: LucideIcon
  href: string
}

export const menuOptions: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Jobs', icon: Briefcase, href: '/jobs' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export const employerMenuOptions: MenuItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/employer/dashboard' },
  { name: 'My Jobs', icon: Briefcase, href: '/employer/dashboard' },
  { name: 'Candidates', icon: Users, href: '/hiring-workflow' },
  { name: 'Messages', icon: MessageSquare, href: '/messages' },
  { name: 'Company', icon: Building2, href: '/employer/company' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]
