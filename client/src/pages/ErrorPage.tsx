import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorPageProps {
  error?: Error
  reset?: () => void
}

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-8">
          {_error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <Button onClick={reset || (() => window.location.reload())} className="bg-emerald-600 hover:bg-emerald-700">
          Try Again
        </Button>
      </div>
    </div>
  )
}
