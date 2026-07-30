import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Mail, Upload, BarChart3, History,
  Heart, FolderOpen, Code, Settings, X, Zap,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Mail, label: 'Validate Email', path: '/validate' },
  { icon: Upload, label: 'Bulk Validate', path: '/bulk', badge: 'PRO' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Heart, label: 'Favorites', path: '/favorites' },
  { icon: FolderOpen, label: 'Collections', path: '/collections' },
  { icon: Code, label: 'API Playground', path: '/api-playground', badge: 'NEW' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const { data: stats } = useQuery({
    queryKey: ['sidebar-stats'],
    queryFn: () => api.stats.dashboard().then(r => r.data),
    refetchInterval: 60000,
    staleTime: 30000,
  })

  const used = stats?.totalEmailsChecked ?? 7250
  const limit = 10000
  const percent = Math.min(100, Math.round((used / limit) * 100))

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F0F11]">
      <div className="flex items-center justify-between px-6 h-[72px] shrink-0">
        <Link to="/" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B5CEB] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-[#5B5CEB]/20 group-hover:shadow-[#5B5CEB]/30 transition-shadow">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-[15px] tracking-tight text-[#111827] dark:text-white">AI Email Validator</div>
            <div className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] tracking-tight leading-none mt-0.5">Professional Email Intelligence</div>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden text-[#6B7280] hover:text-[#111827] dark:hover:text-white p-1.5 rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-white/5 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-3 py-3 overflow-y-auto">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'text-[#5B5CEB] bg-[#5B5CEB]/5 dark:bg-[#5B5CEB]/10'
                    : 'text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4F6] dark:hover:bg-white/5'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#5B5CEB]" />
                )}
                <div className={cn(
                  'w-5 h-5 flex items-center justify-center shrink-0',
                  isActive ? 'text-[#5B5CEB]' : 'text-[#9CA3AF] dark:text-[#6B7280] group-hover:text-[#6B7280] dark:group-hover:text-[#9CA3AF] transition-colors'
                )}>
                  <item.icon className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={cn(
                    'text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md',
                    item.badge === 'NEW'
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'text-[#5B5CEB] dark:text-[#818CF8] bg-[#5B5CEB]/10 dark:bg-[#5B5CEB]/20'
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#E5E7EB] dark:border-white/10 shrink-0">
        <div className="bg-[#F8FAFC] dark:bg-white/5 rounded-2xl p-4 border border-[#E5E7EB] dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">Monthly Usage</span>
            <span className="text-xs font-medium text-[#111827] dark:text-white">{percent}%</span>
          </div>
          <div className="h-2 bg-[#E5E7EB] dark:bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#5B5CEB] to-[#4F46E5]"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{used.toLocaleString()} / {limit.toLocaleString()}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E5E7EB] dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Plan</span>
              <span className="text-xs font-semibold text-[#111827] dark:text-white bg-[#E5E7EB] dark:bg-white/10 px-2 py-0.5 rounded-md">Free</span>
            </div>
            <button className="w-full py-2 rounded-xl bg-[#111827] dark:bg-white text-white dark:text-[#111827] text-xs font-semibold hover:bg-[#1F2937] dark:hover:bg-white/90 transition-colors active:scale-[0.98]">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-[#E5E7EB] dark:border-white/10 z-30 bg-white dark:bg-[#0F0F11]">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-[280px] h-full bg-white dark:bg-[#0F0F11] border-r border-[#E5E7EB] dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
