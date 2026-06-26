import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

interface EmailVerificationBannerProps {
  email?: string
  onDismiss?: () => void
}

export function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mx-4 sm:mx-6 mt-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Verify your email address</p>
          <p className="text-xs text-muted-foreground mt-1">
            {email ? `We sent a verification link to ${email}. Please check your inbox.` : 'Please verify your email address to access all features.'}
          </p>
        </div>
        <button onClick={() => { setDismissed(true); onDismiss?.() }} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
