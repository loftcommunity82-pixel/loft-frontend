'use client'

import Link from 'next/link'
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react'
import { LogoWithText } from './logo'
import ContactSupportModal from '../ContactSupportModal'

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <LogoWithText />
            </Link>
            <p className="text-muted-foreground text-sm">
              Your trusted platform for finding your dream job and connecting with top employers.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-muted-foreground hover:text-emerald-400 text-sm">Browse Jobs</Link></li>
              <li><Link href="/profile" className="text-muted-foreground hover:text-emerald-400 text-sm">My Profile</Link></li>
              <li><Link href="/applications" className="text-muted-foreground hover:text-emerald-400 text-sm">My Applications</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-emerald-400 text-sm">Dashboard</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Employers</h3>
            <ul className="space-y-2">
              <li><Link href="/employer/dashboard" className="text-muted-foreground hover:text-emerald-400 text-sm">Employer Dashboard</Link></li>
              <li><Link href="/jobs/create" className="text-muted-foreground hover:text-emerald-400 text-sm">Post a Job</Link></li>
              <li><Link href="/hiring-workflow" className="text-muted-foreground hover:text-emerald-400 text-sm">Hiring Pipeline</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <ContactSupportModal />
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground hover:text-emerald-400 text-sm">Settings</Link>
              </li>
              <li>
                <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'}`} className="text-muted-foreground hover:text-emerald-400 text-sm">
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} LoftCommunity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
