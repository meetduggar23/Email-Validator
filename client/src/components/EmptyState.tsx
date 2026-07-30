import { motion } from 'framer-motion'
import { Mail, Heart, FolderOpen, Search, Upload, BarChart3 } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'mail' | 'heart' | 'folder' | 'search' | 'upload' | 'chart'
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}

const icons = {
  mail: Mail,
  heart: Heart,
  folder: FolderOpen,
  search: Search,
  upload: Upload,
  chart: BarChart3,
}

export default function EmptyState({ icon = 'mail', title, description, action }: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-5">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
