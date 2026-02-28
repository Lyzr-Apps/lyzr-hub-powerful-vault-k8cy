'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  HiOutlineCreditCard,
  HiOutlineChartBarSquare,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
  HiOutlineBars3,
  HiOutlineXMark,
} from 'react-icons/hi2'

export type NavSection = 'dashboard' | 'analytics' | 'accounts' | 'settings'

interface SidebarProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  alertCount: number
  collapsed: boolean
  onToggleCollapse: () => void
}

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <HiOutlineCreditCard className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <HiOutlineChartBarSquare className="h-4 w-4" /> },
  { id: 'accounts', label: 'Accounts', icon: <HiOutlineUserGroup className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <HiOutlineCog6Tooth className="h-4 w-4" /> },
]

export default function Sidebar({ activeSection, onNavigate, alertCount, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen bg-[hsl(220,14%,95%)] border-r border-[hsl(220,15%,88%)] flex flex-col transition-all duration-200',
        collapsed ? 'w-14' : 'w-52'
      )}
    >
      <div className={cn('flex items-center gap-2 px-3 py-3', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-sm bg-[hsl(220,75%,50%)] flex items-center justify-center flex-shrink-0">
              <HiOutlineCreditCard className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <span className="font-sans font-semibold text-sm tracking-tight text-[hsl(220,20%,15%)] truncate block leading-tight">Architect</span>
              <span className="text-[9px] text-[hsl(220,12%,50%)] tracking-tight leading-none">by Lyzr</span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 flex-shrink-0"
          onClick={onToggleCollapse}
        >
          {collapsed ? <HiOutlineBars3 className="h-4 w-4" /> : <HiOutlineXMark className="h-4 w-4" />}
        </Button>
      </div>
      <Separator className="bg-[hsl(220,15%,88%)]" />
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs font-medium tracking-tight transition-colors',
              activeSection === item.id
                ? 'bg-[hsl(220,75%,50%)] text-white'
                : 'text-[hsl(220,12%,50%)] hover:bg-[hsl(220,12%,92%)] hover:text-[hsl(220,20%,15%)]'
            )}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.id === 'dashboard' && alertCount > 0 && (
              <Badge variant="destructive" className="ml-auto text-[10px] h-4 px-1 rounded-sm">
                {alertCount}
              </Badge>
            )}
          </button>
        ))}
      </nav>
      {!collapsed && (
        <div className="px-3 py-2 border-t border-[hsl(220,15%,88%)]">
          <p className="text-[10px] text-[hsl(220,12%,50%)] tracking-tight leading-tight">Architect Credit Hub</p>
          <p className="text-[10px] text-[hsl(220,10%,70%)] tracking-tight">Powered by Lyzr</p>
        </div>
      )}
    </aside>
  )
}
