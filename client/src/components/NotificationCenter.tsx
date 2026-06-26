import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/lib/api-hooks'

const typeIcons: Record<string, string> = {
  APPLICATION_RECEIVED: '\uD83D\uDCCB',
  APPLICATION_SHORTLISTED: '\u2B50',
  APPLICATION_REJECTED: '\u274C',
  JOB_RECOMMENDED: '\uD83D\uDCBC',
  JOB_EXPIRED: '\u23F0',
  PROFILE_VIEWED: '\uD83D\uDC41\u200D\uD83D\uDDE8',
  MESSAGE: '\uD83D\uDCAC',
  ENGLISH_TEST_INVITE: '\uD83D\uDCDD',
  INTERVIEW_SCHEDULED: '\uD83D\uDCC5',
}

export function NotificationCenter() {
  const navigate = useNavigate()
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-[500px] flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-foreground font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-emerald-400 text-xs" onClick={markAllRead}>
                  <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-emerald-500/5' : ''}`}
                      onClick={() => { markRead([n.id]); if (n.link) navigate(n.link) }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">{typeIcons[n.type] || '\uD83D\uDD14'}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!n.isRead ? 'text-foreground font-medium' : 'text-foreground/80'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-neutral-600 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
