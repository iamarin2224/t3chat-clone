import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { PanelLeft } from 'lucide-react'
import React from 'react'

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

const Header = ({ onToggleSidebar, isSidebarOpen }: HeaderProps) => {
  return (
     <div className="flex h-12 w-full flex-row justify-between items-center border-b border-border bg-sidebar px-4 py-2">
        {!isSidebarOpen ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar} 
            className="h-8 w-8 hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Open Sidebar</span>
          </Button>
        ) : (
          <div />
        )}
        <ModeToggle/>
     </div>
  )
}

export default Header