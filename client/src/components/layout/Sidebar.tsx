import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Mail, UploadCloud, BarChart3, History, Settings, X, Shield,
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Mail, label: 'Validate Email', path: '/validate' },
  { icon: UploadCloud, label: 'Bulk Validate', path: '/bulk' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6">
        <Link to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 rounded-xl bg-primary-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">EmailValidator</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-6">
        <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 p-4 text-white">
          <p className="text-sm font-semibold">Free Plan</p>
          <p className="text-xs text-white/70 mt-1">Unlimited validations</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-card z-30">
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
              className="w-64 h-full bg-card border-r border-border"
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
