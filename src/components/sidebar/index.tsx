'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuthContext } from '@/providers/auth-provider'
import { menuOptions, employerMenuOptions } from '@/lib/constant'
import clsx from 'clsx'
import { X, Bell, Shield } from 'lucide-react'
import { Logo, LogoWithText } from '../global/logo'

type Props = {
  isOpen?: boolean
  onClose?: () => void
  mobile?: boolean
}

const adminLinks = [
  { name: 'Dashboard', icon: Shield, href: '/admin' },
  { name: 'Applications', icon: Shield, href: '/admin/applications' },
  { name: 'Employers', icon: Shield, href: '/admin/employers' },
  { name: 'Settings', icon: Shield, href: '/admin/settings' },
]

const MenuOptions = ({ isOpen, onClose, mobile }: Props) => {
  const pathName = usePathname()
  const { user } = useAuthContext()
  const isEmployer = user?.role === 'employer'
  const [isAdmin, setIsAdmin] = useState(false)
  const options = isEmployer ? employerMenuOptions : menuOptions

  useEffect(() => {
    if (isAdmin) return
    fetch('/api/admin/analytics')
      .then(r => r.ok && setIsAdmin(true))
      .catch(() => {})
  }, [isAdmin])

  const isActive = (href: string) => {
    const path = href.split('?')[0]
    if (path === '/employer/dashboard') {
      return pathName === '/employer/dashboard'
    }
    return pathName === path
  }

  const isAdminPath = pathName.startsWith('/admin')

  const content = (
    <nav className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0">
        <Logo variant="icon" width={28} height={28} />
        <span className="font-semibold text-white text-sm">LoftCommunity</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {isAdmin && isAdminPath && (
          <>
            <p className="text-xs font-medium text-emerald-400 px-3 pb-1 uppercase tracking-wider">Admin</p>
            {adminLinks.map((menuItem) => {
              const Icon = menuItem.icon
              const active = isActive(menuItem.href)
              return (
                <Link
                  key={menuItem.name}
                  href={menuItem.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{menuItem.name}</span>
                </Link>
              )
            })}
            <div className="border-t border-white/10 my-2" />
          </>
        )}
        {options.map((menuItem) => {
          const Icon = menuItem.icon
          const active = isActive(menuItem.href)
          return (
            <Link
              key={menuItem.name}
              href={menuItem.href}
              onClick={onClose}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{menuItem.name}</span>
            </Link>
          )
        })}
      </div>

      <div className="border-t border-white/10 p-3 shrink-0 space-y-1">
        {isAdmin && !isAdminPath && (
          <Link
            href="/admin"
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Shield className="h-5 w-5 shrink-0" />
            <span>Admin</span>
          </Link>
        )}
        <Link
          href="/notifications"
          onClick={onClose}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive('/notifications')
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Bell className="h-5 w-5 shrink-0" />
          <span>Notifications</span>
        </Link>
      </div>
    </nav>
  )

  if (mobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/60" onClick={onClose} />
            <div className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-background border-r border shadow-2xl animate-in slide-in-from-left flex flex-col">
              <div className="flex items-center justify-between px-4 h-16 border-b border shrink-0">
                <Link href="/" onClick={onClose}>
                  <LogoWithText />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {isAdmin && (
                  <>
                    <p className="text-xs font-medium text-emerald-400 px-3 pb-1 uppercase tracking-wider">
                      Admin
                    </p>
                    {adminLinks.map((menuItem) => {
                      const Icon = menuItem.icon
                      const active = isActive(menuItem.href)
                      return (
                        <Link
                          key={menuItem.name}
                          href={menuItem.href}
                          onClick={onClose}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            active
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span>{menuItem.name}</span>
                        </Link>
                      )
                    })}
                    <div className="border-t border-white/10 my-2" />
                  </>
                )}
                <p className="text-xs font-medium text-muted-foreground px-3 pb-2 uppercase tracking-wider">
                  {isEmployer ? 'Employer' : 'Menu'}
                </p>
                {options.map((menuItem) => {
                  const Icon = menuItem.icon
                  const active = isActive(menuItem.href)
                  return (
                    <Link
                      key={menuItem.name}
                      href={menuItem.href}
                      onClick={onClose}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{menuItem.name}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t border p-3 shrink-0 space-y-1">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  href="/notifications"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return <div className="hidden md:flex w-56 shrink-0 border-r border-white/10 bg-background">{content}</div>
}

export default MenuOptions
