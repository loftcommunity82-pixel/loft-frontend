'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MenuIcon, X, HelpCircle } from 'lucide-react'
import { useAuthContext } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { LogoWithText } from './logo'
import ContactSupportModal from '../ContactSupportModal'

export default function Navbar() {
  const { user, status, logout } = useAuthContext()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  return (
    <header className="fixed right-0 left-0 top-0 py-4 px-4 bg-black/40 backdrop-blur-lg z-[100] flex items-center border-b-[1px] border justify-between">
      <aside className="flex items-center gap-[2px] ml-0 sm:ml-8">
        <LogoWithText />
      </aside>
      <nav className="absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%] hidden md:block">
        <ul className="flex items-center gap-4 list-none">
          <li>
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">Jobs</Link>
          </li>
          <li>
            <Link href="/employer/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Employers</Link>
          </li>
          <li>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
          </li>
          <li>
            <ContactSupportModal />
          </li>
        </ul>
      </nav>
      <aside className="flex items-center gap-4">
        {!isLoading && (
          <>
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href={user?.role === 'employer' ? "/employer/dashboard" : "/dashboard"}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => logout()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link
                  href="/sign-up"
                  className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#34D399_0%,#059669_50%,#34D399_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Get Started
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 top-[65px] z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <nav className="fixed right-0 top-[65px] bottom-0 w-64 bg-background border-l border p-6 animate-in slide-in-from-right">
            <ul className="flex flex-col gap-4">
              <li>
                <Link href="/jobs" className="block text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>Jobs</Link>
              </li>
              <li>
                <Link href="/employer/dashboard" className="block text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>Employers</Link>
              </li>
              <li>
                <Link href="/dashboard" className="block text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li className="border-t border pt-4 mt-4">
                    <span className="text-sm text-muted-foreground block mb-2">{user?.name || user?.email}</span>
                  </li>
                  <li>
                    <Button variant="outline" className="w-full" onClick={() => logout()}>Sign Out</Button>
                  </li>
                </>
              ) : (
                <>
                  <li className="border-t border pt-4 mt-4">
                    <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full">Sign In</Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-emerald-500 hover:bg-emerald-600">Get Started</Button>
                    </Link>
                  </li>
                </>
              )}
              <li className="border-t border pt-4 mt-4">
                <ContactSupportModal />
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
