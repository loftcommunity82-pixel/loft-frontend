import { Link } from 'react-router-dom'
import { Twitter, Linkedin, Github, Instagram } from 'lucide-react'
import { LogoWithText } from '@/components/ui/logo'

const footerLinks = {
  seekers: [
    { href: '/jobs', label: 'Browse Jobs' },
    { href: '/profile', label: 'My Profile' },
    { href: '/applications', label: 'My Applications' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  employers: [
    { href: '/employer/dashboard', label: 'Employer Dashboard' },
    { href: '/jobs/create', label: 'Post a Job' },
    { href: '/hiring-workflow', label: 'Hiring Pipeline' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.05] bg-neutral-950">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="space-y-4">
            <LogoWithText />
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your trusted platform for finding your dream job and connecting with top employers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-emerald-600/20 text-neutral-400 hover:text-emerald-400 flex items-center justify-center transition-all duration-200 min-w-[44px] min-h-[44px]"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-white">For Job Seekers</h3>
            <ul className="space-y-2.5">
              {footerLinks.seekers.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors py-1 block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-white">For Employers</h3>
            <ul className="space-y-2.5">
              {footerLinks.employers.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors py-1 block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-white">Support</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-emerald-400 transition-colors py-1 block">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.05] mt-10 md:mt-14 pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} LoftCommunity. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link to="/privacy" className="text-xs sm:text-sm text-neutral-500 hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link to="/terms" className="text-xs sm:text-sm text-neutral-500 hover:text-emerald-400 transition-colors">Terms</Link>
            <Link to="/cookies" className="text-xs sm:text-sm text-neutral-500 hover:text-emerald-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
