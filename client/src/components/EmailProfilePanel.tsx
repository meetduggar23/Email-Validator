import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Globe, Server, Activity, Shield, Sparkles, Copy, Check, Heart, Share2, Download } from 'lucide-react'
import { useState } from 'react'
import HealthScore from './HealthScore'
import ProviderIcon from './ProviderIcon'

interface EmailProfilePanelProps {
  isOpen: boolean
  onClose: () => void
  data: any
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onShare?: () => void
}

export default function EmailProfilePanel({ isOpen, onClose, data, isFavorite, onToggleFavorite, onShare }: EmailProfilePanelProps) {
  const [copied, setCopied] = useState(false)

  if (!data) return null

  const checks = [
    { label: 'Syntax', valid: data.syntax ? 'ok' : 'not_found', icon: Mail },
    { label: 'Domain', valid: data.domainCheck || data.domain, icon: Globe },
    { label: 'MX Records', valid: data.mxCheck || data.mxRecords, icon: Server },
    { label: 'SMTP', valid: data.smtp, icon: Activity },
    { label: 'Disposable', valid: !data.disposable, icon: Shield },
    { label: 'Deliverability', valid: data.deliverability === 'high' ? 'ok' : 'not_found', icon: Sparkles },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Email Profile</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(data.email); setCopied(true); setTimeout(() => setCopied(false), 2000) }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    {copied ? <Check className="w-4 h-4 text-success-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  {onToggleFavorite && (
                    <button onClick={onToggleFavorite} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-danger-500 text-danger-500' : 'text-muted-foreground'}`} />
                    </button>
                  )}
                  {onShare && (
                    <button onClick={onShare} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-muted/50">
                <ProviderIcon provider={data.provider} size={36} />
                <div>
                  <h3 className="font-semibold text-base">{data.email}</h3>
                  <p className="text-sm text-muted-foreground">{data.provider}</p>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <HealthScore score={data.healthScore || data.confidenceScore} label={data.healthLabel} size="lg" />
              </div>

              {data.explanation && (
                <div className="mb-6 p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900">
                  <p className="text-sm text-primary-700 dark:text-primary-300 leading-relaxed">{data.explanation}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                {checks.map((check, i) => {
                  const isValid = check.valid === 'ok' || check.valid === true
                  const isWarning = check.valid === 'unable_to_verify'
                  return (
                    <motion.div
                      key={check.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-3 rounded-xl border ${isValid ? 'border-success-200 dark:border-success-900 bg-success-50 dark:bg-success-950/20' : isWarning ? 'border-warning-200 dark:border-warning-900 bg-warning-50 dark:bg-warning-950/20' : 'border-danger-200 dark:border-danger-900 bg-danger-50 dark:bg-danger-950/20'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <check.icon className={`w-3.5 h-3.5 ${isValid ? 'text-success-500' : isWarning ? 'text-warning-500' : 'text-danger-500'}`} />
                        <span className="text-xs text-muted-foreground">{check.label}</span>
                      </div>
                      <span className={`text-sm font-medium ${isValid ? 'text-success-600 dark:text-success-400' : isWarning ? 'text-warning-600 dark:text-warning-400' : 'text-danger-600 dark:text-danger-400'}`}>
                        {check.valid === 'ok' || check.valid === true ? 'Pass' : check.valid === 'unable_to_verify' ? 'Unable to Verify' : 'Fail'}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{data.confidenceScore}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className="font-medium">{data.healthScore || data.confidenceScore}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Risk Level</span>
                  <span className={`font-medium ${data.healthLabel === 'Healthy' ? 'text-success-500' : data.healthLabel === 'Risky' ? 'text-warning-500' : 'text-danger-500'}`}>
                    {data.healthLabel || (data.confidenceScore >= 80 ? 'Healthy' : data.confidenceScore >= 40 ? 'Risky' : 'Invalid')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{data.provider}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
