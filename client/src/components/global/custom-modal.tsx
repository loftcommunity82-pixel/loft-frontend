import { Dialog, DialogContent } from '@/components/ui/dialog'

interface CustomModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function CustomModal({ isOpen, onClose, children, className = '' }: CustomModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${className}`}>
        {children}
      </DialogContent>
    </Dialog>
  )
}
