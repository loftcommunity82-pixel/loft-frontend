import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
        <p className="text-muted-foreground text-sm mt-4">Loading...</p>
      </div>
    </div>
  )
}
