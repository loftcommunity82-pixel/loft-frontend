import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Sidebar from './Sidebar'
import Infobar from './Infobar'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export default function DashboardShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const reduced = useReducedMotion()

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      <Sidebar />
      <Sidebar mobile isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-4 py-0 border-b border-white/10 shrink-0 bg-background">
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="text-foreground"
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
          </div>
          <Infobar />
        </header>
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
