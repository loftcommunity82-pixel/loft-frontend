import { Link } from 'react-router-dom'
import { Book, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from '@/components/NotificationCenter'
import ContactSupportModal from '@/components/modals/ContactSupportModal'
import { useAuth } from '@/providers/AuthProvider'

export default function Infobar() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-row justify-end gap-6 items-center px-4 py-4 w-full bg-background">
      <ContactSupportModal />
      <Link to="/guide">
        <Book className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
      </Link>
      <NotificationCenter />
      {user && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:inline max-w-[120px] truncate">
            {user.name || user.email}
          </span>
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
