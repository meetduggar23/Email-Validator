import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Check, X, AlertTriangle, Globe, Server, Shield,
  Activity, Copy, Share2, Sparkles, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'
import { getConfidenceColor } from '@/lib/utils'

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type EmailData = z.infer<typeof emailSchema>

const COMMON_PROVIDERS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com', 'protonmail.com', 'mail.com']

export default function ValidateEmail() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
  })

  const emailValue = watch('email')

  const onSubmit = async (data: EmailData) => {
    setIsLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.validate.single(data.email)
      if (res.success) setResult(res.data)
    } catch (err: any) {
      setError(err.message || 'Validation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  const getDomainSuggestions = () => {
    if (!emailValue || !emailValue.includes('@')) return []
    const inputDomain = emailValue.split('@')[1]?.toLowerCase()
    if (!inputDomain) return COMMON_PROVIDERS
    return COMMON_PROVIDERS.filter(p => p.startsWith(inputDomain) && p !== inputDomain).slice(0, 3)
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Validate Email</h1>
        <p className="text-muted-foreground mt-1">Check any email address for syntax, domain, and deliverability</p>
      </div>

      <Card className="overflow-visible">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  className="h-14 pl-12 pr-36 text-lg rounded-2xl border-2 focus-visible:border-primary-500"
                  {...register('email')}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button type="submit" size="lg" disabled={isLoading || !emailValue}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

              {/* Domain Suggestions */}
              <AnimatePresence>
                {showSuggestions && emailValue?.includes('@') && getDomainSuggestions().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-card shadow-xl p-2"
                  >
                    {getDomainSuggestions().map(provider => (
                      <button
                        key={provider}
                        type="button"
                        className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                        onMouseDown={() => setValue('email', `${emailValue.split('@')[0]}@${provider}`, { shouldValidate: true })}
                      >
                        {emailValue.split('@')[0]}@{provider}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {errors.email && <p className="text-sm text-danger-500">{errors.email.message}</p>}
          </form>
        </CardContent>
      </Card>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 rounded-2xl p-4">
          {error}
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
            <Card className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-950/30 dark:to-purple-950/30 border-primary-200 dark:border-primary-800">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold">{result.email}</h2>
                      <Badge variant={result.syntax ? 'success' : 'danger'} className="text-xs">
                        {result.syntax ? 'Valid' : 'Invalid'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.provider}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-2 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                      <span className="ml-2 hidden sm:inline">Share</span>
                    </Button>
                  </div>
                </div>

                {/* Confidence Meter */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className={`text-lg font-bold ${getConfidenceColor(result.confidenceScore)}`}>
                      {result.confidenceScore}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidenceScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${result.confidenceScore >= 80 ? 'bg-success-500' : result.confidenceScore >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Checks */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Syntax', valid: result.syntax, icon: Mail, desc: 'Email format validation' },
                { label: 'Domain', valid: result.domain, icon: Globe, desc: 'Domain existence check' },
                { label: 'MX Records', valid: result.mxRecords, icon: Server, desc: 'Mail exchange records' },
                { label: 'SMTP', valid: result.smtp, icon: Activity, desc: 'SMTP server check' },
                { label: 'Disposable', valid: !result.disposable, icon: Shield, desc: 'Temporary email detection', invert: true },
                { label: 'Deliverability', valid: result.deliverability === 'high', icon: Sparkles, desc: 'Overall deliverability' },
              ].map((check, i) => (
                <motion.div
                  key={check.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`border-l-4 ${check.valid ? 'border-l-success-500' : 'border-l-danger-500'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${check.valid ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400' : 'bg-danger-100 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400'}`}>
                            {check.valid ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{check.label}</p>
                            <p className="text-xs text-muted-foreground">{check.desc}</p>
                          </div>
                        </div>
                        <Badge variant={check.valid ? 'success' : 'danger'} className="text-[10px]">
                          {check.valid ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Suggestions & Typo Fixes */}
            {(result.typoSuggestions?.length > 0 || result.suggestions?.length > 0) && (
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

            {/* Results Metadata */}
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
    </div>
  )
}
