import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials } from '@/lib/utils'
import { Menu, Search, Bell, Moon, Sun, LogOut, User, Settings, ChevronRight } from 'lucide-react'

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Dashboard' },
  '/validate': { title: 'Validate Email', breadcrumb: 'Validate' },
  '/bulk': { title: 'Bulk Validate', breadcrumb: 'Bulk Validate' },
  '/reports': { title: 'Reports', breadcrumb: 'Reports' },
  '/history': { title: 'History', breadcrumb: 'History' },
  '/favorites': { title: 'Favorites', breadcrumb: 'Favorites' },
  '/collections': { title: 'Collections', breadcrumb: 'Collections' },
  '/api-playground': { title: 'API Playground', breadcrumb: 'API Playground' },
  '/settings': { title: 'Settings', breadcrumb: 'Settings' },
}

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const pageInfo = pageTitles[location.pathname] || { title: 'Dashboard', breadcrumb: 'Dashboard' }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="h-16 border-b border-[#E5E7EB] dark:border-white/10 bg-white/80 dark:bg-[#0F0F11]/80 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-[#6B7280] hover:text-[#111827] dark:hover:text-white p-2 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] dark:text-[#6B7280]">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#6B7280] dark:text-[#9CA3AF] font-medium">{pageInfo.breadcrumb}</span>
            </div>
            <h1 className="text-lg font-semibold text-[#111827] dark:text-white -mt-0.5">{pageInfo.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] dark:text-[#6B7280]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search emails..."
              className="w-[200px] lg:w-[240px] h-9 pl-9 pr-3 text-sm rounded-xl border-[#E5E7EB] dark:border-white/10 bg-[#F8FAFC] dark:bg-white/5 text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-[#6B7280] focus-visible:border-[#5B5CEB] focus-visible:ring-0"
            />
          </div>

          <button className="relative p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#5B5CEB] ring-2 ring-white dark:ring-[#0F0F11]" />
          </button>

          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="outline-none ml-1">
                  <Avatar className="cursor-pointer w-8 h-8 ring-2 ring-[#5B5CEB]/20 hover:ring-[#5B5CEB]/40 transition-all">
                    <AvatarFallback className="bg-[#5B5CEB]/10 text-[#5B5CEB] dark:text-[#818CF8] text-xs font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#E5E7EB] dark:border-white/10 shadow-xl">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-[#111827] dark:text-white">{user.name}</span>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-normal">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer text-sm">
                    <Settings className="w-4 h-4 mr-2 text-[#6B7280]" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-danger-500 text-sm">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
