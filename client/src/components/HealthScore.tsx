import { motion } from 'framer-motion'

interface HealthScoreProps {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function HealthScore({ score, label, size = 'md' }: HealthScoreProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (clamped / 100) * circumference

  const color = clamped >= 80 ? '#10B981' : clamped >= 40 ? '#F59E0B' : '#EF4444'
  const bgColor = clamped >= 80 ? '#10B98110' : clamped >= 40 ? '#F59E0B10' : '#EF444410'

  const dims = size === 'sm' ? { w: 64, h: 64, stroke: 4, text: 'text-lg', sub: 'text-[9px]' }
    : size === 'lg' ? { w: 120, h: 120, stroke: 6, text: 'text-3xl', sub: 'text-xs' }
    : { w: 88, h: 88, stroke: 5, text: 'text-xl', sub: 'text-[10px]' }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dims.w, height: dims.h }}>
        <svg width={dims.w} height={dims.h} viewBox="0 0 120 120" className="transform -rotate-90">
          <circle cx="60" cy="60" r="54" fill={bgColor} stroke="#E5E7EB" strokeWidth={dims.stroke} />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth={dims.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`font-bold ${dims.text}`}
            style={{ color }}
          >
            {clamped}
          </motion.span>
        </div>
      </div>
      {label && <span className={`font-medium ${dims.sub}`} style={{ color }}>{label}</span>}
    </div>
  )
}
