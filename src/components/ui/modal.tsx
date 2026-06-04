import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'

export interface ModalProps {
  children?: React.ReactNode
  title: string
  description?: string
  isOpen: boolean
  onClose: (open?: boolean) => void
  onSubmit?: () => void
  submitText?: string
  cancelText?: string
  showFooter?: boolean
  submitVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
  disabled?: boolean
}

const Modal = ({
  children,
  title,
  description,
  isOpen,
  onClose,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  showFooter = true,
  submitVariant = "default",
  className = '',
  disabled = false
}: ModalProps) => {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !disabled && onClose()}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        {showFooter && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onClose()}
              disabled={disabled}
            >
              {cancelText}
            </Button>
            {onSubmit && (
              <Button
                variant={submitVariant}
                onClick={handleSubmit}
                disabled={disabled}
              >
                {submitText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Modal