import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  className?: string
}

export function LogoutButton({ variant = 'ghost', size = 'default', showIcon = true, className = '' }: LogoutButtonProps) {
  const { logout, status, isAuthenticated } = useAuth()

  const handleLogout = async () => { await logout() }

  if (!isAuthenticated) return null

  return (
    <Button variant={variant} size={size} onClick={handleLogout} disabled={status === 'loading'} className={className}>
      {showIcon && <LogOut className="h-4 w-4 mr-2" />}
      {status === 'loading' ? 'Signing out...' : 'Sign Out'}
    </Button>
  )
}
