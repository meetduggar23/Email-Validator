import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Check, X, AlertTriangle, Globe, Server, Activity,
  Sparkles, ArrowRight, Loader2, Copy, Heart, Share2, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'
import { getConfidenceColor } from '@/lib/utils'
import EmailAutocomplete from './EmailAutocomplete'
import HealthScore from './HealthScore'
import ProviderIcon from './ProviderIcon'
import EmailProfilePanel from './EmailProfilePanel'
import { toast } from '@/components/ui/toast'

interface EmailValidationCardProps {
  variant?: 'default' | 'landing'
}

function getStatusColor(status: boolean | string | undefined): string {
  if (status === 'ok' || status === true) return 'text-[#10B981]'
  if (status === 'unable_to_verify') return 'text-[#F59E0B]'
  return 'text-[#EF4444]'
}

function getStatusDotColor(status: boolean | string | undefined): string {
  if (status === 'ok' || status === true) return 'bg-[#10B981]'
  if (status === 'unable_to_verify') return 'bg-[#F59E0B]'
  return 'bg-[#EF4444]'
}

function getStatusText(label: string, status: boolean | string | undefined): string {
  if (status === 'ok' || status === true) {
    if (label === 'Syntax') return 'Valid'
    if (label === 'Domain') return 'Exists'
    if (label === 'MX Records') return 'Found'
    if (label === 'Disposable') return 'No'
    if (label === 'Deliverability') return 'High'
    if (label === 'SMTP') return 'Valid'
    return 'Pass'
  }
  if (status === 'unable_to_verify') return 'Unable to Verify'
  if (label === 'Syntax') return 'Invalid'
  if (label === 'Domain') return 'Not Found'
  if (label === 'MX Records') return 'Not Found'
  if (label === 'Disposable') return 'Yes'
  if (label === 'Deliverability') return 'Low'
  if (label === 'SMTP') return 'Invalid'
  return 'Fail'
}

function getCheckBorderColor(valid: boolean | string | undefined): string {
  if (valid === 'ok' || valid === true) return 'border-l-success-500'
  if (valid === 'unable_to_verify') return 'border-l-warning-500'
  return 'border-l-danger-500'
}

function getCheckBgColor(valid: boolean | string | undefined): string {
  if (valid === 'ok' || valid === true) return 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400'
  if (valid === 'unable_to_verify') return 'bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400'
  return 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400'
}

function getCheckBadgeVariant(valid: boolean | string | undefined): 'success' | 'danger' | 'warning' {
  if (valid === 'ok' || valid === true) return 'success'
  if (valid === 'unable_to_verify') return 'warning'
  return 'danger'
}

function getCheckIcon(valid: boolean | string | undefined) {
  if (valid === 'ok' || valid === true) return <Check className="w-5 h-5" />
  if (valid === 'unable_to_verify') return <AlertTriangle className="w-5 h-5" />
  return <X className="w-5 h-5" />
}

export default function EmailValidationCard({ variant = 'default' }: EmailValidationCardProps) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const handleValidate = async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setIsLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.validate.single(trimmed)
      if (res.success) {
        setResult(res.data)
        const fav = await api.favorites.check(trimmed)
        setIsFavorite(fav.data.isFavorite)
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['history'] })
      }
    } catch (err: any) {
      setError(err.message || 'Validation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(result.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  const handleToggleFavorite = useCallback(async () => {
    if (!result) return
    try {
      if (isFavorite) {
        const fav = await api.favorites.check(result.email)
        if (fav.data.id) await api.favorites.remove(fav.data.id)
        setIsFavorite(false)
        toast({ title: 'Removed from favorites', variant: 'default' })
      } else {
        await api.favorites.add(result.email)
        setIsFavorite(true)
        toast({ title: 'Added to favorites', variant: 'success' })
      }
    } catch { /* ignore */ }
  }, [result, isFavorite, toast])

  const handleShare = useCallback(async () => {
    if (!result?.id) return
    try {
      const res = await api.share.create(result.id)
      await navigator.clipboard.writeText(res.data.shareUrl)
      toast({ title: 'Share link copied to clipboard', variant: 'success' })
    } catch {
      toast({ title: 'Failed to create share link', variant: 'destructive' })
    }
  }, [result, toast])

  const isOverallValid = result?.syntax && result?.domain && result?.mxRecords && !result?.disposable
  const isNetworkError = result?.domainCheck === 'unable_to_verify' || result?.mxCheck === 'unable_to_verify'
  const hasSuggestions = result?.typoSuggestions?.length > 0 || result?.suggestions?.length > 0
  const healthScore = result?.healthScore ?? result?.confidenceScore ?? 0

  if (variant === 'landing') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <EmailAutocomplete
              value={email}
              onChange={setEmail}
              onEnter={handleValidate}
              placeholder="name@example.com"
              theme="dark"
              inputClassName="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#4F46E5]/50 transition-colors pointer-events-auto"
            />
          </div>
          <button
            onClick={handleValidate}
            disabled={isLoading || !email.trim()}
            className="px-5 h-12 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-[#4F46E5]/50 text-white text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isLoading ? 'Validating' : 'Validate'}
          </button>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-danger-500/10 border border-danger-500/20 text-danger-300 text-sm rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOverallValid ? (
                      <Check className="w-5 h-5 text-[#10B981]" />
                    ) : isNetworkError ? (
                      <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                    ) : (
                      <X className="w-5 h-5 text-[#EF4444]" />
                    )}
                    <span className="text-sm font-medium text-white">{result.email}</span>
                  </div>
                  <Badge variant={isOverallValid ? 'success' : isNetworkError ? 'warning' : 'danger'} className="text-[10px]">
                    {isOverallValid ? 'Valid' : isNetworkError ? 'Unable to Verify' : result.disposable ? 'Disposable' : 'Invalid'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(result.syntax ? 'ok' : 'not_found')}`} />
                    <span className="text-white/60">Syntax:</span>
                    <span className={getStatusColor(result.syntax ? 'ok' : 'not_found')}>{result.syntax ? 'Valid' : 'Invalid'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(result.domainCheck || result.domain)}`} />
                    <span className="text-white/60">Domain:</span>
                    <span className={getStatusColor(result.domainCheck || result.domain)}>{getStatusText('Domain', result.domainCheck || result.domain)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(result.mxCheck || result.mxRecords)}`} />
                    <span className="text-white/60">MX Records:</span>
                    <span className={getStatusColor(result.mxCheck || result.mxRecords)}>{getStatusText('MX Records', result.mxCheck || result.mxRecords)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${!result.disposable ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
                    <span className="text-white/60">Disposable:</span>
                    <span className={!result.disposable ? 'text-[#10B981]' : 'text-[#F59E0B]'}>{result.disposable ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-xs text-white/40">Health: {healthScore}/100</span>
                  <span className={`text-xs font-bold ${getConfidenceColor(healthScore)}`}>
                    {healthScore}% confidence
                  </span>
                </div>

                {result.explanation && (
                  <div className="pt-1 border-t border-white/5">
                    <p className="text-xs text-white/50 leading-relaxed">{result.explanation}</p>
                  </div>
                )}

                {hasSuggestions && (
                  <div className="pt-1 border-t border-white/5 space-y-1">
                    {result.typoSuggestions?.map((s: string, i: number) => (
                      <div key={`typo-${i}`} className="flex items-center gap-1.5 text-xs text-[#F59E0B]">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                    {result.suggestions?.map((s: string, i: number) => (
                      <div key={`sug-${i}`} className="flex items-center gap-1.5 text-xs text-white/40">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${healthScore >= 80 ? 'bg-[#10B981]' : healthScore >= 50 ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-visible">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <EmailAutocomplete
                value={email}
                onChange={setEmail}
                onEnter={handleValidate}
                placeholder="Enter email address..."
                inputClassName="w-full h-14 pl-12 pr-36 text-lg rounded-2xl border-2 border-input bg-background text-sm ring-offset-background focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button onClick={handleValidate} size="lg" disabled={isLoading || !email.trim()}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Validating
                    </div>
                  ) : (
                    <>
                      Validate <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Result Header */}
            <Card className={`bg-gradient-to-br ${isOverallValid ? 'from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 border-primary-200 dark:border-primary-800' : isNetworkError ? 'from-warning-50 to-amber-50 dark:from-warning-950/30 dark:to-amber-950/30 border-warning-200 dark:border-warning-800' : 'from-danger-50 to-warning-50 dark:from-danger-950/30 dark:to-warning-950/30 border-danger-200 dark:border-danger-800'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ProviderIcon provider={result.provider} size={36} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold">{result.email}</h2>
                        <Badge variant={isOverallValid ? 'success' : isNetworkError ? 'warning' : 'danger'} className="text-xs">
                          {isOverallValid ? 'Valid' : isNetworkError ? 'Unable to Verify' : 'Invalid'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleToggleFavorite}>
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-danger-500 text-danger-500' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowProfile(true)}>
                      <Info className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-2 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-shrink-0">
                    <HealthScore score={healthScore} label={result.healthLabel} size="md" />
                  </div>
                  <div className="flex-1 w-full">
                    {result.explanation && (
                      <div className="mb-3 p-3 rounded-xl bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900">
                        <p className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">{result.explanation}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence Score</span>
                        <span className={`font-bold ${getConfidenceColor(result.confidenceScore)}`}>{result.confidenceScore}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidenceScore}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${result.confidenceScore >= 80 ? 'bg-success-500' : result.confidenceScore >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Checks Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Syntax', valid: result.syntax ? 'ok' : 'not_found', icon: Mail, desc: 'Email format validation' },
                { label: 'Domain', valid: result.domainCheck || result.domain, icon: Globe, desc: 'Domain existence check' },
                { label: 'MX Records', valid: result.mxCheck || result.mxRecords, icon: Server, desc: 'Mail exchange records' },
                { label: 'SMTP', valid: result.smtp, icon: Activity, desc: 'SMTP server check' },
                { label: 'Disposable', valid: !result.disposable, icon: Sparkles, desc: 'Temporary email detection' },
                { label: 'Deliverability', valid: result.deliverability === 'high', icon: Check, desc: 'Overall deliverability' },
              ].map((check, i) => (
                <motion.div
                  key={check.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`border-l-4 ${getCheckBorderColor(check.valid)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCheckBgColor(check.valid)}`}>
                            {getCheckIcon(check.valid)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{check.label}</p>
                            <p className="text-xs text-muted-foreground">{check.desc}</p>
                          </div>
                        </div>
                        <Badge variant={getCheckBadgeVariant(check.valid)} className="text-[10px]">
                          {getStatusText(check.label, check.valid)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Suggestions */}
            {hasSuggestions && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning-500" /> Suggestions
                  </h3>
                  <div className="space-y-3">
                    {result.typoSuggestions?.map((suggestion: string, i: number) => (
                      <motion.div
                        key={`typo-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800"
                      >
                        <AlertTriangle className="w-5 h-5 text-warning-500 shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </motion.div>
                    ))}
                    {result.suggestions?.map((suggestion: string, i: number) => (
                      <motion.div
                        key={`sug-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (result.typoSuggestions?.length || 0) + i * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted"
                      >
                        <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Domain Intelligence */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Domain Intelligence</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Provider', value: result.provider },
                    { label: 'Domain', value: result.email.split('@')[1] || 'N/A' },
                    { label: 'MX Records', value: result.mxRecords ? 'Found' : 'Not Found' },
                    { label: 'DNS', value: result.domain ? 'Resolved' : 'Not Found' },
                    { label: 'Disposable', value: result.disposable ? 'Yes' : 'No' },
                    { label: 'Deliverability', value: result.deliverability },
                    { label: 'Risk', value: result.healthLabel || (healthScore >= 80 ? 'Low' : healthScore >= 40 ? 'Medium' : 'High') },
                    { label: 'Confidence', value: `${result.confidenceScore}%` },
                    { label: 'Health', value: `${healthScore}/100` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold mt-1 text-sm truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'Provider', value: result.provider },
                    { label: 'Deliverability', value: result.deliverability },
                    { label: 'Disposable', value: result.disposable ? 'Yes' : 'No' },
                    { label: 'Confidence', value: `${result.confidenceScore}%` },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <EmailProfilePanel
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        data={result}
        isFavorite={isFavorite}
        onToggleFavorite={handleToggleFavorite}
        onShare={handleShare}
      />
    </div>
  )
}
